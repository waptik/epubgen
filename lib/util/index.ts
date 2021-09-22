import { remove as removeDiacritics } from 'diacritics';
import { getType } from 'mime';
import ow from 'ow';
import chapterXHTML2 from 'templates/epub2/chapter.xhtml.ejs.js';
import contentOPF2 from 'templates/epub2/content.opf.ejs.js';
import tocXHTML2 from 'templates/epub2/toc.xhtml.ejs.js';
import chapterXHTML3 from 'templates/epub3/chapter.xhtml.ejs.js';
import contentOPF3 from 'templates/epub3/content.opf.ejs.js';
import tocXHTML3 from 'templates/epub3/toc.xhtml.ejs.js';
import css from 'templates/template.css.js';
import tocNCX from 'templates/toc.ncx.ejs.js';
import uslug from 'uslug';
import type { EPub } from '..';
import { normalizeHTML } from './html';
import { Chapter, NormChapters, NormOptions, Options, validateChapters, validateOptions } from './validate';

export * from './constants';
export * from './html';
export * from './other';
export { Options, NormOptions };


export const optionsDefaults = (version = 3) => ({
  description: '',
  author: ['anonymous'],
  publisher: 'anonymous',
  tocTitle: 'Table of Contents',
  prependChapterTitles: true,
  date: new Date().toISOString(),
  lang: "en",
  css,
  chapterXHTML: version === 2 ? chapterXHTML2 : chapterXHTML3,
  contentOPF: version === 2 ? contentOPF2 : contentOPF3,
  tocNCX,
  tocXHTML: version === 2 ? tocXHTML2 : tocXHTML3,
  fonts: [],
  version,
  verbose: false,
});


export const normName = (name: string | string[]) => {
  try {
    ow(name, ow.string);
    return [name];
  } catch {
    return (name || []) as string[];
  }
};

export const validateAndNormalizeOptions = (options: Options) => {
  validateOptions(options as NormOptions);

  // put defaults
  const opt = {
    ...optionsDefaults(options.version || 3),
    ...options as Partial<Options>,
  } as NormOptions;
  opt.author = normName(opt.author);
  opt.fonts.forEach(font => font.mediaType = getType(font.url.replace(/\?.*/, ""))!);
  opt.date = new Date(opt.date).toISOString();
  return opt;
};

export function validateAndNormalizeChapters(this: EPub, chapters: Chapter[]) {
  validateChapters(chapters as NormChapters);

  chapters.forEach((chapter, index) => {
    validateAndNormalizeChapter(chapter as NormChapters[number], index);
    chapter.content = normalizeHTML.call(this, index, chapter.content)
  });
  return chapters as NormChapters;
}

export const validateAndNormalizeChapter = (chapter: NormChapters[number], index: number) => {
  chapter.title ||= 'no title';
  chapter.url ||= '';
  const slug = uslug(removeDiacritics(chapter.title))
  if (!chapter.filename) {
    chapter.filename = `${index}_${slug}.xhtml`;
  } else if (!chapter.filename.endsWith('.xhtml')) {
    chapter.filename = `${chapter.filename}.xhtml`;
  }
  chapter.id = `item_${index}`;
  chapter.excludeFromToc ||= false
  chapter.beforeToc ||= false
  chapter.author = normName(chapter.author);
};

