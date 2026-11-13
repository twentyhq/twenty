import { isNonEmptyString } from '@sniptt/guards';

import { type ApplicationOAuthClient } from '@/application/applicationOAuthClientType';
import { isNonEmptyArray } from '@/utils/array/isNonEmptyArray';
import { getUrlSafely } from '@/utils/getUrlSafely';
import { isDefined } from '@/utils/validation/isDefined';

const getClientIdMetadataDocumentUrlErrors = (
  clientIdMetadataDocumentUrl: unknown,
): string[] => {
  if (!isNonEmptyString(clientIdMetadataDocumentUrl)) {
    return ['OAuth client metadata document URL must be a non-empty string'];
  }

  const url = getUrlSafely(clientIdMetadataDocumentUrl);

  if (!isDefined(url) || url.href !== clientIdMetadataDocumentUrl) {
    return [
      `OAuth client metadata document URL "${clientIdMetadataDocumentUrl}" must be a canonical URL`,
    ];
  }

  const errors: string[] = [];

  if (url.protocol !== 'https:') {
    errors.push(
      `OAuth client metadata document URL "${clientIdMetadataDocumentUrl}" must use https`,
    );
  }

  if (url.pathname === '/') {
    errors.push(
      `OAuth client metadata document URL "${clientIdMetadataDocumentUrl}" must have a path`,
    );
  }

  if (url.hash !== '' || url.username !== '' || url.password !== '') {
    errors.push(
      `OAuth client metadata document URL "${clientIdMetadataDocumentUrl}" must not have a fragment or credentials`,
    );
  }

  return errors;
};

export const validateApplicationOAuthClient = (
  oAuthClient: ApplicationOAuthClient,
): string[] => {
  const { clientIdMetadataDocumentUrls, connectUrl } = oAuthClient;

  const errors = isNonEmptyArray(clientIdMetadataDocumentUrls)
    ? clientIdMetadataDocumentUrls.flatMap(getClientIdMetadataDocumentUrlErrors)
    : ['OAuth client must declare at least one metadata document URL'];

  const connectUrlProtocol = isNonEmptyString(connectUrl)
    ? getUrlSafely(connectUrl)?.protocol
    : undefined;

  if (connectUrlProtocol !== 'https:') {
    errors.push('OAuth client must declare an https connect URL');
  }

  return errors;
};
