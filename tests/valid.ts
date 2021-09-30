import { writeFile } from 'fs/promises';
import fetch from 'node-fetch';
import epub, { optionsDefaults } from '../lib';
import { contentAlice, optionsAlice } from './aliceData';

optionsAlice.css = `${optionsDefaults(2).css}
/* latin-ext */
@font-face {
  font-family: 'Lato';
  font-style: normal;
  font-weight: 400;
  src: url(./fonts/lato-ext.woff2) format('woff2');
  unicode-range: U+0100-024F, U+0259, U+1E00-1EFF, U+2020, U+20A0-20AB, U+20AD-20CF, U+2113, U+2C60-2C7F, U+A720-A7FF;
}
/* latin */
@font-face {
  font-family: 'Lato';
  font-style: normal;
  font-weight: 400;
  src: url(./fonts/lato.woff2) format('woff2');
  unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
}

@font-face {
  font-family: 'Advent Pro';
  font-style: normal;
  font-weight: 400;
  src: url(./fonts/advent.ttf) format('ttf');
}

body {
  font-family: Lato;
}
`;
optionsAlice.fonts = [
  { url: 'https://fonts.gstatic.com/s/lato/v20/S6uyw4BMUTPHjxAwXjeu.woff2', filename: 'lato-ext.woff2' },
  { url: 'https://fonts.gstatic.com/s/lato/v20/S6uyw4BMUTPHjx4wXg.woff2', filename: 'lato.woff2' },
  { url: 'http://fonts.gstatic.com/s/adventpro/v4/1NxMBeKVcNNH2H46AUR3wfesZW2xOQ-xsNqO47m55DA.ttf', filename: 'advent.ttf' },
];
optionsAlice.version = 2;

contentAlice.push({
  ...contentAlice[1],
  content: `<main attr="bla"><img somerandomattr>${contentAlice[1].content.replace('<img', '<IMG')}</main><div>`,
});


(async () => {
  const content = await epub(optionsAlice, contentAlice);
  await writeFile(`${__filename.slice(0, -3)}.epub`, Buffer.from(content));

  contentAlice.push({
    content: await fetch('http://example.com/').then(res => res.text()),
  });
  const content2 = await epub(optionsAlice, contentAlice);
  await writeFile(`${__filename.slice(0, -3)}_html.epub`, Buffer.from(content2));
})();