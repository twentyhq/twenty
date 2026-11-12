import { expectOneNotInternalServerErrorSnapshot } from 'test/integration/graphql/utils/expect-one-not-internal-server-error-snapshot.util';
import { findCurrentWorkspaceInviteHash } from 'test/integration/graphql/utils/find-current-workspace-invite-hash.util';
import { SAML_IDENTITY_PROVIDER_CERTIFICATE } from 'test/integration/metadata/suites/sso-identity-provider/constants/saml-identity-provider-certificate.constant';
import { createOneSamlIdentityProvider } from 'test/integration/metadata/suites/sso-identity-provider/utils/create-one-saml-identity-provider.util';
import { deleteOneSsoIdentityProvider } from 'test/integration/metadata/suites/sso-identity-provider/utils/delete-one-sso-identity-provider.util';
import { updateOneSsoIdentityProvider } from 'test/integration/metadata/suites/sso-identity-provider/utils/update-one-sso-identity-provider.util';
import { authorizeWithPassword } from 'test/integration/sso/utils/authorize-with-password.util';
import { completeOidcLogin } from 'test/integration/sso/utils/complete-oidc-login.util';
import { completeSamlLogin } from 'test/integration/sso/utils/complete-saml-login.util';
import { createTestOidcIdentityProvider } from 'test/integration/sso/utils/create-test-oidc-identity-provider.util';
import { createTestSamlIdentityProvider } from 'test/integration/sso/utils/create-test-saml-identity-provider.util';
import { deleteSsoConnectedAccounts } from 'test/integration/sso/utils/delete-sso-connected-accounts.util';
import { expectSsoErrorRedirect } from 'test/integration/sso/utils/expect-sso-error-redirect.util';
import { getAuthorizationUrlForSso } from 'test/integration/sso/utils/get-authorization-url-for-sso.util';
import { getSsoTestIdentityProvider } from 'test/integration/sso/utils/get-sso-test-identity-provider.util';
import { getYcombinatorAdminAccessToken } from 'test/integration/sso/utils/get-ycombinator-admin-access-token.util';
import { replayOnTestApp } from 'test/integration/sso/utils/replay-on-test-app.util';
import { requestSamlResponseWithPassword } from 'test/integration/sso/utils/request-saml-response-with-password.util';
import { signInWithOidc } from 'test/integration/sso/utils/sign-in-with-oidc.util';
import { signInWithSaml } from 'test/integration/sso/utils/sign-in-with-saml.util';
import { startOidcLogin } from 'test/integration/sso/utils/start-oidc-login.util';
import { startSamlLogin } from 'test/integration/sso/utils/start-saml-login.util';
import { assertIsDefinedOrThrow } from 'twenty-shared/utils';
import { v4 as uuidv4 } from 'uuid';

import { SsoIdentityProviderStatus } from 'src/engine/core-modules/sso/workspace-sso-identity-provider.entity';

const APPLE_SUBDOMAIN = 'apple';
const YCOMBINATOR_SUBDOMAIN = 'yc';
const DEFAULT_SUBDOMAIN = 'app';

// The OIDC strategy keys the login session by identity provider id
const buildMissingLoginSessionErrorMessage = (identityProviderId: string) =>
  `Authentication error: did not find expected authorization request details in session, req.session["${identityProviderId}"] is undefined`;

const replayRedirect = async (url: URL) => {
  const response = await replayOnTestApp(url);

  expect(response.status).toBe(302);

  return new URL(response.headers.location);
};

