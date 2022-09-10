# Deno Epub generator

A wrapper around [epub-gen-memory](https://github.com/cpiber/epub-gen-memory)
for deno.

## Usage:

Create epub file:

```ts
import epub from "https://deno.land/x/epubgen/mod.ts";

epub(options).then(
  (content) => console.log("Ebook Generated Successfully!"),
  (err) => console.error("Failed to generate Ebook because of ", err)
);
```
