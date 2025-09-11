import { type ObjectMetadataMaps } from 'src/engine/metadata-modules/types/object-metadata-maps';
import { getObjectMetadataMapItemByNameSingular } from 'src/engine/metadata-modules/utils/get-object-metadata-map-item-by-name-singular.util';
import { type AllStandardFieldIds } from 'src/modules/virtual-fields/types/AllStandardFieldIds';
import { type AllStandardObjectIds } from 'src/modules/virtual-fields/types/AllStandardObjectIds';

export type FieldResolution = {
  objectName: string;
  fieldName: string;
};

export type FieldResolutionOptions = {
  shouldThrowOnError?: boolean;
};

export function resolveFieldByStandardId(
  standardFieldId: AllStandardFieldIds,
  objectMetadataMaps: ObjectMetadataMaps,
): FieldResolution | null {
  for (const objectMetadata of Object.values(objectMetadataMaps.byId)) {
    if (!objectMetadata) continue;

    for (const fieldMetadata of Object.values(objectMetadata.fieldsById)) {
      if (fieldMetadata.standardId === standardFieldId) {
        return {
          objectName: objectMetadata.nameSingular,
          fieldName: fieldMetadata.name,
        };
      }
    }
  }

  return null;
}

export function resolveFieldById(
  fieldId: string,
  objectMetadataMaps: ObjectMetadataMaps,
): FieldResolution | null {
  for (const objectMetadata of Object.values(objectMetadataMaps.byId)) {
    if (!objectMetadata) continue;

    const fieldMetadata = objectMetadata.fieldsById[fieldId];

    if (fieldMetadata) {
      return {
        objectName: objectMetadata.nameSingular,
        fieldName: fieldMetadata.name,
      };
    }
  }

  return null;
}

export function resolveField(
  fieldId: string | AllStandardFieldIds,
  objectMetadataMaps: ObjectMetadataMaps,
  options: FieldResolutionOptions = {},
): FieldResolution | null {
  const { shouldThrowOnError = false } = options;

  const resolvedByStandardId = resolveFieldByStandardId(
    fieldId as AllStandardFieldIds,
    objectMetadataMaps,
  );

  if (resolvedByStandardId) {
    return resolvedByStandardId;
  }

  const resolvedById = resolveFieldById(fieldId, objectMetadataMaps);

  if (resolvedById) {
    return resolvedById;
  }

  if (shouldThrowOnError) {
    throw new Error(`Could not resolve field ID: ${fieldId}`);
  }

  return null;
}

export function resolveObjectById(
  objectId: AllStandardObjectIds,
  objectMetadataMaps: ObjectMetadataMaps,
): string | null {
  const objectMetadata = objectMetadataMaps.byId[objectId];

  if (objectMetadata) {
    return objectMetadata.nameSingular;
  }

  for (const obj of Object.values(objectMetadataMaps.byId)) {
    if (obj?.standardId === objectId) {
      return obj.nameSingular;
    }
  }

  return null;
}

export function getFieldMetadata(
  fieldId: string | AllStandardFieldIds,
  objectMetadataMaps: ObjectMetadataMaps,
) {
  const fieldResolution = resolveField(fieldId, objectMetadataMaps);

  if (!fieldResolution) {
    return null;
  }

  const objectMetadata = getObjectMetadataMapItemByNameSingular(
    objectMetadataMaps,
    fieldResolution.objectName,
  );

  if (!objectMetadata) {
    return null;
  }

  const resolvedFieldId =
    objectMetadata.fieldIdByName[fieldResolution.fieldName];

  return resolvedFieldId ? objectMetadata.fieldsById[resolvedFieldId] : null;
}

export function getObjectMetadataByName(
  objectName: string,
  objectMetadataMaps: ObjectMetadataMaps,
) {
  return getObjectMetadataMapItemByNameSingular(objectMetadataMaps, objectName);
}
