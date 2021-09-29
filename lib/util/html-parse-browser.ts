/// <reference lib="DOM" />

import type { EPub } from 'lib';
import { allowedAttributes, allowedXhtml11Tags as _allowedXhtml11Tags } from './constants';
import type { CB } from './html';

const allowedXhtml11Tags = _allowedXhtml11Tags.map(t => t.toUpperCase());

export function fixHTML(this: EPub, index: number, html: string, imgCB: CB) {
  const document = new DOMParser().parseFromString(html, 'text/html');

  // reverse to make sure we transform innermost first
  Array.from(document.body.querySelectorAll('*')).reverse().forEach(element => {
    for (const a of Array.from(element.attributes)) {
      if (allowedAttributes.indexOf(a.name as typeof allowedAttributes[number]) === -1) {
        if (this.options.verbose) console.warn(`Warning (content[${index}]): attribute ${a.name} isn't allowed.`);
        element.removeAttribute(a.name);
      }
    }

    if (this.options.version === 2 && allowedXhtml11Tags.indexOf(element.tagName as typeof allowedXhtml11Tags[number]) === -1) {
      if (this.options.verbose) console.warn(`Warning (content[${index}]): tag ${element.tagName} isn't allowed in EPUB 2/XHTML 1.1 DTD.`);
      const div = document.createElement('div');
      for (const a of Array.from(element.attributes)) div.setAttribute(a.name, a.value);
      div.innerHTML = element.innerHTML;
      element.replaceWith(div);
    }
  });
  
  // record images and change where they point
  document.body.querySelectorAll('img').forEach(element => {
    element.alt ||= "image-placeholder";
    
    if (!element.src) element.remove();
    else element.src = imgCB.call(this, element.src);
  });

  return new XMLSerializer().serializeToString(document.body);
}