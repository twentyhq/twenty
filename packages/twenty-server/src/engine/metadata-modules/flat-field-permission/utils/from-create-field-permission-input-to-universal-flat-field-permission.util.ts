import { getFieldPermissionUniversalIdentifier } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { resolveEntityRelationUniversalIdentifiers } from 'src/engine/metadata-modules/flat-entity/utils/resolve-entity-relation-universal-identifiers.util';
import { type FieldPermissionInput } from 'src/engine/metadata-modules/object-permission/dtos/upsert-field-permissions.input';
import { type UniversalFlatFieldPermission } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-permission.type';

export const fromCreateFieldPermissionInputToUniversalFlatFieldPermission = ({
  fieldPermissionInput,
  roleId,
  flatApplication,
  flatRoleMaps,
  flatObjectMetadataMaps,
  flatFieldMetadataMaps,
  flatRowLevelPermissionPredicateGroupMaps,
}: {
  fieldPermissionInput: FieldPermissionInput;
  roleId: string;
  flatApplication: FlatApplication;
} & Pick<
  AllFlatEntityMaps,
  | 'flatRoleMaps'
  | 'flatObjectMetadataMaps'
  | 'flatFieldMetadataMaps'
  | 'flatRowLevelPermissionPredicateGroupMaps'
>): UniversalFlatFieldPermission & { id: string } => {
  const now = new Date().toISOString();

  const {
    roleUniversalIdentifier,
    objectMetadataUniversalIdentifier,
    fieldMetadataUniversalIdentifier,
    rowLevelPermissionPredicateGroupUniversalIdentifier,
  } = resolveEntityRelationUniversalIdentifiers({
    metadataName: 'fieldPermission',
    foreignKeyValues: {
      roleId,
      objectMetadataId: fieldPermissionInput.objectMetadataId,
      fieldMetadataId: fieldPermissionInput.fieldMetadataId,
      rowLevelPermissionPredicateGroupId:
        fieldPermissionInput.rowLevelPermissionPredicateGroupId ?? null,
    },
    flatEntityMaps: {
      flatRoleMaps,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
      flatRowLevelPermissionPredicateGroupMaps,
    },
  });

  const rowLevelPermissionPredicateGroup = isDefined(
    fieldPermissionInput.rowLevelPermissionPredicateGroupId,
  )
    ? findFlatEntityByIdInFlatEntityMaps({
        flatEntityId: fieldPermissionInput.rowLevelPermissionPredicateGroupId,
        flatEntityMaps: flatRowLevelPermissionPredicateGroupMaps,
      })
    : undefined;

  return {
    id: v4(),
    universalIdentifier: getFieldPermissionUniversalIdentifier({
      applicationUniversalIdentifier: flatApplication.universalIdentifier,
      roleUniversalIdentifier,
      fieldUniversalIdentifier: fieldMetadataUniversalIdentifier,
      rowLevelPermissionPredicateGroupUniversalIdentifier,
    }),
    applicationUniversalIdentifier: flatApplication.universalIdentifier,
    roleUniversalIdentifier,
    objectMetadataUniversalIdentifier,
    fieldMetadataUniversalIdentifier,
    rowLevelPermissionPredicateGroupUniversalIdentifier,
    rowLevelPermissionRuleUniversalIdentifier:
      rowLevelPermissionPredicateGroup?.rowLevelPermissionRuleUniversalIdentifier ??
      null,
    canReadFieldValue: fieldPermissionInput.canReadFieldValue ?? undefined,
    canUpdateFieldValue: fieldPermissionInput.canUpdateFieldValue ?? undefined,
    createdAt: now,
    updatedAt: now,
  };
};
