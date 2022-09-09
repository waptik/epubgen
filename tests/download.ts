// import epubgen from "https://esm.sh/epub-gen-memory@1.0.9/sabstub?target=node&deps=domhandler,domutils,htmlparser2";
import epubgen from "../mod.ts";

import { contentAlice, optionsAlice } from "./aliceData.ts"; // modified copy of https://github.com/cpiber/epub-gen-memory/blob/master/tests/aliceData.ts

class Download {
  private uuid: string;

  constructor() {
    this.uuid = crypto.randomUUID();
  }

  async epub() {
    try {
      const filename = `alice_${this.uuid}.epub`;
      const content = await epubgen(optionsAlice, contentAlice);
      await Deno.writeFile(
        `temp/${filename}`,
        content,
      );
      console.log(`Downloaded epub: ${filename}`);
    } catch (error) {
      console.error(error);
    }
  }
}

export const download = new Download();
