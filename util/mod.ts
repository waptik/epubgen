import uslug from "https://esm.sh/uslug@1.0.4";

import chapterXHTML3 from "../templates/ts/chapter.xhtml.ejs.ts";
import contentOPF3 from "../templates/ts/content.opf.ejs.ts";
import tocXHTML3 from "../templates/ts/toc.xhtml.ejs.ts";
import css from "../templates/ts/template.css.ts";
import tocNCX from "../templates/ts/toc.ncx.ejs.ts";

import { mime, ow } from "../deps.ts";
import { EPub } from "../epub.ts";
import { normalizeHTML } from "./html.ts";
import { removeDiacritics } from "./other.ts";

import {
  Chapter,
  chapterPredicate,
  Content,
  Font,
  NormChapter,
  NormOptions,
  Options,
  optionsPredicate,
} from "./validate.ts";

export * from "./html.ts";
export * from "./other.ts";

export { chapterPredicate, optionsPredicate };
export type { Chapter, Content, Font, NormChapter, NormOptions, Options };

export const optionsDefaults = (version = 3): Omit<Options, "title"> => ({
  description: "no description",
  author: ["anonymous"],
  publisher: "anonymous",
  tocTitle: "Table of Contents",
  tocInTOC: true,
  numberChaptersInTOC: true,
  prependChapterTitles: true,
  date: new Date().toISOString(),
  lang: "en",
  css,
  chapterXHTML: chapterXHTML3,
  contentOPF: contentOPF3,
  tocNCX,
  tocXHTML: tocXHTML3,
  fonts: [],
  version,
  fetchTimeout: 20000,
  retryTimes: 3,
  batchSize: 100,
  ignoreFailedDownloads: false,
  verbose: false,
});

export const chapterDefaults = (index: number) => ({
  title: `Chapter ${index + 1}`,
  id: `item_${index}`,
  url: "",
  excludeFromToc: false,
  beforeToc: false,
});

export const normName = (name: string | string[] | undefined): string[] =>
  ow.isValid(name, ow.string) ? [name] : (name || []);

export const validateAndNormalizeOptions = (options: Options) => {
  ow(options, "options", optionsPredicate);

  // put defaults
  const opt = {
    ...optionsDefaults(options.version || 3),
    ...options,
  } as NormOptions;
  opt.author = normName(opt.author);
  opt.fonts = opt.fonts.map((font) => ({
    ...font,
    mediaType: mime.getType(font.filename)!,
  }));
  opt.date = new Date(opt.date).toISOString();
  opt.lang = removeDiacritics(opt.lang);
  return opt;
};

export function validateAndNormalizeChapters(
  this: EPub,
  chapters: readonly Chapter[],
) {
  ow(chapters, "content", ow.array.ofType(chapterPredicate));

  let afterTOC = false;
  return chapters.map((chapter, index) => {
    const ch = validateAndNormalizeChapter(chapter, index);
    ch.content = normalizeHTML.call(this, index, chapter.content);
    if (afterTOC && ch.beforeToc) {
      this.warn(
        `Warning (content[${index}]): Got \`beforeToc=true\` after at least one \`beforeToc=false\`. Chapters will be out of order.`,
      );
    }
    if (!ch.beforeToc) afterTOC = true;
    return ch;
  });
}

export const validateAndNormalizeChapter = (
  chapter: Chapter,
  index: number,
) => {
  const ch = {
    ...chapterDefaults(index),
    ...chapter,
  } as NormChapter;

  const slug = uslug(removeDiacritics(ch.title));
  if (!ch.filename) {
    ch.filename = `${index}_${slug}.xhtml`;
  } else if (!ch.filename.endsWith(".xhtml")) {
    ch.filename = `${ch.filename}.xhtml`;
  }
  ch.author = normName(ch.author);
  return ch;
};
