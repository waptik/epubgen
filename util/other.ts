export { normalizeSync as removeDiacritics } from "../deps.ts";

export * from "./fetchable.ts";
import { dejs, path } from "../deps.ts";
import fetchable from "./fetchable.ts";
import assets from "../assets.json" assert { type: "json" };

export const encoder = new TextEncoder();

export const uuid = () =>
  "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx"
    .replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0;
      return (c === "x" ? r : r & 0x3 | 0x8).toString(16);
    });

export const retryFetch = async (
  url: string,
  timeout: number,
  retry: number,
  log: typeof console.log,
) => {
  for (let i = 0; i < retry - 1; i++) {
    try {
      return await fetchable(url, timeout);
    } catch {
      log(
        `Failed to fetch \`${url}\` ${i + 1} ${
          i === 0 ? "time" : "times"
        }. Retrying...`,
      );
    }
  }
  // last try, no catching
  return fetchable(url, timeout);
};
export function fetchFileContent(file: string): Promise<string> {
  // todo read user custom templates

  return Promise.resolve(
    (assets as Record<string, string>)[file],
  );
  // const templatesGitHubURL =
  //   "https://raw.githubusercontent.com/waptik/epubgen/main/templates";
  // const url = new URL(`${templatesGitHubURL}/${file}`, import.meta.url);
  //
  // const response = await fetch(url);
  // return await response.text();
}

export const renderTemplate = (
  fileName: string,
  data: Record<string, unknown>,
) => {
  return new Promise<string>((resolve, reject) => {
    fetchFileContent(fileName).then((template) => {
      dejs.renderToString(template, data).then(
        (
          rendered,
        ) => {
          resolve(rendered);
        },
      ).catch((error) => {
        reject(error);
      });
    });
  });
};
