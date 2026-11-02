import { posix, resolve } from 'node:path';
import ts from 'typescript';
import { isDefined } from '../utils/validation/isDefined';

export const collectFrontComponentTypeReferences = ({
  directory,
  dependencies,
  shouldIncludeLibraries = false,
}: {
  directory: string;
  dependencies: string[];
  shouldIncludeLibraries?: boolean;
}): Record<string, string> => {
  const entryPath = posix.normalize(
    resolve(directory, 'component-type-references.ts').replace(/\\/g, '/'),
  );
  const entry = dependencies
    .filter((specifier) => !specifier.endsWith('.css'))
    .map((specifier) => `export * from ${JSON.stringify(specifier)};`)
    .join('\n');
  const options: ts.CompilerOptions = {
    target: ts.ScriptTarget.ES2022,
    module: ts.ModuleKind.ESNext,
    moduleResolution: ts.ModuleResolutionKind.Bundler,
    preserveSymlinks: true,
    noEmit: true,
    noLib: !shouldIncludeLibraries,
    types: [],
  };
  const files: Record<string, string> = {};
  const host = ts.createCompilerHost(options);
  const readFile = host.readFile;

  host.readFile = (path) => {
    const normalizedPath = posix.normalize(path.replace(/\\/g, '/'));
    if (normalizedPath === entryPath) {
      return entry;
    }
    const content = readFile(path);
    const modulePath = normalizedPath.indexOf('/node_modules/');

    if (
      isDefined(content) &&
      modulePath !== -1 &&
      (/\.[cm]?tsx?$/.test(normalizedPath) ||
        normalizedPath.endsWith('/package.json'))
    ) {
      files[normalizedPath.slice(modulePath)] = content;
    }
    return content;
  };

  ts.createProgram([entryPath], options, host).getTypeChecker();

  return files;
};
