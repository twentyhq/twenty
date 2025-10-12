import { type ALL_METADATA_NAME_MANY_TO_ONE_RELATIONS } from 'src/engine/metadata-modules/flat-entity/constant/all-metadata-many-to-one-relations.constant';
import { type AllMetadataName } from 'src/engine/metadata-modules/flat-entity/types/all-metadata-name.type';

export type MetadataManyToOneRelatedMetadataNames<T extends AllMetadataName> =
  Extract<
    keyof (typeof ALL_METADATA_NAME_MANY_TO_ONE_RELATIONS)[T],
    AllMetadataName
  >;
