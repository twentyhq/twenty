import { randomUUID } from 'node:crypto';

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
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { updateConfigVariable } from 'test/integration/twenty-config/utils/update-config-variable.util';

const PASSWORD = 'Login-with-invitation-1';

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

  it('joins the workspace on the right password even when the email still needs verification', async () => {
    await updateConfigVariable({
      input: { key: 'IS_EMAIL_VERIFICATION_REQUIRED', value: true },
    });

    try {
      const response = await loginOnAppleWorkspace(email, PASSWORD);

      expect(response.body.data?.getLoginTokenFromCredentials).toBeFalsy();
      expect(response.body.errors[0].extensions.subCode).toBe(
        'EMAIL_NOT_VERIFIED',
      );
      expect(await findWorkspaceInvitationsByEmail({ email })).toHaveLength(0);
    } finally {
      await updateConfigVariable({
        input: { key: 'IS_EMAIL_VERIFICATION_REQUIRED', value: false },
      });
    }

    const response = await loginOnAppleWorkspace(email, PASSWORD);

    expect(response.body.errors).toBeUndefined();
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
