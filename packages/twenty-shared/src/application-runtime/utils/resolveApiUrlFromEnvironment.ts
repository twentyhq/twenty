import { isNonEmptyString } from '@sniptt/guards';

import { DEFAULT_API_URL_NAME } from '@/application-runtime/constants/DefaultApiUrlName';
import { DEFAULT_INTERNAL_API_URL_NAME } from '@/application-runtime/constants/DefaultInternalApiUrlName';

// For requests to Twenty only: URLs handed to browsers or third parties must keep using the public TWENTY_API_URL.
export const resolveApiUrlFromEnvironment = (
  environment: Record<string, string | undefined>,
): string | undefined => {
  const internalApiUrl = environment[DEFAULT_INTERNAL_API_URL_NAME];

  return isNonEmptyString(internalApiUrl)
    ? internalApiUrl
    : environment[DEFAULT_API_URL_NAME];
};
