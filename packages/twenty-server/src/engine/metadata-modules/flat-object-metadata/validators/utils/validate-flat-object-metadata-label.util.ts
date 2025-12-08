import { msg } from '@lingui/core/macro';

import { type FlatObjectMetadataValidationError } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata-validation-error.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type ObjectMetadataMinimalInformation } from 'src/engine/metadata-modules/flat-object-metadata/types/object-metadata-minimal-information.type';
import { ObjectMetadataExceptionCode } from 'src/engine/metadata-modules/object-metadata/object-metadata.exception';
import { IDENTIFIER_MAX_CHAR_LENGTH } from 'src/engine/metadata-modules/utils/constants/identifier-max-char-length.constants';
import { IDENTIFIER_MIN_CHAR_LENGTH } from 'src/engine/metadata-modules/utils/constants/identifier-min-char-length.constants';

export const validateFlatObjectMetadataLabel = ({
  labelPlural,
  labelSingular,
}: Pick<FlatObjectMetadata, 'labelPlural' | 'labelSingular'> &
  ObjectMetadataMinimalInformation): FlatObjectMetadataValidationError[] => {
  const errors: FlatObjectMetadataValidationError[] = [];

  // Validate both labelSingular and labelPlural
  for (const label of [labelSingular, labelPlural]) {
    // Length too short check
    if (label.length < IDENTIFIER_MIN_CHAR_LENGTH) {
      errors.push({
        code: ObjectMetadataExceptionCode.INVALID_OBJECT_INPUT,
        message: `Object label is too short`,
        userFriendlyMessage: msg`Object label is too short`,
        value: label,
      });
    }

    // Length too long check
    if (label.length > IDENTIFIER_MAX_CHAR_LENGTH) {
      errors.push({
        code: ObjectMetadataExceptionCode.INVALID_OBJECT_INPUT,
        message: `Object label is too long`,
        userFriendlyMessage: msg`Object label is too long`,
        value: label,
      });
    }
  }

  // Check if labels are identical
  const labelsAreIdentical =
    labelSingular.trim().toLowerCase() === labelPlural.trim().toLowerCase();

  if (labelsAreIdentical) {
    errors.push({
      code: ObjectMetadataExceptionCode.INVALID_OBJECT_INPUT,
      message: `The singular and plural labels cannot be the same for an object`,
      userFriendlyMessage: msg`The singular and plural labels cannot be the same for an object`,
      value: labelSingular,
    });
  }

  return errors;
};
