import { remove as removeDiacritics } from 'diacritics';
import { render as renderTemplate } from 'ejs';
import jszip, { JSZipGeneratorOptions } from 'jszip';
import { getExtension, getType } from 'mime';
import { Chapter, chapterDefaults, Content, Font, Image, NormChapter, NormOptions, Options, optionsDefaults, retryFetch, type, uuid, validateAndNormalizeChapters, validateAndNormalizeOptions } from './util';


export { Options, Content, Chapter, Font, optionsDefaults, chapterDefaults };

export class EPub {
  protected options: NormOptions;
  protected content: NormChapter[];
  protected uuid: string;
  protected images: Image[] = [];
  protected cover?: { extension: string, mediaType: string };

  protected log: typeof console.log;
  protected zip: InstanceType<jszip>;

  constructor(options: Options, content: Content) {
    this.options = validateAndNormalizeOptions(options);
    this.options.lang = removeDiacritics(this.options.lang);
    this.content = validateAndNormalizeChapters.call(this, content);
    this.uuid = uuid();

    this.log = this.options.verbose ? console.log.bind(console) : () => {};
    this.zip = new jszip();
    this.zip.file('mimetype', 'application/epub+zip', { compression: 'STORE' });

    if (this.options.cover) {
      const mediaType = getType(this.options.cover);
      const extension = getExtension(mediaType || '');
      if (mediaType && extension)
        this.cover = { mediaType, extension };
    }
  }

  async render() {
    this.log('Generating Template Files...');
    await this.generateTemplateFiles();
    this.log('Downloading fonts...');
    await this.downloadAllFonts();
    this.log('Downloading images...');
    await this.downloadAllImages();
    this.log('Making cover...');
    await this.makeCover();
    this.log('Finishing up...');
    return this;
  }

  async genEpub() {
    await this.render();
    const content = this.zip.generateAsync({
      type,
      mimeType: 'application/epub+zip',
      compression: 'DEFLATE',
      compressionOptions: {
        level: 9,
      },
    });
    this.log('Done');
    return content;
  }

  generateAsync(options: JSZipGeneratorOptions) {
    return this.zip.generateAsync(options);
  }

  protected async generateTemplateFiles() {
    const oebps = this.zip.folder('OEBPS')!;
    oebps.file('style.css', this.options.css);
    
    this.content.forEach(chapter => {
      const rendered = renderTemplate(this.options.chapterXHTML, {
        lang: this.options.lang,
        prependChapterTitles: this.options.prependChapterTitles,
        ...chapter,
      });
      oebps.file(chapter.filename, rendered);
    });

    const metainf = this.zip.folder('META-INF')!;
    metainf.file('container.xml', '<?xml version="1.0" encoding="UTF-8" ?><container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container"><rootfiles><rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/></rootfiles></container>');

    if (this.options.version === 2) {
      // write meta-inf/com.apple.ibooks.display-options.xml [from pedrosanta:xhtml#6]
      metainf.file('com.apple.ibooks.display-options.xml', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><display_options><platform name="*"><option name="specified-fonts">true</option></platform></display_options>');
    }

    const opt = {
      ...this.options,
      id: this.uuid,
      images: this.images,
      cover: this.cover,
      content: this.content,
    };

    oebps.file('content.opf', renderTemplate(this.options.contentOPF, opt));
    oebps.file('toc.ncx', renderTemplate(this.options.tocNCX, opt));
    oebps.file('toc.xhtml', renderTemplate(this.options.tocXHTML, opt));
  }

  protected async downloadAllFonts() {
    if (!this.options.fonts.length) return this.log('No fonts to download');
    const oebps = this.zip.folder('OEBPS')!;
    const fonts = oebps.folder('fonts')!;

    for (let i = 0; i < this.options.fonts.length; i += this.options.batchSize) {
      const fontContents = await Promise.all(
        this.options.fonts.slice(i, i + this.options.batchSize).map(font =>
          retryFetch(font.url, this.options.fetchTimeout, this.options.retryTimes, this.log)
            .then(res => (this.log(`Downloaded font ${font.url}`), { ...font, data: res })))
      );
      fontContents.forEach(font => fonts.file(font.filename, font.data));
    }
  }

  protected async downloadAllImages() {
    if (!this.images.length) return this.log('No images to download');
    const oebps = this.zip.folder('OEBPS')!;
    const images = oebps.folder('images')!;

    for (let i = 0; i < this.images.length; i += this.options.batchSize) {
      const imageContents = await Promise.all(
        this.images.slice(i, i + this.options.batchSize).map(image =>
          retryFetch(image.url, this.options.fetchTimeout, this.options.retryTimes, this.log)
            .then(res => (this.log(`Downloaded image ${image.url}`), { ...image, data: res }))
        )
      );
      imageContents.forEach(image => images.file(`${image.id}.${image.extension}`, image.data));
    }
  }

  protected async makeCover() {
    if (!this.cover) return this.log('No cover to download');
    const oebps = this.zip.folder('OEBPS')!;
    const coverContent = await retryFetch(this.options.cover, this.options.fetchTimeout, this.options.retryTimes, this.log);
    oebps.file(`cover.${this.cover.extension}`, coverContent);
  }
}

const epub = (options: Options, content: Content) => new EPub(options, content).genEpub();
export default epub;