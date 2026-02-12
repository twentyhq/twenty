import { type AllMetadataName } from 'twenty-shared/metadata';

import { type ALL_METADATA_RELATIONS } from 'src/engine/metadata-modules/flat-entity/constant/all-metadata-relations.constant';

type ExtractForeignKeys<T> = {
  [K in keyof T]: T[K] extends { foreignKey: infer FK } ? FK : never;
}[keyof T];

export type MetadataManyToOneJoinColumn<T extends AllMetadataName> =
  ExtractForeignKeys<(typeof ALL_METADATA_RELATIONS)[T]['manyToOne']>;
