import { remove as removeDiacritics } from 'diacritics';
import { render as renderTemplate } from 'ejs';
import jszip from 'jszip';
import { getExtension, getType } from 'mime';
import chapterXHTML from 'templates/chapter.xhtml.ejs.js';
import contentOpf2 from 'templates/epub2/content.opf.ejs.js';
import tocXHTML2 from 'templates/epub2/toc.xhtml.ejs.js';
import contentOpf3 from 'templates/epub3/content.opf.ejs.js';
import tocXHTML3 from 'templates/epub3/toc.xhtml.ejs.js';
import tocNcx from 'templates/toc.ncx.ejs.js';
import { Image, normalizeHTML, NormOptions, Options, uuid, validateAndNormalizeChapter, validateAndNormalizeOptions } from './util';
import fetchable, { type } from './util/fetchable';

export { Options };

export class EPub {
  protected options: NormOptions;
  protected uuid: string;
  protected docHeader: string;
  protected images: Image[] = [];
  protected cover?: { extension: string, mediaType: string };

  protected log: typeof console.log;
  protected zip: InstanceType<jszip>;

  constructor(options: Options) {
    this.options = validateAndNormalizeOptions(options);
    this.options.lang = removeDiacritics(this.options.lang);
    this.uuid = uuid();

    this.log = this.options.verbose ? console.log : () => {};
    this.zip = new jszip();
    this.zip.file('mimetype', 'application/epub+zip');

    if (this.options.version === 2) {
      this.docHeader = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.1//EN" "http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="${this.options.lang}">`;
    } else {
      this.docHeader = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" lang="${this.options.lang}">`;
    }

    if (this.options.cover) {
      const mediaType = getType(this.options.cover);
      const extension = getExtension(mediaType || '');
      if (mediaType && extension)
        this.cover = { mediaType, extension };
    }

    this.options.content.forEach(validateAndNormalizeChapter);
    this.options.content.forEach((chapter, index) => chapter.content = normalizeHTML.call(this, index, chapter.content));
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
    const content = await this.genEpub();
    this.log('Done.');
    return content;
  }

  private async generateTemplateFiles() {
    const oebps = this.zip.folder('OEBPS')!;
    oebps.file('style.css', this.options.css);
    
    this.options.content.forEach(chapter => {
      const rendered = renderTemplate(chapterXHTML, {
        docHeader: this.docHeader,
        appendChapterTitles: this.options.appendChapterTitles,
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
    };

    const contentOpf = this.options.version === 2 ? contentOpf2 : contentOpf3;
    oebps.file('content.opf', renderTemplate(contentOpf, opt));
    oebps.file('tox.ncx', renderTemplate(tocNcx, opt));
    const tocXHTML = this.options.version === 2 ? tocXHTML2 : tocXHTML3;
    oebps.file('toc.xhtml', renderTemplate(tocXHTML, opt));
  }

  private async downloadAllFonts() {
    if (!this.options.fonts.length) return this.log('No fonts to download');
    const oebps = this.zip.folder('OEBPS')!;
    const fonts = oebps.folder('fonts')!;
    const fontContents = await Promise.all(
      this.options.fonts.map(font =>
        fetchable(font.url).then(res => (this.log(`Downloaded font ${font.url}`), { ...font, data: res })))
    );
    fontContents.forEach(font => fonts.file(font.filename, font.data));
  }

  private async downloadAllImages() {
    if (!this.images.length) return this.log('No images to download');
    const oebps = this.zip.folder('OEBPS')!;
    const images = oebps.folder('images')!;
    const imageContents = await Promise.all(
      this.images.map(image =>
        fetchable(image.url).then(res => (this.log(`Downloaded image ${image.url}`), { ...image, data: res }))
      )
    );
    imageContents.forEach(image => images.file(`${image.id}.${image.extension}`, image.data));
  }

  private async makeCover() {
    if (!this.cover) return this.log('No cover to download');
    const oebps = this.zip.folder('OEBPS')!;
    const coverContent = await fetchable(this.options.cover);
    oebps.file(`cover.${this.cover.extension}`, coverContent);
  }

  private async genEpub() {
    return await this.zip.generateAsync({
      type,
      mimeType: 'application/epub+zip',
      compression: 'DEFLATE',
      compressionOptions: {
        level: 9,
      },
    });
  }
}

const epub = (options: Options) => {
  const e = new EPub(options);
  return e.render();
};
export default epub;