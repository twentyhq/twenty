import { type AllMetadataName } from 'twenty-shared/metadata';

import {
  ALL_METADATA_SERIALIZED_RELATION,
  type MetadataSerializedRelatedMetadataName,
} from 'src/engine/metadata-modules/flat-entity/constant/all-metadata-serialized-relation.constant';

export const getMetadataSerializedRelationNames = <T extends AllMetadataName>(
  metadataName: T,
) => {
  return Object.keys(
    ALL_METADATA_SERIALIZED_RELATION[metadataName],
  ) as MetadataSerializedRelatedMetadataName<T>[];
};
