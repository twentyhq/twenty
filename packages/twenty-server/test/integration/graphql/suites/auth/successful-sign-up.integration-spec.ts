import { afterEach } from 'node:test';
import { AuthTokenPair } from 'src/engine/core-modules/auth/dto/auth-token-pair.dto';
import { deleteUser } from 'test/integration/graphql/utils/delete-user.util';
import { signUp } from 'test/integration/graphql/utils/sign-up.util';
import { isDefined } from 'twenty-shared/utils';

describe('Successful User Sign Up (integration)', () => {
  let createdUserAccessToken: AuthTokenPair | undefined;

  afterEach(async () => {
    if (!isDefined(createdUserAccessToken)) {
      return;
    }

    await deleteUser({
      accessToken: createdUserAccessToken.accessOrWorkspaceAgnosticToken.token,
      expectToFail: false,
    });
  });
  it('should sign up a new user successfully', async () => {
    const { data } = await signUp({
      input: {
        email: `test-${Date.now()}@example.com`,
        password: 'Test123!@#',
      },

      expectToFail: false,
    });
    createdUserAccessToken = data.signUp.tokens;

    expect(
      data.signUp.tokens.accessOrWorkspaceAgnosticToken.token,
    ).toBeDefined();
    expect(data.signUp.tokens.refreshToken.token).toBeDefined();
    expect(
      data.signUp.availableWorkspaces.availableWorkspacesForSignIn,
    ).toEqual([]);
    expect(
      data.signUp.availableWorkspaces.availableWorkspacesForSignUp,
    ).toEqual([]);
  });
});
