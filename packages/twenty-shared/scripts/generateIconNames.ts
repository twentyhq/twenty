import prettier from '@prettier/sync';
import * as fs from 'fs';
import path from 'path';

const ALL_ICONS_PATH = path.resolve(
  'packages/twenty-ui/src/icon/providers/internal/AllIcons.ts',
);
const OUTPUT_PATH = path.resolve(
  'packages/twenty-shared/src/types/IconName.ts',
);

const HEADER = `/*
 * _____                    _
 *|_   _|_      _____ _ __ | |_ _   _
 *  | | \\ \\ /\\ / / _ \\ '_ \\| __| | | | Auto-generated file
 *  | |  \\ V  V /  __/ | | | |_| |_| | Any edits to this will be overridden
 *  |_|   \\_/\\_/ \\___|_| |_|\\__|\\__, |
 *                              |___/
 */
`;

const extractIconNames = (allIconsSource: string): string[] => {
  const objectLiteral = allIconsSource
    .split('export const ALL_ICONS = {')[1]
    ?.split('\n};')[0];

  if (objectLiteral === undefined) {
    throw new Error(`Could not find ALL_ICONS object in ${ALL_ICONS_PATH}`);
  }

  const iconNames = [...objectLiteral.matchAll(/^\s*(\w+),$/gm)].map(
    (match) => match[1],
  );

  if (iconNames.length === 0) {
    throw new Error(`No icons found in ${ALL_ICONS_PATH}`);
  }

  return [...new Set(iconNames)].sort((a, b) => a.localeCompare(b));
};

const generate = () => {
  const iconNames = extractIconNames(fs.readFileSync(ALL_ICONS_PATH, 'utf-8'));
  const union = iconNames.map((iconName) => `  | '${iconName}'`).join('\n');
  const content = `${HEADER}\nexport type IconName =\n${union};\n`;

  const prettierConfigFile = prettier.resolveConfigFile();
  const prettierConfiguration =
    prettierConfigFile === null
      ? {}
      : prettier.resolveConfig(prettierConfigFile);

  return prettier.format(content, {
    ...prettierConfiguration,
    parser: 'typescript',
  });
};

const generated = generate();
const isCheckOnly = process.argv.includes('--check');

if (isCheckOnly) {
  const current = fs.existsSync(OUTPUT_PATH)
    ? fs.readFileSync(OUTPUT_PATH, 'utf-8')
    : undefined;

  if (current !== generated) {
    throw new Error(
      'IconName.ts is stale. Run `npx nx generateIconNames twenty-shared`.',
    );
  }
} else {
  fs.writeFileSync(OUTPUT_PATH, generated, 'utf-8');
}
