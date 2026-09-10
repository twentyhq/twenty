import { isDefined } from 'twenty-shared/utils';

import { type SyncableFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-from.type';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { type UniversalSyncableFlatEntity } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-entity-from.type';
import { type UniversalFlatEntityMaps } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-entity-maps.type';

export type CircularDependencyValidationSuccess = {
  status: 'success';
  depth: number;
};

export type CircularDependencyValidationFailure = {
  status: 'fail';
  reason: 'self_reference' | 'circular_dependency' | 'max_depth_exceeded';
  depth?: number;
};

export type CircularDependencyValidationResult =
  | CircularDependencyValidationSuccess
  | CircularDependencyValidationFailure;

export const validateFlatEntityCircularDependency = <
  T extends SyncableFlatEntity | UniversalSyncableFlatEntity,
  K extends keyof T,
>({
  flatEntityUniversalIdentifier,
  flatEntityParentUniversalIdentifier,
  maxDepth,
  parentUniversalIdentifierKey,
  flatEntityMaps,
}: {
  flatEntityUniversalIdentifier: string;
  flatEntityParentUniversalIdentifier: string;
  maxDepth?: number;
  parentUniversalIdentifierKey: K;
  flatEntityMaps: UniversalFlatEntityMaps<T>;
}): CircularDependencyValidationResult => {
  if (flatEntityUniversalIdentifier === flatEntityParentUniversalIdentifier) {
    return {
      status: 'fail',
      reason: 'self_reference',
    };
  }

  const visited = new Set<string>();
  let currentParentUniversalIdentifier: string | null | undefined =
    flatEntityParentUniversalIdentifier;
  let depth = 1;

  while (isDefined(currentParentUniversalIdentifier)) {
    if (isDefined(maxDepth) && depth > maxDepth) {
      return {
        status: 'fail',
        reason: 'max_depth_exceeded',
        depth,
      };
    }

    if (currentParentUniversalIdentifier === flatEntityUniversalIdentifier) {
      return {
        status: 'fail',
        reason: 'circular_dependency',
        depth,
      };
    }

    if (visited.has(currentParentUniversalIdentifier)) {
      return {
        status: 'fail',
        reason: 'circular_dependency',
        depth,
      };
    }

    visited.add(currentParentUniversalIdentifier);

    const parentEntity: T | undefined = findFlatEntityByUniversalIdentifier({
      universalIdentifier: currentParentUniversalIdentifier,
      flatEntityMaps,
    });

    if (!isDefined(parentEntity)) {
      break;
    }

    const nextParentUniversalIdentifier: T[K] =
      parentEntity[parentUniversalIdentifierKey];

    currentParentUniversalIdentifier =
      isDefined(nextParentUniversalIdentifier) &&
      typeof nextParentUniversalIdentifier === 'string'
        ? nextParentUniversalIdentifier
        : undefined;
    depth++;
  }

  if (isDefined(maxDepth) && depth > maxDepth) {
    return {
      status: 'fail',
      reason: 'max_depth_exceeded',
      depth,
    };
  }

  return {
    status: 'success',
    depth,
  };
};
