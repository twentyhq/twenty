import {
  type DisableableObjectPermissionAction,
  type FieldPermissionAction,
} from 'twenty-shared/application';
import {
  type ObjectRecordsPermissions,
  type RestrictedFieldPermissions,
  type RestrictedFieldsPermissions,
} from 'twenty-shared/types';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { getFlatFieldMetadatasWithDisabledActionsByObjectId } from 'src/engine/permissions/internal/role/utils/get-flat-field-metadatas-with-disabled-actions-by-object-id.util';
import { type RoleRecordsPermissions } from 'src/engine/permissions/types/role-records-permissions.type';

const RESTRICTED_FIELD_PERMISSION_BY_FIELD_PERMISSION_ACTION: Record<
  FieldPermissionAction,
  keyof RestrictedFieldPermissions
> = {
  canReadFieldValue: 'canRead',
  canUpdateFieldValue: 'canUpdate',
};

const restrictObjectRecordsPermissionsToDisabledActions = ({
  objectRecordsPermissions,
  disabledObjectPermissionActions,
}: {
  objectRecordsPermissions: ObjectRecordsPermissions;
  disabledObjectPermissionActions: DisableableObjectPermissionAction[];
}): ObjectRecordsPermissions => {
  const isEnabled = (action: DisableableObjectPermissionAction) =>
    !disabledObjectPermissionActions.includes(action);
  const { rowLevelRecordsPermissions } = objectRecordsPermissions;

  return {
    ...objectRecordsPermissions,
    canCreateAllRecords:
      objectRecordsPermissions.canCreateAllRecords &&
      isEnabled('canCreateObjectRecords'),
    canReadAllRecords:
      objectRecordsPermissions.canReadAllRecords &&
      isEnabled('canReadObjectRecords'),
    canUpdateAllRecords:
      objectRecordsPermissions.canUpdateAllRecords &&
      isEnabled('canUpdateObjectRecords'),
    canSoftDeleteAllRecords:
      objectRecordsPermissions.canSoftDeleteAllRecords &&
      isEnabled('canSoftDeleteObjectRecords'),
    canDestroyAllRecords:
      objectRecordsPermissions.canDestroyAllRecords &&
      isEnabled('canDestroyObjectRecords'),
    ...(isDefined(rowLevelRecordsPermissions) && {
      rowLevelRecordsPermissions: {
        ...rowLevelRecordsPermissions,
        canCreateRecords:
          rowLevelRecordsPermissions.canCreateRecords &&
          isEnabled('canCreateObjectRecords'),
        canReadRecords:
          rowLevelRecordsPermissions.canReadRecords &&
          isEnabled('canReadObjectRecords'),
        canUpdateRecords:
          rowLevelRecordsPermissions.canUpdateRecords &&
          isEnabled('canUpdateObjectRecords'),
        canSoftDeleteRecords:
          rowLevelRecordsPermissions.canSoftDeleteRecords &&
          isEnabled('canSoftDeleteObjectRecords'),
        canDestroyRecords:
          rowLevelRecordsPermissions.canDestroyRecords &&
          isEnabled('canDestroyObjectRecords'),
      },
    }),
  };
};

const getDisabledObjectPermissionActions = ({
  flatObjectMetadata,
  actingApplicationId,
}: {
  flatObjectMetadata: Pick<
    FlatObjectMetadata,
    'applicationId' | 'disabledObjectPermissionActions'
  >;
  actingApplicationId: string | undefined;
}) => {
  if (flatObjectMetadata.applicationId === actingApplicationId) {
    return [];
  }

  return flatObjectMetadata.disabledObjectPermissionActions ?? [];
};

// Like saved field permissions, the label identifier always stays readable
const getEnforcedFieldPermissionActions = ({
  flatFieldMetadata,
  labelIdentifierFieldMetadataId,
}: {
  flatFieldMetadata: Pick<
    OrmFlatFieldMetadata,
    'id' | 'disabledFieldPermissionActions'
  >;
  labelIdentifierFieldMetadataId: string | null;
}): FieldPermissionAction[] =>
  (flatFieldMetadata.disabledFieldPermissionActions ?? []).filter(
    (action) =>
      action !== 'canReadFieldValue' ||
      flatFieldMetadata.id !== labelIdentifierFieldMetadataId,
  );

const restrictFieldsToDisabledActions = ({
  restrictedFields,
  fieldsWithDisabledActions,
  labelIdentifierFieldMetadataId,
}: {
  restrictedFields: RestrictedFieldsPermissions;
  fieldsWithDisabledActions: OrmFlatFieldMetadata[];
  labelIdentifierFieldMetadataId: string | null;
}): RestrictedFieldsPermissions => {
  const updatedRestrictedFields = { ...restrictedFields };

  for (const flatFieldMetadata of fieldsWithDisabledActions) {
    updatedRestrictedFields[flatFieldMetadata.id] = {
      ...updatedRestrictedFields[flatFieldMetadata.id],
      ...Object.fromEntries(
        getEnforcedFieldPermissionActions({
          flatFieldMetadata,
          labelIdentifierFieldMetadataId,
        }).map((action) => [
          RESTRICTED_FIELD_PERMISSION_BY_FIELD_PERMISSION_ACTION[action],
          false,
        ]),
      ),
    };
  }

  return updatedRestrictedFields;
};

export const restrictRecordsPermissionsToDisabledActions = ({
  recordsPermissions,
  flatObjectMetadataMaps,
  flatFieldMetadataMaps,
  actingApplicationId,
}: {
  recordsPermissions: RoleRecordsPermissions;
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>;
  actingApplicationId: string | undefined;
}): RoleRecordsPermissions => {
  const fieldsWithDisabledActionsByObjectId =
    getFlatFieldMetadatasWithDisabledActionsByObjectId(flatFieldMetadataMaps);
  let restrictedObjects: RoleRecordsPermissions['objects'] | undefined;

  for (const [objectMetadataId, objectRecordsPermissions] of Object.entries(
    recordsPermissions.objects,
  )) {
    const flatObjectMetadata = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: objectMetadataId,
      flatEntityMaps: flatObjectMetadataMaps,
    });

    if (
      !isDefined(flatObjectMetadata) ||
      !isDefined(objectRecordsPermissions)
    ) {
      continue;
    }

    const disabledObjectPermissionActions = getDisabledObjectPermissionActions({
      flatObjectMetadata,
      actingApplicationId,
    });
    const fieldsWithDisabledActions = (
      fieldsWithDisabledActionsByObjectId.get(objectMetadataId) ?? []
    ).filter(
      (flatFieldMetadata) =>
        flatFieldMetadata.applicationId !== actingApplicationId,
    );

    if (
      !isNonEmptyArray(disabledObjectPermissionActions) &&
      !isNonEmptyArray(fieldsWithDisabledActions)
    ) {
      continue;
    }

    restrictedObjects ??= { ...recordsPermissions.objects };
    restrictedObjects[objectMetadataId] = {
      ...restrictObjectRecordsPermissionsToDisabledActions({
        objectRecordsPermissions,
        disabledObjectPermissionActions,
      }),
      restrictedFields: restrictFieldsToDisabledActions({
        restrictedFields: objectRecordsPermissions.restrictedFields,
        fieldsWithDisabledActions,
        labelIdentifierFieldMetadataId:
          flatObjectMetadata.labelIdentifierFieldMetadataId,
      }),
    };
  }

  return isDefined(restrictedObjects)
    ? { ...recordsPermissions, objects: restrictedObjects }
    : recordsPermissions;
};
