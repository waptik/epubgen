import epub from '../lib';

(async () => {
  try {
    await epub({ bla: 1 } as any, []);
    process.exit(-1);
  } catch (err) {
    console.log(`Caught \`${err}\` as expected`);
  }
})();