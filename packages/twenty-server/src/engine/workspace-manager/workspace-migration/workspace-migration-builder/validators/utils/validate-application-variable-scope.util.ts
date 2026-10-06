import { msg, t } from '@lingui/core/macro';
import { isApplicationVariableScope } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import { ApplicationVariableEntityExceptionCode } from 'src/engine/core-modules/application/application-variable/application-variable.exception';
import { type FlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/types/failed-flat-entity-validation.type';

export const validateApplicationVariableScope = ({
  scope,
  value,
}: {
  scope: string;
  value: string | null;
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

  if (scope === 'USER' && isDefined(value)) {
    errors.push({
      code: ApplicationVariableEntityExceptionCode.INVALID_APPLICATION_VARIABLE_INPUT,
      message: t`User application variable cannot have a value`,
      userFriendlyMessage: msg`A user variable cannot have a value: each member sets their own.`,
    });
  }

  if (scope === 'WORKSPACE' && !isDefined(value)) {
    errors.push({
      code: ApplicationVariableEntityExceptionCode.INVALID_APPLICATION_VARIABLE_INPUT,
      message: t`Workspace application variable must have a value`,
      userFriendlyMessage: msg`A workspace variable must have a value.`,
    });
  }

  return errors;
};
