import { ConnectedAccountProvider } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { EMAIL_DRAFTING_PROVIDERS } from 'src/engine/metadata-modules/connected-account/constants/email-drafting-providers.constant';
import { EMAIL_SENDING_PROVIDERS } from 'src/engine/metadata-modules/connected-account/constants/email-sending-providers.constant';
import { type ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { type EmailOperation } from 'src/engine/metadata-modules/connected-account/types/email-operation.type';

export const canConnectedAccountPerformEmailOperation = ({
  connectedAccount,
  operation,
}: {
  connectedAccount: Pick<
    ConnectedAccountEntity,
    'provider' | 'connectionParameters'
  >;
  operation: EmailOperation;
}): boolean => {
  const providersForOperation =
    operation === 'SEND' ? EMAIL_SENDING_PROVIDERS : EMAIL_DRAFTING_PROVIDERS;

  if (!providersForOperation.includes(connectedAccount.provider)) {
    return false;
  }

  if (connectedAccount.provider !== ConnectedAccountProvider.IMAP_SMTP_CALDAV) {
    return true;
  }

  return operation === 'SEND'
    ? isDefined(connectedAccount.connectionParameters?.SMTP)
    : isDefined(connectedAccount.connectionParameters?.IMAP);
};
