import fetch from 'node-fetch';

export const type = 'nodebuffer';

const fetchable = (url: string) => fetch(url).then(res => {
  if (!res.ok)
    throw new Error(`Got error ${res.status} (${res.statusText}) while fetching ${url}`);
  return res.buffer();
});
export default fetchable;