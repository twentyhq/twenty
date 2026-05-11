import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const imagesRoot = path.join(__dirname, '..', 'public', 'images');

const CONVERTIBLE_EXTENSIONS = /\.(png|jpe?g)$/i;

let totalBefore = 0;
let totalAfter = 0;
let count = 0;

async function walkAndConvert(directoryPath) {
  for (const entry of fs.readdirSync(directoryPath, { withFileTypes: true })) {
    const fullPath = path.join(directoryPath, entry.name);

    if (entry.isDirectory()) {
      await walkAndConvert(fullPath);
      continue;
    }

    if (!CONVERTIBLE_EXTENSIONS.test(entry.name)) {
      continue;
    }

    const outputPath = fullPath.replace(CONVERTIBLE_EXTENSIONS, '.webp');
    const beforeSize = fs.statSync(fullPath).size;

    await sharp(fullPath).webp({ quality: 92 }).toFile(outputPath);

    const afterSize = fs.statSync(outputPath).size;

    fs.unlinkSync(fullPath);

    totalBefore += beforeSize;
    totalAfter += afterSize;
    count++;

    const saved = (((beforeSize - afterSize) / beforeSize) * 100).toFixed(1);
    const rel = path.relative(imagesRoot, outputPath);
    console.log(
      `${rel}  ${(beforeSize / 1024).toFixed(0)} KB -> ${(afterSize / 1024).toFixed(0)} KB  (${saved}% saved)`,
    );
  }
}

await walkAndConvert(imagesRoot);

console.log('');
console.log(`Converted ${count} files`);
console.log(
  `Total: ${(totalBefore / 1048576).toFixed(2)} MiB -> ${(totalAfter / 1048576).toFixed(2)} MiB  (${(((totalBefore - totalAfter) / totalBefore) * 100).toFixed(1)}% saved)`,
);
