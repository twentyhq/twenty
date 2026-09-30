import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import {
  type ApplicationWithVariable,
  setupApplicationWithVariable,
} from 'test/integration/metadata/suites/application/utils/setup-application-with-variable.util';
import {
  type RestApiRequestMethod,
  makeRestApiRequest,
} from 'test/integration/rest/utils/make-rest-api-request.util';
import { expectOneNotInternalServerErrorHttpResponseSnapshot } from 'test/integration/utils/expect-one-not-internal-server-error-http-response-snapshot.util';
import { generateAppleAdminApplicationTokenPair } from 'test/integration/utils/generate-apple-admin-application-token-pair.util';
import { generateApplicationTokenPair } from 'test/integration/utils/generate-application-token-pair.util';
import { SystemPermissionFlag } from 'twenty-shared/constants';
import {
  type EachTestingContext,
  eachTestingContextFilter,
} from 'twenty-shared/testing';
import { isDefined } from 'twenty-shared/utils';

import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const PLACEHOLDER_WEBHOOK_ID = '20202020-0000-4000-8000-000000000000';
const PROBE_TARGET_URL = 'https://application-token-probe.example.com/webhook';

type GlobalTestContext = {
  application: ApplicationWithVariable;
  userBoundToken: string;
  unboundToken: string;
};

type TokenTestContext = {
  token: (globalContext: GlobalTestContext) => string;
};

type RouteTestContext = {
  method: RestApiRequestMethod;
  path: string;
  body?: Record<string, unknown>;
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
    title: 'create a webhook',
    context: {
      method: 'post',
      path: '/webhooks',
      body: { targetUrl: PROBE_TARGET_URL, operations: ['*.*'] },
    },
  },
  {
    title: 'update a webhook',
    context: {
      method: 'patch',
      path: `/webhooks/${PLACEHOLDER_WEBHOOK_ID}`,
      body: { targetUrl: PROBE_TARGET_URL },
    },
  },
  {
    title: 'delete a webhook',
    context: {
      method: 'delete',
      path: `/webhooks/${PLACEHOLDER_WEBHOOK_ID}`,
    },
  },
];

const countProbeWebhooks = async (): Promise<number> => {
  const [{ count }] = await globalThis.testDataSource.query(
    `SELECT COUNT(*)::int AS count FROM core."webhook" WHERE "targetUrl" = $1`,
    [PROBE_TARGET_URL],
  );

  return count;
};

describe('Application token REST webhook writes should fail', () => {
  let globalTestContext: GlobalTestContext;

  beforeAll(async () => {
    // The role holds the webhooks flag, so the permission guard lets the
    // application through and the refusal is the principal check's.
    const application = await setupApplicationWithVariable({
      name: 'Rest Webhook Probe',
      variableKey: 'REST_WEBHOOK_PROBE',
      permissionFlagUniversalIdentifiers: [
        SystemPermissionFlag.API_KEYS_AND_WEBHOOKS,
      ],
    });

    const [userBoundTokenPair, unboundTokenPair] = await Promise.all([
      generateAppleAdminApplicationTokenPair({ applicationId: application.id }),
      generateApplicationTokenPair({
        workspaceId: SEED_APPLE_WORKSPACE_ID,
        applicationId: application.id,
      }),
    ]);

    globalTestContext = {
      application,
      userBoundToken: userBoundTokenPair.applicationAccessToken.token,
      unboundToken: unboundTokenPair.applicationAccessToken.token,
    };
  }, 120000);

  afterAll(async () => {
    if (!isDefined(globalTestContext)) {
      return;
    }

    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier:
        globalTestContext.application.universalIdentifier,
    });
  });

  describe.each(eachTestingContextFilter(tokenTestCases))(
    '$title',
    ({ context: tokenContext }) => {
      it.each(eachTestingContextFilter(routeTestCases))(
        'should refuse to $title',
        async ({ context }) => {
          const response = await makeRestApiRequest({
            method: context.method,
            path: context.path,
            body: context.body,
            bearer: tokenContext.token(globalTestContext),
          });

          expectOneNotInternalServerErrorHttpResponseSnapshot(response);
          expect(await countProbeWebhooks()).toBe(0);
        },
      );

      it('should still list webhooks', async () => {
        const response = await makeRestApiRequest({
          method: 'get',
          path: '/webhooks',
          bearer: tokenContext.token(globalTestContext),
        });

        expect(response.status).toBe(200);
      });
    },
  );
});
