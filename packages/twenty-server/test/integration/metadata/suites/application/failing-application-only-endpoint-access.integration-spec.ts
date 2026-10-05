import { expectOneNotInternalServerErrorSnapshot } from 'test/integration/graphql/utils/expect-one-not-internal-server-error-snapshot.util';
import {
  APPLICATION_ONLY_GRAPHQL_OPERATION_FACTORIES,
  APPLICATION_ONLY_REST_REQUEST_FACTORIES,
  type ApplicationOnlyEndpointTarget,
  makeApplicationOnlyRestRequest,
} from 'test/integration/metadata/suites/application/utils/application-only-endpoint-request-factories.util';
import { loginAsTwentyCli } from 'test/integration/metadata/suites/application/utils/login-as-twenty-cli.util';
import { uninstallApplication } from 'test/integration/metadata/suites/application/utils/uninstall-application.util';
import {
  type ApplicationWithAppConnection,
  cleanupApplicationWithAppConnection,
  setupApplicationWithAppConnection,
} from 'test/integration/metadata/suites/connection-provider/utils/setup-application-with-app-connection.util';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { expectOneNotInternalServerErrorHttpResponseSnapshot } from 'test/integration/utils/expect-one-not-internal-server-error-http-response-snapshot.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import {
  type EachTestingContext,
  eachTestingContextFilter,
} from 'twenty-shared/testing';
import { isDefined } from 'twenty-shared/utils';
import { v4 as uuidv4 } from 'uuid';

import { type AppBillingService } from 'src/engine/core-modules/billing/app-billing/app-billing.service';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { TWENTY_CLI_APPLICATION_REGISTRATION } from 'src/engine/workspace-manager/twenty-standard-application/constants/twenty-cli-application-registration.constant';

type GlobalTestContext = {
  application: ApplicationWithAppConnection;
  target: ApplicationOnlyEndpointTarget;
  oauthClientToken: string;
  emitChargeEventSpy: jest.SpyInstance;
};

type CallerTestContext = {
  token: (globalContext: GlobalTestContext) => string;
};

type GraphqlOperationName =
  keyof typeof APPLICATION_ONLY_GRAPHQL_OPERATION_FACTORIES;

type RestRequestName = keyof typeof APPLICATION_ONLY_REST_REQUEST_FACTORIES;

type StateReader = (globalContext: GlobalTestContext) => Promise<unknown>;

const WORKSPACE_SCHEMA = getWorkspaceSchemaName(SEED_APPLE_WORKSPACE_ID);

const callerTestCases: EachTestingContext<CallerTestContext>[] = [
  {
    title: 'with a member session',
    context: { token: () => APPLE_JONY_MEMBER_ACCESS_TOKEN },
  },
  {
    title: 'with an API key',
    context: { token: () => API_KEY_ACCESS_TOKEN },
  },
  {
    title: 'with an OAuth-only client token',
    context: { token: (globalContext) => globalContext.oauthClientToken },
  },
];

const readConnectionAuthFailure: StateReader = ({ application }) =>
  globalThis.testDataSource.query(
    `SELECT "authFailedAt", "authFailedReason" FROM core."connectedAccount"
      WHERE id = $1`,
    [application.connectedAccountId],
  );

const readKeyValuePairs: StateReader = ({ target }) =>
  globalThis.testDataSource.query(
    `SELECT "applicationId", value FROM core."keyValuePair"
      WHERE key = $1 ORDER BY "applicationId"`,
    [target.keyValueKey],
  );

const readJobs: StateReader = async ({ application, target }) => {
  const response = await makeMetadataApiRequest(
    APPLICATION_ONLY_GRAPHQL_OPERATION_FACTORIES.getJobs(target),
    application.applicationToken,
  );

  return response.body.data.getJobs;
};

const readMessageChannels: StateReader = ({ application }) =>
  globalThis.testDataSource.query(
    `SELECT id, "displayName", visibility, "isSyncEnabled"
       FROM core."messageChannel"
      WHERE "connectedAccountId" = $1 ORDER BY id`,
    [application.connectedAccountId],
  );

const readIngestedMessages: StateReader = ({ target }) =>
  globalThis.testDataSource.query(
    `SELECT "messageId"
       FROM "${WORKSPACE_SCHEMA}"."messageChannelMessageAssociation"
      WHERE "messageChannelId" = $1`,
    [target.messageChannelId],
  );

const readNothing: StateReader = async () => null;

const GRAPHQL_STATE_READERS: Partial<
  Record<GraphqlOperationName, StateReader>
