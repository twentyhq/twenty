import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import {
  type ApplicationWithResources,
  setupApplicationWithResources,
} from 'test/integration/metadata/suites/application/utils/setup-application-with-resources.util';
import { makeRestApiRequest } from 'test/integration/rest/utils/make-rest-api-request.util';
import { expectOneNotInternalServerErrorHttpResponseSnapshot } from 'test/integration/utils/expect-one-not-internal-server-error-http-response-snapshot.util';
import { generateAppleAdminApplicationTokenPair } from 'test/integration/utils/generate-apple-admin-application-token-pair.util';
import { generateApplicationTokenPair } from 'test/integration/utils/generate-application-token-pair.util';
import {
  type EachTestingContext,
  eachTestingContextFilter,
} from 'twenty-shared/testing';

import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

type GlobalTestContext = {
  otherApplication: ApplicationWithResources;
  userBoundToken: string;
  unboundToken: string;
};

type TokenTestContext = {
  token: (globalContext: GlobalTestContext) => string;
};

type RouteTestContext = {
  path: (otherApplication: ApplicationWithResources) => string;
};

const tokenTestCases: EachTestingContext<TokenTestContext>[] = [
  {
    title: 'with a user-bound application token',
    context: { token: (globalContext) => globalContext.userBoundToken },
  },
  {
    title: 'with an application token without user binding',
    context: { token: (globalContext) => globalContext.unboundToken },
  },
];

const routeTestCases: EachTestingContext<RouteTestContext>[] = [
  {
    title: 'front component built JS',
    context: {
      path: ({ frontComponentId }) => `/front-components/${frontComponentId}`,
    },
  },
  {
    title: 'front component shared dependencies',
    context: {
      path: ({ id }) => `/front-component-shared-dependencies/${id}`,
    },
  },
  {
    title: 'SDK client module',
    context: {
      path: ({ id }) => `/sdk-client/${id}/core`,
    },
  },
];

describe('Application token REST access to another application should fail', () => {
  let callingApplication: ApplicationWithResources;
  let globalTestContext: GlobalTestContext;

  beforeAll(async () => {
    callingApplication = await setupApplicationWithResources({
      name: 'Calling Rest Application',
    });
    const otherApplication = await setupApplicationWithResources({
      name: 'Other Rest Application',
    });

    const [userBoundTokenPair, unboundTokenPair] = await Promise.all([
      generateAppleAdminApplicationTokenPair({
        applicationId: callingApplication.id,
      }),
      generateApplicationTokenPair({
        workspaceId: SEED_APPLE_WORKSPACE_ID,
        applicationId: callingApplication.id,
      }),
    ]);

    globalTestContext = {
      otherApplication,
      userBoundToken: userBoundTokenPair.applicationAccessToken.token,
      unboundToken: unboundTokenPair.applicationAccessToken.token,
    };
  }, 120000);

  afterAll(async () => {
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: callingApplication.universalIdentifier,
    });
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier:
        globalTestContext.otherApplication.universalIdentifier,
    });
  });

  describe.each(eachTestingContextFilter(tokenTestCases))(
    '$title',
    ({ context: tokenContext }) => {
      it.each(eachTestingContextFilter(routeTestCases))(
        'should refuse the $title of another application',
        async ({ context }) => {
          const response = await makeRestApiRequest({
            method: 'get',
            path: context.path(globalTestContext.otherApplication),
            bearer: tokenContext.token(globalTestContext),
          });

          expectOneNotInternalServerErrorHttpResponseSnapshot(response);
        },
      );
    },
  );
});
