import { msg, t } from '@lingui/core/macro';
import { isConnectionProviderScope } from 'twenty-shared/application';

import { ConnectionProviderExceptionCode } from 'src/engine/core-modules/application/connection-provider/connection-provider-exception-code.enum';
import { type FlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/types/failed-flat-entity-validation.type';

export const validateConnectionProviderScope = (
  scope: string,
): FlatEntityValidationError<ConnectionProviderExceptionCode>[] => {
  if (isConnectionProviderScope(scope)) {
    return [];
  }

  return [
    {
      code: ConnectionProviderExceptionCode.INVALID_CONNECTION_PROVIDER_INPUT,
      message: t`Connection provider scope "${scope}" is invalid`,
      userFriendlyMessage: msg`This connection provider scope is not supported.`,
    },
  ];
};
