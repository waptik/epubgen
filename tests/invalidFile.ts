import epub from '../lib';

(async () => {
  try {
    await epub({ title: 'EPub Gen', verbose: true }, [{ content: `<p>Generate EPUB books from HTML with a simple API in Node.js or the browser.</p><p><img src="file:///invalid/file/path">` }]);
  } catch (err) {
    console.log(`Caught \`${err}\` as expected`);
  }
})();