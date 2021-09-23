# epub-gen-memory -- a library to make EPUBs from HTML

Generate EPUB books from HTML with a simple API in Node.js or the browser.

See [JSZip Support table](https://stuk.github.io/jszip/) for which engines are supported. In addition, browsers need to support `fetch` as well as `DOMParser` to replace `node-fetch` and `jsdom`.

------

This EPUB library will generate the needed files, as well as download all referenced images. Note that all fonts and all images respectively are downloaded in parallel, so please keep that in mind when adjusting `fetchTimeout`.

Note that in the browser, only images on servers with CORS enabled can be downloaded.

On the server (with Node.js), image paths can also start with `file://`, in which case they are read directly from disc. The part after `file://` must be a valid path for your system, as read by [`fs.readFile`](https://nodejs.org/api/fs.html#fs_file_url_paths).


## Usage

Install the lib and add it as a dependency (recommended), run in your project directory:

```shell
npm install epub-gen-memory --save
```

Then put this in your code:

```js
import epub from 'epub-gen-memory';

epub(options).then(
    content => console.log("Ebook Generated Successfully!"),
    err => console.error("Failed to generate Ebook because of ", err)
);
```

See [JSZip documentation](https://github.com/Stuk/jszip/blob/master/documentation/howto/write_zip.md) on how to get the zip to the user. For a nodejs example please see the tests.

In environments where `SharedArrayBuffer` is not available, you might want to instead import from `epub-gen-memory/sabstub`, which includes a non-functional stub:

```js
import epub from 'epub-gen-memory/sabstub';
```

The package also includes a [browserify](https://www.npmjs.com/package/browserify)d bundle (UMD) as `epub-gen-memory/bundle`. It is recommended to use the bundle if you want to build for the browser. The bundle is also available from a CDN: [UNPKG](https://unpkg.com/epub-gen-memory). The bundle also includes the proper return type for the browser (`Blob` instead of `Buffer`).

```js
import epub from 'epub-gen-memory/bundle';
```

**Note**: This library was written in TypeScript and thus uses ESM exports, but it was compiled to CommonJS, so you can also use the following:

```js
const epub = require('epub-gen-memory').default;
```


## API

```js
import epub, { EPub, optionsDefaults, chapterDefaults } from 'epub-gen-memory';
import type { Options, Content, Chapter, Font } from 'epub-gen-memory';
```


### `epub(options, content)`

- `options`: `Options` (see [below](#options))
- `content`: `Chapter[]` (see [below](#chapters))
- Returns: `Promise<Buffer>`
- **Browser** Returns: `Promise<Blob>`


### `class EPub`

- `contructor(options: Options, content: Chapter[])`
- `render(): Promise<EPub>`
- `genEpub(): Promise<Buffer>` (Browser `Promise<Blob>`)
- `generateAsync(options: JSZipGeneratorOptions): Promise<...>` see [JSZip.generateAsync](https://stuk.github.io/jszip/documentation/api_jszip/generate_async.html)
protected:
- `generateTemplateFiles(): Promise<void>`
- `downloadAllFonts(): Promise<void>`
- `downloadAllImages(): Promise<void>`
- `makeCover(): Promise<void>`


### `optionsDefaults([version])`

- `version`: `number` (default `3`) Epub version
- Returns: `Options` defaults


### `chapterDefaults(index)`

- `index`: `number` of the chapter
- Returns: `Chapter` defaults


### Options

- `title`: `string`
    Title of the book
- `author`: `string | string[]` (optional, default `['anonymous']`)
    Name of the author for the book, e.g. `"Alice"` or `["Alice", "Bob"]`
- `publisher`: `string` (optional, default `anonymous`)
    Publisher name
- `description`: `string` (optional)
    Book description
- `cover`: `string` (optional)
    Book cover image URL, e.g. `"http://abc.com/book-cover.jpg"`
- `tocTitle`: `string` (optional, default `Table of Contents`)
    Title of the Table of Contents
- `prependChapterTitles`: `boolean` (optional, default `true`)
    Automatically put the title of the chapter before the content
- `date`: `string` (optional, default today)
    Publication date
- `lang`: `string` (optional, default `en`)
    Language code of the book
- `css`: `string` (optional)
    CSS string, replaces our default styles, e.g: `"body{background: #000}"`
- `fonts`: `Font[]` (optional)
    Array of fonts to include, see [below](#fonts)
- `version`: `number` (optional, default `3`)
    Version of the generated EPUB, `3` for the latest version (http://idpf.org/epub/30) or `2` for the previous version (http://idpf.org/epub/201)
- `fetchTimeout`: `number` (optional, default `20000`)
    Timeout time for requests, in milliseconds; Browsers need to support `AbortController` and signals for this to work
- `retryTimes`: `number` (optional, default `3`)
    How many times to retry fetching resources
- `verbose`: `boolean` (optional, default `false`)
    Whether to log progress messages


### Chapters

**Within each chapter object:**

- `title`: `string` (optional, default `Chapter [number]`)
    Chapter title
- `author`: `string | string[]` (optional)
    Chapter author, generates info below chapter title
- `content`: `string`
    HTML String of the chapter content, image sources are downloaded
- `excludeFromToc`: `boolean` (optional, default `false`)
    Don't list chapter in Table of Contents
- `beforeToc`: `boolean` (optional, default `false`)
    List chapter before Table of Contents heading
- `filename`: `string` (optional)
    Custom name for chapter file
- `url`: `string` (optional)
    External link below chapter title


### Fonts

**Within each font object:**

- `filename`: `string`
    Name under which the font should be downloaded, including file extension
- `url`: `string`
    URL where to find font, for best compatibility use `ttf` (TrueType) fonts


You can then use the fonts as such (assuming you have a font with filename `Merriweather.ttf`):

```css
@font-face {
    font-family: "Merriweather";
    font-style: normal;
    font-weight: normal;
    src : url(./fonts/Merriweather.ttf);
}
```


## Demo Preview:

![Demo Preview](demo_preview.png?raw=true)

_From Lewis Carroll "Alice's Adventures in Wonderland", based on text at https://www.cs.cmu.edu/~rgs/alice-table.html and images from http://www.alice-in-wonderland.net/resources/pictures/alices-adventures-in-wonderland._

Please see the tests for the code used.


## Credits

This library is based on the work of @cyrilis.
