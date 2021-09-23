const fs = require('fs').promises;
const path = require('path');
const dree = require('dree');
const chalk = require('chalk');
const chokidar = require('chokidar');
const rimraf = require('rimraf');

const templates = path.resolve(__dirname, '../templates');
const output = path.resolve(__dirname, '../lib/templates');

const compile = async (relativePath, fullPath) => {
  console.log('Compiling', relativePath);
  const out = path.resolve(output, `${relativePath}.ts`);
  await fs.mkdir(path.dirname(out), { recursive: true });
  const content = await fs.readFile(fullPath);
  await fs.writeFile(out, `export default ${JSON.stringify(content.toString())} as string;`);
};

console.log(chalk.yellow`{bold Cleaning template directory} ${output}`);
rimraf.sync(output);

console.log(chalk.blue`{bold Compiling templates in} ${templates} {bold to} ${output}`);

if (process.argv.indexOf('-w') !== -1 || process.argv.indexOf('--watch') !== -1) {
  const watcher = chokidar.watch(templates);
  watcher.on('add', fullPath => compile(path.relative(templates, fullPath), fullPath));
  watcher.on('change', fullPath => compile(path.relative(templates, fullPath), fullPath));
  watcher.on('unlink', async fullPath => {
    const relativePath = path.relative(templates, fullPath);
    const out = path.resolve(output, `${relativePath}.ts`);
    console.log(chalk.yellow`{bold Removing compiled file} ${relativePath}`);
    await fs.rm(out);
  });
} else {
  dree.scanAsync(templates, {}, element => compile(element.relativePath, element.path));
}
