import { isDefined } from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type SyncableFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/flat-entity.type';

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
  T extends SyncableFlatEntity,
  K extends keyof T,
>({
  flatEntityId,
  flatEntityParentId,
  maxDepth,
  parentIdKey,
  flatEntityMaps,
}: {
  flatEntityId: string;
  flatEntityParentId: string;
  maxDepth?: number;
  parentIdKey: K;
  flatEntityMaps: FlatEntityMaps<T>;
}): CircularDependencyValidationResult => {
  // Direct self-reference check
  if (flatEntityId === flatEntityParentId) {
    return {
      status: 'fail',
      reason: 'self_reference',
    };
  }

  // Traverse ancestor chain to detect cycles and measure depth
  const visited = new Set<string>();
  let currentParentId: string | null | undefined = flatEntityParentId;
  let depth = 1;

  while (isDefined(currentParentId)) {
    if (isDefined(maxDepth) && depth > maxDepth) {
      return {
        status: 'fail',
        reason: 'max_depth_exceeded',
        depth,
      };
    }

    // Check for circular dependency
    if (currentParentId === flatEntityId) {
      return {
        status: 'fail',
        reason: 'circular_dependency',
        depth,
      };
    }

    // Check for cycle in ancestors (already visited node)
    if (visited.has(currentParentId)) {
      return {
        status: 'fail',
        reason: 'circular_dependency',
        depth,
      };
    }

    visited.add(currentParentId);

    const parentEntity: T | undefined = flatEntityMaps.byId[currentParentId];

    if (!isDefined(parentEntity)) {
      break;
    }

    const nextParentId: T[K] = parentEntity[parentIdKey];

    currentParentId =
      isDefined(nextParentId) && typeof nextParentId === 'string'
        ? nextParentId
        : undefined;
    depth++;
  }

  // Check max depth for the final depth value
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
