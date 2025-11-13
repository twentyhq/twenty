import { type AllMetadataName } from 'twenty-shared/metadata';

import { type ALL_METADATA_REQUIRED_METADATA_FOR_VALIDATION } from 'src/engine/metadata-modules/flat-entity/constant/all-metadata-required-metadata-for-validation.constant';

export type MetadataValidationRelatedMetadataNames<T extends AllMetadataName> =
  Extract<
    keyof (typeof ALL_METADATA_REQUIRED_METADATA_FOR_VALIDATION)[T],
    AllMetadataName
  >;
