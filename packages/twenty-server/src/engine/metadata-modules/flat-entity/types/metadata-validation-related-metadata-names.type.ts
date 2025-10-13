import { type IsEmptyRecord } from 'twenty-shared/types';

import { type ALL_METADATA_REQUIRED_METADATA_FOR_VALIDATION } from 'src/engine/metadata-modules/flat-entity/constant/all-metadata-required-metadata-for-validation.constant';
import { type AllMetadataName } from 'src/engine/metadata-modules/flat-entity/types/all-metadata-name.type';

export type MetadataValidationRelatedMetadataNames<T extends AllMetadataName> =
  IsEmptyRecord<
    (typeof ALL_METADATA_REQUIRED_METADATA_FOR_VALIDATION)[T]
  > extends true
    ? undefined
    : NonNullable<
        Extract<
          keyof (typeof ALL_METADATA_REQUIRED_METADATA_FOR_VALIDATION)[T],
          AllMetadataName
        >
      >;
