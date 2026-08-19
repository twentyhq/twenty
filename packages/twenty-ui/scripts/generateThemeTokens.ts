import { spawnSync } from 'node:child_process';
import { copyFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { DESIGN_TOKENS } from '../design-tokens/designTokens';
import { buildDocsJson } from '../design-tokens/pipeline/buildDocsJson';
import { buildStaticTokens } from '../design-tokens/pipeline/buildStaticTokens';
import { buildThemeCss } from '../design-tokens/pipeline/buildThemeCss';
import { buildThemeCssVariables } from '../design-tokens/pipeline/buildThemeCssVariables';
import { buildThemeTypes } from '../design-tokens/pipeline/buildThemeTypes';
import { collectLeaves } from '../design-tokens/pipeline/collectLeaves';

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const themeConstantsDirectory = resolve(packageRoot, 'src/theme-constants');
const tokensDirectory = resolve(packageRoot, 'src/tokens');
const distDirectory = resolve(packageRoot, 'dist');
const generatedDirectory = resolve(packageRoot, 'generated');

const leaves = collectLeaves(DESIGN_TOKENS);

const sourceOutputs: Record<string, string> = {
  [resolve(themeConstantsDirectory, 'theme-light.css')]: buildThemeCss(
    leaves,
    'light',
  ),
  [resolve(themeConstantsDirectory, 'theme-dark.css')]: buildThemeCss(
    leaves,
    'dark',
  ),
  [resolve(themeConstantsDirectory, 'themeCssVariables.ts')]:
    buildThemeCssVariables(leaves),
  [resolve(themeConstantsDirectory, 'themeTypes.generated.ts')]:
    buildThemeTypes(leaves),
  [resolve(tokensDirectory, 'tokensLight.ts')]: buildStaticTokens(
    leaves,
    'light',
  ),
  [resolve(tokensDirectory, 'tokensDark.ts')]: buildStaticTokens(
    leaves,
    'dark',
  ),
};

mkdirSync(tokensDirectory, { recursive: true });
for (const [filePath, content] of Object.entries(sourceOutputs)) {
  writeFileSync(filePath, content, 'utf-8');
}

const formatResult = spawnSync(
  'npx',
  ['oxfmt', ...Object.keys(sourceOutputs)],
  { cwd: packageRoot, stdio: 'inherit' },
);
if (formatResult.status !== 0) {
  throw new Error('oxfmt failed on the generated theme files');
}

mkdirSync(distDirectory, { recursive: true });
for (const cssFileName of ['theme-light.css', 'theme-dark.css']) {
  copyFileSync(
    resolve(themeConstantsDirectory, cssFileName),
    resolve(distDirectory, cssFileName),
  );
}

mkdirSync(generatedDirectory, { recursive: true });
writeFileSync(
  resolve(generatedDirectory, 'tokens.docs.json'),
  buildDocsJson(leaves),
  'utf-8',
);

console.log(`Generated theme artifacts from ${leaves.length} design tokens.`);
