# epub-gen-memory - a library to make EPUBs from HTML

Generate EPUB books from HTML with a simple API in Node.js or the browser.

See [https://stuk.github.io/jszip/](JSZip Support table) for which engines are supported.

------

This EPUB library will generate the needed files, as well as download all referenced images.

Note that in the browser, only images on servers with CORS enabled can be downloaded.


## Usage

Install the lib and add it as a dependency (recommended), run in your project directory:

	npm install epub-gen-memory --save

Then put this in your code:

```js
    import epub from 'epub-gen-memory';

    epub(options).then(
        content => console.log("Ebook Generated Successfully!"),
	    err => console.error("Failed to generate Ebook because of ", err)
    );
```

In environments where `Shared ArrayBuffer` is not available, you might want to instead import from `epub-gen-memory/sabstub`, which includes a non-functional stub:

```js
    import epub from 'epub-gen-memory/sabstub';
```

The package also includes a [browserify](https://www.npmjs.com/package/browserify)d bundle (UMD) as `epub-gen-memory/bundle`. It is recommended to use the bundle if you want to build for the browser. The bundle is also available from a CDN: [UNPKG](https://unpkg.com/epub-gen-memory).

```js
    import epub from 'epub-gen-memory/bundle';
```


## API

### `epub(options)`

- `options` Options (includes data)
- Returns: `Promise<Buffer>`
- **Browser** Returns: `Promise<Blob>`


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
- `content`: `Chapter[]`
    Contents of the book, see below
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
    Array of fonts to include, see below
- `version`: `number` (optional, default `3`)
    Version of the generated EPUB, `3` the latest version (http://idpf.org/epub/30) or `2` the previous version (http://idpf.org/epub/201)
- `verbose`: `boolean` (optional, default `false`)
    Whether to log progress messages


### Chapters

**Within each chapter object:**

- `title`: `string` (optional, default `no title`)
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


## Demo Code:

Please see the tests.


## Demo Preview:

![Demo Preview](demo_preview.png?raw=true)

_From Lewis Carroll "Alice's Adventures in Wonderland", based on text at https://www.cs.cmu.edu/~rgs/alice-table.html and images from http://www.alice-in-wonderland.net/resources/pictures/alices-adventures-in-wonderland._


## Credits

This library is based on the work of @cyrilis.
