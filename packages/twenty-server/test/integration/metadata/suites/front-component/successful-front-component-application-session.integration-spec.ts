import { decodeJwtCompleteOrThrow } from 'test/integration/graphql/utils/decode-jwt-complete-or-throw.util';
import { findFrontComponents } from 'test/integration/metadata/suites/front-component/utils/find-front-components.util';
import { generateFrontComponentApplicationSession } from 'test/integration/metadata/suites/front-component/utils/generate-front-component-application-session.util';
import { jestExpectToBeDefined } from 'test/utils/jest-expect-to-be-defined.util.test';

import { JwtTokenTypeEnum } from 'src/engine/core-modules/auth/types/jwt-token-type.enum';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { USER_WORKSPACE_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-user-workspaces.util';
import { USER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-users.util';

describe('Front component application session should be issued to a session', () => {
  let applicationId: string;

  beforeAll(async () => {
    const { data } = await findFrontComponents({ expectToFail: false });
    const [frontComponent] = data.frontComponents;

    jestExpectToBeDefined(frontComponent);

    applicationId = frontComponent.applicationId;
  });

  it('should issue a token pair bound to the session and the public variables of the application', async () => {
    const { data } = await generateFrontComponentApplicationSession({
      input: { applicationId },
      expectToFail: false,
    });

    const { applicationTokenPair, applicationVariables } =
      data.generateFrontComponentApplicationSession;

    expect(applicationVariables).toEqual(expect.any(Object));

    const expectedBinding = {
      applicationId,
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      userId: USER_DATA_SEED_IDS.JANE,
      userWorkspaceId: USER_WORKSPACE_DATA_SEED_IDS.JANE,
    };

    expect(
      decodeJwtCompleteOrThrow(
        applicationTokenPair.applicationAccessToken.token,
      ).payload,
    ).toMatchObject({
      ...expectedBinding,
      type: JwtTokenTypeEnum.APPLICATION_ACCESS,
    });
    expect(
      decodeJwtCompleteOrThrow(
        applicationTokenPair.applicationRefreshToken.token,
      ).payload,
    ).toMatchObject({
      ...expectedBinding,
      type: JwtTokenTypeEnum.APPLICATION_REFRESH,
    });
  });
});
