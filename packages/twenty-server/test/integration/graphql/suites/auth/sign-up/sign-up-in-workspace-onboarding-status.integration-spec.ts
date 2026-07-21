import { randomUUID } from 'crypto';

import { deleteUser } from 'test/integration/graphql/utils/delete-user.util';
import { getOnboardingStatus } from 'test/integration/graphql/utils/get-onboarding-status.util';
import { signUpInWorkspaceAndGetAccessToken } from 'test/integration/graphql/utils/sign-up-in-workspace-and-get-access-token.util';
import { isDefined } from 'twenty-shared/utils';

import { OnboardingStatus } from 'src/engine/core-modules/onboarding/enums/onboarding-status.enum';

describe('Onboarding status when signing up in an existing workspace (integration)', () => {
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

  it('should start with the connect-account step for a new user joining through an invite', async () => {
    createdUserAccessToken = await signUpInWorkspaceAndGetAccessToken(
      `invited-onboarding-status-${randomUUID()}@example.com`,
    );

    const {
      data: { currentUser },
    } = await getOnboardingStatus({
      accessToken: createdUserAccessToken,
      expectToFail: false,
    });

    expect(currentUser.onboardingStatus).toBe(OnboardingStatus.SYNC_EMAIL);
  });
});
