import { Injectable } from '@nestjs/common';

import diff from 'microdiff';

import { ComparatorAction } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/comparator.interface';

import { RoleEntity } from 'src/engine/metadata-modules/role/role.entity';
import { transformMetadataForComparison } from 'src/engine/workspace-manager/workspace-sync-metadata/comparators/utils/transform-metadata-for-comparison.util';
import { ComputedRole } from 'src/engine/workspace-manager/workspace-sync-metadata/factories/standard-role.factory';

export interface RoleComparatorResult {
  action: ComparatorAction;
  object: ComputedRole;
}

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
    standardRoles: ComputedRole[],
    existingRoles: RoleEntity[],
  ): RoleComparatorResult[] {
    const results: RoleComparatorResult[] = [];

    const standardRoleMap = transformMetadataForComparison(standardRoles, {
      shouldIgnoreProperty: (property) =>
        rolePropertiesToIgnore.includes(property),
      keyFactory(role) {
        return role.roleId || role.label;
      },
    });

    const existingRoleMap = transformMetadataForComparison(existingRoles, {
      shouldIgnoreProperty: (property) =>
        rolePropertiesToIgnore.includes(property),
      keyFactory(role) {
        return role.id;
      },
    });

    const roleDifferences = diff(existingRoleMap, standardRoleMap);

    for (const difference of roleDifferences) {
      switch (difference.type) {
        case 'CREATE': {
          const standardRole = standardRoles.find(
            (role) => (role.roleId || role.label) === difference.path[0],
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
          const roleId = difference.path[0];
          const existingRole = existingRoles.find((role) => role.id === roleId);
          const standardRole = standardRoles.find(
            (role) => role.roleId === roleId,
          );

          if (existingRole && standardRole) {
            results.push({
              action: ComparatorAction.UPDATE,
              object: standardRole,
            });
          }
          break;
        }
      }
    }

    return results;
  }
}
