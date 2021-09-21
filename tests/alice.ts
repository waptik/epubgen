import { writeFile } from 'fs/promises';
import epub from '../lib';
import optionsAlice from './aliceData';

(async () => {
  const content = await epub(optionsAlice);
  await writeFile('./alice.epub', Buffer.from(content));
})();