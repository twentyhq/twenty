import { type ApplicationOAuthIdentity } from '@/application/applicationOAuthIdentityType';
import { OAUTH_IDENTITY_REDIRECT_URI_WILDCARD_SEGMENT } from '@/application/constants/OAuthIdentityRedirectUriWildcardSegment';
import { getUrlSafely } from '@/utils/getUrlSafely';

const WILDCARD_SEGMENT_VALUE_PATTERN = /^[A-Za-z0-9_-]+$/;

const matchesRedirectUri = ({
  allowedRedirectUri,
  redirectUri,
}: {
  allowedRedirectUri: string;
  redirectUri: string;
}): boolean => {
  if (!allowedRedirectUri.includes(OAUTH_IDENTITY_REDIRECT_URI_WILDCARD_SEGMENT)) {
    return allowedRedirectUri === redirectUri;
  }

  const allowedUrl = getUrlSafely(allowedRedirectUri);
  const redirectUrl = getUrlSafely(redirectUri);

  // Only the canonical form, so dot segments or credentials cannot slip past the comparison
  if (
    allowedUrl === null ||
    redirectUrl === null ||
    redirectUrl.href !== redirectUri ||
    redirectUrl.username !== '' ||
    redirectUrl.password !== '' ||
    redirectUrl.search !== '' ||
    redirectUrl.hash !== '' ||
    redirectUrl.origin !== allowedUrl.origin
  ) {
    return false;
  }

  const allowedSegments = allowedUrl.pathname.split('/');
  const redirectSegments = redirectUrl.pathname.split('/');

  return (
    allowedSegments.length === redirectSegments.length &&
    allowedSegments.every((allowedSegment, index) => {
      const redirectSegment = redirectSegments[index] ?? '';

      return allowedSegment === OAUTH_IDENTITY_REDIRECT_URI_WILDCARD_SEGMENT
        ? WILDCARD_SEGMENT_VALUE_PATTERN.test(redirectSegment)
        : allowedSegment === redirectSegment;
    })
  );
};

export const isRedirectUriAllowedByOAuthIdentity = ({
  oAuthIdentity,
  redirectUri,
}: {
  oAuthIdentity: Pick<ApplicationOAuthIdentity, 'redirectUris'>;
  redirectUri: string;
}): boolean =>
  oAuthIdentity.redirectUris.some((allowedRedirectUri) =>
    matchesRedirectUri({ allowedRedirectUri, redirectUri }),
  );
