import { Injectable } from '@nestjs/common';

import { IsNull } from 'typeorm';

import {
  PermissionFlagType,
  SystemPermissionFlag,
} from 'twenty-shared/constants';
import {
  type ObjectsPermissions,
  type ObjectsPermissionsByRoleId,
  type RestrictedFieldsPermissions,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { WorkspaceCacheProvider } from 'src/engine/workspace-cache/interfaces/workspace-cache-provider.service';

import { type FieldPermissionEntity } from 'src/engine/metadata-modules/object-permission/field-permission/field-permission.entity';
import { type ObjectPermissionEntity } from 'src/engine/metadata-modules/object-permission/object-permission.entity';
import { computeObjectRecordPermissions } from 'src/engine/metadata-modules/role/utils/compute-object-record-permissions.util';
import { WorkspaceCache } from 'src/engine/workspace-cache/decorators/workspace-cache.decorator';
import { type WorkspaceCacheProviderContext } from 'src/engine/workspace-cache/types/workspace-cache-provider-context.type';
import { type WorkspaceCacheRowsRequirement } from 'src/engine/workspace-cache/types/workspace-cache-rows-requirement.type';

const ROLES_PERMISSIONS_ROWS_REQUIREMENT = {
  role: true,
  objectPermission: { columns: true, groupBy: ['roleId'] },
  rolePermissionFlag: { columns: true, groupBy: ['roleId'] },
  permissionFlag: true,
  fieldPermission: { columns: true, groupBy: ['roleId'] },
  rowLevelPermissionPredicate: {
    columns: true,
    groupBy: ['roleId'],
    where: { deletedAt: IsNull() },
  },
  rowLevelPermissionPredicateGroup: {
    columns: true,
    groupBy: ['roleId'],
    where: { deletedAt: IsNull() },
  },
  objectMetadata: [
    'id',
    'isSystem',
    'universalIdentifier',
    'labelIdentifierFieldMetadataId',
  ],
} as const satisfies WorkspaceCacheRowsRequirement;

const groupByObjectMetadataId = <TRow extends { objectMetadataId: string }>(
  rows: TRow[],
): Map<string, TRow[]> => {
  const rowsByObjectMetadataId = new Map<string, TRow[]>();

  for (const row of rows) {
    const objectMetadataRows = rowsByObjectMetadataId.get(row.objectMetadataId);

    if (isDefined(objectMetadataRows)) {
      objectMetadataRows.push(row);
    } else {
      rowsByObjectMetadataId.set(row.objectMetadataId, [row]);
    }
  }

  return rowsByObjectMetadataId;
};

@Injectable()
@WorkspaceCache('rolesPermissions', { packingPonderation: 2 })
export class WorkspaceRolesPermissionsCacheService extends WorkspaceCacheProvider<ObjectsPermissionsByRoleId> {
  override readonly rowsRequirement = ROLES_PERMISSIONS_ROWS_REQUIREMENT;

  computeForCache({
    rows,
  }: WorkspaceCacheProviderContext<
    typeof ROLES_PERMISSIONS_ROWS_REQUIREMENT
  >): ObjectsPermissionsByRoleId {
    const {
      role: roles,
      objectPermission: objectPermissions,
      rolePermissionFlag: rolePermissionFlags,
      permissionFlag: permissionFlags,
      fieldPermission: fieldPermissions,
      rowLevelPermissionPredicate: rowLevelPermissionPredicates,
      rowLevelPermissionPredicateGroup: rowLevelPermissionPredicateGroups,
      objectMetadata: workspaceObjectMetadataCollection,
    } = rows;

    const permissionFlagUniversalIdentifierById = new Map(
      permissionFlags.map((permissionFlag) => [
        permissionFlag.id,
        permissionFlag.universalIdentifier,
      ]),
    );

    const permissionsByRoleId: ObjectsPermissionsByRoleId = {};

    for (const role of roles) {
      const rolePermissionFlagUniversalIdentifiers = new Set(
        (rolePermissionFlags.byRoleId.get(role.id) ?? []).map(
          (rolePermissionFlag) =>
            // The permissionFlag relation is stripped until the 2.6.0 upgrade cursor, so fall back to the legacy flag column
            permissionFlagUniversalIdentifierById.get(
              rolePermissionFlag.permissionFlagId,
            ) ??
            SystemPermissionFlag[rolePermissionFlag.flag as PermissionFlagType],
        ),
      );

      const objectPermissionOverrideByObjectMetadataId = new Map<
        string,
        ObjectPermissionEntity
      >();

      for (const objectPermission of objectPermissions.byRoleId.get(role.id) ??
        []) {
        if (
          !objectPermissionOverrideByObjectMetadataId.has(
            objectPermission.objectMetadataId,
          )
        ) {
          objectPermissionOverrideByObjectMetadataId.set(
            objectPermission.objectMetadataId,
            objectPermission,
          );
        }
      }

      const fieldPermissionsByObjectMetadataId = groupByObjectMetadataId(
        fieldPermissions.byRoleId.get(role.id) ?? [],
      );
      const rowLevelPermissionPredicatesByObjectMetadataId =
        groupByObjectMetadataId(
          rowLevelPermissionPredicates.byRoleId.get(role.id) ?? [],
        );
      const rowLevelPermissionPredicateGroupsByObjectMetadataId =
        groupByObjectMetadataId(
          rowLevelPermissionPredicateGroups.byRoleId.get(role.id) ?? [],
        );

      const objectRecordsPermissions: ObjectsPermissions = {};

      for (const objectMetadata of workspaceObjectMetadataCollection) {
        const objectMetadataId = objectMetadata.id;

        const { objectRecordPermissions, appliesFieldPermissions } =
          computeObjectRecordPermissions({
            role,
            rolePermissionFlagUniversalIdentifiers,
            objectMetadata,
            objectPermissionOverride:
              objectPermissionOverrideByObjectMetadataId.get(objectMetadataId),
          });

        objectRecordsPermissions[objectMetadataId] = {
          ...objectRecordPermissions,
          restrictedFields: appliesFieldPermissions
            ? this.computeRestrictedFields({
                fieldPermissions:
                  fieldPermissionsByObjectMetadataId.get(objectMetadataId) ??
                  [],
                labelIdentifierFieldMetadataId:
                  objectMetadata.labelIdentifierFieldMetadataId,
              })
            : {},
          rowLevelPermissionPredicates:
            rowLevelPermissionPredicatesByObjectMetadataId.get(
              objectMetadataId,
            ) ?? [],
          rowLevelPermissionPredicateGroups:
            rowLevelPermissionPredicateGroupsByObjectMetadataId.get(
              objectMetadataId,
            ) ?? [],
        };
      }

      permissionsByRoleId[role.id] = objectRecordsPermissions;
    }

    return permissionsByRoleId;
  }

  private computeRestrictedFields({
    fieldPermissions,
    labelIdentifierFieldMetadataId,
  }: {
    fieldPermissions: FieldPermissionEntity[];
    labelIdentifierFieldMetadataId: string | null;
  }): RestrictedFieldsPermissions {
    const restrictedFields: RestrictedFieldsPermissions = {};

    for (const fieldPermission of fieldPermissions) {
      if (
        !isDefined(fieldPermission.canReadFieldValue) &&
        !isDefined(fieldPermission.canUpdateFieldValue)
      ) {
        continue;
      }

      restrictedFields[fieldPermission.fieldMetadataId] = {
        canRead:
          fieldPermission.fieldMetadataId === labelIdentifierFieldMetadataId
            ? true
            : fieldPermission.canReadFieldValue,
        canUpdate: fieldPermission.canUpdateFieldValue,
      };
    }

    return restrictedFields;
  }
}
