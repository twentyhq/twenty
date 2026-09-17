import { globSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

import { extractDocumentationExamples } from '../docs/extractDocumentationExamples';
import { getDocumentationImportDiagnostics } from '../docs/getDocumentationImportDiagnostics';

const toModuleName = (subpath: string): string =>
  subpath === '.' ? 'twenty-ui' : `twenty-ui/${subpath.slice(2)}`;

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const documentationRoot = resolve(packageRoot, '../twenty-docs/ui');
const packageManifest: {
  exports: Record<string, unknown>;
  peerDependencies: Record<string, string>;
} = JSON.parse(readFileSync(resolve(packageRoot, 'package.json'), 'utf8'));
const exportedSubpaths = Object.entries(packageManifest.exports)
  .filter(([, target]) => target !== null)
  .map(([subpath]) => subpath);
const allowedModules = new Set([
  ...exportedSubpaths.map(toModuleName),
  ...Object.keys(packageManifest.peerDependencies),
]);
const configuration = ts.readConfigFile(
  resolve(packageRoot, 'tsconfig.json'),
  ts.sys.readFile,
);
const { options } = ts.parseJsonConfigFileContent(
  configuration.config,
  ts.sys,
  packageRoot,
);
const examples = new Map<string, string>();

for (const page of globSync('**/*.mdx', { cwd: documentationRoot })) {
  const contents = readFileSync(resolve(documentationRoot, page), 'utf8');

  for (const [index, example] of extractDocumentationExamples(
    contents,
  ).entries()) {
    examples.set(
      resolve(
        documentationRoot,
        `${page}.example-${index + 1}.${example.language}`,
      ),
      example.code,
    );
  }
}

if (examples.size === 0) {
  throw new Error('No UI documentation examples found');
}

const compilerOptions: ts.CompilerOptions = {
  ...options,
  preserveSymlinks: true,
  noEmit: true,
  types: [],
  paths: {
    ...options.paths,
    ...Object.fromEntries(
      exportedSubpaths
        .filter((subpath) => !subpath.endsWith('.css'))
        .map((subpath) => [
          toModuleName(subpath),
          [resolve(packageRoot, 'src', subpath, 'index.ts')],
        ]),
    ),
  },
};
const compilerHost = ts.createCompilerHost(compilerOptions);
const getSourceFile = compilerHost.getSourceFile;
compilerHost.getSourceFile = (
  fileName,
  languageVersion,
  onError,
  shouldCreateNewSourceFile,
) => {
  const example = examples.get(fileName);

  return example === undefined
    ? getSourceFile(
        fileName,
        languageVersion,
        onError,
        shouldCreateNewSourceFile,
      )
    : ts.createSourceFile(
        fileName,
        example,
        languageVersion,
        true,
        fileName.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
      );
};
const program = ts.createProgram(
  [...examples.keys()],
  compilerOptions,
  compilerHost,
);
const diagnostics = [
  ...program.getOptionsDiagnostics(),
  ...[...examples.keys()].flatMap((fileName) => {
    const source = program.getSourceFile(fileName);

    if (!source) {
      throw new Error(`Could not load documentation example ${fileName}`);
    }

    return [
      ...getDocumentationImportDiagnostics({ source, allowedModules }),
      ...program.getSyntacticDiagnostics(source),
      ...program.getSemanticDiagnostics(source),
    ];
  }),
];

if (diagnostics.length > 0) {
  process.stderr.write(
    ts.formatDiagnosticsWithColorAndContext(diagnostics, {
      getCurrentDirectory: () => documentationRoot,
      getCanonicalFileName: (fileName) => fileName,
      getNewLine: () => '\n',
    }),
  );
  process.exitCode = 1;
} else {
  process.stdout.write(
    `Checked ${examples.size} UI documentation examples against public entry points.\n`,
  );
}
