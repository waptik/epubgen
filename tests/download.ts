import epubgen from "../mod.ts";

import { contentAlice, optionsAlice } from "./aliceData.ts"; // modified copy of https://github.com/cpiber/epub-gen-memory/blob/master/tests/aliceData.ts

class Download {
  private uuid: string;

  constructor() {
    this.uuid = crypto.randomUUID();
  }

  async epub() {
    const content = await epubgen(optionsAlice, contentAlice);
    await Deno.writeFile(
      `temp/alice_${this.uuid}.epub`,
      content,
    );

    // optionsAlice.numberChaptersInTOC = false;
    // const content2 = await epubgen(optionsAlice, contentAlice);
    // await Deno.writeFile(
    //   `./novels/alice_${this.uuid}_nonum.epub`,
    //   new Uint8Array(content2),
    // );
  }
}

export const download = new Download();
