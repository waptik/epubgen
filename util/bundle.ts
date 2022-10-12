import { fs, path, posixPath } from "../deps.ts";
export async function buildBundle(folder: string) {
  const bundles: Record<string, string> = {};
  const currentUrl = new URL(".", import.meta.url);
  const currentParrentDir = path.dirname(currentUrl.pathname);
  const relativeUrl = path.join(currentParrentDir, folder);
  const absolutePath = path.resolve(currentParrentDir, relativeUrl);
  for await (const entry of fs.walk(absolutePath)) {
    if (entry.isFile && !entry.name.startsWith(".")) {
      const fileContent = await Deno.readTextFile(
        entry.path,
      );
      const entryRelativePath = path.relative(absolutePath, entry.path);
      bundles[entryRelativePath] = fileContent;
    }
  }

  const bundle = JSON.stringify(bundles);
  const bundlePath = path.join(currentParrentDir, "assets.json");
  await fs.ensureFile(bundlePath);
  console.log(`Writing bundle to ${bundlePath}`);
  await Deno.writeTextFile(bundlePath, bundle);
}
