import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { generateTwentyIconDictionaryMarkdown } from '../src/icon/internal/generateTwentyIconDictionaryMarkdown';

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const outputPath = resolve(scriptDirectory, '../src/icon/icon-dictionary.md');
const generatedMarkdown = generateTwentyIconDictionaryMarkdown();
const isCheckOnly = process.argv.includes('--check');

if (isCheckOnly) {
  const currentMarkdown = existsSync(outputPath)
    ? readFileSync(outputPath, 'utf8')
    : undefined;

  if (currentMarkdown !== generatedMarkdown) {
    throw new Error(
      'The icon dictionary Markdown is stale. Run `npx nx generateIconDictionary twenty-ui`.',
    );
  }
} else {
  writeFileSync(outputPath, generatedMarkdown, 'utf8');
}
