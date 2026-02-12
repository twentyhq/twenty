import { type AllMetadataName } from 'twenty-shared/metadata';

import { type ALL_METADATA_RELATIONS } from 'src/engine/metadata-modules/flat-entity/constant/all-metadata-relations.constant';

type ExtractMetadataNames<T> = {
  [K in keyof T]: T[K] extends { metadataName: infer M } ? M : never;
}[keyof T];

export type MetadataOneToManyRelatedMetadataNames<T extends AllMetadataName> =
  Extract<
    ExtractMetadataNames<(typeof ALL_METADATA_RELATIONS)[T]['oneToMany']>,
    AllMetadataName
  >;
