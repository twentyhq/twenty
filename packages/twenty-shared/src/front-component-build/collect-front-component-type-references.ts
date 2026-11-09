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
    const nodeModulesPathIndex = normalizedPath.indexOf('/node_modules/');

    if (
      isDefined(content) &&
      nodeModulesPathIndex !== -1 &&
      (/\.[cm]?tsx?$/.test(normalizedPath) ||
        normalizedPath.endsWith('/package.json'))
    ) {
      files[normalizedPath.slice(nodeModulesPathIndex)] = content;
    }
    return content;
  };

  ts.createProgram([entryPath], options, host).getTypeChecker();

  for (const specifier of dependencies) {
    const { resolvedModule } = ts.resolveModuleName(
      specifier,
      entryPath,
      options,
      host,
    );
    if (
      !isDefined(resolvedModule) ||
      ![
        ts.Extension.Js,
        ts.Extension.Jsx,
        ts.Extension.Mjs,
        ts.Extension.Cjs,
      ].some((extension) => extension === resolvedModule.extension)
    ) {
      continue;
    }
    const normalizedPath = posix.normalize(
      resolvedModule.resolvedFileName.replace(/\\/g, '/'),
    );
    const nodeModulesPathIndex = normalizedPath.indexOf('/node_modules/');
    if (nodeModulesPathIndex === -1) {
      continue;
    }
    const declarationPath = normalizedPath
      .slice(nodeModulesPathIndex)
      .replace(/\.([cm]?)jsx?$/, '.d.$1ts');
    files[declarationPath] =
      `${files[declarationPath] ?? ''}declare module ${JSON.stringify(specifier)};\n`;
  }

  return files;
};
