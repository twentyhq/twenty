import { type MessageDescriptor } from '@lingui/core';
import { msg, t } from '@lingui/core/macro';
import { doNotTranslate } from 'twenty-shared/i18n';
import { type ConditionalAvailabilityCheckError } from 'twenty-shared/types';
import { assertUnreachable } from 'twenty-shared/utils';

import { type FlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/types/failed-flat-entity-validation.type';

const getUserFriendlyMessage = (
  failure: ConditionalAvailabilityCheckError,
): MessageDescriptor => {
  switch (failure.errorCode) {
    case 'RULE_TOO_LARGE':
      return msg`Visibility restriction has too many conditions`;
    case 'UNKNOWN_NAME': {
      const { name } = failure.errorParams;

      return msg`"${name}" cannot be used in this visibility restriction`;
    }
    case 'INVALID_NODE':
      return msg`Visibility restriction cannot be read`;
    default:
      return assertUnreachable(failure);
  }
};

export const getConditionalAvailabilityValidationError = <
  TCode extends string,
>({
  failure,
  code,
}: {
  failure: ConditionalAvailabilityCheckError;
  code: TCode;
}): FlatEntityValidationError<TCode> => {
  const diagnostic = doNotTranslate(failure.errorMessage);

  return {
    code,
    message: t`Invalid visibility restriction: ${diagnostic}`,
    userFriendlyMessage: getUserFriendlyMessage(failure),
    value: failure,
  };
};
