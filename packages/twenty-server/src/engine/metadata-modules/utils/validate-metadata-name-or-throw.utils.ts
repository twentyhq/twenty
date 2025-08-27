import { validateMetadataNameIsCamelCaseOrThrow } from 'src/engine/metadata-modules/utils/validate-metadata-name-is-camel-case.utils';
import { validateMetadataNameIsNotReservedKeywordOrThrow } from 'src/engine/metadata-modules/utils/validate-metadata-name-is-not-reserved-keyword';
import { validateMetadataNameIsNotTooLongOrThrow } from 'src/engine/metadata-modules/utils/validate-metadata-name-is-not-too-long.utils';
import { validateMetadataNameIsNotTooShortOrThrow } from 'src/engine/metadata-modules/utils/validate-metadata-name-is-not-too-short.utils';
import { validateMetadataNameStartWithLowercaseLetterAndContainDigitsNorLettersOrThrow } from 'src/engine/metadata-modules/utils/validate-metadata-name-start-with-lowercase-letter-and-contain-digits-nor-letters.utils';

export const validateMetadataNameOrThrow = (name: string): void => {
  const validators = [
    validateMetadataNameIsNotTooLongOrThrow,
    validateMetadataNameIsNotTooShortOrThrow,
    validateMetadataNameIsCamelCaseOrThrow,
    validateMetadataNameStartWithLowercaseLetterAndContainDigitsNorLettersOrThrow,
    validateMetadataNameIsNotReservedKeywordOrThrow,
  ];

  validators.forEach((validator) => validator(name));
};
