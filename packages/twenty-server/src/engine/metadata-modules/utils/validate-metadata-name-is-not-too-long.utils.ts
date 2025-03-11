import { InvalidMetadataNameException } from 'src/engine/metadata-modules/utils/exceptions/invalid-metadata-name.exception';
import { exceedsDatabaseIdentifierMaximumLength } from 'src/engine/metadata-modules/utils/validate-database-identifier-length.utils';

export const validateMetadataNameIsNotTooLongOrThrow = (name: string) => {
  if (exceedsDatabaseIdentifierMaximumLength(name)) {
    throw new InvalidMetadataNameException(
      `String "${name}" exceeds 63 characters limit`,
    );
  }
};
