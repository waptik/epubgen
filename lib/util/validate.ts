import ow, { ObjectPredicate, ReusableValidator } from 'ow';

const name = ow.optional.any(ow.string, ow.array.ofType(ow.string), ow.undefined);

const chapter = ow.object.exactShape({
  title: ow.optional.string,
  author: name,
  content: ow.string,
  excludeFromToc: ow.optional.boolean,
  beforeToc: ow.optional.boolean,
  filename: ow.optional.string.is(s => (s.indexOf('/') === -1 && s.indexOf('\\') === -1) || `Filename must not include slashes, got \`${s}\``),
  url: ow.optional.string,
});

export const validateOptions = ow.create('options', ow.object.exactShape({
  title: ow.string,
  author: name,
  publisher: ow.optional.string,
  description: ow.optional.string,
  cover: ow.optional.string,
  content: ow.array.ofType(chapter),
  tocTitle: ow.optional.string,
  appendChapterTitles: ow.optional.boolean,
  date: ow.optional.string,
  lang: ow.optional.string,
  css: ow.optional.string,
  fonts: ow.optional.any(ow.array.ofType(ow.string), ow.undefined),
  version: ow.optional.number.is(x => x === 3 || x === 2 ||
    `Expected version to be 3 or 2, got \`${x}\``),
  verbose: ow.optional.boolean,
}));

export type Options = (typeof validateOptions) extends ReusableValidator<infer R> ? MakeOptionalObject<R> : never;
export type Chapter = (typeof chapter) extends ObjectPredicate<infer R> ? R : never;
export type NormOptions = NonNullableObject<
  Omit<Options, 'author'>
  & {
    author: string[],
    content: ({
      id: string,
      author: string[],
    } & Omit<Chapter, 'author'>)[],
  }>;