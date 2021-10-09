import { getExtension, getType } from 'mime';
import type { EPub } from '..';
import { fixHTML } from './html-parse';
import { uuid } from './other';

export type CB = typeof imgSrc;

export type Image = {
  url: string,
  id: string,
  extension: string | null,
  mediaType: string | null,
};

function imgSrc(this: EPub, url: string) {
  let image = this.images.find(i => i.url === url);
  if (!image) {
    const mediaType = getType(url.replace(/\?.*/, "")) || '';
    image = {
      url,
      mediaType,
      id: uuid(),
      extension: getExtension(mediaType) || '',
    };
    this.images.push(image);
  }
  return `images/${image.id}.${image.extension}`;
}

export function normalizeHTML(this: EPub, index: number, data: string) {
  return fixHTML.call(this, index, data, imgSrc).replace(/^<body(?: xmlns="http:\/\/www\.w3\.org\/1999\/xhtml")?>|<\/body>$/g, '');
}