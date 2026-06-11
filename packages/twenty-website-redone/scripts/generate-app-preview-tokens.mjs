import { execSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';

import { appPreviewTokenGeneration } from './app-preview-token-generation.mjs';

const theme = await appPreviewTokenGeneration.buildTheme();
const moduleSource = appPreviewTokenGeneration.renderModule(theme);

mkdirSync(dirname(appPreviewTokenGeneration.outputPath), { recursive: true });
writeFileSync(appPreviewTokenGeneration.outputPath, moduleSource);
execSync(`npx oxfmt ${appPreviewTokenGeneration.outputPath}`, {
  stdio: 'inherit',
});

console.log(
  `generate-app-preview-tokens: wrote ${appPreviewTokenGeneration.outputPath}`,
);
