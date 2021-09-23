import { getExtension, getType } from 'mime';
import { serializeToString } from 'xmlserializer';
import type { EPub } from '..';
import { allowedAttributes, allowedXhtml11Tags } from './constants';
import { parse } from './html-parse-browser';
import { uuid } from './other';

export type Image = {
  url: string,
  id: string,
  extension: string | null,
  mediaType: string | null,
};

export function normalizeHTML(this: EPub, index: number, data: string) {
  const document = parse(data);

  // reverse to make sure we transform innermost first
  Array.from(document.body.querySelectorAll('*')).reverse().forEach(element => {
    for (const a of Array.from(element.attributes)) {
      if (allowedAttributes.indexOf(a.name as typeof allowedAttributes[number]) === -1)
        element.removeAttribute(a.name);
    }

    if (this.options.version === 2 && allowedXhtml11Tags.indexOf(element.tagName.toLowerCase() as typeof allowedXhtml11Tags[number]) === -1) {
      if (this.options.verbose) console.warn(`Warning (content[${index}]): tag ${element.tagName} isn't allowed on EPUB 2/XHTML 1.1 DTD.`);
      element.replaceWith(`<div>${element.innerHTML}</div>`);
    }
  });

  // record images and change where they point
  document.body.querySelectorAll('img').forEach(element => {
    element.alt ||= "image-placeholder";
    
    const url = element.src;
    let image = this.images.find(i => i.url === url);
    if (!image) {
      const mediaType = getType(url.replace(/\?.*/, ""));
      image = {
        url,
        mediaType,
        id: uuid(),
        extension: getExtension(mediaType || ''),
      };
      this.images.push(image);
    }
    element.src = `images/${image.id}.${image.extension}`;
  });

  return serializeToString(document.body as unknown as import('parse5').Element).replace(/^<body xmlns="http:\/\/www\.w3\.org\/1999\/xhtml">|<\/body>$/g, '');
}