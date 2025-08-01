import { isDefined } from 'twenty-shared/utils';

import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { IndexFieldMetadataEntity } from 'src/engine/metadata-modules/index-metadata/index-field-metadata.entity';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { CachedFieldMetadataEntity } from 'src/engine/metadata-modules/types/cached-field-metadata-entity';
import { ObjectMetadataMaps } from 'src/engine/metadata-modules/types/object-metadata-maps';

export const getFieldMetadataEntityFromCachedObjectMetadataMaps = ({
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

  const fieldMetadataFromCache: CachedFieldMetadataEntity =
    objectMetadataFromCache.fieldsById[fieldMetadataId];

  if (!isDefined(fieldMetadataFromCache)) {
    return undefined;
  }

  // We need to determine if graphql will be able to handle relations crafting byitself
  return {
    ...fieldMetadataFromCache,
    object: {} as ObjectMetadataEntity,
    relationTargetFieldMetadata: null,
    relationTargetObjectMetadata: null,
    indexFieldMetadatas: {} as IndexFieldMetadataEntity,
    fieldPermissions: [],
    createdAt: new Date(fieldMetadataFromCache.createdAt),
    updatedAt: new Date(fieldMetadataFromCache.updatedAt),
  };
};
