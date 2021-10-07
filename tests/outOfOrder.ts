import { writeFile } from 'fs/promises';
import epub from '../lib';
import { contentAlice, optionsAlice } from './aliceData';

const warnings: any[][] = [];
optionsAlice.verbose = (type, ...args) => {
  if (type === 'warn') warnings.push(args);
  (type === 'warn' ? console.warn : console.log)(...args);
};

contentAlice[2].beforeToc = true;

(async () => {
  const content = await epub(optionsAlice, contentAlice);
  await writeFile(`${__filename.slice(0, -3)}.epub`, Buffer.from(content));
  const order = warnings.find(w => typeof w[0] === 'string' && w[0].match(/out of order/));
  if (!order) process.exit(-1);

  contentAlice[1].beforeToc = true;
  warnings.splice(0);

  const content2 = await epub(optionsAlice, contentAlice);
  await writeFile(`${__filename.slice(0, -3)}_ok.epub`, Buffer.from(content2));
  const order2 = warnings.find(w => typeof w[0] === 'string' && w[0].match(/out of order/));
  if (order2) process.exit(-1);
})();