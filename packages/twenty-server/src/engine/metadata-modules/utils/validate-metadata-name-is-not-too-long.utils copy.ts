import { NameTooLongException } from 'src/engine/metadata-modules/utils/exceptions/name-too-long.exception';
import { exceedsDatabaseIdentifierMaximumLength } from 'src/engine/metadata-modules/utils/validate-database-identifier-length.utils';

export const validateMetadataNameIsNotTooLongOrThrow = (name: string) => {
  if (exceedsDatabaseIdentifierMaximumLength(name)) {
    throw new NameTooLongException(name);
  }
};
