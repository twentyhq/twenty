import groupBy from 'lodash.groupby';
import {
  type PermissionFlagType,
  SystemPermissionFlag,
} from 'twenty-shared/constants';
import {
  type ObjectsPermissions,
  type ObjectsPermissionsByRoleId,
  type RestrictedFieldsPermissions,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type FieldPermissionEntity } from 'src/engine/metadata-modules/object-permission/field-permission/field-permission.entity';
import { type RolesPermissionsBuildRows } from 'src/engine/metadata-modules/role/types/roles-permissions-build-rows.type';
import { computeObjectRecordPermissions } from 'src/engine/metadata-modules/role/utils/compute-object-record-permissions.util';

const computeRestrictedFields = ({
  fieldPermissions,
  labelIdentifierFieldMetadataId,
}: {
  fieldPermissions: Pick<
    FieldPermissionEntity,
    'fieldMetadataId' | 'canReadFieldValue' | 'canUpdateFieldValue'
  >[];
  labelIdentifierFieldMetadataId: string | null;
}): RestrictedFieldsPermissions => {
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
};

export const buildRolesPermissions = (
  rows: RolesPermissionsBuildRows,
): ObjectsPermissionsByRoleId => {
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

    const objectPermissionsByObjectMetadataId = groupBy(
      objectPermissions.byRoleId.get(role.id) ?? [],
      'objectMetadataId',
    );
    const fieldPermissionsByObjectMetadataId = groupBy(
      fieldPermissions.byRoleId.get(role.id) ?? [],
      'objectMetadataId',
    );
    const rowLevelPermissionPredicatesByObjectMetadataId = groupBy(
      rowLevelPermissionPredicates.byRoleId.get(role.id) ?? [],
      'objectMetadataId',
    );
    const rowLevelPermissionPredicateGroupsByObjectMetadataId = groupBy(
      rowLevelPermissionPredicateGroups.byRoleId.get(role.id) ?? [],
      'objectMetadataId',
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
            objectPermissionsByObjectMetadataId[objectMetadataId]?.[0],
        });

      objectRecordsPermissions[objectMetadataId] = {
        ...objectRecordPermissions,
        restrictedFields: appliesFieldPermissions
          ? computeRestrictedFields({
              fieldPermissions:
                fieldPermissionsByObjectMetadataId[objectMetadataId] ?? [],
              labelIdentifierFieldMetadataId:
                objectMetadata.labelIdentifierFieldMetadataId,
            })
          : {},
        rowLevelPermissionPredicates:
          rowLevelPermissionPredicatesByObjectMetadataId[objectMetadataId] ??
          [],
        rowLevelPermissionPredicateGroups:
          rowLevelPermissionPredicateGroupsByObjectMetadataId[
            objectMetadataId
          ] ?? [],
      };
    }

    permissionsByRoleId[role.id] = objectRecordsPermissions;
  }

  return permissionsByRoleId;
};
