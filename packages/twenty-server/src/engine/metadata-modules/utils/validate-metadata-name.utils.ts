import { validateMetadataNameOnlyContainsWhitelistedCharactersOrThrow } from 'src/engine/metadata-modules/utils/validate-metadata-name-contains-whitelisted-characters.utils';
import { validateMetadataNameIsCamelCaseOrThrow } from 'src/engine/metadata-modules/utils/validate-metadata-name-is-camel-case.utils';
import { validateMetadataNameIsNotReservedKeywordOrThrow } from 'src/engine/metadata-modules/utils/validate-metadata-name-is-not-reserved-keyword';
import { validateMetadataNameIsNotTooLongOrThrow } from 'src/engine/metadata-modules/utils/validate-metadata-name-is-not-too-long.utils copy';
import { validateMetadataNameIsNotTooShortOrThrow } from 'src/engine/metadata-modules/utils/validate-metadata-name-is-not-too-short.utils';

export const validateMetadataNameOrThrow = (name: string): void => {
  const validators = [
    validateMetadataNameIsNotTooLongOrThrow,
    validateMetadataNameIsNotTooShortOrThrow,
    validateMetadataNameIsCamelCaseOrThrow,
    validateMetadataNameOnlyContainsWhitelistedCharactersOrThrow,
    validateMetadataNameIsNotReservedKeywordOrThrow,
  ];

  validators.forEach((validator) => validator(name));
};
