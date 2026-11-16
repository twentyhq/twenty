import {
  type DisableableObjectPermissionAction,
  type FieldPermissionAction,
} from 'twenty-shared/application';
import { type ObjectRecordsPermissions } from 'twenty-shared/types';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { getFlatFieldMetadatasWithDisabledActionsByObjectId } from 'src/engine/permissions/internal/role/utils/get-flat-field-metadatas-with-disabled-actions-by-object-id.util';
import { type RoleRecordsPermissions } from 'src/engine/permissions/types/role-records-permissions.type';

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
      rowLevelRecordsPermissions: rowLevelRecordsPermissions.map((rule) => ({
        ...rule,
        canCreateRecords:
          rule.canCreateRecords && isEnabled('canCreateObjectRecords'),
        canReadRecords:
          rule.canReadRecords && isEnabled('canReadObjectRecords'),
        canUpdateRecords:
          rule.canUpdateRecords && isEnabled('canUpdateObjectRecords'),
        canSoftDeleteRecords:
          rule.canSoftDeleteRecords && isEnabled('canSoftDeleteObjectRecords'),
        canDestroyRecords:
          rule.canDestroyRecords && isEnabled('canDestroyObjectRecords'),
      })),
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
  objectRecordsPermissions: { unreadableFields, uneditableFields },
  fieldsWithDisabledActions,
  labelIdentifierFieldMetadataId,
}: {
  objectRecordsPermissions: Pick<
    ObjectRecordsPermissions,
    'unreadableFields' | 'uneditableFields'
  >;
  fieldsWithDisabledActions: OrmFlatFieldMetadata[];
  labelIdentifierFieldMetadataId: string | null;
}): Pick<ObjectRecordsPermissions, 'unreadableFields' | 'uneditableFields'> => {
  const restrictedUnreadableFields = new Set(unreadableFields);
  const restrictedUneditableFields = new Set(uneditableFields);

  for (const flatFieldMetadata of fieldsWithDisabledActions) {
    const enforcedActions = getEnforcedFieldPermissionActions({
      flatFieldMetadata,
      labelIdentifierFieldMetadataId,
    });

    if (enforcedActions.includes('canReadFieldValue')) {
      restrictedUnreadableFields.add(flatFieldMetadata.id);
      restrictedUneditableFields.add(flatFieldMetadata.id);
    }

    if (enforcedActions.includes('canUpdateFieldValue')) {
      restrictedUneditableFields.add(flatFieldMetadata.id);
    }
  }

  return {
    unreadableFields: [...restrictedUnreadableFields],
    uneditableFields: [...restrictedUneditableFields],
  };
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
      ...restrictFieldsToDisabledActions({
        objectRecordsPermissions,
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
