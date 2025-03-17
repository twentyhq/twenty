import * as fs from 'fs';
import path from 'path';
import slash from 'slash';

const extensions = ['.ts', '.tsx'];
const excludedExtensions = [
  '.test.ts',
  '.test.tsx',
  '.spec.ts',
  '.spec.tsx',
  '.stories.ts',
  '.stories.tsx',
];
const excludedDirectories = [
  '__tests__',
  '__mocks__',
  '__stories__',
  'internal',
];
// TODO refactor to be config ?
const srcPath = path.resolve('packages/twenty-shared/src');

type createTypeScriptFileArgs = {
  path: string;
  content: string;
};
const createTypeScriptIndexFile = ({
  content,
  path: filePath,
}: createTypeScriptFileArgs) =>
  fs.writeFileSync(path.join(filePath, 'index.ts'), `${content}\n`, 'utf-8');

const getSubDirectoryPaths = (directoryPath: string): string[] =>
  fs
    .readdirSync(directoryPath)
    .filter((fileOrDirectoryName) => {
      const isDirectory = fs
        .statSync(path.join(directoryPath, fileOrDirectoryName))
        .isDirectory();
      if (!isDirectory) {
        return false;
      }

      const isExcludedDirectory =
        excludedDirectories.includes(fileOrDirectoryName);
      return !isExcludedDirectory;
    })
    .map((subDirectoryName) => path.join(directoryPath, subDirectoryName));

const getDirectoryPathsRecursive = (directoryPath: string): string[] => [
  directoryPath,
  ...getSubDirectoryPaths(directoryPath).flatMap(getDirectoryPathsRecursive),
];

const getFilesPaths = (directoryPath: string): string[] =>
  fs.readdirSync(directoryPath).filter((filePath) => {
    const isFile = fs.statSync(path.join(directoryPath, filePath)).isFile();
    if (!isFile) {
      return false;
    }

    const isIndexFile = filePath.startsWith('index.');
    if (isIndexFile) {
      return false;
    }

    const isWhiteListedExtension = extensions.some((extension) =>
      filePath.endsWith(extension),
    );
    const isExcludedExtension = excludedExtensions.every(
      (excludedExtension) => !filePath.endsWith(excludedExtension),
    );
    return isWhiteListedExtension && isExcludedExtension;
  });

const main = () => {
  const moduleDirectories = getSubDirectoryPaths(srcPath);

  moduleDirectories.forEach((moduleDirectoryPath) => {
    const directoryPaths = getDirectoryPathsRecursive(moduleDirectoryPath);
    const moduleExports = directoryPaths
      .flatMap((directoryPath) => {
        const directFilesPaths = getFilesPaths(directoryPath);

        return directFilesPaths.map((filePath) => {
          const fileNameWithoutExtension = filePath
            .split('.')
            .slice(0, -1)
            .join('.');
          const pathToImport = slash(
            path.relative(
              moduleDirectoryPath,
              path.join(directoryPath, fileNameWithoutExtension),
            ),
          );
          return `export * from './${pathToImport}';`;
        });
      })
      .sort((a, b) => a.localeCompare(b))
      .join('\n');

    createTypeScriptIndexFile({
      content: moduleExports,
      path: moduleDirectoryPath,
    });
  });

  const mainBarrelExports = moduleDirectories
    .map(
      (moduleDirectoryPath) =>
        `export * from './${slash(path.relative(srcPath, moduleDirectoryPath))}';`,
    )
    .sort((a, b) => a.localeCompare(b))
    .join('\n');

  createTypeScriptIndexFile({
    content: mainBarrelExports,
    path: srcPath,
  });
};
main();
