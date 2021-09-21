const fs = require('fs').promises;
const path = require('path');
const dree = require('dree');
const chalk = require('chalk');

const templates = path.resolve(__dirname, '../templates');
const output = path.resolve(__dirname, '../lib/templates');

console.log(chalk.blue`{bold Compiling templates in} ${templates} {bold to} ${output}`);
dree.scanAsync(templates, {}, async element => {
  console.log('Compiling', element.relativePath);
  const out = path.resolve(output, `${element.relativePath}.ts`);
  await fs.mkdir(path.dirname(out), { recursive: true });
  const content = await fs.readFile(element.path);
  await fs.writeFile(out, `export default ${JSON.stringify(content.toString())};`);
});