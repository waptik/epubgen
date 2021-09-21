/// <reference lib="DOM" />
export const type = 'blob';

const fetchable = (url: string) => fetch(url).then(res => {
  if (!res.ok)
    throw new Error(`Got error ${res.status} (${res.statusText}) while fetching ${url}`);
  return res.blob();
});
export default fetchable;