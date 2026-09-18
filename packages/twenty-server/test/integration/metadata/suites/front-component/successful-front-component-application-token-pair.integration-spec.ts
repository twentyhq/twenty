import { decodeJwtCompleteOrThrow } from 'test/integration/graphql/utils/decode-jwt-complete-or-throw.util';
import { findFrontComponent } from 'test/integration/metadata/suites/front-component/utils/find-front-component.util';
import { findFrontComponents } from 'test/integration/metadata/suites/front-component/utils/find-front-components.util';
import { jestExpectToBeDefined } from 'test/utils/jest-expect-to-be-defined.util.test';

import { JwtTokenTypeEnum } from 'src/engine/core-modules/auth/types/jwt-token-type.enum';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { USER_WORKSPACE_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-user-workspaces.util';
import { USER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-users.util';

const FRONT_COMPONENT_WITH_TOKEN_PAIR_GQL_FIELDS = `
  id
  applicationId
  applicationVariables
  applicationTokenPair {
    applicationAccessToken {
      token
      expiresAt
    }
    applicationRefreshToken {
      token
      expiresAt
    }
  }
`;

describe('Front component application token pair should be issued to a session', () => {
  let frontComponentId: string;
  let owningApplicationId: string;

  beforeAll(async () => {
    const { data } = await findFrontComponents({ expectToFail: false });
    const [frontComponent] = data.frontComponents;

    jestExpectToBeDefined(frontComponent);

    frontComponentId = frontComponent.id;
    owningApplicationId = frontComponent.applicationId;
  });

  it('should issue a token pair bound to the session for the owning application', async () => {
    const { data } = await findFrontComponent({
      input: { id: frontComponentId },
      gqlFields: FRONT_COMPONENT_WITH_TOKEN_PAIR_GQL_FIELDS,
      expectToFail: false,
    });

    expect(data.frontComponent).toMatchObject({
      id: frontComponentId,
      applicationId: owningApplicationId,
      applicationVariables: expect.any(Object),
    });

    const { applicationTokenPair } = data.frontComponent;

    jestExpectToBeDefined(applicationTokenPair);

    const expectedBinding = {
      applicationId: owningApplicationId,
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
