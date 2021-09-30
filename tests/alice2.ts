import { writeFile } from 'fs/promises';
import epub from '../lib';
import { contentAlice, optionsAlice } from './aliceData';

(async () => {
  optionsAlice.version = 2;
  const content = await epub(optionsAlice, contentAlice);
  await writeFile(`${__filename.slice(0, -3)}.epub`, Buffer.from(content));

  optionsAlice.tocInTOC = false;
  optionsAlice.numberChaptersInTOC = false;
  contentAlice[0].excludeFromToc = true;
  const content2 = await epub(optionsAlice, contentAlice);
  await writeFile(`${__filename.slice(0, -3)}_notoc.epub`, Buffer.from(content2));
})();