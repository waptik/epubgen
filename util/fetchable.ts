export const type = "arraybuffer";

const fetchable = async (url: string, timeout: number) => {
  const controller = new AbortController();
  const out = setTimeout(() => controller.abort(), timeout);

  try {
    // if (url.startsWith("file://")) {
    //   console.log("fetchable: url.startsWith(file://)");
    //
    //   return Deno.readFile(new URL(url), { signal: controller.signal });
    // }

    const res = await fetch(url, { signal: controller.signal });
    // console.log("res 222", res);
    if (!res.ok) {
      throw new Error(
        `Got error ${res.status} (${res.statusText}) while fetching ${url}`,
      );
    }
    // const str = await res.text();
    // console.log("str", str);
    return res.arrayBuffer();
    // return res.text();
    // return res.blob();
  } finally {
    clearTimeout(out);
  }
};
export default fetchable;
