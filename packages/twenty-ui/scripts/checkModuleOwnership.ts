import { isNonEmptyArray, isString } from '@sniptt/guards';
import { globSync } from 'glob';
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
import { isDefined } from '../src/utilities/utils/isDefined';

import ownership from '../docs/module-ownership.json';
import publicExports from '../docs/public-exports.json';
import packageJson from '../package.json';
import { getPublicExportSnapshot } from './getPublicExportSnapshot';

const PACKAGE_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
);
const SOURCE_ROOT = path.join(PACKAGE_ROOT, 'src');
const SHARED_COMPONENTS_ROOT = path.join(SOURCE_ROOT, 'components');
const SOURCE_EXTENSIONS = ['.tsx', '.ts'];
const DISTRIBUTION_PREFIX = './dist/';
const DECLARATION_EXTENSION_PATTERN = /\.d\.ts$/;
const PACKAGE_ENTRY_POINTS = new Set([
  SOURCE_ROOT,
  path.join(SOURCE_ROOT, 'index'),
  ...SOURCE_EXTENSIONS.map((extension) =>
    path.join(SOURCE_ROOT, `index${extension}`),
  ),
]);
const SUPPORT_DIRECTORY_PATTERN = /\/(contexts|hooks)\//;
const TEST_DIRECTORY_PATTERN = /\/(testing|__tests__|__stories__|__mocks__)\//;
const TEST_FILE_PATTERN = /\.(stories|test|spec)\.tsx?$/;
const ROUTER_IMPORT_PATTERN = /^react-router(?:-dom)?(?:\/|$)/;
const shouldUpdateSnapshot = process.argv.includes('--write');
const actualOwnership: Record<keyof typeof ownership, string[]> = {
  primitives: [],
  components: [],
};
const errors: string[] = [];

for (const layer of ['primitives', 'components'] as const) {
  const expected = new Set<string>(ownership[layer]);
  const actual = new Set<string>();

  for (const file of globSync(`${layer}/**/index.ts`, { cwd: SOURCE_ROOT })) {
    const filePath = path.join(SOURCE_ROOT, file);
    const source = ts.createSourceFile(
      filePath,
      readFileSync(filePath, 'utf8'),
      ts.ScriptTarget.Latest,
      true,
    );

    for (const statement of source.statements) {
      if (
        !ts.isExportDeclaration(statement) ||
        statement.isTypeOnly ||
        !isDefined(statement.moduleSpecifier) ||
        !ts.isStringLiteral(statement.moduleSpecifier) ||
        !isDefined(statement.exportClause) ||
        !ts.isNamedExports(statement.exportClause)
      ) {
        continue;
      }

      const target = path.resolve(
        path.dirname(filePath),
        statement.moduleSpecifier.text,
      );

      const componentSource = SOURCE_EXTENSIONS.map(
        (extension) => `${target}${extension}`,
      ).find((candidate) => ts.sys.fileExists(candidate));
      if (
        !componentSource?.endsWith('.tsx') ||
        SUPPORT_DIRECTORY_PATTERN.test(componentSource)
      ) {
        continue;
      }

      for (const element of statement.exportClause.elements) {
        if (!element.isTypeOnly) {
          actual.add(element.name.text);
        }
      }
    }
  }

  actualOwnership[layer] = [...actual].sort();

  if (shouldUpdateSnapshot) {
    continue;
  }

  for (const name of expected) {
    if (!actual.has(name)) {
      errors.push(`${name} is missing from ${layer}`);
    }
  }

  for (const name of actual) {
    if (!expected.has(name)) {
      errors.push(`${name} has no public ownership decision in ${layer}`);
    }
  }
}

for (const file of globSync('**/*.{ts,tsx}', { cwd: SOURCE_ROOT })) {
  const filePath = path.join(SOURCE_ROOT, file);
  const isTestOrDeclaration =
    TEST_DIRECTORY_PATTERN.test(filePath) ||
    TEST_FILE_PATTERN.test(filePath) ||
    file.endsWith('.d.ts');

  const { importedFiles } = ts.preProcessFile(
    readFileSync(filePath, 'utf8'),
    true,
    true,
  );
  for (const { fileName: moduleName } of importedFiles) {
    if (
      ROUTER_IMPORT_PATTERN.test(moduleName) ||
      (!isTestOrDeclaration &&
        (moduleName.startsWith('twenty-front') ||
          moduleName.startsWith('@/') ||
          moduleName.startsWith('~/')))
    ) {
      errors.push(`${file} depends on application code: ${moduleName}`);
    }

    const target = moduleName.startsWith('@ui/')
      ? path.join(SOURCE_ROOT, moduleName.slice('@ui/'.length))
      : moduleName.startsWith('twenty-ui/')
        ? path.join(SOURCE_ROOT, moduleName.slice('twenty-ui/'.length))
        : path.resolve(path.dirname(filePath), moduleName);
    if (
      file.startsWith('primitives/') &&
      (moduleName === 'twenty-ui' ||
        moduleName === '@ui' ||
        PACKAGE_ENTRY_POINTS.has(target) ||
        target === SHARED_COMPONENTS_ROOT ||
        target.startsWith(SHARED_COMPONENTS_ROOT + path.sep))
    ) {
      errors.push(`${file} depends on a shared composition: ${moduleName}`);
    }
  }
}

const entryPoints = Object.fromEntries(
  Object.entries(packageJson.exports).flatMap(([name, entry]) => {
    if (isString(entry)) {
      return [];
    }

    return [
      [
        name,
        path.join(
          SOURCE_ROOT,
          entry.types
            .slice(DISTRIBUTION_PREFIX.length)
            .replace(DECLARATION_EXTENSION_PATTERN, '.ts'),
        ),
      ],
    ];
  }),
);
const actualPublicExports = getPublicExportSnapshot({
  sourceRoot: SOURCE_ROOT,
  entryPoints,
});

if (!shouldUpdateSnapshot) {
  const expectedPublicExports: Record<string, string[]> = publicExports;

  for (const entryName of new Set([
    ...Object.keys(expectedPublicExports),
    ...Object.keys(actualPublicExports),
  ])) {
    if (!isDefined(actualPublicExports[entryName])) {
      errors.push(`Public entry ${entryName} is missing`);
      continue;
    }

    if (!isDefined(expectedPublicExports[entryName])) {
      errors.push(`Public entry ${entryName} has no public export decision`);
      continue;
    }

    const expected = new Set(expectedPublicExports[entryName] ?? []);
    const actual = new Set(actualPublicExports[entryName] ?? []);

    for (const name of expected) {
      if (!actual.has(name)) {
        errors.push(`${name} is missing from public entry ${entryName}`);
      }
    }

    for (const name of actual) {
      if (!expected.has(name)) {
        errors.push(`${name} has no public export decision in ${entryName}`);
      }
    }
  }
}

if (isNonEmptyArray(errors)) {
  throw new Error(errors.join('\n'));
}

if (shouldUpdateSnapshot) {
  writeFileSync(
    path.join(PACKAGE_ROOT, 'docs/public-exports.json'),
    `${JSON.stringify(actualPublicExports, null, 2)}\n`,
  );
  writeFileSync(
    path.join(PACKAGE_ROOT, 'docs/module-ownership.json'),
    `${JSON.stringify(actualOwnership, null, 2)}\n`,
  );
}

process.stdout.write(
  `Module ownership verified: ${actualOwnership.primitives.length} primitives and ${actualOwnership.components.length} shared components across ${Object.keys(actualPublicExports).length} public entries.\n`,
);
