import { afterEach } from 'node:test';
import { AuthTokenPair } from 'src/engine/core-modules/auth/dto/auth-token-pair.dto';
import { SignUpInput } from 'src/engine/core-modules/auth/dto/sign-up.input';
import { getCurrentUser } from 'test/integration/graphql/utils/current-user.util';
import { deleteUser } from 'test/integration/graphql/utils/delete-user.util';
import { expectOneNotInternalServerErrorSnapshot } from 'test/integration/graphql/utils/expect-one-not-internal-server-error-snapshot.util';
import { signUp } from 'test/integration/graphql/utils/sign-up.util';
import { extractRecordIdsAndDatesAsExpectAny } from 'test/utils/extract-record-ids-and-dates-as-expect-any';
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
  it('should sign up delete and signup a new user successfully', async () => {
    const input: SignUpInput = {
      email: `test-123@example.com`,
      password: 'Test123!@#',
    };
    {
      const { data } = await signUp({
        input,

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
    }

    {
      const {
        data: { currentUser },
      } = await getCurrentUser({
        accessToken:
          createdUserAccessToken.accessOrWorkspaceAgnosticToken.token,
        expectToFail: false,
      });

      expect(currentUser.deletedAt).toBeNull();
      expect(currentUser).toMatchSnapshot(
        extractRecordIdsAndDatesAsExpectAny({ ...currentUser }),
      );
    }

    await deleteUser({
      accessToken: createdUserAccessToken.accessOrWorkspaceAgnosticToken.token,
      expectToFail: false,
    });

    {
      const { errors } = await getCurrentUser({
        accessToken:
          createdUserAccessToken.accessOrWorkspaceAgnosticToken.token,
        expectToFail: true,
      });

      expectOneNotInternalServerErrorSnapshot({
        errors,
      });
    }

    {
      const { data } = await signUp({
        input,

        expectToFail: false,
      });
      createdUserAccessToken = data.signUp.tokens;
    }

    {
      const {
        data: { currentUser },
      } = await getCurrentUser({
        accessToken:
          createdUserAccessToken.accessOrWorkspaceAgnosticToken.token,
        expectToFail: false,
      });

      expect(currentUser.deletedAt).toBeNull();
      expect(currentUser).toMatchSnapshot(
        extractRecordIdsAndDatesAsExpectAny({ ...currentUser }),
      );
    }
  });
});
