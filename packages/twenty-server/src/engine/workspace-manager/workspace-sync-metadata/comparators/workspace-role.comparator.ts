import { Injectable } from '@nestjs/common';

import diff from 'microdiff';

import { ComparatorAction } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/comparator.interface';

import { FlatRole } from 'src/engine/metadata-modules/flat-role/types/flat-role.type';
import { RoleEntity } from 'src/engine/metadata-modules/role/role.entity';
import { transformMetadataForComparison } from 'src/engine/workspace-manager/workspace-sync-metadata/comparators/utils/transform-metadata-for-comparison.util';

type RoleComparatorResult = {
  action: ComparatorAction;
  object: FlatRole;
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
  'uniqueIdentifier',
];

@Injectable()
export class WorkspaceRoleComparator {
  compare(
    standardRoles: FlatRole[],
    existingRoles: RoleEntity[],
  ): RoleComparatorResult[] {
    const results: RoleComparatorResult[] = [];

    const standardRoleMap = transformMetadataForComparison(standardRoles, {
      shouldIgnoreProperty: (property) =>
        rolePropertiesToIgnore.includes(property),
      keyFactory(role) {
        return role.id || role.label;
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
            (role) => (role.id || role.label) === difference.path[0],
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
          const standardRole = standardRoles.find((role) => role.id === roleId);

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
