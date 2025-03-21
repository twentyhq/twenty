import prettier from '@prettier/sync';
import * as fs from 'fs';
import path from 'path';
import { Options } from 'prettier';
import slash from 'slash';

// TODO prastoin refactor this file in several one into its dedicated package and make it a TypeScript CLI

const INCLUDED_EXTENSIONS = ['.ts', '.tsx'];
const EXCLUDED_EXTENSIONS = [
  '.test.ts',
  '.test.tsx',
  '.spec.ts',
  '.spec.tsx',
  '.stories.ts',
  '.stories.tsx',
];
const EXCLUDED_DIRECTORIES = [
  '__tests__',
  '__mocks__',
  '__stories__',
  'internal',
];
const INDEX_FILENAME = 'index';
const PACKAGE_JSON_FILENAME = 'package.json';
const NX_PROJECT_CONFIGURATION_FILENAME = 'project.json';
const PACKAGE_PATH = path.resolve('packages/twenty-shared');
const SRC_PATH = path.resolve(`${PACKAGE_PATH}/src`);
const PACKAGE_JSON_PATH = path.join(PACKAGE_PATH, PACKAGE_JSON_FILENAME);
const NX_PROJECT_CONFIGURATION_PATH = path.join(
  PACKAGE_PATH,
  NX_PROJECT_CONFIGURATION_FILENAME,
);

const prettierConfigFile = prettier.resolveConfigFile();
if (prettierConfigFile == null) {
  throw new Error('Prettier config file not found');
}
const prettierConfiguration = prettier.resolveConfig(prettierConfigFile);
const prettierFormat = (str: string, parser: Options['parser']) =>
  prettier.format(str, {
    ...prettierConfiguration,
    parser,
  });
type createTypeScriptFileArgs = {
  path: string;
  content: string;
  filename: string;
};
const createTypeScriptFile = ({
  content,
  path: filePath,
  filename,
}: createTypeScriptFileArgs) => {
  const header = `
/*
 * _____                    _
 *|_   _|_      _____ _ __ | |_ _   _
 *  | | \\ \\ /\\ / / _ \\ '_ \\| __| | | | Auto-generated file
 *  | |  \\ V  V /  __/ | | | |_| |_| | Any edits to this will be overridden
 *  |_|   \\_/\\_/ \\___|_| |_|\\__|\\__, |
 *                              |___/
 */
`;
  const formattedContent = prettierFormat(
    `${header}\n${content}\n`,
    'typescript',
  );
  fs.writeFileSync(
    path.join(filePath, `${filename}.ts`),
    formattedContent,
    'utf-8',
  );
};

const getLastPathFolder = (path: string) => path.split('/').pop();

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
        EXCLUDED_DIRECTORIES.includes(fileOrDirectoryName);
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

    const isIndexFile = filePath.startsWith(INDEX_FILENAME);
    if (isIndexFile) {
      return false;
    }

    const isWhiteListedExtension = INCLUDED_EXTENSIONS.some((extension) =>
      filePath.endsWith(extension),
    );
    const isExcludedExtension = EXCLUDED_EXTENSIONS.every(
      (excludedExtension) => !filePath.endsWith(excludedExtension),
    );
    return isWhiteListedExtension && isExcludedExtension;
  });

type ComputeExportLineForGivenFileArgs = {
  filePath: string;
  moduleDirectory: string; // Rename
  directoryPath: string; // Rename
};
const computeExportLineForGivenFile = ({
  filePath,
  moduleDirectory,
  directoryPath,
}: ComputeExportLineForGivenFileArgs) => {
  const fileNameWithoutExtension = filePath.split('.').slice(0, -1).join('.');
  const pathToImport = slash(
    path.relative(
      moduleDirectory,
      path.join(directoryPath, fileNameWithoutExtension),
    ),
  );
  // TODO refactor should extract all exports atomically please refer to https://github.com/twentyhq/core-team-issues/issues/644
  return `export * from './${pathToImport}';`;
};

const generateModuleIndexFiles = (moduleDirectories: string[]) => {
  return moduleDirectories.map<createTypeScriptFileArgs>((moduleDirectory) => {
    const directoryPaths = getDirectoryPathsRecursive(moduleDirectory);
    const content = directoryPaths
      .flatMap((directoryPath) => {
        const directFilesPaths = getFilesPaths(directoryPath);

        return directFilesPaths.map((filePath) =>
          computeExportLineForGivenFile({
            directoryPath,
            filePath,
            moduleDirectory: moduleDirectory,
          }),
        );
      })
      .sort((a, b) => a.localeCompare(b)) // Could be removed as using prettier afterwards anw ?
      .join('\n');

    return {
      content,
      path: moduleDirectory,
      filename: INDEX_FILENAME,
    };
  });
};

type JsonUpdate = Record<string, any>;
type WriteInJsonFileArgs = {
  content: JsonUpdate;
  file: string;
};
const updateJsonFile = ({ content, file }: WriteInJsonFileArgs) => {
  const updatedJsonFile = JSON.stringify(content);
  const formattedContent = prettierFormat(updatedJsonFile, 'json-stringify');
  fs.writeFileSync(file, formattedContent, 'utf-8');
};

const writeInPackageJson = (update: JsonUpdate) => {
  const rawJsonFile = fs.readFileSync(PACKAGE_JSON_PATH, 'utf-8');
  const initialJsonFile = JSON.parse(rawJsonFile);

  updateJsonFile({
    file: PACKAGE_JSON_PATH,
    content: {
      ...initialJsonFile,
      ...update,
    },
  });
};

const updateNxProjectConfigurationBuildOutputs = (outputs: JsonUpdate) => {
  const rawJsonFile = fs.readFileSync(NX_PROJECT_CONFIGURATION_PATH, 'utf-8');
  const initialJsonFile = JSON.parse(rawJsonFile);

  updateJsonFile({
    file: NX_PROJECT_CONFIGURATION_PATH,
    content: {
      ...initialJsonFile,
      targets: {
        ...initialJsonFile.targets,
        build: {
          ...initialJsonFile.targets.build,
           outputs,
        },
      },
    },
  });
};

const computePackageJsonFilesAndPreconstructConfig = (
  moduleDirectories: string[],
) => {
  const entrypoints = [...moduleDirectories.map(getLastPathFolder)];

  return {
    preconstruct: {
      entrypoints: [
        './index.ts',
        ...entrypoints.map((module) => `./${module}/index.ts`),
      ],
    },
    files: ['dist', ...entrypoints],
  };
};

const computeProjectNxBuildOutputsPath = (moduleDirectories: string[]) => {
  const dynamicOutputsPath = moduleDirectories
    .map(getLastPathFolder)
    .flatMap((barrelName) =>
      ['package.json', 'dist'].map(
        (subPath) => `{projectRoot}/${barrelName}/${subPath}`,
      ),
    );

  return ['{projectRoot}/dist', ...dynamicOutputsPath];
};

const main = () => {
  const moduleDirectories = getSubDirectoryPaths(SRC_PATH);
  const moduleIndexFiles = generateModuleIndexFiles(moduleDirectories);
  const packageJsonPreconstructConfigAndFiles =
    computePackageJsonFilesAndPreconstructConfig(moduleDirectories);
  const nxBuildOutputsPath =
    computeProjectNxBuildOutputsPath(moduleDirectories);

  updateNxProjectConfigurationBuildOutputs(
     nxBuildOutputsPath
  );
  writeInPackageJson(packageJsonPreconstructConfigAndFiles);
  moduleIndexFiles.forEach(createTypeScriptFile);
};
main();
