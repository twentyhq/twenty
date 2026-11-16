import { createTestOidcIdentityProvider } from 'test/integration/sso/utils/create-test-oidc-identity-provider.util';
import { createTestSamlIdentityProvider } from 'test/integration/sso/utils/create-test-saml-identity-provider.util';
import { signInWithOidc } from 'test/integration/sso/utils/sign-in-with-oidc.util';
import { signInWithSaml } from 'test/integration/sso/utils/sign-in-with-saml.util';
import { ConnectedAccountProvider } from 'twenty-shared/types';

export const SSO_TEST_PROTOCOLS = [
  {
    protocol: 'OIDC',
    connectedAccountProvider: ConnectedAccountProvider.OIDC,
    createTestIdentityProvider: createTestOidcIdentityProvider,
    signIn: signInWithOidc,
  },
  {
    protocol: 'SAML',
    connectedAccountProvider: ConnectedAccountProvider.SAML,
    createTestIdentityProvider: createTestSamlIdentityProvider,
    signIn: signInWithSaml,
  },
] as const;
