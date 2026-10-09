import { msg, t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';

import { ApplicationVariableEntityExceptionCode } from 'src/engine/core-modules/application/application-variable/application-variable.exception';
import { type FlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/types/failed-flat-entity-validation.type';

export const validateApplicationVariableDefaultValue = ({
  isSecret,
  defaultValue,
}: {
  isSecret: boolean;
  defaultValue: string | null;
}): FlatEntityValidationError<ApplicationVariableEntityExceptionCode>[] => {
  if (!isSecret || !isDefined(defaultValue)) {
    return [];
  }

  return [
    {
      code: ApplicationVariableEntityExceptionCode.INVALID_APPLICATION_VARIABLE_INPUT,
      message: t`Secret application variable cannot have a default value`,
      userFriendlyMessage: msg`A secret variable cannot have a default value.`,
    },
  ];
};
