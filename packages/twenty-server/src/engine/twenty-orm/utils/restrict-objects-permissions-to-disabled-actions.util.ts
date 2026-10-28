import { type FieldPermissionAction } from 'twenty-shared/application';
import {
  type ObjectsPermissions,
  type RestrictedFieldPermissions,
  type RestrictedFieldsPermissions,
} from 'twenty-shared/types';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { getFlatFieldMetadatasWithDisabledActionsByObjectId } from 'src/engine/twenty-orm/utils/get-flat-field-metadatas-with-disabled-actions-by-object-id.util';

const RESTRICTED_FIELD_PERMISSION_BY_FIELD_PERMISSION_ACTION: Record<
  FieldPermissionAction,
  keyof RestrictedFieldPermissions
> = {
  canReadFieldValue: 'canRead',
  canUpdateFieldValue: 'canUpdate',
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

const restrictFieldsToDisabledActions = ({
  restrictedFields,
  fieldsWithDisabledActions,
}: {
  restrictedFields: RestrictedFieldsPermissions;
  fieldsWithDisabledActions: OrmFlatFieldMetadata[];
}): RestrictedFieldsPermissions => {
  const updatedRestrictedFields = { ...restrictedFields };

  for (const flatFieldMetadata of fieldsWithDisabledActions) {
    updatedRestrictedFields[flatFieldMetadata.id] = {
      ...updatedRestrictedFields[flatFieldMetadata.id],
      ...Object.fromEntries(
        (flatFieldMetadata.disabledFieldPermissionActions ?? []).map(
          (action) => [
            RESTRICTED_FIELD_PERMISSION_BY_FIELD_PERMISSION_ACTION[action],
            false,
          ],
        ),
      ),
    };
  }

  return updatedRestrictedFields;
};

export const restrictObjectsPermissionsToDisabledActions = ({
  objectsPermissions,
  flatObjectMetadataMaps,
  flatFieldMetadataMaps,
  actingApplicationId,
}: {
  objectsPermissions: ObjectsPermissions;
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>;
  actingApplicationId: string | undefined;
}): ObjectsPermissions => {
  const fieldsWithDisabledActionsByObjectId =
    getFlatFieldMetadatasWithDisabledActionsByObjectId(flatFieldMetadataMaps);
  let restrictedObjectsPermissions: ObjectsPermissions | undefined;

  for (const [objectMetadataId, objectPermissions] of Object.entries(
    objectsPermissions,
  )) {
    const flatObjectMetadata = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: objectMetadataId,
      flatEntityMaps: flatObjectMetadataMaps,
    });

    if (!isDefined(flatObjectMetadata)) {
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

    restrictedObjectsPermissions ??= { ...objectsPermissions };
    restrictedObjectsPermissions[objectMetadataId] = {
      ...objectPermissions,
      ...Object.fromEntries(
        disabledObjectPermissionActions.map((action) => [action, false]),
      ),
      restrictedFields: restrictFieldsToDisabledActions({
        restrictedFields: objectPermissions.restrictedFields,
        fieldsWithDisabledActions,
      }),
    };
  }

  return restrictedObjectsPermissions ?? objectsPermissions;
};
