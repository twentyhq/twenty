import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { ObjectMetadataMaps } from 'src/engine/metadata-modules/types/object-metadata-maps';
import { isDefined } from 'twenty-shared/utils';

export const getFielMetadataEntityFromObjectMetadataMaps = ({
  fieldMetadataId,
  objectMetadataId,
  objectMetadataMaps,
}: {
  objectMetadataMaps: ObjectMetadataMaps;
  objectMetadataId: string;
  fieldMetadataId: string;
}): FieldMetadataEntity | undefined => {
  const objectMetadataFromCache = objectMetadataMaps.byId[objectMetadataId];

  if (!isDefined(objectMetadataFromCache)) {
    return undefined;
  }

  const fieldMetadataFromCache =
    objectMetadataFromCache.fieldsById[fieldMetadataId];

  if (!isDefined(fieldMetadataFromCache)) {
    return undefined;
  }

  return {
    ...fieldMetadataFromCache,
    createdAt: new Date(fieldMetadataFromCache.createdAt),
    updatedAt: new Date(fieldMetadataFromCache.updatedAt),
  };
};
