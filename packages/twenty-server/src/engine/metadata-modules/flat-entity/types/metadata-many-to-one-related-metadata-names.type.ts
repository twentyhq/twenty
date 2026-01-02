import { type AllMetadataName } from 'twenty-shared/metadata';

import { type ALL_METADATA_RELATION_PROPERTIES } from 'src/engine/metadata-modules/flat-entity/constant/all-metadata-relations-properties.constant';

type ExtractMetadataNames<T> = {
  [K in keyof T]: T[K] extends { metadataName: infer M } ? M : never;
}[keyof T];

export type MetadataManyToOneRelatedMetadataNames<T extends AllMetadataName> =
  Extract<
    ExtractMetadataNames<
      (typeof ALL_METADATA_RELATION_PROPERTIES)[T]['manyToOne']
    >,
    AllMetadataName
  >;
