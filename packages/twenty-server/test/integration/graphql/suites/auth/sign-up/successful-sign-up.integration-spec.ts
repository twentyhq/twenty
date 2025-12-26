import { deleteUser } from 'test/integration/graphql/utils/delete-user.util';
import { expectOneNotInternalServerErrorSnapshot } from 'test/integration/graphql/utils/expect-one-not-internal-server-error-snapshot.util';
import { getCurrentUser } from 'test/integration/graphql/utils/get-current-user.util';
import { signUp } from 'test/integration/graphql/utils/sign-up.util';
import { extractRecordIdsAndDatesAsExpectAny } from 'test/utils/extract-record-ids-and-dates-as-expect-any';
import { isDefined } from 'twenty-shared/utils';

import { type SignUpInput } from 'src/engine/core-modules/auth/dto/sign-up.input';

describe('Successful User Sign Up (integration)', () => {
  let createdUserAccessToken: string | undefined;

  afterEach(async () => {
    if (isDefined(createdUserAccessToken)) {
      await deleteUser({
        accessToken: createdUserAccessToken,
        expectToFail: false,
      });

      createdUserAccessToken = undefined;
    }
  });

  it('should sign up, delete and signup same new user successfully', async () => {
    const input: SignUpInput = {
      email: `test-123@example.com`,
      password: 'Test123!@#',
    };

    const { data: firstSignUpData } = await signUp({
      input,
      expectToFail: false,
    });

    createdUserAccessToken =
      firstSignUpData.signUp.tokens.accessOrWorkspaceAgnosticToken.token;

    expect(
      firstSignUpData.signUp.tokens.accessOrWorkspaceAgnosticToken.token,
    ).toBeDefined();
    expect(firstSignUpData.signUp.tokens.refreshToken.token).toBeDefined();
    expect(
      firstSignUpData.signUp.availableWorkspaces.availableWorkspacesForSignIn,
    ).toEqual([]);
    expect(
      firstSignUpData.signUp.availableWorkspaces.availableWorkspacesForSignUp,
    ).toEqual([]);

    const {
      data: { currentUser: currentUserAfterSignUp },
    } = await getCurrentUser({
      accessToken: createdUserAccessToken,
      expectToFail: false,
    });

    expect(currentUserAfterSignUp.deletedAt).toBeNull();
    expect(currentUserAfterSignUp).toMatchSnapshot(
      extractRecordIdsAndDatesAsExpectAny({ ...currentUserAfterSignUp }),
    );

    await deleteUser({
      accessToken: createdUserAccessToken,
      expectToFail: false,
    });

    const { errors: getCurrentUserAfterDeleteErrors } = await getCurrentUser({
      accessToken: createdUserAccessToken,
      expectToFail: true,
    });

    expectOneNotInternalServerErrorSnapshot({
      errors: getCurrentUserAfterDeleteErrors,
    });

    const { data: secondSignUpData } = await signUp({
      input,
      expectToFail: false,
    });

    createdUserAccessToken =
      secondSignUpData.signUp.tokens.accessOrWorkspaceAgnosticToken.token;

    const {
      data: { currentUser: currentUserAfterSecondSignUp },
    } = await getCurrentUser({
      accessToken: createdUserAccessToken,
      expectToFail: false,
    });

    expect(currentUserAfterSecondSignUp.deletedAt).toBeNull();
    expect(currentUserAfterSecondSignUp).toMatchSnapshot(
      extractRecordIdsAndDatesAsExpectAny({ ...currentUserAfterSecondSignUp }),
    );
  });
});
