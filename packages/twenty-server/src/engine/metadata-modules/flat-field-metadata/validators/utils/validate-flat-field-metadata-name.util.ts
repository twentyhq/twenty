import { msg, t } from '@lingui/core/macro';
import camelCase from 'lodash.camelcase';
import { RESERVED_METADATA_NAME_KEYWORDS } from 'twenty-shared/metadata';

import { FieldMetadataExceptionCode } from 'src/engine/metadata-modules/field-metadata/field-metadata.exception';
import { type FlatFieldMetadataValidationError } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata-validation-error.type';
import { IDENTIFIER_MAX_CHAR_LENGTH } from 'src/engine/metadata-modules/utils/constants/identifier-max-char-length.constants';
import { IDENTIFIER_MIN_CHAR_LENGTH } from 'src/engine/metadata-modules/utils/constants/identifier-min-char-length.constants';
import { type WorkspaceMigrationBuilderOptions } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/workspace-migration-builder-options.type';

const STARTS_WITH_LOWER_CASE_AND_CONTAINS_ONLY_CAPS_AND_LOWER_LETTERS_AND_NUMBER_STRING_REGEX =
  /^[a-z][a-zA-Z0-9]*$/;

export const validateFlatFieldMetadataName = ({
  buildOptions,
  name,
}: {
  name: string;
  buildOptions: WorkspaceMigrationBuilderOptions;
}): FlatFieldMetadataValidationError[] => {
  const errors: FlatFieldMetadataValidationError[] = [];

  if (name.length > IDENTIFIER_MAX_CHAR_LENGTH) {
    errors.push({
      code: FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
      message: t`Name is too long`,
      userFriendlyMessage: msg`Name is too long`,
      value: name,
    });
  }

  if (name.length < IDENTIFIER_MIN_CHAR_LENGTH) {
    errors.push({
      code: FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
      message: t`Name is too short`,
      userFriendlyMessage: msg`Name is too short`,
      value: name,
    });
  }

  if (name !== camelCase(name)) {
    errors.push({
      code: FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
      message: t`Name should be in camelCase`,
      userFriendlyMessage: msg`Name should be in camelCase`,
      value: name,
    });
  }

  if (
    !name.match(
      STARTS_WITH_LOWER_CASE_AND_CONTAINS_ONLY_CAPS_AND_LOWER_LETTERS_AND_NUMBER_STRING_REGEX,
    )
  ) {
    errors.push({
      code: FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
      message: t`Name is not valid: it must start with lowercase letter and contain only alphanumeric letters`,
      userFriendlyMessage: msg`Name is not valid: it must start with lowercase letter and contain only alphanumeric letters`,
      value: name,
    });
  }

  if (
    !buildOptions.isSystemBuild &&
    RESERVED_METADATA_NAME_KEYWORDS.includes(name)
  ) {
    errors.push({
      code: FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
      message: t`This name is reserved. Use a different name or the system will add "Custom" suffix.`,
      userFriendlyMessage: msg`This name is reserved. Use a different name or the system will add "Custom" suffix.`,
      value: name,
    });
  }

  return errors;
};
