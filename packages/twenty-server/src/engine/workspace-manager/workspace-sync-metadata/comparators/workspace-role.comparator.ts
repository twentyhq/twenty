import { Injectable } from '@nestjs/common';

import diff from 'microdiff';

import { ComparatorAction } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/comparator.interface';

import { type FlatRole } from 'src/engine/metadata-modules/flat-role/types/flat-role.type';
import { type RoleEntity } from 'src/engine/metadata-modules/role/role.entity';
import { transformMetadataForComparison } from 'src/engine/workspace-manager/workspace-sync-metadata/comparators/utils/transform-metadata-for-comparison.util';

type RoleComparatorResult =
  | {
      action: ComparatorAction.CREATE | ComparatorAction.UPDATE;
      object: FlatRole;
    }
  | {
      action: ComparatorAction.DELETE;
      object: RoleEntity;
    };

const rolePropertiesToIgnore = [
  'id',
  'createdAt',
  'updatedAt',
  'workspaceId',
  'roleTargets',
  'permissionFlags',
  'objectPermissions',
  'fieldPermissions',
];

@Injectable()
export class WorkspaceRoleComparator {
  compare(
    standardRoles: FlatRole[],
    existingRoles: RoleEntity[],
  ): RoleComparatorResult[] {
    const results: RoleComparatorResult[] = [];

    const keyFactory = (role: FlatRole | RoleEntity) =>
      role.standardId || role.id;

    const standardRoleMap = transformMetadataForComparison(standardRoles, {
      shouldIgnoreProperty: (property) =>
        rolePropertiesToIgnore.includes(property),
      keyFactory,
    });

    const existingRoleMap = transformMetadataForComparison(existingRoles, {
      shouldIgnoreProperty: (property) =>
        rolePropertiesToIgnore.includes(property),
      keyFactory,
    });

    const roleDifferences = diff(existingRoleMap, standardRoleMap);

    for (const difference of roleDifferences) {
      const uniqueIdentifier = difference.path[0] as string;

      switch (difference.type) {
        case 'CREATE': {
          const standardRole = standardRoles.find(
            (role) => keyFactory(role) === uniqueIdentifier,
          );

          if (standardRole) {
            results.push({
              action: ComparatorAction.CREATE,
              object: standardRole,
            });
          }
          break;
        }
        case 'CHANGE': {
          const existingRole = existingRoles.find(
            (role) => keyFactory(role) === uniqueIdentifier,
          );
          const standardRole = standardRoles.find(
            (role) => keyFactory(role) === uniqueIdentifier,
          );

          if (existingRole && standardRole) {
            results.push({
              action: ComparatorAction.UPDATE,
              object: standardRole,
            });
          }
          break;
        }
        case 'REMOVE': {
          const existingRole = existingRoles.find(
            (role) => keyFactory(role) === uniqueIdentifier,
          );

          if (existingRole && difference.path.length === 1) {
            results.push({
              action: ComparatorAction.DELETE,
              object: existingRole,
            });
          }
          break;
        }
      }
    }

    return results;
  }
}
