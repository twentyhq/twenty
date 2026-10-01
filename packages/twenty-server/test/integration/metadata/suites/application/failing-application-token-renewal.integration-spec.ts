import { expectOneNotInternalServerErrorSnapshot } from 'test/integration/graphql/utils/expect-one-not-internal-server-error-snapshot.util';
import { findManyApplications } from 'test/integration/graphql/utils/find-many-applications.util';
import { generateAppleAdminApplicationTokenPair } from 'test/integration/utils/generate-apple-admin-application-token-pair.util';
import { renewApplicationToken } from 'test/integration/metadata/suites/application/utils/renew-application-token.util';
import { generateApplicationTokenPair } from 'test/integration/utils/generate-application-token-pair.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { jestExpectToBeDefined } from 'test/utils/jest-expect-to-be-defined.util.test';
import {
  eachTestingContextFilter,
  type EachTestingContext,
} from 'twenty-shared/testing';

import { type ThrottlerService } from 'src/engine/core-modules/throttler/throttler.service';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { USER_WORKSPACE_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-user-workspaces.util';
import { USER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-users.util';

type GlobalTestContext = {
  sessionBoundAccessToken: string;
  sessionBoundRefreshToken: string;
  otherUserRefreshToken: string;
  otherUserWorkspaceRefreshToken: string;
  noUserRefreshToken: string;
  noUserWorkspaceRefreshToken: string;
};

type TestContext = {
  refreshToken: (globalContext: GlobalTestContext) => string;
  token?: (globalContext: GlobalTestContext) => string;
};

const failingApplicationTokenRenewalTestCases: EachTestingContext<TestContext>[] =
  [
    {
      title: 'when the caller is an application token instead of a session',
      context: {
        refreshToken: (globalContext) => globalContext.sessionBoundRefreshToken,
        token: (globalContext) => globalContext.sessionBoundAccessToken,
      },
    },
    {
      title: 'when the caller is an API key',
      context: {
        refreshToken: (globalContext) => globalContext.sessionBoundRefreshToken,
        token: () => API_KEY_ACCESS_TOKEN,
      },
    },
    {
      title: 'when the refresh token is bound to another user',
      context: {
        refreshToken: (globalContext) => globalContext.otherUserRefreshToken,
      },
    },
    {
      title: 'when the refresh token is bound to another user workspace',
      context: {
        refreshToken: (globalContext) =>
          globalContext.otherUserWorkspaceRefreshToken,
      },
    },
    {
      title: 'when the refresh token has no user binding',
      context: {
        refreshToken: (globalContext) => globalContext.noUserRefreshToken,
      },
    },
    {
      title: 'when the refresh token has no user workspace binding',
      context: {
        refreshToken: (globalContext) =>
          globalContext.noUserWorkspaceRefreshToken,
      },
    },
  ];

describe('Application token renewal should fail', () => {
  let globalTestContext: GlobalTestContext;

  beforeAll(async () => {
    const { data: applicationsData } = await findManyApplications({
      expectToFail: false,
    });
    const [application] = applicationsData.findManyApplications;

    jestExpectToBeDefined(application);

    const applicationId = application.id;
    const workspaceId = SEED_APPLE_WORKSPACE_ID;

    const sessionBoundTokenPair = await generateAppleAdminApplicationTokenPair({
      applicationId,
    });

    const [
      otherUserTokenPair,
      otherUserWorkspaceTokenPair,
      noUserTokenPair,
      noUserWorkspaceTokenPair,
    ] = await Promise.all([
      generateApplicationTokenPair({
        workspaceId,
        applicationId,
        userId: USER_DATA_SEED_IDS.TIM,
        userWorkspaceId: USER_WORKSPACE_DATA_SEED_IDS.JANE,
      }),
      generateApplicationTokenPair({
        workspaceId,
        applicationId,
        userId: USER_DATA_SEED_IDS.JANE,
        userWorkspaceId: USER_WORKSPACE_DATA_SEED_IDS.TIM,
      }),
      generateApplicationTokenPair({
        workspaceId,
        applicationId,
        userWorkspaceId: USER_WORKSPACE_DATA_SEED_IDS.JANE,
      }),
      generateApplicationTokenPair({
        workspaceId,
        applicationId,
        userId: USER_DATA_SEED_IDS.JANE,
      }),
    ]);

    globalTestContext = {
      sessionBoundAccessToken:
        sessionBoundTokenPair.applicationAccessToken.token,
      sessionBoundRefreshToken:
        sessionBoundTokenPair.applicationRefreshToken.token,
      otherUserRefreshToken: otherUserTokenPair.applicationRefreshToken.token,
      otherUserWorkspaceRefreshToken:
        otherUserWorkspaceTokenPair.applicationRefreshToken.token,
      noUserRefreshToken: noUserTokenPair.applicationRefreshToken.token,
      noUserWorkspaceRefreshToken:
        noUserWorkspaceTokenPair.applicationRefreshToken.token,
    };
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it.each(eachTestingContextFilter(failingApplicationTokenRenewalTestCases))(
    '$title',
    async ({ context }) => {
      const { errors } = await renewApplicationToken({
        input: {
          applicationRefreshToken: context.refreshToken(globalTestContext),
        },
        token: context.token?.(globalTestContext),
        expectToFail: true,
      });

      expectOneNotInternalServerErrorSnapshot({ errors });
    },
  );

  it('should consume session rate limit bucket on failed renewal attempts', async () => {
    const tokenBucketThrottleOrThrowSpy = jest.spyOn(
      getAppProviderByClassName<ThrottlerService>('ThrottlerService'),
      'tokenBucketThrottleOrThrow',
    );

    await renewApplicationToken({
      input: {
        applicationRefreshToken: 'invalid-malformed-token',
      },
      expectToFail: true,
    });

    expect(tokenBucketThrottleOrThrowSpy).toHaveBeenCalledTimes(1);
    expect(tokenBucketThrottleOrThrowSpy).toHaveBeenCalledWith(
      `app-renew:${SEED_APPLE_WORKSPACE_ID}:${USER_WORKSPACE_DATA_SEED_IDS.JANE}`,
      1,
      30,
      30_000,
    );
  });
});
