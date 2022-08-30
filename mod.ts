import ow from "ow";
import { Content, Options, optionsPredicate } from "./util/validate.ts";

import { EPub } from "./epub.ts";

// jzip.file()
// zip.addFile("Hello.txt", "Hello World\n");

// const img = zip.folder("images");
// img.addFile("smile.gif", "\0", { base64: true });

// await zip.writeZip("example.zip");

const epub = (
  optionsOrTitle: Options | string,
  content: Content,
  ...args: (boolean | number)[]
) => {
  ow(optionsOrTitle, ow.any(optionsPredicate, ow.string));
  const options = ow.isValid(optionsOrTitle, ow.string)
    ? { title: optionsOrTitle }
    : optionsOrTitle;
  ow(args, ow.array.ofType(ow.any(ow.boolean, ow.number)));
  args.forEach((arg) => {
    if (ow.isValid(arg, ow.boolean)) options.verbose = arg;
    else options.version = arg;
  });

  return new EPub(options, content).genEpub();
};
export default epub;
