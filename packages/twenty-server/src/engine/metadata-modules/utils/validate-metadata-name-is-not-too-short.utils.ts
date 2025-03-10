import { NameTooShortException } from 'src/engine/metadata-modules/utils/exceptions/name-too-short.exception';
import { beneathDatabaseIdentifierMinimumLength } from 'src/engine/metadata-modules/utils/validate-database-identifier-length.utils';

export const validateMetadataNameIsNotTooShortOrThrow = (name: string) => {
  if (beneathDatabaseIdentifierMinimumLength(name)) {
    throw new NameTooShortException(name);
  }
};
