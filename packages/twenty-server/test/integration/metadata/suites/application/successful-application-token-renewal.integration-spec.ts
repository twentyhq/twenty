import { decodeJwtCompleteOrThrow } from 'test/integration/graphql/utils/decode-jwt-complete-or-throw.util';
import { findManyApplications } from 'test/integration/graphql/utils/find-many-applications.util';
import { generateApplicationToken } from 'test/integration/metadata/suites/application/utils/generate-application-token.util';
import { renewApplicationToken } from 'test/integration/metadata/suites/application/utils/renew-application-token.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { jestExpectToBeDefined } from 'test/utils/jest-expect-to-be-defined.util.test';

import { JwtTokenTypeEnum } from 'src/engine/core-modules/auth/types/jwt-token-type.enum';
import { type ThrottlerService } from 'src/engine/core-modules/throttler/throttler.service';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { USER_WORKSPACE_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-user-workspaces.util';
import { USER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-users.util';

describe('Application token renewal should succeed', () => {
  let applicationId: string;
  let sessionBoundRefreshToken: string;

  beforeAll(async () => {
    const { data: applicationsData } = await findManyApplications({
      expectToFail: false,
    });
    const [application] = applicationsData.findManyApplications;

    jestExpectToBeDefined(application);

    applicationId = application.id;

    const { data } = await generateApplicationToken({
      applicationId,
      expectToFail: false,
    });

    sessionBoundRefreshToken =
      data.generateApplicationToken.applicationRefreshToken.token;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should renew a refresh token bound to the authenticated session and keep its binding', async () => {
    const tokenBucketThrottleOrThrowSpy = jest.spyOn(
      getAppProviderByClassName<ThrottlerService>('ThrottlerService'),
      'tokenBucketThrottleOrThrow',
    );

    const { data } = await renewApplicationToken({
      input: { applicationRefreshToken: sessionBoundRefreshToken },
      expectToFail: false,
    });

    const expectedBinding = {
      applicationId,
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      userId: USER_DATA_SEED_IDS.JANE,
      userWorkspaceId: USER_WORKSPACE_DATA_SEED_IDS.JANE,
    };

    expect(
      decodeJwtCompleteOrThrow(
        data.renewApplicationToken.applicationAccessToken.token,
      ).payload,
    ).toMatchObject({
      ...expectedBinding,
      type: JwtTokenTypeEnum.APPLICATION_ACCESS,
    });
    expect(
      decodeJwtCompleteOrThrow(
        data.renewApplicationToken.applicationRefreshToken.token,
      ).payload,
    ).toMatchObject({
      ...expectedBinding,
      type: JwtTokenTypeEnum.APPLICATION_REFRESH,
    });
    expect(tokenBucketThrottleOrThrowSpy).toHaveBeenCalledWith(
      `app-renew:${SEED_APPLE_WORKSPACE_ID}:${USER_WORKSPACE_DATA_SEED_IDS.JANE}:${applicationId}`,
      1,
      30,
      30_000,
    );
  });
});
