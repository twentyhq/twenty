import { type AllMetadataName } from 'twenty-shared/metadata';

import { type ALL_METADATA_RELATED_METADATA_BY_FOREIGN_KEY } from 'src/engine/metadata-modules/flat-entity/constant/all-metadata-many-to-one-relations.constant';

export type MetadataManyToOneRelatedMetadataNames<T extends AllMetadataName> =
  Extract<
    (typeof ALL_METADATA_RELATED_METADATA_BY_FOREIGN_KEY)[T][keyof (typeof ALL_METADATA_RELATED_METADATA_BY_FOREIGN_KEY)[T]],
    AllMetadataName
  >;
