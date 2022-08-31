export { normalizeSync as removeDiacritics } from "../deps.ts";

export * from "./fetchable.ts";
import fetchable from "./fetchable.ts";

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

export async function fetchFileContent(file: string) {
  const url = new URL(file, import.meta.url);
  const response = await fetch(url);
  const data = await response.text();
  console.log("fetchFileContent", { data });

  return data;
}

export function pathToUrl(path: string) {
  path = new URL(path, import.meta.url).href;
  console.log({ path });
  return path;
}
