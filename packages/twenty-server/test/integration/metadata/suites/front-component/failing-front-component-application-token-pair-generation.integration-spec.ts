import { expectOneNotInternalServerErrorSnapshot } from 'test/integration/graphql/utils/expect-one-not-internal-server-error-snapshot.util';
import { findFrontComponents } from 'test/integration/metadata/suites/front-component/utils/find-front-components.util';
import { generateFrontComponentApplicationTokenPair } from 'test/integration/metadata/suites/front-component/utils/generate-front-component-application-token-pair.util';
import { generateApplicationTokenPair } from 'test/integration/utils/generate-application-token-pair.util';
import { generateAppleAdminApplicationTokenPair } from 'test/integration/utils/generate-apple-admin-application-token-pair.util';
import { jestExpectToBeDefined } from 'test/utils/jest-expect-to-be-defined.util.test';
import {
  eachTestingContextFilter,
  type EachTestingContext,
} from 'twenty-shared/testing';

import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const UNKNOWN_APPLICATION_ID = '20202020-0000-4000-8000-000000000000';

type GlobalTestContext = {
  applicationWithFrontComponentId: string;
  applicationUserBoundToken: string;
  applicationUnboundToken: string;
};

type TestContext = {
  applicationId: (globalContext: GlobalTestContext) => string;
  token?: (globalContext: GlobalTestContext) => string;
};

const failingFrontComponentApplicationTokenPairGenerationTestCases: EachTestingContext<TestContext>[] =
  [
    {
      title: 'when called with a user-bound application token',
      context: {
        applicationId: (globalContext) =>
          globalContext.applicationWithFrontComponentId,
        token: (globalContext) => globalContext.applicationUserBoundToken,
      },
    },
    {
      title: 'when called with an application token without user binding',
      context: {
        applicationId: (globalContext) =>
          globalContext.applicationWithFrontComponentId,
        token: (globalContext) => globalContext.applicationUnboundToken,
      },
    },
    {
      title: 'when called with an API key token',
      context: {
        applicationId: (globalContext) =>
          globalContext.applicationWithFrontComponentId,
        token: () => API_KEY_ACCESS_TOKEN,
      },
    },
    {
      title: 'when the application does not exist',
      context: {
        applicationId: () => UNKNOWN_APPLICATION_ID,
      },
    },
  ];

describe('Front component application token pair generation should fail', () => {
  let globalTestContext: GlobalTestContext;

  beforeAll(async () => {
    const { data: frontComponentsData } = await findFrontComponents({
      expectToFail: false,
    });
    const [frontComponent] = frontComponentsData.frontComponents;

    jestExpectToBeDefined(frontComponent);

    const [userBoundTokenPair, unboundTokenPair] = await Promise.all([
      generateAppleAdminApplicationTokenPair({
        applicationId: frontComponent.applicationId,
      }),
      generateApplicationTokenPair({
        workspaceId: SEED_APPLE_WORKSPACE_ID,
        applicationId: frontComponent.applicationId,
      }),
    ]);

    globalTestContext = {
      applicationWithFrontComponentId: frontComponent.applicationId,
      applicationUserBoundToken:
        userBoundTokenPair.applicationAccessToken.token,
      applicationUnboundToken: unboundTokenPair.applicationAccessToken.token,
    };
  });

  it.each(
    eachTestingContextFilter(
      failingFrontComponentApplicationTokenPairGenerationTestCases,
    ),
  )('$title', async ({ context }) => {
    const { errors } = await generateFrontComponentApplicationTokenPair({
      input: { applicationId: context.applicationId(globalTestContext) },
      token: context.token?.(globalTestContext),
      expectToFail: true,
    });

    expectOneNotInternalServerErrorSnapshot({ errors });
  });
});
