import { spawnSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { MAIN_COLOR_TOKENS } from '../design-tokens/color/mainColors';
import { DESIGN_TOKENS } from '../design-tokens/designTokens';
import { buildMainColorNames } from '../design-tokens/pipeline/buildMainColorNames';
import { buildThemeConstants } from '../design-tokens/pipeline/buildThemeConstants';
import { buildThemeCss } from '../design-tokens/pipeline/buildThemeCss';
import { buildThemeCssVariables } from '../design-tokens/pipeline/buildThemeCssVariables';
import { buildThemeSpacing } from '../design-tokens/pipeline/buildThemeSpacing';
import { buildThemeTypes } from '../design-tokens/pipeline/buildThemeTypes';
import { collectLeaves } from '../design-tokens/pipeline/collectLeaves';
import { THEME_CSS_FILE_NAME_BY_SCHEME } from '../design-tokens/themeCssFileNameByScheme';

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const themeConstantsDirectory = resolve(packageRoot, 'src/theme-constants');
const themeDirectory = resolve(packageRoot, 'src/theme');

const leaves = collectLeaves(DESIGN_TOKENS);

const sourceOutputs: Record<string, string> = {
  [resolve(themeConstantsDirectory, THEME_CSS_FILE_NAME_BY_SCHEME.light)]:
    buildThemeCss({ leaves, scheme: 'light' }),
  [resolve(themeConstantsDirectory, THEME_CSS_FILE_NAME_BY_SCHEME.dark)]:
    buildThemeCss({ leaves, scheme: 'dark' }),
  [resolve(themeConstantsDirectory, 'themeCssVariables.ts')]:
    buildThemeCssVariables(leaves),
  [resolve(themeConstantsDirectory, 'themeTypes.generated.ts')]:
    buildThemeTypes(leaves),
  [resolve(themeDirectory, 'internal/themeSpacing.ts')]:
    buildThemeSpacing(leaves),
  [resolve(themeDirectory, 'constants/ThemeLight.ts')]: buildThemeConstants({
    leaves,
    scheme: 'light',
  }),
  [resolve(themeDirectory, 'constants/ThemeDark.ts')]: buildThemeConstants({
    leaves,
    scheme: 'dark',
  }),
  [resolve(themeDirectory, 'constants/MainColorNames.ts')]: buildMainColorNames(
    Object.keys(MAIN_COLOR_TOKENS),
  ),
};

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

console.log(`Generated theme artifacts from ${leaves.length} design tokens.`);
