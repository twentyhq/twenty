import { type AllMetadataName } from 'twenty-shared/metadata';

import { type ALL_MANY_TO_ONE_METADATA_FOREIGN_KEY } from 'src/engine/metadata-modules/flat-entity/constant/all-many-to-one-metadata-foreign-key.constant';

type ExtractForeignKeys<T> = {
  [K in keyof T]: T[K] extends { foreignKey: infer FK } ? FK : never;
}[keyof T];

export type MetadataManyToOneJoinColumn<T extends AllMetadataName> =
  ExtractForeignKeys<(typeof ALL_MANY_TO_ONE_METADATA_FOREIGN_KEY)[T]>;
