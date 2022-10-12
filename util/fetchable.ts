export const type = "arraybuffer";

const fetchable = async (url: string, timeout: number) => {
  const controller = new AbortController();
  const out = setTimeout(() => controller.abort(), timeout);

  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) {
      throw new Error(
        `Got error ${res.status} (${res.statusText}) while fetching ${url}`,
      );
    }

    return res.arrayBuffer();
  } finally {
    clearTimeout(out);
  }
};
export default fetchable;
