import { posix } from 'node:path';
import ts from 'typescript';
import { isDefined } from '../utils/validation/isDefined';

export const getFrontComponentTypeDiagnostics = ({
  source,
  files,
}: {
  source: string;
  files: Record<string, string>;
}): string[] => {
  const sourcePath = '/component.tsx';
  const previewPath = '/preview.tsx';
  const sources: Record<string, string> = {
    ...files,
    [sourcePath]: source,
    [previewPath]: `import { Component } from './component'; export const preview = <Component />;`,
  };
  const directories = new Set<string>();

  for (const file of Object.keys(sources)) {
    let directory = posix.dirname(file);
    while (!directories.has(directory)) {
      directories.add(directory);
      directory = posix.dirname(directory);
    }
  }

  const options: ts.CompilerOptions = {
    target: ts.ScriptTarget.ES2022,
    module: ts.ModuleKind.ESNext,
    moduleResolution: ts.ModuleResolutionKind.Bundler,
    jsx: ts.JsxEmit.ReactJSX,
    strict: true,
    skipLibCheck: true,
    allowSyntheticDefaultImports: true,
    noEmit: true,
    types: [],
  };
  const host: ts.CompilerHost = {
    fileExists: (path) => isDefined(sources[posix.resolve('/', path)]),
    readFile: (path) => sources[posix.resolve('/', path)],
    directoryExists: (path) => directories.has(posix.resolve('/', path)),
    getDirectories: (path) =>
      [...directories].filter(
        (directory) => posix.dirname(directory) === path && directory !== path,
      ),
    getSourceFile: (path, languageVersion) => {
      const content = sources[posix.resolve('/', path)];
      return !isDefined(content)
        ? undefined
        : ts.createSourceFile(path, content, languageVersion, true);
    },
    getDefaultLibFileName: () =>
      '/node_modules/typescript/lib/lib.es2022.full.d.ts',
    getCurrentDirectory: () => '/',
    getCanonicalFileName: (path) => path,
    useCaseSensitiveFileNames: () => true,
    getNewLine: () => '\n',
    writeFile: () => undefined,
  };
  const program = ts.createProgram([sourcePath, previewPath], options, host);
  const diagnostics = [
    ...program.getOptionsDiagnostics(),
    ...program.getGlobalDiagnostics(),
    ...[sourcePath, previewPath].flatMap((path) => {
      const file = program.getSourceFile(path);
      if (!isDefined(file)) {
        throw new Error(`Missing typecheck source: ${path}`);
      }
      return [
        ...program.getSyntacticDiagnostics(file),
        ...program.getSemanticDiagnostics(file),
      ];
    }),
  ];

  return diagnostics.slice(0, 20).map((diagnostic) => {
    const position =
      isDefined(diagnostic.file) && isDefined(diagnostic.start)
        ? diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start)
        : undefined;
    const location = !isDefined(position)
      ? ''
      : `${posix.basename(diagnostic.file?.fileName ?? sourcePath)}:${position.line + 1}:${position.character + 1} `;
    return `${location}TS${diagnostic.code}: ${ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n')}`;
  });
};
