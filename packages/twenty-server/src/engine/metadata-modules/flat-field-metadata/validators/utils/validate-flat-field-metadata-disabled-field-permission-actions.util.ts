import { msg } from '@lingui/core/macro';
import { FIELD_PERMISSION_ACTIONS } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import { FieldMetadataExceptionCode } from 'src/engine/metadata-modules/field-metadata/field-metadata.exception';
import { type FlatFieldMetadataValidationError } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata-validation-error.type';

export const validateFlatFieldMetadataDisabledFieldPermissionActions = ({
  disabledFieldPermissionActions,
}: {
  disabledFieldPermissionActions: unknown;
}): FlatFieldMetadataValidationError[] => {
  if (!isDefined(disabledFieldPermissionActions)) {
    return [];
  }

  if (!Array.isArray(disabledFieldPermissionActions)) {
    return [
      {
        code: FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
        message: 'Disabled field permission actions must be a list',
        userFriendlyMessage: msg`Disabled field permission actions must be a list`,
        value: disabledFieldPermissionActions,
      },
    ];
  }

  const errors: FlatFieldMetadataValidationError[] = [];
  const fieldPermissionActions: readonly string[] = FIELD_PERMISSION_ACTIONS;

  for (const action of disabledFieldPermissionActions) {
    if (
      typeof action !== 'string' ||
      !fieldPermissionActions.includes(action)
    ) {
      errors.push({
        code: FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
        message: `Unknown disabled field permission action "${action}"`,
        userFriendlyMessage: msg`Unknown disabled field permission action`,
        value: action,
      });
    }
  }

  if (
    new Set(disabledFieldPermissionActions).size !==
    disabledFieldPermissionActions.length
  ) {
    errors.push({
      code: FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
      message: 'Disabled field permission actions must not repeat',
      userFriendlyMessage: msg`Disabled field permission actions must not repeat`,
      value: disabledFieldPermissionActions,
    });
  }

  return errors;
};
