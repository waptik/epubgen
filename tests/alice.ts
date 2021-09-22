import { writeFile } from 'fs/promises';
import epub from '../lib';
import { contentAlice, optionsAlice } from './aliceData';

(async () => {
  const content = await epub(optionsAlice, contentAlice);
  await writeFile('./alice.epub', Buffer.from(content));
})();