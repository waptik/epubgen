import { writeFile } from 'fs/promises';
import { resolve } from 'path';
import epub from '../lib';

(async () => {
  const content = await epub({ title: 'EPub Gen' }, [{ content: `<p>Generate EPUB books from HTML with a simple API in Node.js or the browser.</p><p><img src="file://${resolve(__dirname, '../../demo_preview.png')}"><img>` }]);
  await writeFile(`${__filename.slice(0, -3)}.epub`, Buffer.from(content));
})();