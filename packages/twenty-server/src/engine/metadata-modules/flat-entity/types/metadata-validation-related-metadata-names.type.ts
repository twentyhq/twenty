import { ALL_METADATA_REQUIRED_METADATA_FOR_VALIDATION } from "src/engine/metadata-modules/flat-entity/constant/all-metadata-required-metadata-for-validation.constant";
import { AllMetadataName } from "src/engine/metadata-modules/flat-entity/types/all-metadata-name.type";
import { IsEmptyRecord } from "twenty-shared/types";

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
