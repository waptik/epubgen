import { remove as removeDiacritics } from 'diacritics';
import ow from 'ow';
import css from 'templates/template.css.js';
import uslug from 'uslug';
import { NormOptions, Options, validateOptions } from './validate';

export * from './constants';
export * from './html';
export * from './other';
export { Options, NormOptions };


export const optionsDefaults = {
  description: '',
  author: ['anonymous'],
  publisher: 'anonymous',
  tocTitle: 'Table of Contents',
  appendChapterTitles: true,
  date: new Date().toISOString(),
  lang: "en",
  css,
  fonts: [],
  version: 3,
  verbose: false,
};


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
    ...optionsDefaults,
    ...options as Partial<Options>,
  };
  opt.author = normName(opt.author);
  return opt as NormOptions;
};

export const validateAndNormalizeChapter = (chapter: NormOptions['content'][number], index: number) => {
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

