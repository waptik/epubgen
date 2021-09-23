import { writeFile } from 'fs/promises';
import epub from '../lib';
import { contentAlice, optionsAlice } from './aliceData';

(async () => {
  optionsAlice.version = 2;
  const content = await epub(optionsAlice, contentAlice);
  await writeFile('./alice2.epub', Buffer.from(content));

  optionsAlice.tocInTOC = false;
  contentAlice[0].excludeFromToc = true;
  const content2 = await epub(optionsAlice, contentAlice);
  await writeFile('./alice2_notoc.epub', Buffer.from(content2));
})();