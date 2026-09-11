import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { MAIN_COLOR_TOKENS } from '../design-tokens/color/mainColors';
import { DESIGN_TOKENS } from '../design-tokens/designTokens';
import { buildMainColorNames } from '../design-tokens/pipeline/buildMainColorNames';
import { buildTagColors } from '../design-tokens/pipeline/buildTagColors';
import { buildThemeConstants } from '../design-tokens/pipeline/buildThemeConstants';
import { buildThemeCss } from '../design-tokens/pipeline/buildThemeCss';
import { buildThemeCommon } from '../design-tokens/pipeline/buildThemeCommon';
import { buildThemeCssVariables } from '../design-tokens/pipeline/buildThemeCssVariables';
import { buildThemeSpacing } from '../design-tokens/pipeline/buildThemeSpacing';
import { buildThemeSubtreeConstant } from '../design-tokens/pipeline/buildThemeSubtreeConstant';
import { buildThemeTypes } from '../design-tokens/pipeline/buildThemeTypes';
import { collectLeaves } from '../design-tokens/pipeline/collectLeaves';
import { THEME_COMMON_ROOT_KEYS } from '../design-tokens/themeCommonRootKeys';
import { THEME_CSS_FILE_NAME_BY_SCHEME } from '../design-tokens/themeCssFileNameByScheme';

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const themeConstantsDirectory = resolve(packageRoot, 'src/theme-constants');
const themeDirectory = resolve(packageRoot, 'src/theme');

const leaves = collectLeaves(DESIGN_TOKENS);

const sourceOutputs = [
  {
    path: resolve(themeConstantsDirectory, THEME_CSS_FILE_NAME_BY_SCHEME.light),
    content: buildThemeCss({ leaves, scheme: 'light' }),
  },
  {
    path: resolve(themeConstantsDirectory, THEME_CSS_FILE_NAME_BY_SCHEME.dark),
    content: buildThemeCss({ leaves, scheme: 'dark' }),
  },
  {
    path: resolve(themeConstantsDirectory, 'themeCssVariables.ts'),
    content: buildThemeCssVariables(leaves),
  },
  {
    path: resolve(themeConstantsDirectory, 'themeTypes.ts'),
    content: buildThemeTypes(leaves),
  },
  {
    path: resolve(themeDirectory, 'internal/themeSpacing.ts'),
    content: buildThemeSpacing(leaves),
  },
  {
    path: resolve(themeDirectory, 'constants/ThemeLight.ts'),
    content: buildThemeConstants({ leaves, scheme: 'light' }),
  },
  {
    path: resolve(themeDirectory, 'constants/ThemeDark.ts'),
    content: buildThemeConstants({ leaves, scheme: 'dark' }),
  },
  {
    path: resolve(themeDirectory, 'constants/ThemeCommon.ts'),
    content: buildThemeCommon({ leaves, rootKeys: THEME_COMMON_ROOT_KEYS }),
  },
  {
    path: resolve(themeDirectory, 'constants/MainColorNames.ts'),
    content: buildMainColorNames(Object.keys(MAIN_COLOR_TOKENS)),
  },
  {
    path: resolve(packageRoot, '../twenty-shared/src/constants/TagColors.ts'),
    content: buildTagColors(Object.keys(MAIN_COLOR_TOKENS)),
  },
  {
    path: resolve(themeDirectory, 'constants/Animation.ts'),
    content: buildThemeSubtreeConstant({
      leaves,
      rootKey: 'animation',
      scheme: 'light',
      exportName: 'ANIMATION',
    }),
  },
  {
    path: resolve(themeDirectory, 'constants/GrayScaleLight.ts'),
    content: buildThemeSubtreeConstant({
      leaves,
      rootKey: 'grayScale',
      scheme: 'light',
      exportName: 'GRAY_SCALE_LIGHT',
    }),
  },
  {
    path: resolve(themeDirectory, 'constants/GrayScaleDark.ts'),
    content: buildThemeSubtreeConstant({
      leaves,
      rootKey: 'grayScale',
      scheme: 'dark',
      exportName: 'GRAY_SCALE_DARK',
    }),
  },
];

const isCheckMode = process.argv.includes('--check');
const outputPaths = sourceOutputs.map(({ path }) => path);

const readIfPresent = (path: string) =>
  existsSync(path) ? readFileSync(path, 'utf-8') : undefined;

const writeAndFormatOutputs = () => {
  for (const { path, content } of sourceOutputs) {
    writeFileSync(path, content, 'utf-8');
  }

  // oxfmt reformats CSS as well as TypeScript, so the committed artifacts are
  // its output rather than the builders'.
  const formatResult = spawnSync('npx', ['oxfmt', ...outputPaths], {
    cwd: packageRoot,
    stdio: 'inherit',
  });
  if (formatResult.status !== 0) {
    throw new Error('oxfmt failed on the generated theme files');
  }
};

// Formatting has to happen on the real paths, because oxfmt resolves the
// repository .oxfmtrc.jsonc from the file location, so check mode restores
// what was there rather than leaving the working tree edited.
const committedContents = isCheckMode ? outputPaths.map(readIfPresent) : [];

const restoreCommittedOutputs = () => {
  for (const [index, path] of outputPaths.entries()) {
    const committedContent = committedContents[index];
    if (committedContent === undefined) {
      rmSync(path, { force: true });
      continue;
    }
    writeFileSync(path, committedContent, 'utf-8');
  }
};

let staleOutputPaths: string[] = [];

if (isCheckMode) {
  try {
    writeAndFormatOutputs();
    staleOutputPaths = outputPaths.filter(
      (path, index) => readIfPresent(path) !== committedContents[index],
    );
  } finally {
    restoreCommittedOutputs();
  }
} else {
  writeAndFormatOutputs();
}

if (staleOutputPaths.length > 0) {
  process.stderr.write(
    `::error::Generated theme artifacts are stale: ${staleOutputPaths
      .map((path) => relative(packageRoot, path))
      .join(', ')}. Run: npx nx generateTokens twenty-ui\n`,
  );
  process.exit(1);
}

console.log(`Generated theme artifacts from ${leaves.length} design tokens.`);
