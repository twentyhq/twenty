import { msg, t } from '@lingui/core/macro';
import { isApplicationVariableScope } from 'twenty-shared/application';

import { ApplicationVariableEntityExceptionCode } from 'src/engine/core-modules/application/application-variable/application-variable.exception';
import { type UniversalFlatApplicationVariable } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-application-variable.type';
import { type FlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/types/failed-flat-entity-validation.type';

export const validateApplicationVariableScope = ({
  scope,
  isSecret,
  isRequired,
}: Pick<UniversalFlatApplicationVariable, 'isSecret' | 'isRequired'> & {
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

  if (scope === 'USER' && isSecret) {
    errors.push({
      code: ApplicationVariableEntityExceptionCode.INVALID_APPLICATION_VARIABLE_INPUT,
      message: t`A user application variable cannot be secret`,
      userFriendlyMessage: msg`A user application variable cannot be secret.`,
    });
  }

  if (scope === 'USER' && isRequired) {
    errors.push({
      code: ApplicationVariableEntityExceptionCode.INVALID_APPLICATION_VARIABLE_INPUT,
      message: t`A user application variable cannot be required`,
      userFriendlyMessage: msg`A user application variable cannot be required.`,
    });
  }

  return errors;
};
