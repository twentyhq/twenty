import { computeMetadataNameFromLabel as computeMetadataNameFromLabelCore } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import {
  InvalidMetadataException,
  InvalidMetadataExceptionCode,
} from 'src/engine/metadata-modules/utils/exceptions/invalid-metadata.exception';

// Server-specific wrapper that converts generic errors to InvalidMetadataException
// This provides consistent error handling with proper exception codes for the server
export const computeMetadataNameFromLabelOrThrow = (label: string): string => {
  if (!isDefined(label)) {
    throw new InvalidMetadataException(
      'Label is required',
      InvalidMetadataExceptionCode.LABEL_REQUIRED,
    );
  }

  try {
    return computeMetadataNameFromLabelCore({ label });
  } catch (error) {
    if (error instanceof Error) {
      throw new InvalidMetadataException(
        error.message,
        InvalidMetadataExceptionCode.INVALID_LABEL,
      );
    }
    throw error;
  }
};
