# Deno Epub generator

A wrapper around [epub-gen-memory](https://github.com/cpiber/epub-gen-memory)
for deno.

## Usage:

Create epub file:

```ts
import epub from "https://deno.land/x/epubgen/mod.ts";

epub(options, chapters).then(
  (content) => console.log("Ebook Generated Successfully!"),
  (err) => console.error("Failed to generate Ebook because of ", err),
);
```

## Example

```ts
import epub from "https://deno.land/x/epubgen/mod.ts";
import * as path from "https://deno.land/std@0.159.0/path/mod.ts";
const options = {
  title: "Book Title",
  description: "This is a test book",
  author: "John",
  // cover: path.toFileUrl(path.resolve("cover.jpg")).href,
  cover:
    "http://orig10.deviantart.net/e272/f/2013/255/0/0/alice_in_wonderland_book_cover_by_pannucabaguana-d6m003p.jpg",
};

epub(options, [
  {
    title: "Chapter 1",
    content: "<p>Hello world!</p>",
  },
]).then(
  (content) => {
    Deno.writeFileSync("book.epub", content);
  },
  (err) => console.error("Failed to generate Ebook because of ", err),
);
```

## Epub Check Online

<https://draft2digital.com/book/epubcheck/upload>
