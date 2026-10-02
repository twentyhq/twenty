import { randomUUID } from 'node:crypto';

import { authenticator } from 'otplib';
import request from 'supertest';
import { buildAppleWorkspaceOrigin } from 'test/integration/graphql/utils/build-apple-workspace-origin.util';
import { initiateOtpProvisioningForAuthenticatedUser } from 'test/integration/graphql/utils/initiate-otp-provisioning-for-authenticated-user.util';
import { verifyTwoFactorAuthenticationMethod } from 'test/integration/graphql/utils/verify-two-factor-authentication-method.util';

import { type CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { USER_WORKSPACE_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-user-workspaces.util';

const SERVER_URL = `http://localhost:${APP_PORT}`;
const SEEDED_PASSWORD = 'tim@apple.dev';
const PASSWORD_MAX_FAILURES_PER_EMAIL = 10;
const OTP_MAX_FAILURES_PER_USER = 5;
const PARALLEL_ATTEMPTS = 20;

type GraphqlResponseBody<TData = unknown> = {
  data?: TData | null;
  errors?: { message: string }[];
};

const postMetadata = async <TData = unknown>({
  query,
  variables,
}: {
  query: string;
  variables: Record<string, unknown>;
}): Promise<GraphqlResponseBody<TData>> => {
  const response = await request(SERVER_URL)
    .post('/metadata')
    .set('Origin', buildAppleWorkspaceOrigin())
    .send({ query, variables });

  return response.body;
};

const signIn = (email: string, password: string) =>
  postMetadata({
    query: `
      mutation SignIn($email: String!, $password: String!) {
        signIn(email: $email, password: $password) {
          availableWorkspaces {
            availableWorkspacesForSignIn {
              id
            }
          }
        }
      }
    `,
    variables: { email, password },
  });

const getLoginTokenFromCredentials = (email: string) =>
  postMetadata<{
    getLoginTokenFromCredentials: { loginToken: { token: string } };
  }>({
    query: `
      mutation GetLoginTokenFromCredentials(
        $email: String!
        $password: String!
        $origin: String!
      ) {
        getLoginTokenFromCredentials(
          email: $email
          password: $password
          origin: $origin
        ) {
          loginToken {
            token
          }
        }
      }
    `,
    variables: {
      email,
      password: SEEDED_PASSWORD,
      origin: buildAppleWorkspaceOrigin(),
    },
  });

const getAuthTokensFromOtp = (otp: string, loginToken: string) =>
  postMetadata({
    query: `
      mutation GetAuthTokensFromOTP(
        $otp: String!
        $loginToken: String!
        $origin: String!
      ) {
        getAuthTokensFromOTP(
          otp: $otp
          loginToken: $loginToken
          origin: $origin
        ) {
          tokens {
            accessOrWorkspaceAgnosticToken {
              token
            }
          }
        }
      }
    `,
    variables: { otp, loginToken, origin: buildAppleWorkspaceOrigin() },
  });

const isThrottled = (body: GraphqlResponseBody) =>
  body.errors?.some(({ message }) => message.startsWith('Limit reached')) ??
  false;

const deleteJonyTwoFactorAuthenticationMethods = async (): Promise<void> => {
  await global.testDataSource.query(
    `DELETE FROM core."twoFactorAuthenticationMethod" WHERE "userWorkspaceId" = $1`,
    [USER_WORKSPACE_DATA_SEED_IDS.JONY],
  );
};

describe('Sign-in failure throttling (integration)', () => {
  afterAll(async () => {
    await deleteJonyTwoFactorAuthenticationMethods();

    await global.app
      .get<CacheStorageService>(CacheStorageNamespace.EngineWorkspace)
      .flushByPattern('sign-in-*');
  });

  it('should evaluate at most the allowed number of parallel wrong passwords for one email', async () => {
    const email = `throttled-${randomUUID()}@apple.dev`;

    const responses = await Promise.all(
      Array.from({ length: PARALLEL_ATTEMPTS }, () =>
        signIn(email, 'wrong-password'),
      ),
    );

    const throttledCount = responses.filter(isThrottled).length;

    expect(PARALLEL_ATTEMPTS - throttledCount).toBe(
      PASSWORD_MAX_FAILURES_PER_EMAIL,
    );
    expect(responses.every((body) => body.errors !== undefined)).toBe(true);
  });

  it('should never throttle successful sign-ins', async () => {
    for (
      let attempt = 0;
      attempt <= PASSWORD_MAX_FAILURES_PER_EMAIL;
      attempt++
    ) {
      const body = await getLoginTokenFromCredentials('tim@apple.dev');

      expect(body.errors).toBeUndefined();
    }
  });

  it('should evaluate at most the allowed number of parallel wrong OTP codes for one user', async () => {
    await deleteJonyTwoFactorAuthenticationMethods();

    const { data } = await initiateOtpProvisioningForAuthenticatedUser({
      accessToken: APPLE_JONY_MEMBER_ACCESS_TOKEN,
      expectToFail: false,
    });

    const secret =
      data.initiateOTPProvisioningForAuthenticatedUser.uri.match(
        /[?&]secret=([^&]+)/,
      )?.[1] ?? '';

    await verifyTwoFactorAuthenticationMethod({
      otp: authenticator.generate(secret),
      accessToken: APPLE_JONY_MEMBER_ACCESS_TOKEN,
      expectToFail: false,
    });

    const loginResponse =
      await getLoginTokenFromCredentials('jony.ive@apple.dev');
    const loginToken =
      loginResponse.data?.getLoginTokenFromCredentials.loginToken.token ?? '';

    const currentOtp = authenticator.generate(secret);
    const wrongOtp = currentOtp === '000000' ? '111111' : '000000';

    const responses = await Promise.all(
      Array.from({ length: PARALLEL_ATTEMPTS }, () =>
        getAuthTokensFromOtp(wrongOtp, loginToken),
      ),
    );

    const throttledCount = responses.filter(isThrottled).length;

    expect(PARALLEL_ATTEMPTS - throttledCount).toBe(OTP_MAX_FAILURES_PER_USER);

    const correctCodeAfterLimit = await getAuthTokensFromOtp(
      authenticator.generate(secret),
      loginToken,
    );

    expect(isThrottled(correctCodeAfterLimit)).toBe(true);
  });
});
