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
const srcPath = path.resolve('packages/twenty-ui/src');

/**
 * @param {string} directoryPath
 * @returns {string[]}
 */
const getSubDirectoryPaths = (directoryPath) =>
  fs
    .readdirSync(directoryPath)
    .filter(
      (fileOrDirectoryName) =>
        !excludedDirectories.includes(fileOrDirectoryName) &&
        fs
          .statSync(path.join(directoryPath, fileOrDirectoryName))
          .isDirectory(),
    )
    .map((subDirectoryName) => path.join(directoryPath, subDirectoryName));

/**
 *
 * @param {string} directoryPath
 * @returns {string[]}
 */
const getDirectoryPathsRecursive = (directoryPath) => [
  directoryPath,
  ...getSubDirectoryPaths(directoryPath).flatMap(getDirectoryPathsRecursive),
];

/**
 *
 * @param {string} directoryPath
 * @returns {string[]}
 */
const getFilesPaths = (directoryPath) =>
  fs
    .readdirSync(directoryPath)
    .filter(
      (filePath) =>
        fs.statSync(path.join(directoryPath, filePath)).isFile() &&
        !filePath.startsWith('index.') &&
        extensions.some((extension) => filePath.endsWith(extension)) &&
        excludedExtensions.every(
          (excludedExtension) => !filePath.endsWith(excludedExtension),
        ),
    );

const moduleDirectories = getSubDirectoryPaths(srcPath);

moduleDirectories.forEach((moduleDirectoryPath) => {
  const directoryPaths = getDirectoryPathsRecursive(moduleDirectoryPath);

  const moduleExports = directoryPaths
    .flatMap((directoryPath) => {
      const directFilesPaths = getFilesPaths(directoryPath);

      return directFilesPaths.map((filePath) => {
        const fileName = filePath.split('.').slice(0, -1).join('.');
        return `export * from './${slash(path.relative(
          moduleDirectoryPath,
          path.join(directoryPath, fileName),
        ))}';`;
      });
    })
    .sort((a, b) => a.localeCompare(b))
    .join('\n');

  fs.writeFileSync(
    path.join(moduleDirectoryPath, 'index.ts'),
    `${moduleExports}\n`,
    'utf-8',
  );
});

const mainBarrelExports = moduleDirectories
  .map(
    (moduleDirectoryPath) =>
      `export * from './${slash(path.relative(srcPath, moduleDirectoryPath))}';`,
  )
  .sort((a, b) => a.localeCompare(b))
  .join('\n');

fs.writeFileSync(
  path.join(srcPath, 'index.ts'),
  `${mainBarrelExports}\n`,
  'utf-8',
);
