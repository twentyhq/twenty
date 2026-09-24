import { isNonEmptyArray, isString } from '@sniptt/guards';
import { build, type Plugin } from 'esbuild';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

import packageJson from '../package.json';
import { isDefined } from '../src/utilities/utils/isDefined';

type DeclarationImport = {
  declarationFilePath: string;
  importPath: string;
};

const PACKAGE_PATH = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
);
const ALLOWED_OPTIONAL_PEERS_BY_ENTRY_POINT: Record<string, string[]> = {
  './components/code-editor': ['@monaco-editor/react', 'monaco-editor'],
};
const OPTIONAL_PEER_DEPENDENCY_NAMES = Object.entries(
  packageJson.peerDependenciesMeta,
)
  .filter(([, { optional }]) => optional)
  .map(([dependencyName]) => dependencyName);
const BARE_IMPORT_PATH_PATTERN = /^[^./]/;
const DECLARATION_FILE_SUFFIXES = ['.d.ts', '/index.d.ts'];

const matchesDependencyImportPath = ({
  importPath,
  dependencyNames,
}: {
  importPath: string;
  dependencyNames: string[];
}) =>
  dependencyNames.some(
    (dependencyName) =>
      importPath === dependencyName ||
      importPath.startsWith(`${dependencyName}/`),
  );

const createOptionalPeerDependenciesPlugin = (
  allowedOptionalPeers: string[],
): Plugin => ({
  name: 'reject-optional-peer-dependencies',
  setup: (build) => {
    build.onResolve({ filter: BARE_IMPORT_PATH_PATTERN }, ({ path }) =>
      matchesDependencyImportPath({
        importPath: path,
        dependencyNames: OPTIONAL_PEER_DEPENDENCY_NAMES,
      }) &&
      !matchesDependencyImportPath({
        importPath: path,
        dependencyNames: allowedOptionalPeers,
      })
        ? { errors: [{ text: `Unexpected optional peer dependency: ${path}` }] }
        : undefined,
    );
  },
});

const resolveDeclarationFilePath = ({
  importerFilePath,
  importPath,
}: {
  importerFilePath: string;
  importPath: string;
}) => {
  const declarationFilePath = DECLARATION_FILE_SUFFIXES.map((suffix) =>
    path.resolve(path.dirname(importerFilePath), `${importPath}${suffix}`),
  ).find((candidateFilePath) => fs.existsSync(candidateFilePath));

  if (!isDefined(declarationFilePath)) {
    throw new Error(
      `Cannot resolve ${importPath} from ${path.relative(PACKAGE_PATH, importerFilePath)}`,
    );
  }

  return declarationFilePath;
};

const collectBareDeclarationImports = ({
  declarationFilePath,
  visitedDeclarationFilePaths,
}: {
  declarationFilePath: string;
  visitedDeclarationFilePaths: Set<string>;
}): DeclarationImport[] => {
  if (visitedDeclarationFilePaths.has(declarationFilePath)) {
    return [];
  }

  visitedDeclarationFilePaths.add(declarationFilePath);

  const { importedFiles, typeReferenceDirectives } = ts.preProcessFile(
    fs.readFileSync(declarationFilePath, 'utf-8'),
  );

  return [...importedFiles, ...typeReferenceDirectives].flatMap(
    ({ fileName: importPath }) =>
      BARE_IMPORT_PATH_PATTERN.test(importPath)
        ? [{ declarationFilePath, importPath }]
        : collectBareDeclarationImports({
            declarationFilePath: resolveDeclarationFilePath({
              importerFilePath: declarationFilePath,
              importPath,
            }),
            visitedDeclarationFilePaths,
          }),
  );
};

for (const [entryName, entryPoint] of Object.entries(packageJson.exports)) {
  if (isString(entryPoint)) {
    continue;
  }

  const allowedOptionalPeers =
    ALLOWED_OPTIONAL_PEERS_BY_ENTRY_POINT[entryName] ?? [];

  for (const entryPath of [entryPoint.import, entryPoint.require]) {
    await build({
      entryPoints: [path.resolve(PACKAGE_PATH, entryPath)],
      bundle: true,
      packages: 'external',
      write: false,
      logLevel: 'error',
      plugins: [createOptionalPeerDependenciesPlugin(allowedOptionalPeers)],
    });
  }

  const unexpectedDeclarationImports = collectBareDeclarationImports({
    declarationFilePath: path.resolve(PACKAGE_PATH, entryPoint.types),
    visitedDeclarationFilePaths: new Set(),
  }).filter(
    ({ importPath }) =>
      matchesDependencyImportPath({
        importPath,
        dependencyNames: OPTIONAL_PEER_DEPENDENCY_NAMES,
      }) &&
      !matchesDependencyImportPath({
        importPath,
        dependencyNames: allowedOptionalPeers,
      }),
  );

  if (isNonEmptyArray(unexpectedDeclarationImports)) {
    throw new Error(
      unexpectedDeclarationImports
        .map(
          ({ declarationFilePath, importPath }) =>
            `Unexpected optional peer dependency: ${importPath} in ${entryName}: ${path.relative(PACKAGE_PATH, declarationFilePath)}`,
        )
        .join('\n'),
    );
  }
}

process.stdout.write(
  'All entry points build with only their declared optional peer dependencies.\n',
);
