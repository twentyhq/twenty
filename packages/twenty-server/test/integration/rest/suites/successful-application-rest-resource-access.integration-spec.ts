import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import {
  type ApplicationWithResources,
  BUILT_FRONT_COMPONENT_CONTENT,
  SHARED_DEPENDENCIES_BUNDLE_CONTENT,
  setupApplicationWithResources,
} from 'test/integration/metadata/suites/application/utils/setup-application-with-resources.util';
import { makeRestApiRequest } from 'test/integration/rest/utils/make-rest-api-request.util';
import { generateAppleAdminApplicationTokenPair } from 'test/integration/utils/generate-apple-admin-application-token-pair.util';
import { generateApplicationTokenPair } from 'test/integration/utils/generate-application-token-pair.util';
import {
  type EachTestingContext,
  eachTestingContextFilter,
} from 'twenty-shared/testing';

import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

type GlobalTestContext = {
  application: ApplicationWithResources;
  otherApplication: ApplicationWithResources;
  userBoundToken: string;
  unboundToken: string;
};

type CallerTestContext = {
  token: (globalContext: GlobalTestContext) => string;
  targetApplication: (
    globalContext: GlobalTestContext,
  ) => ApplicationWithResources;
};

type RouteTestContext = {
  path: (application: ApplicationWithResources) => string;
  expectedContent: string | undefined;
};

const callerTestCases: EachTestingContext<CallerTestContext>[] = [
  {
    title: 'a user-bound application token on its own application',
    context: {
      token: (globalContext) => globalContext.userBoundToken,
      targetApplication: (globalContext) => globalContext.application,
    },
  },
  {
    title: 'an application token without user binding on its own application',
    context: {
      token: (globalContext) => globalContext.unboundToken,
      targetApplication: (globalContext) => globalContext.application,
    },
  },
  {
    title: 'a member session on an installed application',
    context: {
      token: () => APPLE_JANE_ADMIN_ACCESS_TOKEN,
      targetApplication: (globalContext) => globalContext.otherApplication,
    },
  },
];

const routeTestCases: EachTestingContext<RouteTestContext>[] = [
  {
    title: 'front component built JS',
    context: {
      path: ({ frontComponentId }) => `/front-components/${frontComponentId}`,
      expectedContent: BUILT_FRONT_COMPONENT_CONTENT,
    },
  },
  {
    title: 'front component shared dependencies',
    context: {
      path: ({ id }) => `/front-component-shared-dependencies/${id}`,
      expectedContent: SHARED_DEPENDENCIES_BUNDLE_CONTENT,
    },
  },
  {
    title: 'SDK client metadata module',
    context: {
      path: ({ id }) => `/sdk-client/${id}/metadata`,
      expectedContent: undefined,
    },
  },
];

describe('Application REST resource access should succeed', () => {
  let globalTestContext: GlobalTestContext;

  beforeAll(async () => {
    const application = await setupApplicationWithResources({
      name: 'Own Rest Application',
    });
    const otherApplication = await setupApplicationWithResources({
      name: 'Installed Rest Application',
    });

    const [userBoundTokenPair, unboundTokenPair] = await Promise.all([
      generateAppleAdminApplicationTokenPair({
        applicationId: application.id,
      }),
      generateApplicationTokenPair({
        workspaceId: SEED_APPLE_WORKSPACE_ID,
        applicationId: application.id,
      }),
    ]);

    globalTestContext = {
      application,
      otherApplication,
      userBoundToken: userBoundTokenPair.applicationAccessToken.token,
      unboundToken: unboundTokenPair.applicationAccessToken.token,
    };
  }, 120000);

  afterAll(async () => {
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier:
        globalTestContext.application.universalIdentifier,
    });
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier:
        globalTestContext.otherApplication.universalIdentifier,
    });
  });

  describe.each(eachTestingContextFilter(callerTestCases))(
    'from $title',
    ({ context: callerContext }) => {
      it.each(eachTestingContextFilter(routeTestCases))(
        'should serve the $title',
        async ({ context }) => {
          const response = await makeRestApiRequest({
            method: 'get',
            path: context.path(
              callerContext.targetApplication(globalTestContext),
            ),
            bearer: callerContext.token(globalTestContext),
          });

          expect(response.status).toBe(200);
          expect(response.headers['content-type']).toMatch(
            /application\/javascript/,
          );

          if (context.expectedContent !== undefined) {
            expect(response.text).toBe(context.expectedContent);
          }
        },
      );
    },
  );
});
