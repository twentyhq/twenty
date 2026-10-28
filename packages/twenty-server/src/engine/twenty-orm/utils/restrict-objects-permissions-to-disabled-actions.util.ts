import {
  type ObjectsPermissions,
  type RestrictedFieldsPermissions,
} from 'twenty-shared/types';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { getFlatFieldMetadatasWithDisabledActionsByObjectId } from 'src/engine/twenty-orm/utils/get-flat-field-metadatas-with-disabled-actions-by-object-id.util';

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

    const disabledObjectPermissionActions =
      flatObjectMetadata.applicationId === actingApplicationId
        ? []
        : (flatObjectMetadata.disabledObjectPermissionActions ?? []);
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

    const restrictedFields: RestrictedFieldsPermissions = {
      ...objectPermissions.restrictedFields,
    };

    for (const flatFieldMetadata of fieldsWithDisabledActions) {
      const disabledFieldPermissionActions =
        flatFieldMetadata.disabledFieldPermissionActions ?? [];

      restrictedFields[flatFieldMetadata.id] = {
        ...restrictedFields[flatFieldMetadata.id],
        ...(disabledFieldPermissionActions.includes('canReadFieldValue')
          ? { canRead: false }
          : {}),
        ...(disabledFieldPermissionActions.includes('canUpdateFieldValue')
          ? { canUpdate: false }
          : {}),
      };
    }

    restrictedObjectsPermissions ??= { ...objectsPermissions };
    restrictedObjectsPermissions[objectMetadataId] = {
      ...objectPermissions,
      ...Object.fromEntries(
        disabledObjectPermissionActions.map((action) => [action, false]),
      ),
      restrictedFields,
    };
  }

  return restrictedObjectsPermissions ?? objectsPermissions;
};
