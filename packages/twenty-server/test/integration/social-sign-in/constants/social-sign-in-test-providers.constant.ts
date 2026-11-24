import { googleIdentityHandlers } from 'test/integration/google/mocks/google-identity-handlers.util';
import { googleTokenHandlers } from 'test/integration/google/mocks/google-token-handlers.util';
import { microsoftAuthHandlers } from 'test/integration/microsoft/mocks/microsoft-auth-handlers.util';
import { type MswHandler } from 'test/integration/utils/http-mock.util';

type SocialSignInTestProvider = {
  provider: string;
  path: string;
  enabledConfigVariable: 'AUTH_GOOGLE_ENABLED' | 'AUTH_MICROSOFT_ENABLED';
  mockAccount: (email: string) => MswHandler[];
};

export const SOCIAL_SIGN_IN_TEST_PROVIDERS: SocialSignInTestProvider[] = [
  {
    provider: 'Google',
    path: '/auth/google',
    enabledConfigVariable: 'AUTH_GOOGLE_ENABLED',
    mockAccount: (email) => [
      ...googleTokenHandlers(),
      ...googleIdentityHandlers(email),
    ],
  },
  {
    provider: 'Microsoft',
    path: '/auth/microsoft',
    enabledConfigVariable: 'AUTH_MICROSOFT_ENABLED',
    mockAccount: (email) => microsoftAuthHandlers(email),
  },
];
