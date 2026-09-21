import {
  ConnectedAccountProvider,
  type ConnectedAccountOperationFields,
} from '@/types';
import { assertUnreachable } from '@/utils/assertUnreachable';
import { isDefined } from '@/utils/validation/isDefined';

export const canConnectedAccountDraftEmail = (
  connectedAccount: ConnectedAccountOperationFields,
): boolean => {
  switch (connectedAccount.provider) {
    case ConnectedAccountProvider.GOOGLE:
    case ConnectedAccountProvider.MICROSOFT:
      return true;
    case ConnectedAccountProvider.IMAP_SMTP_CALDAV:
      return isDefined(connectedAccount.connectionParameters?.IMAP);
    case ConnectedAccountProvider.EMAIL_GROUP:
    case ConnectedAccountProvider.OIDC:
    case ConnectedAccountProvider.SAML:
    case ConnectedAccountProvider.APP:
      return false;
    default:
      return assertUnreachable(
        connectedAccount.provider,
        `Unhandled connected account provider: ${connectedAccount.provider}`,
      );
  }
};
