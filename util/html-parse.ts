import { compile, selectAll, selectOne } from "https://esm.sh/css-select@5.1.0";
import render from "htmlparser/DomSerializer.ts";
import { Element, Node } from "htmlparser/Node.ts";
import { DomUtils, parseDocument } from "htmlparser/mod.ts";

import type { EPub } from "../epuby.ts";
import { allowedAttributes, allowedXhtml11Tags } from "./constants.ts";
import type { CB } from "./html.ts";

const allNodes = compile("*");
const allImages = compile("img");

export function fixHTML(this: EPub, index: number, html: string, imgCB: CB) {
  const doc = parseDocument(html);
  const body = selectOne("body", doc.children);
  const document = body ?? doc;

  // reverse to make sure we transform innermost first
  selectAll<Node, Element>(allNodes, document).reverse().forEach((element) => {
    for (const name of Object.keys(element.attribs)) {
      if (
        allowedAttributes.indexOf(name as typeof allowedAttributes[number]) ===
          -1
      ) {
        this.warn(
          `Warning (content[${index}]): attribute ${name} isn't allowed.`,
        );
        delete element.attribs[name];
      }
    }

    if (
      this.options.version === 2 &&
      allowedXhtml11Tags.indexOf(
          element.tagName as typeof allowedXhtml11Tags[number],
        ) === -1
    ) {
      this.warn(
        `Warning (content[${index}]): tag ${element.tagName} isn't allowed in EPUB 2/XHTML 1.1 DTD.`,
      );
      element.tagName = "div"; // yay for object-based trees
    }
  });

  // record images and change where they point
  selectAll<Node, Element>(allImages, document).forEach((element) => {
    element.attribs.alt ||= "image-placeholder";

    if (!element.attribs.src) DomUtils.removeElement(element);
    else element.attribs.src = imgCB.call(this, element.attribs.src);
  });

  return render(document, { xmlMode: true });
}
