import { JSZip, type JSZipGeneratorOptions, mime } from "./deps.ts";

import { Image } from "./util/html.ts";
import {
  validateAndNormalizeChapters,
  validateAndNormalizeOptions,
} from "./util/mod.ts";
import {
  fetchFileContent,
  renderTemplate,
  retryFetch,
  uuid,
} from "./util/other.ts";
import { Content, NormChapter, NormOptions, Options } from "./util/validate.ts";

// import ejs from "https://esm.sh/ejs@3.1.8";

export class EPub {
  protected options: NormOptions;
  protected content: NormChapter[];
  protected uuid: string;
  protected images: Image[] = [];
  protected cover?: { extension: string; mediaType: string };

  protected log: typeof console.log;
  protected warn: typeof console.warn;
  protected zip: InstanceType<typeof JSZip>;

  constructor(options: Options, content: Content) {
    this.options = validateAndNormalizeOptions(options);
    switch (this.options.verbose) {
      case true:
        this.log = console.log.bind(console);
        this.warn = console.warn.bind(console);
        break;
      case false:
        this.log = this.warn = () => {};
        break;
      default:
        this.log = this.options.verbose.bind(null, "log");
        this.warn = this.options.verbose.bind(null, "warn");
        break;
    }
    this.uuid = uuid();
    this.content = validateAndNormalizeChapters.call(this, content);
    this.zip = new JSZip();
    this.zip.addFile("mimetype", "application/epub+zip", {
      compression: "STORE",
    });
    if (this.options.cover) {
      const mediaType = mime.getType(this.options.cover);
      const extension = mime.getExtension(mediaType || ".jpg");
      if (mediaType && extension) {
        this.cover = { mediaType, extension };
      }
    }
  }

  async render() {
    this.log("Generating Template Files...");
    this.generateTemplateFiles();
    this.log("Downloading fonts...");
    await this.downloadAllFonts();
    this.log("Downloading images...");
    await this.downloadAllImages();
    this.log("Making cover...");
    await this.makeCover();
    this.log("Finishing up...");
    return this;
  }

  async genEpub() {
    await this.render();
    const content = this.zip.generateAsync({
      type: "uint8array",
      mimeType: "application/epub+zip",
      compression: "DEFLATE",
      compressionOptions: {
        level: 9,
      },
    });
    this.log("Done");
    return content;
  }

  generateAsync(options: JSZipGeneratorOptions) {
    return this.zip.generateAsync(options);
  }

  protected async generateTemplateFiles() {
    const css = await fetchFileContent("template.css");

    this.zip.addFile("OEBPS/style.css", css);

    this.content.forEach(async (chapter) => {
      const rendered = await renderTemplate("chapter.xhtml.ejs", {
        lang: this.options.lang,
        prependChapterTitles: this.options.prependChapterTitles,
        ...chapter,
      });

      this.zip.addFile(chapter.href, rendered);
    });

    this.zip.addFile(
      "META-INF/container.xml",
      `<?xml version="1.0" encoding="UTF-8" ?>
            <container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
                <rootfiles>
                    <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>
                </rootfiles>
            </container>`,
    );

    const opt = {
      ...this.options,
      id: this.uuid,
      images: this.images,
      cover: this.cover,
      content: this.content,
    };

    renderTemplate("content.opf.ejs", opt).then((content) => {
      this.zip.addFile("OEBPS/content.opf", content);
    });
    renderTemplate("toc.ncx.ejs", opt).then((toc) => {
      this.zip.addFile("OEBPS/toc.ncx", toc);
    });
    renderTemplate("toc.xhtml.ejs", opt).then((toc) => {
      this.zip.addFile("OEBPS/toc.xhtml", toc);
    });
  }

  protected async downloadAllFonts() {
    if (!this.options.fonts.length) return this.log("No fonts to download");
    const fonts = this.zip.folder("OEBPS/fonts")!;

    for (
      let i = 0;
      i < this.options.fonts.length;
      i += this.options.batchSize
    ) {
      const fontContents = await Promise.all(
        this.options.fonts.slice(i, i + this.options.batchSize).map((font) => {
          const d = retryFetch(
            font.url,
            this.options.fetchTimeout,
            this.options.retryTimes,
            this.log,
          )
            .then(
              (
                res,
              ) => (this.log(`Downloaded font ${font.url}`),
                { ...font, data: res }),
            );
          return this.options.ignoreFailedDownloads
            ? d.catch(
              (reason) => (this.warn(
                `Warning (font ${font.url}): Download failed`,
                reason,
              ),
                { ...font, data: "" }),
            )
            : d;
        }),
      );
      fontContents.forEach((font) => fonts.addFile(font.filename, font.data));
    }
  }

  protected async downloadAllImages() {
    if (!this.images.length) return this.log("No images to download");
    const images = this.zip.folder("OEBPS/images");

    for (let i = 0; i < this.images.length; i += this.options.batchSize) {
      const imageContents = await Promise.all(
        this.images.slice(i, i + this.options.batchSize).map((image) => {
          const d = retryFetch(
            image.url,
            this.options.fetchTimeout,
            this.options.retryTimes,
            this.log,
          )
            .then(
              (
                res,
              ) => (this.log(`Downloaded image ${image.url}`),
                { ...image, data: res }),
            );
          return this.options.ignoreFailedDownloads
            ? d.catch(
              (reason) => (this.warn(
                `Warning (image ${image.url}): Download failed`,
                reason,
              ),
                { ...image, data: "" }),
            )
            : d;
        }),
      );
      imageContents.forEach((image) =>
        images.addFile(`${image.id}.${image.extension}`, image.data)
      );
    }
  }

  protected async makeCover() {
    if (!this.cover) return this.log("No cover to download");
    const coverContent = await retryFetch(
      this.options.cover,
      this.options.fetchTimeout,
      this.options.retryTimes,
      this.log,
    )
      .catch(
        (reason) => (this.warn(
          `Warning (cover ${this.options.cover}): Download failed`,
          reason,
        ),
          ""),
      );

    this.zip.addFile(`OEBPS/cover.${this.cover.extension}`, coverContent);
  }
}
