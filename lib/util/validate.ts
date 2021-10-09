import ow, { ObjectPredicate, Predicate } from 'ow';
import { Merge } from 'type-fest';

export type Chapter = {
  title?: string,
  author?: string | string[],
  content: string,
  excludeFromToc?: boolean,
  beforeToc?: boolean,
  filename?: string,
  url?: string,
};

export type Content = readonly Chapter[];

export type Font = {
  filename: string,
  url: string,
};

export type LogFn = (type: 'log' | 'warn', ...args: any[]) => void;
export type Options = {
  title: string,
  author?: string | string[],
  publisher?: string,
  description?: string,
  cover?: string,
  tocTitle?: string,
  tocInTOC?: boolean,
  numberChaptersInTOC?: boolean,
  prependChapterTitles?: boolean,
  date?: string,
  lang?: string,
  css?: string,
  chapterXHTML?: string,
  contentOPF?: string,
  tocNCX?: string,
  tocXHTML?: string,
  fonts?: Font[],
  version?: number,
  fetchTimeout?: number,
  retryTimes?: number,
  batchSize?: number,
  ignoreFailedDownloads?: boolean,
  verbose?: boolean | LogFn,
};

const name = ow.optional.any(ow.string, ow.array.ofType(ow.string), ow.undefined);
const filename = ow.optional.string.is(s => (s.indexOf('/') === -1 && s.indexOf('\\') === -1) || `Filename must not include slashes, got \`${s}\``);
const filenameReq = ow.string.is(s => (s.indexOf('/') === -1 && s.indexOf('\\') === -1) || `Filename must not include slashes, got \`${s}\``);

export const chapterPredicate: ObjectPredicate<Chapter> = ow.object.partialShape({
  title: ow.optional.string,
  author: name,
  content: ow.string,
  excludeFromToc: ow.optional.boolean,
  beforeToc: ow.optional.boolean,
  filename,
  url: ow.optional.string,
});

export const fontPredicate: ObjectPredicate<Font> = ow.object.partialShape({
  filename: filenameReq,
  url: ow.string,
});

export const optionsPredicate: ObjectPredicate<Options> = ow.object.partialShape({
  title: ow.string,
  author: name,
  publisher: ow.optional.string,
  description: ow.optional.string,
  cover: ow.optional.string,
  tocTitle: ow.optional.string,
  tocInTOC: ow.optional.boolean,
  numberChaptersInTOC: ow.optional.boolean,
  prependChapterTitles: ow.optional.boolean,
  date: ow.optional.string,
  lang: ow.optional.string,
  css: ow.optional.string,
  chapterXHTML: ow.optional.string,
  contentOPF: ow.optional.string,
  tocNCX: ow.optional.string,
  tocXHTML: ow.optional.string,
  fonts: ow.optional.any(ow.array.ofType(fontPredicate), ow.undefined),
  version: ow.optional.number.is(x => x === 3 || x === 2 ||
    `Expected version to be 3 or 2, got \`${x}\``),
  fetchTimeout: ow.optional.number.positive,
  retryTimes: ow.optional.number.positive,
  batchSize: ow.optional.number.positive,
  ignoreFailedDownloads: ow.optional.boolean,
  verbose: ow.optional.any(ow.boolean, ow.function as Predicate<LogFn>),
});


type NonNullableObject<T> = T extends Record<string, unknown>
  ? Required<{ [key in keyof T]: NonNullableObject<T[key]> }>
  : T extends Array<infer R>
  ? Array<NonNullableObject<R>>
  : NonNullable<T>;

export type NormOptions = NonNullableObject<
  Merge<Options, {
    author: string[],
    fonts: ({
      mediaType: string | null,
    } & Font)[],
  }>>;
export type NormChapter = NonNullableObject<
  Merge<Chapter, {
    id: string,
    author: string[],
  }>>;