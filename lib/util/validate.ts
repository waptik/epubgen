import ow, { ObjectPredicate, ReusableValidator } from 'ow';
import { Merge, SetOptional } from 'type-fest';

type NonNullableObject<T> = T extends Record<string, unknown>
  ? Required<{ [key in keyof T]: NonNullableObject<T[key]> }>
  : T extends Array<infer R>
  ? Array<NonNullableObject<R>>
  : NonNullable<T>;

type MakeOptional<T extends Record<string, unknown>> = SetOptional<{
  [key in keyof T]: T[key] }, NonNullable<{ [key in keyof T]: undefined extends T[key] ? key : never
}[keyof T]>>;
type MakeOptionalObject<T> = T extends Record<string, unknown>
  ? MakeOptional<{ [key in keyof T]: MakeOptionalObject<T[key]> }>
  : T extends Array<infer R>
  ? Array<MakeOptionalObject<R>>
  : T;

const name = ow.optional.any(ow.string, ow.array.ofType(ow.string), ow.undefined);
const filename = ow.optional.string.is(s => (s.indexOf('/') === -1 && s.indexOf('\\') === -1) || `Filename must not include slashes, got \`${s}\``);
const filenameReq = ow.string.is(s => (s.indexOf('/') === -1 && s.indexOf('\\') === -1) || `Filename must not include slashes, got \`${s}\``);

const chapter = ow.object.exactShape({
  title: ow.optional.string,
  author: name,
  content: ow.string,
  excludeFromToc: ow.optional.boolean,
  beforeToc: ow.optional.boolean,
  filename,
  url: ow.optional.string,
});

const font = ow.object.exactShape({
  filename: filenameReq,
  url: ow.string,
});

export const validateOptions = ow.create('options', ow.object.exactShape({
  title: ow.string,
  author: name,
  publisher: ow.optional.string,
  description: ow.optional.string,
  cover: ow.optional.string,
  content: ow.array.ofType(chapter),
  tocTitle: ow.optional.string,
  prependChapterTitles: ow.optional.boolean,
  date: ow.optional.string,
  lang: ow.optional.string,
  css: ow.optional.string,
  fonts: ow.optional.any(ow.array.ofType(font), ow.undefined),
  version: ow.optional.number.is(x => x === 3 || x === 2 ||
    `Expected version to be 3 or 2, got \`${x}\``),
  verbose: ow.optional.boolean,
}));

export type Options = (typeof validateOptions) extends ReusableValidator<infer R> ? MakeOptionalObject<R> : never;
export type Chapter = (typeof chapter) extends ObjectPredicate<infer R> ? MakeOptionalObject<R> : never;
export type Font = (typeof font) extends ObjectPredicate<infer R> ? MakeOptionalObject<R> : never;
export type NormOptions = NonNullableObject<
  Merge<Options, {
    author: string[],
    fonts: ({
      mediaType: string | null,
    } & Font)[],
    content: Merge<Chapter, {
      id: string,
      author: string[],
    }>[],
  }>>;