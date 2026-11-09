import {
  ConnectedAccountProvider,
  type ConnectedAccountEmailFields,
  EmailOperation,
} from '@/types';
import { assertUnreachable } from '@/utils/assertUnreachable';
import { getEmailProvidersForOperation } from '@/utils/email/getEmailProvidersForOperation';
import { isDefined } from '@/utils/validation/isDefined';

const GMAIL_SEND_SCOPE = 'https://www.googleapis.com/auth/gmail.send';
const MICROSOFT_SEND_SCOPE = 'Mail.Send';

// SSO sign-in stores an account with identity scopes only. Accounts
// connected before scopes were recorded have none and keep working.
const hasScopeOrNoneRecorded = (scopes: string[] | null, scope: string) =>
  !isDefined(scopes) || scopes.includes(scope);

export const canConnectedAccountPerformEmailOperation = ({
  connectedAccount,
  operation,
}: {
  connectedAccount: ConnectedAccountEmailFields;
  operation: EmailOperation;
}): boolean => {
  const { provider, connectionParameters, scopes } = connectedAccount;

  if (!getEmailProvidersForOperation(operation).includes(provider)) {
    return false;
  }

  if (provider === ConnectedAccountProvider.GOOGLE) {
    return hasScopeOrNoneRecorded(scopes, GMAIL_SEND_SCOPE);
  }

  if (provider === ConnectedAccountProvider.MICROSOFT) {
    return hasScopeOrNoneRecorded(scopes, MICROSOFT_SEND_SCOPE);
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
