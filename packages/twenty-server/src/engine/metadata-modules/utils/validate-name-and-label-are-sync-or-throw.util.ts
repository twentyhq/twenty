import { computeMetadataNameFromLabel as computeMetadataNameFromLabelCore } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import {
  InvalidMetadataException,
  InvalidMetadataExceptionCode,
} from 'src/engine/metadata-modules/utils/exceptions/invalid-metadata.exception';

// Server-specific wrapper that converts generic errors to InvalidMetadataException
// This provides consistent error handling with proper exception codes for the server
export const computeMetadataNameFromLabel = (label: string): string => {
  if (!isDefined(label)) {
    throw new InvalidMetadataException(
      'Label is required',
      InvalidMetadataExceptionCode.LABEL_REQUIRED,
    );
  }

  try {
    return computeMetadataNameFromLabelCore(label);
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

export const validateNameAndLabelAreSyncOrThrow = ({
  label,
  name,
}: {
  label: string;
  name: string;
}) => {
  const computedName = computeMetadataNameFromLabel(label);

  if (name !== computedName) {
    throw new InvalidMetadataException(
      `Name is not synced with label. Expected name: "${computedName}", got ${name}`,
      InvalidMetadataExceptionCode.NAME_NOT_SYNCED_WITH_LABEL,
    );
  }
};
