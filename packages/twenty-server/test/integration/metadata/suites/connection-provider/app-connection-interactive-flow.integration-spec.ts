import { createHash } from 'crypto';

import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import { uploadApplicationFile } from 'test/integration/metadata/suites/application/utils/upload-application-file.util';
import { continueInteractiveConnectionQueryFactory } from 'test/integration/metadata/suites/connection-provider/utils/continue-interactive-connection-query-factory.util';
import { startInteractiveConnectionQueryFactory } from 'test/integration/metadata/suites/connection-provider/utils/start-interactive-connection-query-factory.util';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { type MarkerServer } from 'test/integration/types/marker-server.type';
import { startMarkerServer } from 'test/integration/utils/start-marker-server.util';
import { waitForAllJobsToFinish } from 'test/integration/utils/wait-for-all-jobs-to-finish.util';
import { v4 } from 'uuid';

import { type ConnectionProviderEntity } from 'src/engine/core-modules/application/connection-provider/connection-provider.entity';
import { type ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';

const APPLICATION_IDENTIFIER = v4();
const ROLE_IDENTIFIER = v4();
const PROVIDER_IDENTIFIER = v4();
const STEP_IDENTIFIER = v4();
const QR_PROVIDER_IDENTIFIER = v4();
const QR_STEP_IDENTIFIER = v4();
const ON_CONNECT_IDENTIFIER = v4();

const STEP_SOURCE = `const credentialsScreen = (error) => ({
  type: 'form',
  title: 'Sign in',
  fields: [
    { key: 'email', label: 'Email', kind: 'email' },
    { key: 'password', label: 'Password', kind: 'password' },
  ],
  ...(error ? { error } : {}),
});

export const handler = ({ trigger, state, values }) => {
  if (trigger === 'start') {
    return { type: 'screen', state: { step: 'credentials' }, screen: credentialsScreen() };
  }
  if (trigger === 'cancel') {
    return { type: 'cancelled' };
  }
  if (state.step === 'credentials') {
    if (values.password !== 'right-password') {
      return { type: 'screen', state, screen: credentialsScreen('Wrong email or password.') };
    }
    return {
      type: 'screen',
      state: { step: 'approval', email: values.email },
      screen: { type: 'waiting', title: 'Approve the sign-in', pollIntervalSeconds: 3 },
    };
  }
  return { type: 'done', externalAccountId: 'account-' + state.email, handle: state.email };
};`;

const QR_STEP_SOURCE = `export const handler = ({ trigger, state }) => {
  if (trigger === 'cancel') {
    return { type: 'cancelled' };
  }
  const pollCount = trigger === 'start' ? 0 : state.pollCount + 1;
  if (pollCount === 2) {
    return { type: 'done', externalAccountId: 'whatsapp-account', handle: '+33 6 12 34 56 78' };
  }
  return {
    type: 'screen',
    state: { pollCount },
    screen: {
      type: 'qr-code',
      title: 'Scan with WhatsApp',
      data: 'whatsapp-qr-' + pollCount,
      pollIntervalSeconds: 5,
    },
  };
};`;

describe('app connection interactive flow', () => {
  let provider: ConnectionProviderEntity;
  let qrProvider: ConnectionProviderEntity;
  let markerServer: MarkerServer;
  let onConnectExecutionsUrl: string;

  const readOnConnectExecutions = (): string[] =>
    markerServer.hasMarker(onConnectExecutionsUrl)
      ? markerServer.readMarker(onConnectExecutionsUrl).trim().split('\n')
      : [];

  const readAccounts = (): Promise<ConnectedAccountEntity[]> =>
    globalThis.testDataSource.query(
      'SELECT * FROM core."connectedAccount" WHERE "connectionProviderId" = $1 ORDER BY "createdAt", id',
      [provider.id],
    );

  const start = ({
    token,
    reconnectingConnectedAccountId,
    providerName = provider.name,
  }: {
    token?: string;
    reconnectingConnectedAccountId?: string;
    providerName?: string;
  } = {}) =>
    makeMetadataApiRequest(
      startInteractiveConnectionQueryFactory({
        input: {
          applicationId: provider.applicationId,
          providerName,
          reconnectingConnectedAccountId,
        },
      }),
      token,
    );

  const continueFlow = async (input: {
    flowId: string;
    action: 'SUBMIT' | 'POLL' | 'CANCEL';
    values?: Record<string, string>;
  }) => {
    const response = await makeMetadataApiRequest(
      continueInteractiveConnectionQueryFactory({ input }),
    );

    await waitForAllJobsToFinish();

    return response;
  };

  const startFlowId = async (
    reconnectingConnectedAccountId?: string,
  ): Promise<string> => {
    const response = await start({ reconnectingConnectedAccountId });

    expect(response.body.errors).toBeUndefined();

    return response.body.data.startInteractiveConnection.flowId;
  };

  const advanceToApproval = async (flowId: string) => {
    const response = await continueFlow({
      flowId,
      action: 'SUBMIT',
      values: { email: 'marie@acme.com', password: 'right-password' },
    });

    expect(response.body.data.continueInteractiveConnection.status).toBe(
      'IN_PROGRESS',
    );
  };

  beforeAll(async () => {
    markerServer = await startMarkerServer();
    onConnectExecutionsUrl = markerServer.markerUrl('on-connect-executions');

    await setupApplicationForSync({
      applicationUniversalIdentifier: APPLICATION_IDENTIFIER,
      name: 'Interactive flow integration',
      description: 'Interactive connection flow',
      sourcePath: 'interactive-flow-integration',
    });
    jest.useRealTimers();

    const functions = [
      {
        universalIdentifier: STEP_IDENTIFIER,
        name: 'connection-step',
        source: STEP_SOURCE,
      },
      {
        universalIdentifier: QR_STEP_IDENTIFIER,
        name: 'qr-connection-step',
        source: QR_STEP_SOURCE,
      },
      {
        universalIdentifier: ON_CONNECT_IDENTIFIER,
        name: 'on-connect',
        source: `export const handler = async ({ connectedAccountId }) => {
  await fetch(${JSON.stringify(onConnectExecutionsUrl)}, { method: 'POST', body: connectedAccountId + '\\n' });
};`,
      },
    ];

    for (const logicFunction of functions) {
      const uploaded = await uploadApplicationFile({
        applicationUniversalIdentifier: APPLICATION_IDENTIFIER,
        fileFolder: 'BuiltLogicFunction',
        filePath: `dist/${logicFunction.name}.mjs`,
        filename: `${logicFunction.name}.mjs`,
        contentType: 'application/javascript',
        fileBuffer: Buffer.from(logicFunction.source),
      });

      expect(uploaded.errors).toBeUndefined();
    }

    const { errors } = await syncApplication({
      manifest: buildBaseManifest({
        appId: APPLICATION_IDENTIFIER,
        roleId: ROLE_IDENTIFIER,
        overrides: {
          logicFunctions: functions.map((logicFunction) => ({
            universalIdentifier: logicFunction.universalIdentifier,
            name: logicFunction.name,
            handlerName: 'handler',
            sourceHandlerPath: `src/${logicFunction.name}.ts`,
            builtHandlerPath: `dist/${logicFunction.name}.mjs`,
            builtHandlerChecksum: createHash('sha256')
              .update(logicFunction.source)
              .digest('hex'),
            timeoutSeconds: 10,
          })),
          connectionProviders: [
            {
              universalIdentifier: PROVIDER_IDENTIFIER,
              name: 'interactive-provider',
              displayName: 'Interactive provider',
              type: 'interactive',
              scope: 'USER',
              interactive: {
                stepLogicFunctionUniversalIdentifier: STEP_IDENTIFIER,
              },
              onConnectLogicFunctionUniversalIdentifier: ON_CONNECT_IDENTIFIER,
            },
            {
              universalIdentifier: QR_PROVIDER_IDENTIFIER,
              name: 'interactive-qr-provider',
              displayName: 'Interactive QR provider',
              type: 'interactive',
              scope: 'USER',
              interactive: {
                stepLogicFunctionUniversalIdentifier: QR_STEP_IDENTIFIER,
              },
            },
          ],
        },
      }),
    });

    expect(errors).toBeUndefined();
    jest.useRealTimers();
    [provider] = await globalThis.testDataSource.query(
      'SELECT * FROM core."connectionProvider" WHERE "universalIdentifier" = $1',
      [PROVIDER_IDENTIFIER],
    );
    [qrProvider] = await globalThis.testDataSource.query(
      'SELECT * FROM core."connectionProvider" WHERE "universalIdentifier" = $1',
      [QR_PROVIDER_IDENTIFIER],
    );
  }, 120000);

  beforeEach(() => {
    markerServer.clearMarker(onConnectExecutionsUrl);
  });

  afterEach(async () => {
    await globalThis.testDataSource.query(
      'DELETE FROM core."connectedAccount" WHERE "applicationId" = $1',
      [provider.applicationId],
    );
  });

  afterAll(async () => {
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: APPLICATION_IDENTIFIER,
    });
    await markerServer.close();
  });

  it('stores the step logic function in interactiveConfig', () => {
    expect(provider).toMatchObject({
      type: 'interactive',
      oauthConfig: null,
      customConfig: null,
      oauthDiscoveryConfig: null,
      interactiveConfig: {
        stepLogicFunctionUniversalIdentifier: STEP_IDENTIFIER,
      },
    });
  });

  it('walks the member through the app screens and connects the account', async () => {
    const startResponse = await start();

    expect(startResponse.body.errors).toBeUndefined();
    expect(startResponse.body.data.startInteractiveConnection).toMatchObject({
      status: 'IN_PROGRESS',
      connectedAccountId: null,
      screen: { type: 'form', title: 'Sign in' },
    });

    const { flowId } = startResponse.body.data.startInteractiveConnection;

    const wrongPasswordResponse = await continueFlow({
      flowId,
      action: 'SUBMIT',
      values: { email: 'marie@acme.com', password: 'wrong' },
    });

    expect(
      wrongPasswordResponse.body.data.continueInteractiveConnection,
    ).toMatchObject({
      status: 'IN_PROGRESS',
      flowId,
      screen: { type: 'form', error: 'Wrong email or password.' },
    });

    const approvalResponse = await continueFlow({
      flowId,
      action: 'SUBMIT',
      values: { email: 'marie@acme.com', password: 'right-password' },
    });

    expect(
      approvalResponse.body.data.continueInteractiveConnection,
    ).toMatchObject({
      status: 'IN_PROGRESS',
      screen: { type: 'waiting', pollIntervalSeconds: 3 },
    });
    expect(await readAccounts()).toHaveLength(0);

    const connectedResponse = await continueFlow({ flowId, action: 'POLL' });
    const [connection] = await readAccounts();

    expect(connectedResponse.body.errors).toBeUndefined();
    expect(connectedResponse.body.data.continueInteractiveConnection).toEqual({
      status: 'CONNECTED',
      flowId: null,
      screen: null,
      connectedAccountId: connection.id,
    });
    expect(connection).toMatchObject({
      provider: 'app',
      externalAccountId: 'account-marie@acme.com',
      handle: 'marie@acme.com',
      accessToken: null,
      scope: 'USER',
    });
    expect(readOnConnectExecutions()).toEqual([connection.id]);

    const replayResponse = await continueFlow({ flowId, action: 'POLL' });

    expect(replayResponse.body.errors?.[0]?.extensions?.code).toBe(
      'BAD_USER_INPUT',
    );
  });

  it('refuses values the current screen did not ask for', async () => {
    const flowId = await startFlowId();

    const response = await continueFlow({
      flowId,
      action: 'SUBMIT',
      values: { email: 'marie@acme.com', token: 'unexpected' },
    });

    expect(response.body.errors?.[0]?.extensions?.code).toBe('BAD_USER_INPUT');
  });

  it('refuses to poll a form screen', async () => {
    const flowId = await startFlowId();

    const response = await continueFlow({ flowId, action: 'POLL' });

    expect(response.body.errors?.[0]?.extensions?.code).toBe('BAD_USER_INPUT');
  });

  it('ends the flow on cancel', async () => {
    const flowId = await startFlowId();

    const cancelResponse = await continueFlow({ flowId, action: 'CANCEL' });

    expect(cancelResponse.body.data.continueInteractiveConnection).toEqual({
      status: 'CANCELLED',
      flowId: null,
      screen: null,
      connectedAccountId: null,
    });

    const submitResponse = await continueFlow({
      flowId,
      action: 'SUBMIT',
      values: { email: 'marie@acme.com', password: 'right-password' },
    });

    expect(submitResponse.body.errors?.[0]?.extensions?.code).toBe(
      'BAD_USER_INPUT',
    );
    expect(await readAccounts()).toHaveLength(0);
  });

  it('refuses callers that are not a member session', async () => {
    const response = await start({ token: API_KEY_ACCESS_TOKEN });

    expect(response.body.errors).toBeDefined();
  });

  it('creates a single connection when two flows complete for the same account', async () => {
    const [firstFlowId, secondFlowId] = [
      await startFlowId(),
      await startFlowId(),
    ];

    await advanceToApproval(firstFlowId);
    await advanceToApproval(secondFlowId);

    const responses = await Promise.all([
      continueFlow({ flowId: firstFlowId, action: 'POLL' }),
      continueFlow({ flowId: secondFlowId, action: 'POLL' }),
    ]);
    const accounts = await readAccounts();

    expect(
      responses.map(
        (response) => response.body.data.continueInteractiveConnection.status,
      ),
    ).toEqual(['CONNECTED', 'CONNECTED']);
    expect(accounts).toHaveLength(1);
    expect(readOnConnectExecutions()).toEqual([accounts[0].id]);
  });

  it('does not reactivate an account disconnected after the flow started', async () => {
    const firstFlowId = await startFlowId();

    await advanceToApproval(firstFlowId);
    await continueFlow({ flowId: firstFlowId, action: 'POLL' });
    const [connection] = await readAccounts();

    const reconnectFlowId = await startFlowId(connection.id);

    await advanceToApproval(reconnectFlowId);
    await globalThis.testDataSource.query(
      `UPDATE core."connectedAccount" SET "archivedAt" = NOW() + interval '5 seconds' WHERE id = $1`,
      [connection.id],
    );

    const response = await continueFlow({
      flowId: reconnectFlowId,
      action: 'POLL',
    });
    const [account] = await readAccounts();

    expect(response.body.errors?.[0]?.extensions?.code).toBe('BAD_USER_INPUT');
    expect(account.archivedAt).not.toBeNull();
  });

  it('refreshes the QR code on each poll until the phone links the account', async () => {
    const startResponse = await start({ providerName: qrProvider.name });
    const { flowId, screen } =
      startResponse.body.data.startInteractiveConnection;

    expect(screen).toEqual({
      type: 'qr-code',
      title: 'Scan with WhatsApp',
      data: 'whatsapp-qr-0',
      pollIntervalSeconds: 5,
    });

    const submitResponse = await continueFlow({
      flowId,
      action: 'SUBMIT',
      values: {},
    });

    expect(submitResponse.body.errors?.[0]?.extensions?.code).toBe(
      'BAD_USER_INPUT',
    );

    const refreshedResponse = await continueFlow({ flowId, action: 'POLL' });

    expect(
      refreshedResponse.body.data.continueInteractiveConnection,
    ).toMatchObject({
      status: 'IN_PROGRESS',
      flowId,
      screen: { type: 'qr-code', data: 'whatsapp-qr-1' },
    });

    const connectedResponse = await continueFlow({ flowId, action: 'POLL' });
    const [account] = await globalThis.testDataSource.query(
      'SELECT * FROM core."connectedAccount" WHERE "connectionProviderId" = $1',
      [qrProvider.id],
    );

    expect(connectedResponse.body.data.continueInteractiveConnection).toEqual({
      status: 'CONNECTED',
      flowId: null,
      screen: null,
      connectedAccountId: account.id,
    });
    expect(account).toMatchObject({
      externalAccountId: 'whatsapp-account',
      handle: '+33 6 12 34 56 78',
    });
  });
});
