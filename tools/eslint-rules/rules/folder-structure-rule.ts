import { ESLintUtils } from '@typescript-eslint/utils';
import fs from 'fs';
import path from 'path';
import {
  CASES,
  ExtensionsType,
  FolderRule,
  NameValidationType,
  RULES,
  configs,
  stringifyConfig,
} from './folderStructureConfig';

export const RULE_NAME = 'folder-structure';

const validateString = (input: string, validator: NameValidationType) => {
  const {
    prefix = '',
    suffix = '',
    namePattern,
    extension = '',
  } = typeof validator === 'string'
    ? { namePattern: validator }
    : validator || {};

  const prefixArray = Array.isArray(prefix) ? prefix : [prefix];
  const suffixArray = Array.isArray(suffix) ? suffix : [suffix];
  const nameArray = Array.isArray(namePattern) ? namePattern : [namePattern];
  const extensionArray = Array.isArray(extension) ? extension : [extension];

  let fileName = input;

  if (namePattern === '*') {
    return true;
  }

  // Check for prefix
  const foundPrefix = prefix
    ? prefixArray.find((pfx) => fileName.startsWith(pfx))
    : '';

  if (foundPrefix === undefined) {
    return false;
  }

  fileName = fileName.substring(foundPrefix.length);

  if (extension) {
    const extIndex = fileName.indexOf('.');
    if (extIndex === -1) {
      return false;
    }

    const ext = fileName.substring(extIndex + 1) as ExtensionsType;
    if (!extensionArray.includes(ext)) {
      return false;
    }

    fileName = fileName.substring(0, extIndex);
  }

  // Check for suffix
  const foundSuffix = suffix
    ? suffixArray.find((sfx) => fileName.endsWith(sfx))
    : '';

  if (foundSuffix === undefined) {
    return false;
  }

  fileName = fileName.substring(0, fileName.length - foundSuffix.length);

  // Check name cases
  const nameValidated = namePattern
    ? nameArray.find((caseName) => {
        const nameRegex = CASES[caseName];
        return nameRegex ? nameRegex.test(fileName) : fileName === caseName;
      })
    : '';

  if (nameValidated === undefined) {
    return false;
  }

  return true;
};
const invalid = {};
const valid = {};
// Recursive function to check folder structure based on config
const checkFolderStructure = (
  currentPath: string,
  config: FolderRule,
): boolean => {
  const { name, children, ruleId } = config;

  if (name) {
    const folderName = currentPath.split('/').pop();
    const isNameValid = validateString(folderName, name);

    if (isNameValid) {
      valid[currentPath] = true;
      delete invalid[currentPath];
      if (!ruleId && (!children || children.length === 0)) {
        return true;
      }
    } else {
      const isAlreadyValid = valid[currentPath];
      if (isAlreadyValid) {
        delete invalid[currentPath];
      } else {
        const invalidPath = invalid[currentPath] || [];
        invalid[currentPath] = [...invalidPath, { name }];
      }
      return false;
    }
  }

  if (ruleId) {
    const rule = RULES[ruleId];
    return checkFolderStructure(currentPath, {
      ...rule,
      name: name ? undefined : rule.name,
    });
  }

  if (children) {
    const filesOrSubFolders = fs.readdirSync(currentPath, {
      withFileTypes: true,
    });
    const isolatedFiles = filesOrSubFolders.filter((file) => file.isFile());
    const isolatedFilesRules = children.filter(
      (rule) => !rule.children && rule.name && !rule.ruleId,
    );
    const subFolders = filesOrSubFolders.filter((file) => file.isDirectory());
    const subFoldersRules = children.filter(
      (rule) => rule.children || rule.ruleId,
    );

    const areIsolatedFilesValid =
      isolatedFiles.length === 0 ||
      isolatedFiles
        .map((file) => {
          if (isolatedFilesRules.length === 0) return;
          const isFileValid = isolatedFilesRules.some((rule) => {
            return checkFolderStructure(`${currentPath}/${file.name}`, rule);
          });

          return isFileValid;
        })
        .every(Boolean);

    const areSubFoldersValid =
      subFolders.length === 0 ||
      subFolders
        .map((subFolder) => {
          if (subFoldersRules.length === 0) return;
          const isSubFolderValid = subFoldersRules.some((rule) => {
            return checkFolderStructure(
              `${currentPath}/${subFolder.name}`,
              rule,
            );
          });

          return isSubFolderValid;
        })
        .every(Boolean);
    return areIsolatedFilesValid && areSubFoldersValid;
  }

  return false;
};

let hasRun = false;

// ESLint rule definition
export const rule = ESLintUtils.RuleCreator(() => __filename)({
  name: RULE_NAME,
  meta: {
    type: 'problem',
    docs: {
      description:
        'Enforce folder structure and naming conventions in the modules directory',
      recommended: 'recommended',
    },
    fixable: null,
    schema: [],
    messages: {
      invalidName:
        "Path name '{{ pathName }}' is invalid. Allowed patterns: '{{ expectedPatterns }}'.",
    },
  },
  defaultOptions: [],
  create: (context) => {
    if (hasRun) return {};
    hasRun = true;

    const rootFolder = path.resolve(
      __dirname,
      '../../../packages/twenty-front',
    );

    checkFolderStructure(rootFolder, configs);

    Object.keys(invalid).forEach((invalidPath) => {
      context.report({
        messageId: 'invalidName',
        loc: { line: 1, column: 0 },
        data: {
          pathName: invalidPath,
          expectedPatterns: stringifyConfig(invalid[invalidPath]),
        },
        fix: null,
      });
    });

    return {};
  },
});
