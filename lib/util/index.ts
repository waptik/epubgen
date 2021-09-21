import ow from 'ow';
import css from 'templates/template.css.js';
import { NormOptions, Options, validateOptions } from './validate';

export * from './constants';
export * from './html';
export * from './other';
export { Options, NormOptions };


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
    description: '',
    author: ['anonymous'],
    tocTitle: 'Table of Contents',
    appendChapterTitles: true,
    date: new Date().toISOString(),
    lang: "en",
    css,
    fonts: [],
    version: 3,
    verbose: false,
    ...options as Partial<Options>,
  };
  opt.author = normName(opt.author);
  return opt as NormOptions;
};


