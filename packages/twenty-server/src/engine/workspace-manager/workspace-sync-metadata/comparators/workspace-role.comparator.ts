import { Injectable } from '@nestjs/common';

import diff from 'microdiff';
import { type FromTo } from 'twenty-shared/types';

import { ComparatorAction } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/comparator.interface';

import { type FlatRole } from 'src/engine/metadata-modules/flat-role/types/flat-role.type';
import { type RoleEntity } from 'src/engine/metadata-modules/role/role.entity';
import { transformMetadataForComparison } from 'src/engine/workspace-manager/workspace-sync-metadata/comparators/utils/transform-metadata-for-comparison.util';

type RoleComparatorResult =
  | {
      action: ComparatorAction.CREATE;
      fromFlatRole: null;
      toFlatRole: FlatRole;
    }
  | {
      action: ComparatorAction.UPDATE;
      fromFlatRole: FlatRole;
      toFlatRole: FlatRole;
    }
  | {
      action: ComparatorAction.DELETE;
      fromFlatRole: FlatRole;
      toFlatRole: null;
    };

type WorkspaceRoleComparatorArgs = FromTo<FlatRole[], 'FlatRoles'>;

const rolePropertiesToIgnore = [
  'id',
  'createdAt',
  'updatedAt',
  'workspaceId',
  'roleTargets',
  'permissionFlags',
  'objectPermissions',
  'fieldPermissions',
  'universalIdentifier',
  'applicationId',
];

@Injectable()
export class WorkspaceRoleComparator {
  compare({
    fromFlatRoles,
    toFlatRoles,
  }: WorkspaceRoleComparatorArgs): RoleComparatorResult[] {
    const results: RoleComparatorResult[] = [];

    const keyFactory = (role: FlatRole | RoleEntity) =>
      role.standardId || role.id;

    const fromRoleMap = transformMetadataForComparison(fromFlatRoles, {
      shouldIgnoreProperty: (property) =>
        rolePropertiesToIgnore.includes(property),
      keyFactory,
    });

    const toRoleMap = transformMetadataForComparison(toFlatRoles, {
      shouldIgnoreProperty: (property) =>
        rolePropertiesToIgnore.includes(property),
      keyFactory,
    });

    const roleDifferences = diff(fromRoleMap, toRoleMap);

    for (const difference of roleDifferences) {
      const universalIdentifier = difference.path[0] as string;

      switch (difference.type) {
        case 'CREATE': {
          const toRole = toFlatRoles.find(
            (role) => keyFactory(role) === universalIdentifier,
          );

          if (toRole) {
            results.push({
              action: ComparatorAction.CREATE,
              fromFlatRole: null,
              toFlatRole: toRole,
            });
          }
          break;
        }
        case 'CHANGE': {
          const fromRole = fromFlatRoles.find(
            (role) => keyFactory(role) === universalIdentifier,
          );
          const toRole = toFlatRoles.find(
            (role) => keyFactory(role) === universalIdentifier,
          );

          if (fromRole && toRole) {
            results.push({
              action: ComparatorAction.UPDATE,
              fromFlatRole: fromRole,
              toFlatRole: toRole,
            });
          }
          break;
        }
        case 'REMOVE': {
          const fromRole = fromFlatRoles.find(
            (role) => keyFactory(role) === universalIdentifier,
          );

          if (fromRole && difference.path.length === 1) {
            results.push({
              action: ComparatorAction.DELETE,
              fromFlatRole: fromRole,
              toFlatRole: null,
            });
          }
          break;
        }
      }
    }

    return results;
  }
}
