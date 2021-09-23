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
import { Chapter, chapterPredicate, Content, Font, NormChapter, NormOptions, Options, optionsPredicate } from './validate';

export * from './constants';
export * from './html';
export * from './other';
export { Options, NormOptions, Content, Chapter, NormChapter, Font };


export const optionsDefaults = (version = 3) => ({
  description: '',
  author: ['anonymous'],
  publisher: 'anonymous',
  tocTitle: 'Table of Contents',
  tocInTOC: true,
  numberChaptersInTOC: true,
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
  fetchTimeout: 20000,
  retryTimes: 3,
  verbose: false,
});

export const chapterDefaults = (index: number) => ({
  title: `Chapter ${index+1}`,
  id: `item_${index}`,
  url: '',
  excludeFromToc: false,
  beforeToc: false,
});


export const normName = (name: string | string[] | undefined) => {
  try {
    ow(name, ow.string);
    return [name];
  } catch {
    return (name || []) as string[];
  }
};

export const validateAndNormalizeOptions = (options: Options) => {
  ow(options, 'options', optionsPredicate);

  // put defaults
  const opt = {
    ...optionsDefaults(options.version || 3),
    ...options,
  } as NormOptions;
  opt.author = normName(opt.author);
  opt.fonts = opt.fonts.map(font => ({ ...font, mediaType: getType(font.filename)! }));
  opt.date = new Date(opt.date).toISOString();
  return opt;
};

export function validateAndNormalizeChapters(this: EPub, chapters: Chapter[]) {
  ow(chapters, 'content', ow.array.ofType(chapterPredicate));

  chapters = chapters.map((chapter, index) => {
    const ch = validateAndNormalizeChapter(chapter, index);
    ch.content = normalizeHTML.call(this, index, chapter.content)
    return ch;
  });
  return chapters as NormChapter[];
}

export const validateAndNormalizeChapter = (chapter: Chapter, index: number) => {
  const ch = {
    ...chapterDefaults(index),
    ...chapter,
  } as NormChapter;

  const slug = uslug(removeDiacritics(ch.title))
  if (!ch.filename) {
    ch.filename = `${index}_${slug}.xhtml`;
  } else if (!ch.filename.endsWith('.xhtml')) {
    ch.filename = `${ch.filename}.xhtml`;
  }
  ch.author = normName(ch.author);
  return ch;
};

