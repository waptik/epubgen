import { writeFile } from 'fs/promises';
import epub from '../lib';

(async () => {
  try {
    await epub({ title: 'EPub Gen', verbose: true }, [{ content: `<p>Generate EPUB books from HTML with a simple API in Node.js or the browser.</p><p><img src="file:///invalid/file/path">` }]);
    process.exit(-1);
  } catch (err) {
    console.log(`Caught \`${err}\` as expected`);
  }

  const content = await epub({ title: 'EPub Gen', verbose: true, ignoreFailedDownloads: true }, [{ content: `<p>Generate EPUB books from HTML with a simple API in Node.js or the browser.</p><p><img src="file:///invalid/file/path">` }]);
  await writeFile(`${__filename.slice(0, -3)}.epub`, Buffer.from(content));
})();