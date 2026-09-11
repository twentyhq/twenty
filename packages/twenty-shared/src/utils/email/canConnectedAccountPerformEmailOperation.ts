import { EMAIL_DRAFTING_PROVIDERS, EMAIL_SENDING_PROVIDERS } from '@/constants';
import { ConnectedAccountProvider, type EmailOperation } from '@/types';
import { isDefined } from '@/utils/validation/isDefined';

export const canConnectedAccountPerformEmailOperation = ({
  connectedAccount,
  operation,
}: {
  connectedAccount: {
    provider: ConnectedAccountProvider;
    connectionParameters?: { IMAP?: unknown; SMTP?: unknown } | null;
  };
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
