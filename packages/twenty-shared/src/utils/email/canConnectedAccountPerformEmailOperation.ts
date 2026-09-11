import { EMAIL_DRAFTING_PROVIDERS, EMAIL_SENDING_PROVIDERS } from '@/constants';
import {
  ConnectedAccountProvider,
  type ConnectedAccountEmailFields,
  EmailOperation,
} from '@/types';
import { assertUnreachable } from '@/utils/assertUnreachable';
import { isDefined } from '@/utils/validation/isDefined';

export const canConnectedAccountPerformEmailOperation = ({
  connectedAccount,
  operation,
}: {
  connectedAccount: ConnectedAccountEmailFields;
  operation: EmailOperation;
}): boolean => {
  const { provider, connectionParameters } = connectedAccount;
  const isImapSmtpCaldav =
    provider === ConnectedAccountProvider.IMAP_SMTP_CALDAV;

  switch (operation) {
    case EmailOperation.SEND:
      return (
        EMAIL_SENDING_PROVIDERS.includes(provider) &&
        (!isImapSmtpCaldav || isDefined(connectionParameters?.SMTP))
      );
    case EmailOperation.DRAFT:
      return (
        EMAIL_DRAFTING_PROVIDERS.includes(provider) &&
        (!isImapSmtpCaldav || isDefined(connectionParameters?.IMAP))
      );
    default:
      return assertUnreachable(
        operation,
        `Unhandled email operation: ${operation}`,
      );
  }
};
