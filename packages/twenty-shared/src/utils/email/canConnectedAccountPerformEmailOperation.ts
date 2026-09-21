import {
  ConnectedAccountProvider,
  type ConnectedAccountEmailFields,
  EmailOperation,
} from '@/types';
import { assertUnreachable } from '@/utils/assertUnreachable';
import { getEmailProvidersForOperation } from '@/utils/email/getEmailProvidersForOperation';
import { isDefined } from '@/utils/validation/isDefined';

export const canConnectedAccountPerformEmailOperation = ({
  connectedAccount,
  operation,
}: {
  connectedAccount: ConnectedAccountEmailFields;
  operation: EmailOperation;
}): boolean => {
  const { provider, connectionParameters } = connectedAccount;

  if (!getEmailProvidersForOperation(operation).includes(provider)) {
    return false;
  }

  if (provider !== ConnectedAccountProvider.IMAP_SMTP_CALDAV) {
    return true;
  }

  switch (operation) {
    case EmailOperation.SEND:
      return isDefined(connectionParameters?.SMTP);
    case EmailOperation.DRAFT:
      return isDefined(connectionParameters?.IMAP);
    default:
      return assertUnreachable(
        operation,
        `Unhandled email operation: ${operation}`,
      );
  }
};
