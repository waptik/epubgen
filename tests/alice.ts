import { writeFile } from 'fs/promises';
import epub from '../lib';
import { contentAlice, optionsAlice } from './aliceData';

(async () => {
  const content = await epub(optionsAlice, contentAlice);
  await writeFile(`${__filename.slice(0, -3)}.epub`, Buffer.from(content));

  optionsAlice.numberChaptersInTOC = false;
  const content2 = await epub(optionsAlice, contentAlice);
  await writeFile(`${__filename.slice(0, -3)}_nonum.epub`, Buffer.from(content2));
})();