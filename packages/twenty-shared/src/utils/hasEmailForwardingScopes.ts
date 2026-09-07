import { GOOGLE_EMAIL_FORWARDING_OAUTH_SCOPES } from '@/constants/GoogleEmailForwardingOauthScopes';
import { MICROSOFT_EMAIL_FORWARDING_OAUTH_SCOPES } from '@/constants/MicrosoftEmailForwardingOauthScopes';
import { ConnectedAccountProvider } from '@/types/ConnectedAccountProvider';

export const hasEmailForwardingScopes = ({
  provider,
  scopes,
}: {
  provider: string;
  scopes: string[] | null | undefined;
}): boolean => {
  const grantedScopes = scopes ?? [];

  switch (provider) {
    case ConnectedAccountProvider.GOOGLE:
      return GOOGLE_EMAIL_FORWARDING_OAUTH_SCOPES.every((scope) =>
        grantedScopes.includes(scope),
      );
    case ConnectedAccountProvider.MICROSOFT:
      return MICROSOFT_EMAIL_FORWARDING_OAUTH_SCOPES.every((scope) =>
        grantedScopes.includes(scope),
      );
    default:
      return false;
  }
};
