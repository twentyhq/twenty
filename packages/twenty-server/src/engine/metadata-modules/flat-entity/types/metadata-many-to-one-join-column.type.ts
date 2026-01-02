import { type AllMetadataName } from 'twenty-shared/metadata';

import { type ALL_METADATA_RELATION_PROPERTIES } from 'src/engine/metadata-modules/flat-entity/constant/all-metadata-relations-properties.constant';

type ExtractForeignKeys<T> = {
  [K in keyof T]: T[K] extends { foreignKey: infer FK } ? FK : never;
}[keyof T];

export type MetadataManyToOneJoinColumn<T extends AllMetadataName> =
  ExtractForeignKeys<(typeof ALL_METADATA_RELATION_PROPERTIES)[T]['manyToOne']>;
