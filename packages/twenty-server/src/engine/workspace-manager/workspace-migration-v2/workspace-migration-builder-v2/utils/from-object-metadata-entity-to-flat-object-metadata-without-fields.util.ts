import { FlatObjectMetadataWithoutFields } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { fromObjectMetadataEntityToFlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/utils/from-object-metadata-entity-to-flat-object-metadata.util';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';

export const fromObjectMetadataEntityToFlatObjectMetadataWithoutFields = (
  objectMetadataEntity: ObjectMetadataEntity,
): FlatObjectMetadataWithoutFields => {
  return fromObjectMetadataEntityToFlatObjectMetadata({
    ...objectMetadataEntity,
    fields: [],
  });
};
