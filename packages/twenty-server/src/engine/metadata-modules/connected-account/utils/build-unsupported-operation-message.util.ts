import { type ConnectedAccountOperation } from 'twenty-shared/types';
import { getMissingScopesForOperation } from 'twenty-shared/utils';

import { type ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';

export const buildUnsupportedOperationMessage = ({
  connectedAccount,
  operation,
}: {
  connectedAccount: Pick<
    ConnectedAccountEntity,
    'handle' | 'provider' | 'scopes'
  >;
  operation: ConnectedAccountOperation;
}): string => {
  const missingScopes = getMissingScopesForOperation({
    connectedAccount,
    operation,
  });

  if (missingScopes.length > 0) {
    return `The connected ${connectedAccount.provider} account is missing permissions (${missingScopes.join(', ')}) for ${operation}. Please reconnect the account to grant them.`;
  }

  return `Connected account '${connectedAccount.handle}' (${connectedAccount.provider}) cannot perform ${operation}`;
};
