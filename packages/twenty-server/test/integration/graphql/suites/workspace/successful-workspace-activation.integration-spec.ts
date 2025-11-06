import { getCurrentUser } from 'test/integration/graphql/utils/current-user.util';
import { deleteUser } from 'test/integration/graphql/utils/delete-user.util';
import { signUp } from 'test/integration/graphql/utils/sign-up.util';
import { extractRecordIdsAndDatesAsExpectAny } from 'test/utils/extract-record-ids-and-dates-as-expect-any';
import { isDefined } from 'twenty-shared/utils';

import { type AuthTokenPair } from 'src/engine/core-modules/auth/dto/auth-token-pair.dto';

describe('Successful workspace activation flow (integration)', () => {
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
  it('should create a workspace in pending status via signUpOnNewWorkspace', async () => {
    const { data } = await signUp({
      input: {
        email: `test-123@example.com`,
        password: 'Test123!@#',
      },

      expectToFail: false,
    });

    const {
      data: { currentUser },
    } = await getCurrentUser({
      accessToken: data.signUp.tokens.accessOrWorkspaceAgnosticToken.token,
      expectToFail: false,
    });

    expect(currentUser).toMatchSnapshot(
      extractRecordIdsAndDatesAsExpectAny({ ...currentUser }),
    );
  });
});
