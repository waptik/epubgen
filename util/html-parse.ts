import { compile, selectAll, selectOne } from "https://esm.sh/css-select@5.1.0";
import render from "https://deno.land/x/html_parser@v0.1.3/src/DomSerializer.ts";
import {
  Element,
  Node,
} from "https://deno.land/x/html_parser@v0.1.3/src/Node.ts";
import {
  DomUtils,
  parseDocument,
} from "https://deno.land/x/html_parser@v0.1.3/src/mod.ts";

import type { EPub } from "../epub.ts";
import { allowedAttributes } from "./constants.ts";
import type { CB } from "./html.ts";

const allNodes = compile("*");
const allImages = compile("img");

export function fixHTML(this: EPub, index: number, html: string, imgCB: CB) {
  const doc = parseDocument(html);
  const body = selectOne("body", doc.children);
  const document = body ?? doc;

  // reverse to make sure we transform innermost first
  selectAll<Node, Element>(allNodes, document).reverse().forEach((element) => {
    console.log("element: ", element);

    for (const name of Object.keys(element.attribs)) {
      if (
        allowedAttributes.indexOf(name as typeof allowedAttributes[number]) ===
          -1
      ) {
        this.log("selectAll 1", { name });
        this.warn(
          `Warning (content[${index}]): attribute ${name} isn't allowed.`,
        );
        delete element.attribs[name];
      }
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
