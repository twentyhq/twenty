import { validateMetadataNameIsNotReservedKeywordOrThrow } from 'src/engine/metadata-modules/utils/validate-metadata-name-is-not-reserved-keyword';
import { validateMetadataNameIsNotTooLongOrThrow } from 'src/engine/metadata-modules/utils/validate-metadata-name-is-not-too-long.utils';
import { validateMetadataNameIsNotTooShortOrThrow } from 'src/engine/metadata-modules/utils/validate-metadata-name-is-not-too-short.utils';

export const validateMetadataTargetLabelOrThrow = (label: string): void => {
  const validators = [
    validateMetadataNameIsNotTooLongOrThrow,
    validateMetadataNameIsNotTooShortOrThrow,
    validateMetadataNameIsNotReservedKeywordOrThrow,
  ];

  validators.forEach((validator) => validator(label));
};
