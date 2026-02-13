import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';

const main = () => {
  const version = process.argv[2];

  if (!version) {
    console.error('Missing "version" parameter');
    process.exit(1);
  }

  const filePath = resolve('package.json');

  const pkg = JSON.parse(readFileSync(filePath, 'utf8'));

  pkg.version = version;
  writeFileSync(filePath, JSON.stringify(pkg, null, 2) + '\n');

  const updatedPkg = JSON.parse(readFileSync(filePath, 'utf8'));

  console.log(`${updatedPkg.name}:${updatedPkg.version}`);
};

main();
