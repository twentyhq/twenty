import { msg } from '@lingui/core/macro';
import camelCase from 'lodash.camelcase';
import { RESERVED_METADATA_NAME_KEYWORDS } from 'twenty-shared/metadata';

import { type FlatObjectMetadataValidationError } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata-validation-error.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type ObjectMetadataMinimalInformation } from 'src/engine/metadata-modules/flat-object-metadata/types/object-metadata-minimal-information.type';
import { ObjectMetadataExceptionCode } from 'src/engine/metadata-modules/object-metadata/object-metadata.exception';
import { IDENTIFIER_MAX_CHAR_LENGTH } from 'src/engine/metadata-modules/utils/constants/identifier-max-char-length.constants';
import { IDENTIFIER_MIN_CHAR_LENGTH } from 'src/engine/metadata-modules/utils/constants/identifier-min-char-length.constants';

const STARTS_WITH_LOWER_CASE_AND_CONTAINS_ONLY_CAPS_AND_LOWER_LETTERS_AND_NUMBER_STRING_REGEX =
  /^[a-z][a-zA-Z0-9]*$/;

export const validateFlatObjectMetadataNames = ({
  namePlural,
  nameSingular,
}: Pick<FlatObjectMetadata, 'nameSingular' | 'namePlural'> &
  ObjectMetadataMinimalInformation) => {
  const errors: FlatObjectMetadataValidationError[] = [];

  // Validate both nameSingular and namePlural
  for (const name of [nameSingular, namePlural]) {
    // Length too long check
    if (name.length > IDENTIFIER_MAX_CHAR_LENGTH) {
      errors.push({
        code: ObjectMetadataExceptionCode.INVALID_OBJECT_INPUT,
        message: `Name is too long`,
        userFriendlyMessage: msg`Name is too long`,
        value: name,
      });
    }

    // Length too short check
    if (name.length < IDENTIFIER_MIN_CHAR_LENGTH) {
      errors.push({
        code: ObjectMetadataExceptionCode.INVALID_OBJECT_INPUT,
        message: `Name is too short`,
        userFriendlyMessage: msg`Name is too short`,
        value: name,
      });
    }

    // CamelCase check
    if (name !== camelCase(name)) {
      errors.push({
        code: ObjectMetadataExceptionCode.INVALID_OBJECT_INPUT,
        message: `Name should be in camelCase`,
        userFriendlyMessage: msg`Name should be in camelCase`,
        value: name,
      });
    }

    // Format check
    if (
      !name.match(
        STARTS_WITH_LOWER_CASE_AND_CONTAINS_ONLY_CAPS_AND_LOWER_LETTERS_AND_NUMBER_STRING_REGEX,
      )
    ) {
      errors.push({
        code: ObjectMetadataExceptionCode.INVALID_OBJECT_INPUT,
        message: `Name is not valid: it must start with lowercase letter and contain only alphanumeric letters`,
        userFriendlyMessage: msg`Name is not valid: it must start with lowercase letter and contain only alphanumeric letters`,
        value: name,
      });
    }

    // Reserved keywords check
    if (RESERVED_METADATA_NAME_KEYWORDS.includes(name)) {
      errors.push({
        code: ObjectMetadataExceptionCode.INVALID_OBJECT_INPUT,
        message: `This name is reserved. Use a different name or the system will add "Custom" suffix.`,
        userFriendlyMessage: msg`This name is reserved. Use a different name or the system will add "Custom" suffix.`,
        value: name,
      });
    }
  }

  // Check if names are identical
  const namesAreIdentical =
    namePlural.trim().toLowerCase() === nameSingular.trim().toLowerCase();

  if (namesAreIdentical) {
    errors.push({
      code: ObjectMetadataExceptionCode.INVALID_OBJECT_INPUT,
      message: `The singular and plural names cannot be the same for an object`,
      userFriendlyMessage: msg`The singular and plural names cannot be the same for an object`,
      value: namePlural,
    });
  }

  return errors;
};
