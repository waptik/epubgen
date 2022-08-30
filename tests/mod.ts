import { download } from "./download.ts";

Deno.test({
  name: "download.epub",
  fn: async () => {
    await download.epub();
  },
});
