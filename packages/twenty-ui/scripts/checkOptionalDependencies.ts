import { isNonEmptyArray } from '@sniptt/guards';
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
const ROOT_ENTRY_POINT = packageJson.exports['.'];
const OPTIONAL_PEER_DEPENDENCY_NAMES = Object.entries(
  packageJson.peerDependenciesMeta,
)
  .filter(([, { optional }]) => optional)
  .map(([dependencyName]) => dependencyName);
const BARE_IMPORT_PATH_PATTERN = /^[^./]/;
const DECLARATION_FILE_SUFFIXES = ['.d.ts', '/index.d.ts'];

const isOptionalPeerDependencyImportPath = (importPath: string) =>
  OPTIONAL_PEER_DEPENDENCY_NAMES.some(
    (dependencyName) =>
      importPath === dependencyName ||
      importPath.startsWith(`${dependencyName}/`),
  );

const rejectOptionalPeerDependenciesPlugin: Plugin = {
  name: 'reject-optional-peer-dependencies',
  setup: (build) => {
    build.onResolve({ filter: BARE_IMPORT_PATH_PATTERN }, ({ path }) =>
      isOptionalPeerDependencyImportPath(path)
        ? { errors: [{ text: `Unexpected optional peer dependency: ${path}` }] }
        : undefined,
    );
  },
};

const resolveDeclarationFilePath = (
  importerFilePath: string,
  importPath: string,
) => {
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

const collectBareDeclarationImports = (
  declarationFilePath: string,
  visitedDeclarationFilePaths: Set<string>,
): DeclarationImport[] => {
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
        : collectBareDeclarationImports(
            resolveDeclarationFilePath(declarationFilePath, importPath),
            visitedDeclarationFilePaths,
          ),
  );
};

for (const entryPath of [ROOT_ENTRY_POINT.import, ROOT_ENTRY_POINT.require]) {
  await build({
    entryPoints: [path.resolve(PACKAGE_PATH, entryPath)],
    bundle: true,
    packages: 'external',
    write: false,
    logLevel: 'error',
    plugins: [rejectOptionalPeerDependenciesPlugin],
  });
}

const optionalPeerDependencyDeclarationImports = collectBareDeclarationImports(
  path.resolve(PACKAGE_PATH, ROOT_ENTRY_POINT.types),
  new Set(),
).filter(({ importPath }) => isOptionalPeerDependencyImportPath(importPath));

if (isNonEmptyArray(optionalPeerDependencyDeclarationImports)) {
  for (const {
    declarationFilePath,
    importPath,
  } of optionalPeerDependencyDeclarationImports) {
    process.stderr.write(
      `Unexpected optional peer dependency: ${importPath} in ${path.relative(PACKAGE_PATH, declarationFilePath)}\n`,
    );
  }

  process.exit(1);
}

process.stdout.write(
  'The root entry point builds without optional peer dependencies.\n',
);
