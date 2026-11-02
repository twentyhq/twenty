import { isNonEmptyString } from '@sniptt/guards';

import { type ApplicationOAuthIdentity } from '@/application/applicationOAuthIdentityType';
import { OAUTH_IDENTITY_REDIRECT_URI_WILDCARD_SEGMENT } from '@/application/constants/OAuthIdentityRedirectUriWildcardSegment';
import { getUrlSafely } from '@/utils/getUrlSafely';
import { isNonEmptyArray } from '@/utils/array/isNonEmptyArray';

const getRedirectUriErrors = (redirectUri: string): string[] => {
  const redirectUrl = getUrlSafely(redirectUri);

  if (redirectUrl === null || redirectUrl.href !== redirectUri) {
    return [`OAuth identity redirect URI "${redirectUri}" must be a canonical URL`];
  }

  const errors: string[] = [];

  if (redirectUrl.protocol !== 'https:') {
    errors.push(`OAuth identity redirect URI "${redirectUri}" must use https`);
  }

  if (redirectUrl.hash !== '') {
    errors.push(
      `OAuth identity redirect URI "${redirectUri}" must not have a fragment`,
    );
  }

  const hasWildcardOutsidePath = `${redirectUrl.host}${redirectUrl.search}`.includes(
    OAUTH_IDENTITY_REDIRECT_URI_WILDCARD_SEGMENT,
  );
  const hasPartialWildcardSegment = redirectUrl.pathname
    .split('/')
    .some(
      (segment) =>
        segment !== OAUTH_IDENTITY_REDIRECT_URI_WILDCARD_SEGMENT &&
        segment.includes(OAUTH_IDENTITY_REDIRECT_URI_WILDCARD_SEGMENT),
    );

  if (hasWildcardOutsidePath || hasPartialWildcardSegment) {
    errors.push(
      `OAuth identity redirect URI "${redirectUri}" may only use "${OAUTH_IDENTITY_REDIRECT_URI_WILDCARD_SEGMENT}" as a whole path segment`,
    );
  }

  return errors;
};

export const validateApplicationOAuthIdentity = (
  oAuthIdentity: ApplicationOAuthIdentity,
): string[] => {
  if (!isNonEmptyArray(oAuthIdentity.redirectUris)) {
    return ['OAuth identity must declare at least one redirect URI'];
  }

  const errors = oAuthIdentity.redirectUris.flatMap(getRedirectUriErrors);

  const redirectUriHostnames = new Set(
    oAuthIdentity.redirectUris.map(
      (redirectUri) => getUrlSafely(redirectUri)?.hostname,
    ),
  );

  // A metadata document host that receives no codes could otherwise vouch for a client it does not run
  for (const hostname of oAuthIdentity.clientIdMetadataDocumentHostnames ??
    []) {
    if (!redirectUriHostnames.has(hostname)) {
      errors.push(
        `OAuth identity metadata document hostname "${hostname}" must be the host of one of its redirect URIs`,
      );
    }
  }

  if (
    !isNonEmptyString(oAuthIdentity.connectUrl) ||
    getUrlSafely(oAuthIdentity.connectUrl) === null
  ) {
    errors.push('OAuth identity must declare a valid connect URL');
  }

  return errors;
};
