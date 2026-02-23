import { type AllMetadataName } from 'twenty-shared/metadata';

import {
  ALL_METADATA_REQUIRED_METADATA_FOR_VALIDATION,
  type MetadataRelatedMetadataNameForValidation,
} from 'src/engine/metadata-modules/flat-entity/constant/all-metadata-required-metadata-for-validation.constant';

export const getMetadataRelatedMetadataNamesForValidation = <
  T extends AllMetadataName,
>(
  metadataName: T,
) => {
  return Object.keys(
    ALL_METADATA_REQUIRED_METADATA_FOR_VALIDATION[metadataName],
  ) as MetadataRelatedMetadataNameForValidation<T>[];
};
