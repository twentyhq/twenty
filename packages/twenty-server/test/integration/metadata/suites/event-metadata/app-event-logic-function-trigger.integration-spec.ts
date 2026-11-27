import { createHash } from 'crypto';

import { gql } from 'graphql-tag';
import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import { uploadApplicationFile } from 'test/integration/metadata/suites/application/utils/upload-application-file.util';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { type MarkerServer } from 'test/integration/types/marker-server.type';
import { expectEventually } from 'test/integration/utils/expect-eventually.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { generateApplicationAccessToken } from 'test/integration/utils/generate-application-access-token.util';
import { startMarkerServer } from 'test/integration/utils/start-marker-server.util';
import { waitForAllJobsToFinish } from 'test/integration/utils/wait-for-all-jobs-to-finish.util';
import {
  type EventManifest,
  type EventOccurrence,
  type LogicFunctionManifest,
} from 'twenty-shared/application';
import { v4 as uuidv4 } from 'uuid';

import { type TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const TEST_APP_ID = uuidv4();
const TEST_ROLE_ID = uuidv4();
const MESSAGE_ADDED_EVENT_ID = uuidv4();
const ON_MESSAGE_ADDED_FUNCTION_ID = uuidv4();

const EMIT_APP_EVENT_MUTATION = gql`
  mutation EmitAppEvent($input: EmitAppEventInput!) {
    emitAppEvent(input: $input) {
      id
      occurredAt
    }
  }
`;

const MESSAGE_ADDED_EVENT: EventManifest = {
  universalIdentifier: MESSAGE_ADDED_EVENT_ID,
  name: 'messageAdded',
  label: 'Message added',
  schema: {
    type: 'object',
    properties: { text: { type: 'string' } },
  },
};

describe('logic functions triggered by an app event (e2e)', () => {
  let markerServer: MarkerServer;
  let executionsUrl: string;
  let onMessageAddedFunction: LogicFunctionManifest;
  let applicationToken: string;

  const syncWithTrigger = ({
    eventUniversalIdentifier,
    expectToFail = false,
  }: {
    eventUniversalIdentifier: string;
    expectToFail?: boolean;
  }) =>
    syncApplication({
      manifest: buildBaseManifest({
        appId: TEST_APP_ID,
        roleId: TEST_ROLE_ID,
        overrides: {
          events: [MESSAGE_ADDED_EVENT],
          logicFunctions: [
            {
              ...onMessageAddedFunction,
              eventTriggerSettings: {
                on: 'appEvent',
                eventUniversalIdentifier,
              },
            },
          ],
        },
      }),
      expectToFail,
    });

  const readExecutions = (): EventOccurrence[] =>
    markerServer.hasMarker(executionsUrl)
      ? markerServer
          .readMarker(executionsUrl)
          .trim()
          .split('\n')
          .map((line) => JSON.parse(line))
      : [];

  beforeAll(async () => {
    markerServer = await startMarkerServer();
    executionsUrl = markerServer.markerUrl('app-event-executions');

    await setupApplicationForSync({
      applicationUniversalIdentifier: TEST_APP_ID,
      name: 'Test Application',
      description: 'App for testing app event triggers',
      sourcePath: 'test-app-event-triggers',
    });
    // The file upload fails while fake timers are on
    jest.useRealTimers();

    const handlerSource = `export const handler = async (payload) => {
  await fetch(${JSON.stringify(executionsUrl)}, { method: 'POST', body: JSON.stringify(payload) + '\\n' });
  return { ok: true };
};`;

    const uploaded = await uploadApplicationFile({
      applicationUniversalIdentifier: TEST_APP_ID,
      fileFolder: 'BuiltLogicFunction',
      filePath: 'dist/on-message-added.mjs',
      filename: 'on-message-added.mjs',
      contentType: 'application/javascript',
      fileBuffer: Buffer.from(handlerSource),
    });

    expect(uploaded.errors).toBeUndefined();

    onMessageAddedFunction = {
      universalIdentifier: ON_MESSAGE_ADDED_FUNCTION_ID,
      name: 'on-message-added',
      handlerName: 'handler',
      sourceHandlerPath: 'src/on-message-added.ts',
      builtHandlerPath: 'dist/on-message-added.mjs',
      builtHandlerChecksum: createHash('sha256')
        .update(handlerSource)
        .digest('hex'),
      timeoutSeconds: 10,
    };

    await syncWithTrigger({ eventUniversalIdentifier: MESSAGE_ADDED_EVENT_ID });

    const [application] = await globalThis.testDataSource.query(
      `SELECT id FROM core."application" WHERE "universalIdentifier" = $1`,
      [TEST_APP_ID],
    );

    applicationToken = await generateApplicationAccessToken({
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      applicationId: application.id,
    });
  }, 180000);

  afterAll(async () => {
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: TEST_APP_ID,
    });
    await markerServer.close();
  }, 120000);

  it('stores the trigger on the logic function', async () => {
    const [logicFunction] = await globalThis.testDataSource.query(
      `SELECT "appEventTriggerSettings", "databaseEventTriggerSettings" FROM core."logicFunction" WHERE "universalIdentifier" = $1`,
      [ON_MESSAGE_ADDED_FUNCTION_ID],
    );

    expect(logicFunction).toEqual({
      appEventTriggerSettings: {
        eventUniversalIdentifier: MESSAGE_ADDED_EVENT_ID,
      },
      databaseEventTriggerSettings: null,
    });
  });

  it('runs the logic function with the occurrence when the event is emitted', async () => {
    const response = await makeMetadataApiRequest(
      {
        query: EMIT_APP_EVENT_MUTATION,
        variables: {
          input: { event: 'messageAdded', properties: { text: 'Hello' } },
        },
      },
      applicationToken,
    );

    expect(response.body.errors).toBeUndefined();

    const { id, occurredAt } = response.body.data.emitAppEvent;

    await waitForAllJobsToFinish();

    await expectEventually(() => {
      expect(readExecutions()).toEqual([
        {
          id,
          type: 'messageAdded',
          occurredAt,
          properties: { text: 'Hello' },
        },
      ]);
    });
  });

  it('fails the emission when the application cannot enqueue more jobs', async () => {
    const twentyConfigService = getAppProviderByClassName<TwentyConfigService>(
      'TwentyConfigService',
    );
    const readConfig = twentyConfigService.get.bind(twentyConfigService);
    const configSpy = jest
      .spyOn(twentyConfigService, 'get')
      .mockImplementation((key) =>
        key === 'APPLICATION_JOB_ENQUEUE_RATE_LIMITING_LIMIT'
          ? 0
          : readConfig(key),
      );

    try {
      const response = await makeMetadataApiRequest(
        {
          query: EMIT_APP_EVENT_MUTATION,
          variables: {
            input: { event: 'messageAdded', properties: { text: 'Again' } },
          },
        },
        applicationToken,
      );

      expect(response.body.errors?.[0]?.extensions?.code).toBe(
        'BAD_USER_INPUT',
      );
    } finally {
      configSpy.mockRestore();
    }
  });

  it('refuses a trigger on an event the application does not declare', async () => {
    await syncWithTrigger({
      eventUniversalIdentifier: uuidv4(),
      expectToFail: true,
    });
  });
});