describe('SSO login should fail', () => {
  const testIdentityProvider = getSsoTestIdentityProvider();
  const createdIdentityProviders: {
    identityProviderId: string;
    token?: string;
  }[] = [];
  let ycombinatorAdminAccessToken: string;

  const createOidcIdentityProvider = async ({
    token,
    clientSecret,
  }: { token?: string; clientSecret?: string } = {}) => {
    const identityProviderId = await createTestOidcIdentityProvider({
      token,
      clientSecret,
    });

    createdIdentityProviders.push({ identityProviderId, token });

    return identityProviderId;
  };

  const createSamlIdentityProvider = async ({
    token,
    id,
    certificate,
  }: { token?: string; id?: string; certificate?: string } = {}) => {
    const identityProviderId = await createTestSamlIdentityProvider({
      token,
      id,
      certificate,
    });

    createdIdentityProviders.push({ identityProviderId, token });

    return identityProviderId;
  };

  const signInAsPhil = ({
    signIn,
    identityProviderId,
    workspaceInviteHash,
  }: {
    signIn: typeof signInWithOidc;
    identityProviderId: string;
    workspaceInviteHash?: string;
  }) =>
    signIn({
      identityProviderId,
      workspaceInviteHash,
      username: testIdentityProvider.member.username,
      password: testIdentityProvider.member.password,
    });

  const authorizeAsPhil = async (identityProviderId: string) => {
    const { data } = await getAuthorizationUrlForSso({
      input: { identityProviderId },
    });

    const { authorizationUrl, sessionCookie } = await startOidcLogin(
      new URL(data.getAuthorizationUrlForSSO.authorizationURL),
    );

    const callbackUrl = await authorizeWithPassword({
      authorizationUrl,
      username: testIdentityProvider.member.username,
      password: testIdentityProvider.member.password,
    });

    return { callbackUrl, sessionCookie };
  };

  const requestSamlResponseAsPhil = async (identityProviderId: string) => {
    const { data } = await getAuthorizationUrlForSso({
      input: { identityProviderId },
    });

    return requestSamlResponseWithPassword({
      samlRequestUrl: await startSamlLogin(
        new URL(data.getAuthorizationUrlForSSO.authorizationURL),
      ),
      username: testIdentityProvider.member.username,
      password: testIdentityProvider.member.password,
    });
  };

  beforeAll(async () => {
    ycombinatorAdminAccessToken = await getYcombinatorAdminAccessToken();
  });

  afterEach(async () => {
    for (const { identityProviderId, token } of createdIdentityProviders.splice(
      0,
    )) {
      await deleteOneSsoIdentityProvider({
        identityProviderId,
        token,
        expectToFail: false,
      });
    }

    // A case that wrongly let Phil in would leave an SSO connected account behind
    await deleteSsoConnectedAccounts({ token: APPLE_PHIL_GUEST_ACCESS_TOKEN });
  });

  describe('OIDC', () => {
    it('when the login page asks for an unknown identity provider', async () => {
      const { errors } = await getAuthorizationUrlForSso({
        input: { identityProviderId: uuidv4() },
        expectToFail: true,
      });

      expectOneNotInternalServerErrorSnapshot({ errors });
    });

    it('when the login route targets an unknown identity provider', async () => {
      const redirectUrl = await replayRedirect(
        new URL(`http://localhost/auth/oidc/login/${uuidv4()}`),
      );

      expectSsoErrorRedirect({
        redirectUrl,
        workspaceSubdomain: DEFAULT_SUBDOMAIN,
        errorMessage: 'Identity provider not found',
      });
    });

    it('when the login route targets a SAML identity provider', async () => {
      const samlIdentityProviderId = uuidv4();

      await createOneSamlIdentityProvider({
        expectToFail: false,
        input: {
          id: samlIdentityProviderId,
          name: 'SAML identity provider',
          issuer: testIdentityProvider.oidc.issuer,
          ssoURL: `${testIdentityProvider.oidc.issuer}/sso`,
          certificate: SAML_IDENTITY_PROVIDER_CERTIFICATE,
        },
      });

      createdIdentityProviders.push({
        identityProviderId: samlIdentityProviderId,
      });

      const redirectUrl = await replayRedirect(
        new URL(`http://localhost/auth/oidc/login/${samlIdentityProviderId}`),
      );

      expectSsoErrorRedirect({
        redirectUrl,
        workspaceSubdomain: APPLE_SUBDOMAIN,
        errorMessage: 'Authentication error: Invalid Identity Provider type',
      });
    });

    it('when the identity provider is inactive', async () => {
      const identityProviderId = await createOidcIdentityProvider();

      await updateOneSsoIdentityProvider({
        expectToFail: false,
        input: {
          id: identityProviderId,
          status: SsoIdentityProviderStatus.Inactive,
        },
      });

      expectSsoErrorRedirect({
        redirectUrl: await signInAsPhil({
          signIn: signInWithOidc,
          identityProviderId,
        }),
        workspaceSubdomain: APPLE_SUBDOMAIN,
        errorMessage: 'Identity provider not found',
      });
    });

    it('when the invite hash belongs to another workspace', async () => {
      const identityProviderId = await createOidcIdentityProvider();

      const { data } = await findCurrentWorkspaceInviteHash({
        token: ycombinatorAdminAccessToken,
      });
      const otherWorkspaceInviteHash = data.currentWorkspace.inviteHash;

      assertIsDefinedOrThrow(otherWorkspaceInviteHash);

      expectSsoErrorRedirect({
        redirectUrl: await signInAsPhil({
          signIn: signInWithOidc,
          identityProviderId,
          workspaceInviteHash: otherWorkspaceInviteHash,
        }),
        workspaceSubdomain: APPLE_SUBDOMAIN,
        errorMessage: 'Identity provider does not belong to this workspace',
      });
    });

    it('when the invite hash is unknown', async () => {
      const identityProviderId = await createOidcIdentityProvider();

      expectSsoErrorRedirect({
        redirectUrl: await signInAsPhil({
          signIn: signInWithOidc,
          identityProviderId,
          workspaceInviteHash: uuidv4(),
        }),
        workspaceSubdomain: APPLE_SUBDOMAIN,
        errorMessage: 'Workspace not found',
      });
    });

    it('when the user is not a member of the identity provider workspace', async () => {
      const identityProviderId = await createOidcIdentityProvider({
        token: ycombinatorAdminAccessToken,
      });

      expectSsoErrorRedirect({
        redirectUrl: await signInWithOidc({
          identityProviderId,
          username: testIdentityProvider.nonMember.username,
          password: testIdentityProvider.nonMember.password,
        }),
        workspaceSubdomain: YCOMBINATOR_SUBDOMAIN,
        errorMessage: 'User does not have access to this workspace',
      });
    });

    it('when the client secret is wrong', async () => {
      const identityProviderId = await createOidcIdentityProvider({
        clientSecret: 'wrong-client-secret',
      });

      expectSsoErrorRedirect({
        redirectUrl: await signInAsPhil({
          signIn: signInWithOidc,
          identityProviderId,
        }),
        workspaceSubdomain: APPLE_SUBDOMAIN,
        errorMessage: /^Authentication error: invalid_client/,
      });
    });

    it('when the callback comes without the login session', async () => {
      const identityProviderId = await createOidcIdentityProvider();

      const { callbackUrl } = await authorizeAsPhil(identityProviderId);

      expectSsoErrorRedirect({
        redirectUrl: await completeOidcLogin({
          callbackUrl,
          sessionCookie: '',
        }),
        workspaceSubdomain: APPLE_SUBDOMAIN,
        errorMessage: buildMissingLoginSessionErrorMessage(identityProviderId),
      });
    });

    it('when the callback state names another identity provider', async () => {
      const identityProviderId = await createOidcIdentityProvider();
      const otherIdentityProviderId = await createOidcIdentityProvider();

      const { callbackUrl, sessionCookie } =
        await authorizeAsPhil(identityProviderId);

      callbackUrl.searchParams.set(
        'state',
        JSON.stringify({ identityProviderId: otherIdentityProviderId }),
      );

      expectSsoErrorRedirect({
        redirectUrl: await completeOidcLogin({ callbackUrl, sessionCookie }),
        workspaceSubdomain: APPLE_SUBDOMAIN,
        errorMessage: buildMissingLoginSessionErrorMessage(
          otherIdentityProviderId,
        ),
      });
    });

    it('when the callback state is altered', async () => {
      const identityProviderId = await createOidcIdentityProvider();

      const { callbackUrl, sessionCookie } =
        await authorizeAsPhil(identityProviderId);

      callbackUrl.searchParams.set(
        'state',
        JSON.stringify({ identityProviderId, workspaceInviteHash: uuidv4() }),
      );

      expectSsoErrorRedirect({
        redirectUrl: await completeOidcLogin({ callbackUrl, sessionCookie }),
        workspaceSubdomain: APPLE_SUBDOMAIN,
        // openid-client fails a state mismatch without passing its message on
        errorMessage: 'Authentication error: Unauthorized',
      });
    });

    it('when the callback code comes from another login', async () => {
      const identityProviderId = await createOidcIdentityProvider();

      const { callbackUrl } = await authorizeAsPhil(identityProviderId);
      const { sessionCookie: otherLoginSessionCookie } =
        await authorizeAsPhil(identityProviderId);

      expectSsoErrorRedirect({
        redirectUrl: await completeOidcLogin({
          callbackUrl,
          sessionCookie: otherLoginSessionCookie,
        }),
        workspaceSubdomain: APPLE_SUBDOMAIN,
        errorMessage:
          'Authentication error: invalid_grant (PKCE verification failed.)',
      });
    });

    it('when the callback has no state', async () => {
      const redirectUrl = await replayRedirect(
        new URL('http://localhost/auth/oidc/callback?code=code'),
      );

      expectSsoErrorRedirect({
        redirectUrl,
        workspaceSubdomain: DEFAULT_SUBDOMAIN,
        errorMessage:
          'Authentication error: Invalid OIDC identity provider params',
      });
    });
  });

  describe('SAML', () => {
    it('when the login route targets an unknown identity provider', async () => {
      const redirectUrl = await replayRedirect(
        new URL(`http://localhost/auth/saml/login/${uuidv4()}`),
      );

      expectSsoErrorRedirect({
        redirectUrl,
        workspaceSubdomain: DEFAULT_SUBDOMAIN,
        errorMessage: 'Identity provider not found',
      });
    });

    it('when the login route targets an OIDC identity provider', async () => {
      const oidcIdentityProviderId = await createOidcIdentityProvider();

      const redirectUrl = await replayRedirect(
        new URL(`http://localhost/auth/saml/login/${oidcIdentityProviderId}`),
      );

      expectSsoErrorRedirect({
        redirectUrl,
        workspaceSubdomain: APPLE_SUBDOMAIN,
        errorMessage: 'Authentication error: Invalid SAML identity provider',
      });
    });

    it('when the identity provider is inactive', async () => {
      const identityProviderId = await createSamlIdentityProvider();

      await updateOneSsoIdentityProvider({
        expectToFail: false,
        input: {
          id: identityProviderId,
          status: SsoIdentityProviderStatus.Inactive,
        },
      });

      expectSsoErrorRedirect({
        redirectUrl: await signInAsPhil({
          signIn: signInWithSaml,
          identityProviderId,
        }),
        workspaceSubdomain: APPLE_SUBDOMAIN,
        errorMessage: 'Identity provider not found',
      });
    });

    it('when the invite hash belongs to another workspace', async () => {
      const identityProviderId = await createSamlIdentityProvider();

      const { data } = await findCurrentWorkspaceInviteHash({
        token: ycombinatorAdminAccessToken,
      });
      const otherWorkspaceInviteHash = data.currentWorkspace.inviteHash;

      assertIsDefinedOrThrow(otherWorkspaceInviteHash);

      expectSsoErrorRedirect({
        redirectUrl: await signInAsPhil({
          signIn: signInWithSaml,
          identityProviderId,
          workspaceInviteHash: otherWorkspaceInviteHash,
        }),
        workspaceSubdomain: APPLE_SUBDOMAIN,
        errorMessage: 'Identity provider does not belong to this workspace',
      });
    });

    it('when the invite hash is unknown', async () => {
      const identityProviderId = await createSamlIdentityProvider();

      expectSsoErrorRedirect({
        redirectUrl: await signInAsPhil({
          signIn: signInWithSaml,
          identityProviderId,
          workspaceInviteHash: uuidv4(),
        }),
        workspaceSubdomain: APPLE_SUBDOMAIN,
        errorMessage: 'Workspace not found',
      });
    });

    it('when the user is not a member of the identity provider workspace', async () => {
      const identityProviderId = await createSamlIdentityProvider({
        token: ycombinatorAdminAccessToken,
      });

      expectSsoErrorRedirect({
        redirectUrl: await signInWithSaml({
          identityProviderId,
          username: testIdentityProvider.nonMember.username,
          password: testIdentityProvider.nonMember.password,
        }),
        workspaceSubdomain: YCOMBINATOR_SUBDOMAIN,
        errorMessage: 'User does not have access to this workspace',
      });
    });

    it('when the certificate is not the identity provider one', async () => {
      const identityProviderId = await createSamlIdentityProvider({
        certificate: SAML_IDENTITY_PROVIDER_CERTIFICATE,
      });

      expectSsoErrorRedirect({
        redirectUrl: await signInAsPhil({
          signIn: signInWithSaml,
          identityProviderId,
        }),
        workspaceSubdomain: APPLE_SUBDOMAIN,
        errorMessage: 'Authentication error: Invalid signature',
      });
    });

    it('when the response is posted to another identity provider callback', async () => {
      const identityProviderId = await createSamlIdentityProvider();
      const otherIdentityProviderId = await createSamlIdentityProvider({
        id: uuidv4(),
      });

      const samlResponse = await requestSamlResponseAsPhil(identityProviderId);

      samlResponse.callbackUrl.pathname = `/auth/saml/callback/${otherIdentityProviderId}`;

      expectSsoErrorRedirect({
        redirectUrl: await completeSamlLogin(samlResponse),
        workspaceSubdomain: APPLE_SUBDOMAIN,
        errorMessage: /^Authentication error: SAML assertion audience mismatch/,
      });
    });

    it('when the response is replayed', async () => {
      const identityProviderId = await createSamlIdentityProvider();

      const samlResponse = await requestSamlResponseAsPhil(identityProviderId);

      const firstRedirectUrl = await completeSamlLogin(samlResponse);

      expect(firstRedirectUrl.searchParams.get('loginToken')).toEqual(
        expect.any(String),
      );

      expectSsoErrorRedirect({
        redirectUrl: await completeSamlLogin(samlResponse),
        workspaceSubdomain: APPLE_SUBDOMAIN,
        errorMessage: 'SAML assertion has already been used',
      });
    });

    it('when the callback targets an unknown identity provider', async () => {
      expectSsoErrorRedirect({
        redirectUrl: await completeSamlLogin({
          callbackUrl: new URL(
            `http://localhost/auth/saml/callback/${uuidv4()}`,
          ),
          samlResponse: 'response',
        }),
        workspaceSubdomain: DEFAULT_SUBDOMAIN,
        errorMessage: 'Identity provider not found',
      });
    });
  });
});
