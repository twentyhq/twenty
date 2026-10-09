import { CONNECTED_ACCOUNT_PERMISSION_SCOPES } from '@/constants';
import {
  type ConnectedAccountPermission,
  ConnectedAccountProvider,
} from '@/types';
import { assertUnreachable } from '@/utils/assertUnreachable';

export const getConnectedAccountPermissionScopes = ({
  permission,
  provider,
}: {
  permission: ConnectedAccountPermission;
  provider: ConnectedAccountProvider;
}): readonly string[] => {
  switch (provider) {
    case ConnectedAccountProvider.GOOGLE:
    case ConnectedAccountProvider.MICROSOFT:
      return CONNECTED_ACCOUNT_PERMISSION_SCOPES[permission][provider];
    case ConnectedAccountProvider.IMAP_SMTP_CALDAV:
    case ConnectedAccountProvider.EMAIL_GROUP:
    case ConnectedAccountProvider.APP:
    case ConnectedAccountProvider.OIDC:
    case ConnectedAccountProvider.SAML:
      return [];
    default:
      return assertUnreachable(
        provider,
        `Unhandled connected account provider for permission scopes: ${provider}`,
      );
  }
};
