import { InvalidMetadataNameException } from 'src/engine/metadata-modules/utils/exceptions/invalid-metadata-name.exception';
import { beneathDatabaseIdentifierMinimumLength } from 'src/engine/metadata-modules/utils/validate-database-identifier-length.utils';

export const validateMetadataNameIsNotTooShortOrThrow = (name: string) => {
  if (beneathDatabaseIdentifierMinimumLength(name)) {
    throw new InvalidMetadataNameException(`Input is too short: "${name}"`);
  }
};
