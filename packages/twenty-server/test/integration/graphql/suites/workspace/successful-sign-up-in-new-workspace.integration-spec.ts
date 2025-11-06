import { getCurrentUser } from 'test/integration/graphql/utils/current-user.util';
import { deleteUser } from 'test/integration/graphql/utils/delete-user.util';
import { signUpInNewWorkspace } from 'test/integration/graphql/utils/sign-up-in-new-workspace.util';
import { signUp } from 'test/integration/graphql/utils/sign-up.util';
import { extractRecordIdsAndDatesAsExpectAny } from 'test/utils/extract-record-ids-and-dates-as-expect-any';
import { isDefined } from 'twenty-shared/utils';

describe('Successful User Sign Up In New Workspace (integration)', () => {
  let createdUserAccessToken: string | undefined;

  afterEach(async () => {
    if (!isDefined(createdUserAccessToken)) {
      return;
    }

    await deleteUser({
      accessToken: createdUserAccessToken,
      expectToFail: false,
    });
  });

  it('should sign up a new user successfully', async () => {
    const { data } = await signUp({
      input: {
        email: `test-123@example.com`,
        password: 'Test123!@#',
      },

      expectToFail: false,
    });
    createdUserAccessToken = data.signUp.tokens.accessOrWorkspaceAgnosticToken.token;

    await signUpInNewWorkspace({
      accessToken: createdUserAccessToken,
      expectToFail: false,
    });

    const {
      data: { currentUser },
    } = await getCurrentUser({
      accessToken: createdUserAccessToken,
      expectToFail: false,
    });

    expect(currentUser.currentWorkspace).toBeDefined();
    expect(currentUser).toMatchSnapshot(
      extractRecordIdsAndDatesAsExpectAny({ ...currentUser }),
    );
  });
});
