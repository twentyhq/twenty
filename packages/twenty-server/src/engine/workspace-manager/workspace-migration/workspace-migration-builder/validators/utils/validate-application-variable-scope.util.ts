import { msg, t } from '@lingui/core/macro';
import { isApplicationVariableScope } from 'twenty-shared/application';

import { ApplicationVariableEntityExceptionCode } from 'src/engine/core-modules/application/application-variable/application-variable.exception';
import { type FlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/types/failed-flat-entity-validation.type';

export const validateApplicationVariableScope = ({
  scope,
}: {
  scope: string;
}): FlatEntityValidationError<ApplicationVariableEntityExceptionCode>[] => {
  const errors: FlatEntityValidationError<ApplicationVariableEntityExceptionCode>[] =
    [];

  if (!isApplicationVariableScope(scope)) {
    errors.push({
      code: ApplicationVariableEntityExceptionCode.INVALID_APPLICATION_VARIABLE_INPUT,
      message: t`Application variable scope "${scope}" is invalid`,
      userFriendlyMessage: msg`This application variable scope is not supported.`,
    });
  }

  return errors;
};
