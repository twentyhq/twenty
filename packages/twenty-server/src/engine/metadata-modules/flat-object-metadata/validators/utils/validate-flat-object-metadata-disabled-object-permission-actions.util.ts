import { msg } from '@lingui/core/macro';
import { OBJECT_PERMISSION_ACTIONS } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import { type FlatObjectMetadataValidationError } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata-validation-error.type';
import { ObjectMetadataExceptionCode } from 'src/engine/metadata-modules/object-metadata/object-metadata.exception';

export const validateFlatObjectMetadataDisabledObjectPermissionActions = ({
  disabledObjectPermissionActions,
}: {
  disabledObjectPermissionActions: unknown;
}): FlatObjectMetadataValidationError[] => {
  if (!isDefined(disabledObjectPermissionActions)) {
    return [];
  }

  if (!Array.isArray(disabledObjectPermissionActions)) {
    return [
      {
        code: ObjectMetadataExceptionCode.INVALID_OBJECT_INPUT,
        message: 'Disabled object permission actions must be a list',
        userFriendlyMessage: msg`Disabled object permission actions must be a list`,
        value: disabledObjectPermissionActions,
      },
    ];
  }

  const errors: FlatObjectMetadataValidationError[] = [];
  const objectPermissionActions: readonly string[] = OBJECT_PERMISSION_ACTIONS;

  for (const action of disabledObjectPermissionActions) {
    if (
      typeof action !== 'string' ||
      !objectPermissionActions.includes(action)
    ) {
      errors.push({
        code: ObjectMetadataExceptionCode.INVALID_OBJECT_INPUT,
        message: `Unknown disabled object permission action "${action}"`,
        userFriendlyMessage: msg`Unknown disabled object permission action`,
        value: action,
      });
    }
  }

  if (
    new Set(disabledObjectPermissionActions).size !==
    disabledObjectPermissionActions.length
  ) {
    errors.push({
      code: ObjectMetadataExceptionCode.INVALID_OBJECT_INPUT,
      message: 'Disabled object permission actions must not repeat',
      userFriendlyMessage: msg`Disabled object permission actions must not repeat`,
      value: disabledObjectPermissionActions,
    });
  }

  return errors;
};
