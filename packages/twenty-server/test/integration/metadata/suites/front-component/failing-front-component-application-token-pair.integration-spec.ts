import { expectOneNotInternalServerErrorSnapshot } from 'test/integration/graphql/utils/expect-one-not-internal-server-error-snapshot.util';
import { findManyApplications } from 'test/integration/graphql/utils/find-many-applications.util';
import { findFrontComponent } from 'test/integration/metadata/suites/front-component/utils/find-front-component.util';
import { findFrontComponents } from 'test/integration/metadata/suites/front-component/utils/find-front-components.util';
import { generateApplicationTokenPair } from 'test/integration/utils/generate-application-token-pair.util';
import { generateAppleAdminApplicationTokenPair } from 'test/integration/utils/generate-apple-admin-application-token-pair.util';
import { jestExpectToBeDefined } from 'test/utils/jest-expect-to-be-defined.util.test';
import {
  eachTestingContextFilter,
  type EachTestingContext,
} from 'twenty-shared/testing';

import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

type GlobalTestContext = {
  otherApplicationUserBoundToken: string;
  owningApplicationUserBoundToken: string;
  owningApplicationUnboundToken: string;
};

type TestContext = {
  token: (globalContext: GlobalTestContext) => string;
};

const failingFrontComponentReadTestCases: EachTestingContext<TestContext>[] = [
  {
    title: 'when called with a user-bound token of another application',
    context: {
      token: (globalContext) => globalContext.otherApplicationUserBoundToken,
    },
  },
  {
    title: 'when called with a user-bound token of the owning application',
    context: {
      token: (globalContext) => globalContext.owningApplicationUserBoundToken,
    },
  },
  {
    title: 'when called with an application token without user binding',
    context: {
      token: (globalContext) => globalContext.owningApplicationUnboundToken,
    },
  },
  {
    title: 'when called with an API key token',
    context: {
      token: () => API_KEY_ACCESS_TOKEN,
    },
  },
];

describe('Front component read with token pair should fail', () => {
  let frontComponentId: string;
  let globalTestContext: GlobalTestContext;

  beforeAll(async () => {
    const { data: frontComponentsData } = await findFrontComponents({
      expectToFail: false,
    });
    const [frontComponent] = frontComponentsData.frontComponents;

    jestExpectToBeDefined(frontComponent);

    frontComponentId = frontComponent.id;

    const owningApplicationId = frontComponent.applicationId;

    const { data: applicationsData } = await findManyApplications({
      expectToFail: false,
    });
    const otherApplication = applicationsData.findManyApplications.find(
      ({ id }) => id !== owningApplicationId,
    );

    jestExpectToBeDefined(otherApplication);

    const [otherTokenPair, owningTokenPair, owningUnboundTokenPair] =
      await Promise.all([
        generateAppleAdminApplicationTokenPair({
          applicationId: otherApplication.id,
        }),
        generateAppleAdminApplicationTokenPair({
          applicationId: owningApplicationId,
        }),
        generateApplicationTokenPair({
          workspaceId: SEED_APPLE_WORKSPACE_ID,
          applicationId: owningApplicationId,
        }),
      ]);

    globalTestContext = {
      otherApplicationUserBoundToken:
        otherTokenPair.applicationAccessToken.token,
      owningApplicationUserBoundToken:
        owningTokenPair.applicationAccessToken.token,
      owningApplicationUnboundToken:
        owningUnboundTokenPair.applicationAccessToken.token,
    };
  });

  it.each(eachTestingContextFilter(failingFrontComponentReadTestCases))(
    '$title',
    async ({ context }) => {
      const { errors } = await findFrontComponent({
        input: { id: frontComponentId },
        gqlFields: `
          id
          applicationTokenPair {
            applicationAccessToken {
              token
            }
          }
        `,
        token: context.token(globalTestContext),
        expectToFail: true,
      });

      expectOneNotInternalServerErrorSnapshot({ errors });
    },
  );
});
