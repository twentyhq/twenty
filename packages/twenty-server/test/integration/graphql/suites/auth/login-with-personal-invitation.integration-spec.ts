import { createHash, randomUUID } from 'node:crypto';

import { sendInvitations } from 'test/integration/graphql/suites/user-session/utils/send-invitations.util';
import { buildAppleWorkspaceOrigin } from 'test/integration/graphql/utils/build-apple-workspace-origin.util';
import { deleteUser } from 'test/integration/graphql/utils/delete-user.util';
import { getAuthTokensFromLoginToken } from 'test/integration/graphql/utils/get-auth-tokens-from-login-token.util';
import { getLoginTokenFromCredentialsQueryFactory } from 'test/integration/graphql/utils/get-login-token-from-credentials.query-factory.util';
import {
  deleteWorkspaceInvitationsByEmail,
  findWorkspaceInvitationsByEmail,
} from 'test/integration/graphql/utils/seed-workspace-invitation.util';
import { signUp } from 'test/integration/graphql/utils/sign-up.util';
import { verifyEmailAndGetLoginTokenOperationFactory } from 'test/integration/graphql/utils/verify-email-and-get-login-token-operation-factory.util';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { updateConfigVariable } from 'test/integration/twenty-config/utils/update-config-variable.util';

import { AppTokenType } from 'src/engine/core-modules/app-token/app-token.entity';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const PASSWORD = 'Login-with-invitation-1';
const ONE_HOUR_IN_MS = 60 * 60 * 1000;

const signUpUser = async (email: string): Promise<string> => {
  const { data } = await signUp({
    input: { email, password: PASSWORD },
    expectToFail: false,
  });

  return data.signUp.tokens.accessOrWorkspaceAgnosticToken.token;
};

const loginOnAppleWorkspace = (email: string, password: string) =>
  makeMetadataApiRequest(
    getLoginTokenFromCredentialsQueryFactory({
      email,
      password,
      origin: buildAppleWorkspaceOrigin(),
    }),
    null,
  );

const seedEmailVerificationToken = async (email: string): Promise<string> => {
  const emailVerificationToken = randomUUID();

  await testDataSource.query(
    `INSERT INTO core."appToken" ("userId", "type", "value", "expiresAt", "context")
     SELECT id, $2, $3, $4, $5::jsonb FROM core."user" WHERE email = $1`,
    [
      email,
      AppTokenType.EmailVerificationToken,
      createHash('sha256').update(emailVerificationToken).digest('hex'),
      new Date(Date.now() + ONE_HOUR_IN_MS).toISOString(),
      JSON.stringify({ email }),
    ],
  );

  return emailVerificationToken;
};

const countAppleWorkspaceMemberships = async (email: string) => {
  const [{ count }] = await testDataSource.query(
    `SELECT count(*)::int AS count FROM core."userWorkspace" "userWorkspace"
     JOIN core."user" "user" ON "user".id = "userWorkspace"."userId"
     WHERE "user".email = $1 AND "userWorkspace"."workspaceId" = $2
     AND "userWorkspace"."deletedAt" IS NULL`,
    [email, SEED_APPLE_WORKSPACE_ID],
  );

  return count;
};

describe('getLoginTokenFromCredentials with a personal invitation (integration)', () => {
  let email: string;
  let userAccessToken: string;

  beforeEach(async () => {
    email = `invited-login-${randomUUID()}@example.com`;
    userAccessToken = await signUpUser(email);

    await sendInvitations({ input: { emails: [email] }, expectToFail: false });
  });

  afterEach(async () => {
    await deleteWorkspaceInvitationsByEmail({ email });
    await deleteUser({ accessToken: userAccessToken, expectToFail: false });
  });

  it('keeps the invitation and does not join the workspace on a wrong password', async () => {
    const response = await loginOnAppleWorkspace(email, 'wrong-password');

    expect(response.body.data?.getLoginTokenFromCredentials).toBeFalsy();
    expect(response.body.errors[0].message).toBe('Wrong password');
    expect(await findWorkspaceInvitationsByEmail({ email })).toHaveLength(1);
  });

  it('joins the workspace through the invitation on the right password', async () => {
    const response = await loginOnAppleWorkspace(email, PASSWORD);

    expect(response.body.errors).toBeUndefined();
    expect(await findWorkspaceInvitationsByEmail({ email })).toHaveLength(0);

    const { errors } = await getAuthTokensFromLoginToken({
      loginToken:
        response.body.data.getLoginTokenFromCredentials.loginToken.token,
      origin: buildAppleWorkspaceOrigin(),
      expectToFail: false,
    });

    expect(errors).toBeUndefined();
  });

  it('joins the workspace only once the email is verified when verification is required', async () => {
    await updateConfigVariable({
      input: { key: 'IS_EMAIL_VERIFICATION_REQUIRED', value: true },
    });

    try {
      const response = await loginOnAppleWorkspace(email, PASSWORD);

      expect(response.body.data?.getLoginTokenFromCredentials).toBeFalsy();
      expect(response.body.errors[0].extensions.subCode).toBe(
        'EMAIL_NOT_VERIFIED',
      );
      expect(await findWorkspaceInvitationsByEmail({ email })).toHaveLength(1);
      expect(await countAppleWorkspaceMemberships(email)).toBe(0);

      const verifyResponse = await makeMetadataApiRequest(
        verifyEmailAndGetLoginTokenOperationFactory({
          email,
          emailVerificationToken: await seedEmailVerificationToken(email),
          origin: buildAppleWorkspaceOrigin(),
        }),
        null,
      );

      expect(verifyResponse.body.errors).toBeUndefined();
      expect(await findWorkspaceInvitationsByEmail({ email })).toHaveLength(0);
      expect(await countAppleWorkspaceMemberships(email)).toBe(1);

      const { errors } = await getAuthTokensFromLoginToken({
        loginToken:
          verifyResponse.body.data.verifyEmailAndGetLoginToken.loginToken.token,
        origin: buildAppleWorkspaceOrigin(),
        expectToFail: false,
      });

      expect(errors).toBeUndefined();
    } finally {
      await updateConfigVariable({
        input: { key: 'IS_EMAIL_VERIFICATION_REQUIRED', value: false },
      });
    }
  });
});

describe('getLoginTokenFromCredentials without access to the workspace (integration)', () => {
  let email: string;
  let userAccessToken: string;

  beforeAll(async () => {
    email = `outsider-login-${randomUUID()}@example.com`;
    userAccessToken = await signUpUser(email);
  });

  afterAll(async () => {
    await deleteUser({ accessToken: userAccessToken, expectToFail: false });
  });

  it.each([PASSWORD, 'wrong-password'])(
    'rejects as not a member whatever the password (%s)',
    async (password) => {
      const response = await loginOnAppleWorkspace(email, password);

      expect(response.body.data?.getLoginTokenFromCredentials).toBeFalsy();
      expect(response.body.errors[0].message).toBe(
        'User is not a member of the workspace.',
      );
    },
  );
});
