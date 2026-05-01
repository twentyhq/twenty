import { OAUTH_ENV_VAR_PREFIX } from '@/application/constants/OAuthEnvVarPrefix';

const sanitizeOAuthProviderName = (name: string): string =>
  name.toUpperCase().replace(/[^A-Z0-9]/g, '_');

export const buildOAuthEnvVarPrefix = (providerName: string): string =>
  `${OAUTH_ENV_VAR_PREFIX}${sanitizeOAuthProviderName(providerName)}_`;
