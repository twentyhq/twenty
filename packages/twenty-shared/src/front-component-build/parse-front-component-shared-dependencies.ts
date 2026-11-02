import { isNonEmptyArray, isNonEmptyString } from '@sniptt/guards';
import path from 'node:path';

import { FRONT_COMPONENT_SHARED_DEPENDENCIES_IMPORT_SPECIFIER } from '../application/constants/FrontComponentSharedDependenciesImportSpecifier';
import { normalizeFrontComponentSharedDependencies } from './normalize-front-component-shared-dependencies';

const RESERVED_DEPENDENCY_PREFIXES = ['twenty-client-sdk', 'twenty-sdk'];

export const parseFrontComponentSharedDependencies = (
  declaredDependencies: unknown,
): { dependencies?: string[]; errors: string[] } => {
  if (declaredDependencies === undefined) {
    return { errors: [] };
  }

  if (!Array.isArray(declaredDependencies)) {
    return {
      errors: [
        '"frontComponentSharedDependencies" in package.json must be an array of package specifiers',
      ],
    };
  }

  if (!isNonEmptyArray(declaredDependencies)) {
    return { errors: [] };
  }

  const errors: string[] = [];
  const seenDependencies = new Set<string>();

  for (const dependency of declaredDependencies) {
    if (!isNonEmptyString(dependency)) {
      errors.push(
        '"frontComponentSharedDependencies" entries in package.json must be non-empty strings',
      );
      continue;
    }

    if (
      dependency.startsWith('.') ||
      path.posix.isAbsolute(dependency) ||
      path.win32.isAbsolute(dependency)
    ) {
      errors.push(
        `Shared dependency "${dependency}" must be a package specifier, not a relative or absolute path`,
      );
      continue;
    }

    if (dependency === FRONT_COMPONENT_SHARED_DEPENDENCIES_IMPORT_SPECIFIER) {
      errors.push(
        `Shared dependency "${dependency}" is reserved and cannot be shared`,
      );
      continue;
    }

    if (
      RESERVED_DEPENDENCY_PREFIXES.some(
        (prefix) =>
          dependency === prefix || dependency.startsWith(`${prefix}/`),
      )
    ) {
      errors.push(
        `Shared dependency "${dependency}" is already served separately and cannot be shared`,
      );
      continue;
    }

    if (seenDependencies.has(dependency)) {
      errors.push(`Shared dependency "${dependency}" is declared twice`);
      continue;
    }

    seenDependencies.add(dependency);
  }

  return isNonEmptyArray(errors)
    ? { errors }
    : {
        dependencies: normalizeFrontComponentSharedDependencies({
          dependencies: [...seenDependencies],
        }),
        errors: [],
      };
};
