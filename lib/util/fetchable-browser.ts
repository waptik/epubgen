/// <reference lib="DOM" />
export const type = 'blob';

const fetchable = async (url: string, timeout: number) => {
  const controller = typeof AbortController !== "undefined" ? new AbortController() : {} as AbortController;
  const out = setTimeout(() => controller.abort && controller.abort(), timeout);

  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok)
      throw new Error(`Got error ${res.status} (${res.statusText}) while fetching ${url}`);
    return res.blob();
  } finally {
    clearTimeout(out);
  }
};
export default fetchable;