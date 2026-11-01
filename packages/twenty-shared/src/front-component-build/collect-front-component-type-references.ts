import { resolve } from 'node:path';
import ts from 'typescript';
import { isDefined } from '../utils/validation/isDefined';

export const collectFrontComponentTypeReferences = ({
  directory,
  dependencies,
  includeLibraries = false,
}: {
  directory: string;
  dependencies: string[];
  includeLibraries?: boolean;
}): Record<string, string> => {
  const entryPath = resolve(directory, 'component-type-references.ts');
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
    noLib: !includeLibraries,
    types: [],
  };
  const files: Record<string, string> = {};
  const host = ts.createCompilerHost(options);
  const readFile = host.readFile;

  host.readFile = (path) => {
    if (path === entryPath) {
      return entry;
    }
    const content = readFile(path);
    const modulePath = path.indexOf('/node_modules/');

    if (
      isDefined(content) &&
      modulePath !== -1 &&
      (/\.[cm]?tsx?$/.test(path) || path.endsWith('/package.json'))
    ) {
      files[path.slice(modulePath)] = content;
    }
    return content;
  };

  ts.createProgram([entryPath], options, host).getTypeChecker();

  return files;
};