> = {
  reportAppConnectionAuthFailure: readConnectionAuthFailure,
  setAppKeyValue: readKeyValuePairs,
  deleteAppKeyValue: readKeyValuePairs,
  enqueueJob: readJobs,
  enqueueJobs: readJobs,
  createAppMessageChannel: readMessageChannels,
  updateAppMessageChannel: readMessageChannels,
  deleteAppMessageChannel: readMessageChannels,
  ingestAppMessages: readIngestedMessages,
};

const REST_STATE_READERS: Partial<Record<RestRequestName, StateReader>> = {
  'POST /app/billing/charge': async ({ emitChargeEventSpy }) =>
    emitChargeEventSpy.mock.calls.length,
};

const graphqlOperationNames = Object.keys(
  APPLICATION_ONLY_GRAPHQL_OPERATION_FACTORIES,
) as GraphqlOperationName[];

const restRequestNames = Object.keys(
  APPLICATION_ONLY_REST_REQUEST_FACTORIES,
) as RestRequestName[];

describe('Application-only endpoints with a non-application caller should fail', () => {
  let globalTestContext: GlobalTestContext;

  beforeAll(async () => {
    const application = await setupApplicationWithAppConnection({
      name: 'Application Only Probe',
    });
    const keyValueKey = `application-only-probe-${uuidv4()}`;

    const setKeyValueResponse = await makeMetadataApiRequest(
      APPLICATION_ONLY_GRAPHQL_OPERATION_FACTORIES.setAppKeyValue({
        keyValueKey,
      }),
      application.applicationToken,
    );

    expect(setKeyValueResponse.body.errors).toBeUndefined();

    const createMessageChannelResponse = await makeMetadataApiRequest(
      APPLICATION_ONLY_GRAPHQL_OPERATION_FACTORIES.createAppMessageChannel({
        connectedAccountId: application.connectedAccountId,
      }),
      application.applicationToken,
    );

    expect(createMessageChannelResponse.body.errors).toBeUndefined();

    globalTestContext = {
      application,
      target: {
        connectedAccountId: application.connectedAccountId,
        messageChannelId:
          createMessageChannelResponse.body.data.createAppMessageChannel.id,
        keyValueKey,
        logicFunctionUniversalIdentifier: uuidv4(),
        jobId: `application-only-probe.${uuidv4()}`,
      },
      oauthClientToken: await loginAsTwentyCli(),
      emitChargeEventSpy: jest.spyOn(
        getAppProviderByClassName<AppBillingService>('AppBillingService'),
        'emitChargeEvent',
      ),
    };
  }, 120000);

  afterAll(async () => {
    if (!isDefined(globalTestContext)) {
      return;
    }

    globalTestContext.emitChargeEventSpy.mockRestore();

    await globalThis.testDataSource.query(
      `DELETE FROM core."keyValuePair" WHERE key = $1`,
      [globalTestContext.target.keyValueKey],
    );
    await cleanupApplicationWithAppConnection(globalTestContext.application);
    await uninstallApplication({
      universalIdentifier:
        TWENTY_CLI_APPLICATION_REGISTRATION.universalIdentifier,
      expectToFail: false,
    });
  });

  describe.each(eachTestingContextFilter(callerTestCases))(
    '$title',
    ({ context }) => {
      it.each(graphqlOperationNames)(
        'should refuse %s and leave state unchanged',
        async (operationName) => {
          const readState = GRAPHQL_STATE_READERS[operationName] ?? readNothing;
          const stateBeforeAttempt = await readState(globalTestContext);

          const response = await makeMetadataApiRequest(
            APPLICATION_ONLY_GRAPHQL_OPERATION_FACTORIES[operationName](
              globalTestContext.target,
            ),
            context.token(globalTestContext),
          );

          expect(await readState(globalTestContext)).toEqual(
            stateBeforeAttempt,
          );
          expectOneNotInternalServerErrorSnapshot({
            errors: response.body.errors,
          });
        },
      );

      it.each(restRequestNames)(
        'should refuse %s and leave state unchanged',
        async (requestName) => {
          const readState = REST_STATE_READERS[requestName] ?? readNothing;
          const stateBeforeAttempt = await readState(globalTestContext);

          const response = await makeApplicationOnlyRestRequest(
            APPLICATION_ONLY_REST_REQUEST_FACTORIES[requestName](
              globalTestContext.target,
            ),
            context.token(globalTestContext),
          );

          expect(await readState(globalTestContext)).toEqual(
            stateBeforeAttempt,
          );
          expectOneNotInternalServerErrorHttpResponseSnapshot({
            status: response.status,
            body: response.body,
          });
        },
      );
    },
  );
});
