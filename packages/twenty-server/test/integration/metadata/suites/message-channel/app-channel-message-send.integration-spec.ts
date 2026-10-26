import { createHash } from 'crypto';
import { existsSync, mkdtempSync, readFileSync, rmSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

import { gql } from 'graphql-tag';
import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import { uploadApplicationFile } from 'test/integration/metadata/suites/application/utils/upload-application-file.util';
import { findConnectionProvidersByApplication } from 'test/integration/metadata/suites/connection-provider/utils/find-connection-providers-by-application.util';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { generateAppleAdminApplicationTokenPair } from 'test/integration/utils/generate-apple-admin-application-token-pair.util';
import { type SendAppMessagePayload } from 'twenty-shared/application';
import {
  ConnectedAccountProvider,
  MessageChannelVisibility,
  MessageParticipantRole,
} from 'twenty-shared/types';
import { assertIsDefinedOrThrow, isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { USER_WORKSPACE_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-user-workspaces.util';
import { MessageDirection } from 'src/modules/messaging/common/enums/message-direction.enum';

const APPLICATION_IDENTIFIER = v4();
const SENDING_PROVIDER_IDENTIFIER = v4();
const SILENT_PROVIDER_IDENTIFIER = v4();
const SEND_MESSAGE_IDENTIFIER = v4();
const MESSAGING_PROVIDER_IDENTIFIER = v4();

const WORKSPACE_SCHEMA = getWorkspaceSchemaName(SEED_APPLE_WORKSPACE_ID);

const CHANNEL_HANDLE = 'urn:li:person:jane';
const CONTACT_HANDLE = 'urn:li:person:ada';
const THREAD_EXTERNAL_ID = 'urn:li:conversation:1';

const CREATE_CHANNEL_MUTATION = gql`
  mutation CreateAppMessageChannel($input: CreateAppMessageChannelInput!) {
    createAppMessageChannel(input: $input) {
      id
    }
  }
`;

const UPDATE_CHANNEL_MUTATION = gql`
  mutation UpdateAppMessageChannel($input: UpdateAppMessageChannelInput!) {
    updateAppMessageChannel(input: $input) {
      id
    }
  }
`;

const INGEST_MESSAGES_MUTATION = gql`
  mutation IngestAppMessages($input: IngestAppMessagesInput!) {
    ingestAppMessages(input: $input) {
      messages {
        messageId
        messageThreadId
      }
    }
  }
`;

const SEND_MESSAGE_MUTATION = gql`
  mutation SendAppChannelMessage($input: SendAppChannelMessageInput!) {
    sendAppChannelMessage(input: $input) {
      messageId
      messageThreadId
    }
  }
`;

describe('sendAppChannelMessage (e2e)', () => {
  let fixtureDirectory: string;
  let sendExecutionsPath: string;
  let applicationToken: string;
  let applicationDbId: string;
  let sendingConnectionId: string;
  let silentConnectionId: string;

  const readSendExecutions = (): SendAppMessagePayload[] => {
    if (!existsSync(sendExecutionsPath)) {
      return [];
    }

    return readFileSync(sendExecutionsPath, 'utf8')
      .trim()
      .split('\n')
      .map((line) => JSON.parse(line));
  };

  const asApplication = (
    operation: Parameters<typeof makeMetadataApiRequest>[0],
  ) => makeMetadataApiRequest(operation, applicationToken);

  const createChannel = ({
    connectedAccountId,
    messagingProviderUniversalIdentifier,
  }: {
    connectedAccountId: string;
    messagingProviderUniversalIdentifier?: string;
  }) =>
    asApplication({
      query: CREATE_CHANNEL_MUTATION,
      variables: {
        input: {
          connectedAccountId,
          handle: CHANNEL_HANDLE,
          displayName: 'Jane Doe',
          visibility: MessageChannelVisibility.SHARE_EVERYTHING,
          messagingProviderUniversalIdentifier,
        },
      },
    });

  const bindChannel = ({
    messageChannelId,
    messagingProviderUniversalIdentifier,
  }: {
    messageChannelId: string;
    messagingProviderUniversalIdentifier: string | null;
  }) =>
    asApplication({
      query: UPDATE_CHANNEL_MUTATION,
      variables: {
        input: { id: messageChannelId, messagingProviderUniversalIdentifier },
      },
    });

  const startConversation = async ({
    connectedAccountId,
    messagingProviderUniversalIdentifier,
  }: {
    connectedAccountId: string;
    messagingProviderUniversalIdentifier?: string;
  }) => {
    const channelResponse = await createChannel({
      connectedAccountId,
      messagingProviderUniversalIdentifier,
    });

    expect(channelResponse.body.errors).toBeUndefined();

    const messageChannelId: string =
      channelResponse.body.data.createAppMessageChannel.id;

    const ingestResponse = await asApplication({
      query: INGEST_MESSAGES_MUTATION,
      variables: {
        input: {
          messageChannelId,
          messages: [
            {
              externalId: 'inbound-1',
              threadExternalId: THREAD_EXTERNAL_ID,
              text: 'Are you free next week?',
              receivedAt: '2026-10-20T10:00:00.000Z',
              participants: [
                {
                  role: MessageParticipantRole.FROM,
                  handle: CONTACT_HANDLE,
                  displayName: 'Ada Lovelace',
                },
                {
                  role: MessageParticipantRole.TO,
                  handle: CHANNEL_HANDLE,
                  displayName: 'Jane Doe',
                },
              ],
            },
          ],
        },
      },
    });

    expect(ingestResponse.body.errors).toBeUndefined();

    const [{ messageThreadId }]: { messageThreadId: string }[] =
      ingestResponse.body.data.ingestAppMessages.messages;

    return { messageChannelId, messageThreadId };
  };

  const send = ({
    idempotencyKey = v4(),
    ...input
  }: {
    messageChannelId: string;
    messageThreadId: string;
    text: string;
    idempotencyKey?: string;
  }) =>
    makeMetadataApiRequest({
      query: SEND_MESSAGE_MUTATION,
      variables: { input: { ...input, idempotencyKey } },
    });

  const insertConnection = async (connectionProviderId: string) => {
    const id = v4();

    await globalThis.testDataSource.query(
      `INSERT INTO core."connectedAccount"
         (id, handle, provider, scope, "workspaceId", "userWorkspaceId",
          "applicationId", "connectionProviderId")
       VALUES ($1, $2, $3, 'WORKSPACE', $4, $5, $6, $7)`,
      [
        id,
        CHANNEL_HANDLE,
        ConnectedAccountProvider.APP,
        SEED_APPLE_WORKSPACE_ID,
        USER_WORKSPACE_DATA_SEED_IDS.JANE,
        applicationDbId,
        connectionProviderId,
      ],
    );

    return id;
  };

  beforeAll(async () => {
    fixtureDirectory = mkdtempSync(join(tmpdir(), 'app-channel-send-'));
    sendExecutionsPath = join(fixtureDirectory, 'send-executions');

    await setupApplicationForSync({
      applicationUniversalIdentifier: APPLICATION_IDENTIFIER,
      name: 'App channel send integration',
      description: 'Replies sent through an app message channel',
      sourcePath: 'app-channel-send-integration',
    });
    jest.useRealTimers();

    const sendMessageSource = `import { appendFileSync } from 'node:fs';
export const handler = (payload) => {
  appendFileSync(${JSON.stringify(sendExecutionsPath)}, JSON.stringify(payload) + '\\n');
  if (payload.text === 'refused') throw new Error('provider refused the message');
  return { externalId: 'sent:' + payload.text, sentAt: '2026-10-21T10:00:00.000Z' };
};`;

    const uploaded = await uploadApplicationFile({
      applicationUniversalIdentifier: APPLICATION_IDENTIFIER,
      fileFolder: 'BuiltLogicFunction',
      filePath: 'dist/send-message.mjs',
      filename: 'send-message.mjs',
      contentType: 'application/javascript',
      fileBuffer: Buffer.from(sendMessageSource),
    });

    expect(uploaded.errors).toBeUndefined();

    const oauth = {
      authorizationEndpoint: 'https://provider.example.com/authorize',
      tokenEndpoint: 'https://provider.example.com/token',
      scopes: [],
      clientIdVariable: 'CLIENT_ID',
      clientSecretVariable: 'CLIENT_SECRET',
    };

    const { errors } = await syncApplication({
      manifest: buildBaseManifest({
        appId: APPLICATION_IDENTIFIER,
        roleId: v4(),
        overrides: {
          logicFunctions: [
            {
              universalIdentifier: SEND_MESSAGE_IDENTIFIER,
              name: 'send-message',
              handlerName: 'handler',
              sourceHandlerPath: 'src/send-message.ts',
              builtHandlerPath: 'dist/send-message.mjs',
              builtHandlerChecksum: createHash('sha256')
                .update(sendMessageSource)
                .digest('hex'),
              timeoutSeconds: 10,
            },
          ],
          connectionProviders: [
            {
              universalIdentifier: SENDING_PROVIDER_IDENTIFIER,
              name: 'sending',
              displayName: 'Sending',
              type: 'oauth',
              oauth,
            },
            {
              universalIdentifier: SILENT_PROVIDER_IDENTIFIER,
              name: 'silent',
              displayName: 'Silent',
              type: 'oauth',
              oauth,
            },
          ],
          messagingProviders: [
            {
              universalIdentifier: MESSAGING_PROVIDER_IDENTIFIER,
              name: 'linkedin-messaging',
              displayName: 'LinkedIn Messages',
              connectionProvider: {
                universalIdentifier: SENDING_PROVIDER_IDENTIFIER,
              },
              sendMessageLogicFunction: {
                universalIdentifier: SEND_MESSAGE_IDENTIFIER,
              },
            },
          ],
        },
      }),
    });

    expect(errors).toBeUndefined();
    jest.useRealTimers();

    const providers = await findConnectionProvidersByApplication(
      APPLICATION_IDENTIFIER,
    );
    const findProviderId = (name: string): string => {
      const provider = providers.find(
        (connectionProvider) => connectionProvider.name === name,
      );

      assertIsDefinedOrThrow(provider);

      return provider.id;
    };

    applicationDbId = providers[0].applicationId;

    const tokenPair = await generateAppleAdminApplicationTokenPair({
      applicationId: applicationDbId,
    });

    applicationToken = tokenPair.applicationAccessToken.token;

    sendingConnectionId = await insertConnection(findProviderId('sending'));
    silentConnectionId = await insertConnection(findProviderId('silent'));
  }, 180000);

  beforeEach(() => {
    rmSync(sendExecutionsPath, { force: true });
  });

  afterEach(async () => {
    const messages: { id: string; messageThreadId: string | null }[] =
      await globalThis.testDataSource.query(
        `SELECT id, "messageThreadId" FROM "${WORKSPACE_SCHEMA}"."message"
           WHERE "headerMessageId" LIKE $1`,
        [`app:${applicationDbId}:%`],
      );
    const messageIds = messages.map((message) => message.id);
    const messageThreadIds = [
      ...new Set(
        messages.map((message) => message.messageThreadId).filter(isDefined),
      ),
    ];

    for (const table of [
      'messageChannelMessageAssociation',
      'messageParticipant',
    ]) {
      await globalThis.testDataSource.query(
        `DELETE FROM "${WORKSPACE_SCHEMA}"."${table}" WHERE "messageId" = ANY($1)`,
        [messageIds],
      );
    }
    await globalThis.testDataSource.query(
      `DELETE FROM "${WORKSPACE_SCHEMA}"."message" WHERE id = ANY($1)`,
      [messageIds],
    );
    await globalThis.testDataSource.query(
      `DELETE FROM "${WORKSPACE_SCHEMA}"."messageThreadTarget" WHERE "messageThreadId" = ANY($1)`,
      [messageThreadIds],
    );
    await globalThis.testDataSource.query(
      `DELETE FROM "${WORKSPACE_SCHEMA}"."messageThread" WHERE id = ANY($1)`,
      [messageThreadIds],
    );
    await globalThis.testDataSource.query(
      `DELETE FROM core."messageChannel" WHERE "connectedAccountId" = ANY($1)`,
      [[sendingConnectionId, silentConnectionId]],
    );
  });

  afterAll(async () => {
    await globalThis.testDataSource.query(
      `DELETE FROM core."connectedAccount" WHERE "applicationId" = $1`,
      [applicationDbId],
    );
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: APPLICATION_IDENTIFIER,
    });
    rmSync(fixtureDirectory, { recursive: true, force: true });
  }, 120000);

  it('sends through the app and records the reply in the same thread', async () => {
    const { messageChannelId, messageThreadId } = await startConversation({
      connectedAccountId: sendingConnectionId,
      messagingProviderUniversalIdentifier: MESSAGING_PROVIDER_IDENTIFIER,
    });

    const response = await send({
      messageChannelId,
      messageThreadId,
      text: 'Tuesday works',
    });

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.sendAppChannelMessage.messageThreadId).toBe(
      messageThreadId,
    );
    expect(readSendExecutions()).toEqual([
      expect.objectContaining({
        messagingProviderName: 'linkedin-messaging',
        connectedAccountId: sendingConnectionId,
        messageChannelId,
        threadExternalId: THREAD_EXTERNAL_ID,
        text: 'Tuesday works',
        recipients: [{ handle: CONTACT_HANDLE, displayName: 'Ada Lovelace' }],
      }),
    ]);

    const [association] = await globalThis.testDataSource.query(
      `SELECT direction, "messageExternalId"
         FROM "${WORKSPACE_SCHEMA}"."messageChannelMessageAssociation"
        WHERE "messageId" = $1`,
      [response.body.data.sendAppChannelMessage.messageId],
    );

    expect(association).toEqual({
      direction: MessageDirection.OUTGOING,
      messageExternalId: 'sent:Tuesday works',
    });
  });

  it('keeps one message when the app later ingests the reply it sent', async () => {
    const { messageChannelId, messageThreadId } = await startConversation({
      connectedAccountId: sendingConnectionId,
      messagingProviderUniversalIdentifier: MESSAGING_PROVIDER_IDENTIFIER,
    });

    const sendResponse = await send({
      messageChannelId,
      messageThreadId,
      text: 'Tuesday works',
    });

    const echoResponse = await asApplication({
      query: INGEST_MESSAGES_MUTATION,
      variables: {
        input: {
          messageChannelId,
          messages: [
            {
              externalId: 'sent:Tuesday works',
              threadExternalId: THREAD_EXTERNAL_ID,
              text: 'Tuesday works',
              receivedAt: '2026-10-21T10:00:00.000Z',
              participants: [
                { role: MessageParticipantRole.FROM, handle: CHANNEL_HANDLE },
                { role: MessageParticipantRole.TO, handle: CONTACT_HANDLE },
              ],
            },
          ],
        },
      },
    });

    expect(echoResponse.body.data.ingestAppMessages.messages[0].messageId).toBe(
      sendResponse.body.data.sendAppChannelMessage.messageId,
    );

    const participants: { handle: string; role: string }[] =
      await globalThis.testDataSource.query(
        `SELECT handle, role FROM "${WORKSPACE_SCHEMA}"."messageParticipant"
          WHERE "messageId" = $1 ORDER BY role`,
        [sendResponse.body.data.sendAppChannelMessage.messageId],
      );

    expect(participants).toEqual([
      { handle: CHANNEL_HANDLE, role: MessageParticipantRole.FROM },
      { handle: CONTACT_HANDLE, role: MessageParticipantRole.TO },
    ]);
  });

  it('sends once and returns the recorded reply when retried with the same idempotency key', async () => {
    const { messageChannelId, messageThreadId } = await startConversation({
      connectedAccountId: sendingConnectionId,
      messagingProviderUniversalIdentifier: MESSAGING_PROVIDER_IDENTIFIER,
    });
    const idempotencyKey = v4();

    const firstResponse = await send({
      messageChannelId,
      messageThreadId,
      text: 'Tuesday works',
      idempotencyKey,
    });
    const retryResponse = await send({
      messageChannelId,
      messageThreadId,
      text: 'Tuesday works',
      idempotencyKey,
    });

    expect(retryResponse.body.errors).toBeUndefined();
    expect(retryResponse.body.data.sendAppChannelMessage.messageId).toBe(
      firstResponse.body.data.sendAppChannelMessage.messageId,
    );
    expect(readSendExecutions()).toEqual([
      expect.objectContaining({ text: 'Tuesday works', idempotencyKey }),
    ]);
  });

  it('replies to the latest message participants only, not to someone who left the conversation', async () => {
    const { messageChannelId, messageThreadId } = await startConversation({
      connectedAccountId: sendingConnectionId,
      messagingProviderUniversalIdentifier: MESSAGING_PROVIDER_IDENTIFIER,
    });

    const olderMessageResponse = await asApplication({
      query: INGEST_MESSAGES_MUTATION,
      variables: {
        input: {
          messageChannelId,
          messages: [
            {
              externalId: 'inbound-older',
              threadExternalId: THREAD_EXTERNAL_ID,
              text: 'Welcome Grace',
              receivedAt: '2026-10-19T10:00:00.000Z',
              participants: [
                { role: MessageParticipantRole.FROM, handle: CONTACT_HANDLE },
                { role: MessageParticipantRole.TO, handle: CHANNEL_HANDLE },
                {
                  role: MessageParticipantRole.TO,
                  handle: 'urn:li:person:grace',
                },
              ],
            },
          ],
        },
      },
    });

    expect(olderMessageResponse.body.errors).toBeUndefined();

    const response = await send({
      messageChannelId,
      messageThreadId,
      text: 'Tuesday works',
    });

    expect(response.body.errors).toBeUndefined();
    expect(readSendExecutions()).toEqual([
      expect.objectContaining({
        recipients: [{ handle: CONTACT_HANDLE, displayName: 'Ada Lovelace' }],
      }),
    ]);
  });

  it('takes recipients only from messages of the channel it replies through', async () => {
    const { messageChannelId, messageThreadId } = await startConversation({
      connectedAccountId: sendingConnectionId,
      messagingProviderUniversalIdentifier: MESSAGING_PROVIDER_IDENTIFIER,
    });

    const otherChannelResponse = await createChannel({
      connectedAccountId: silentConnectionId,
    });
    const otherMessageChannelId: string =
      otherChannelResponse.body.data.createAppMessageChannel.id;

    const otherIngestResponse = await asApplication({
      query: INGEST_MESSAGES_MUTATION,
      variables: {
        input: {
          messageChannelId: otherMessageChannelId,
          messages: [
            {
              externalId: 'other-channel-1',
              threadExternalId: 'urn:li:conversation:other',
              text: 'Newer message from another channel',
              receivedAt: '2026-10-22T10:00:00.000Z',
              participants: [
                {
                  role: MessageParticipantRole.FROM,
                  handle: 'urn:li:person:grace',
                },
                { role: MessageParticipantRole.TO, handle: CHANNEL_HANDLE },
              ],
            },
          ],
        },
      },
    });

    expect(otherIngestResponse.body.errors).toBeUndefined();

    const [otherMessage]: { messageId: string; messageThreadId: string }[] =
      otherIngestResponse.body.data.ingestAppMessages.messages;

    await globalThis.testDataSource.query(
      `UPDATE "${WORKSPACE_SCHEMA}"."message" SET "messageThreadId" = $1 WHERE id = $2`,
      [messageThreadId, otherMessage.messageId],
    );
    await globalThis.testDataSource.query(
      `DELETE FROM "${WORKSPACE_SCHEMA}"."messageThreadTarget" WHERE "messageThreadId" = $1`,
      [otherMessage.messageThreadId],
    );
    await globalThis.testDataSource.query(
      `DELETE FROM "${WORKSPACE_SCHEMA}"."messageThread" WHERE id = $1`,
      [otherMessage.messageThreadId],
    );

    const response = await send({
      messageChannelId,
      messageThreadId,
      text: 'Tuesday works',
    });

    expect(response.body.errors).toBeUndefined();
    expect(readSendExecutions()).toEqual([
      expect.objectContaining({
        threadExternalId: THREAD_EXTERNAL_ID,
        recipients: [{ handle: CONTACT_HANDLE, displayName: 'Ada Lovelace' }],
      }),
    ]);
  });

  it('records nothing when the app fails to send', async () => {
    const { messageChannelId, messageThreadId } = await startConversation({
      connectedAccountId: sendingConnectionId,
      messagingProviderUniversalIdentifier: MESSAGING_PROVIDER_IDENTIFIER,
    });

    const response = await send({
      messageChannelId,
      messageThreadId,
      text: 'refused',
    });

    expect(response.body.errors).toBeDefined();

    const [{ count }] = await globalThis.testDataSource.query(
      `SELECT COUNT(*)::int AS count FROM "${WORKSPACE_SCHEMA}"."message" WHERE "messageThreadId" = $1`,
      [messageThreadId],
    );

    expect(count).toBe(1);
  });

  it('refuses a channel whose sync is turned off without calling the app', async () => {
    const { messageChannelId, messageThreadId } = await startConversation({
      connectedAccountId: sendingConnectionId,
      messagingProviderUniversalIdentifier: MESSAGING_PROVIDER_IDENTIFIER,
    });

    await asApplication({
      query: UPDATE_CHANNEL_MUTATION,
      variables: { input: { id: messageChannelId, isSyncEnabled: false } },
    });

    const response = await send({
      messageChannelId,
      messageThreadId,
      text: 'Tuesday works',
    });

    expect(response.body.errors).toBeDefined();
    expect(readSendExecutions()).toEqual([]);
  });

  it('sends only while the channel is bound to a messaging provider', async () => {
    const { messageChannelId, messageThreadId } = await startConversation({
      connectedAccountId: sendingConnectionId,
    });

    const unboundResponse = await send({
      messageChannelId,
      messageThreadId,
      text: 'Tuesday works',
    });

    expect(unboundResponse.body.errors?.[0]?.extensions?.code).toBe(
      'NOT_FOUND',
    );

    const bindResponse = await bindChannel({
      messageChannelId,
      messagingProviderUniversalIdentifier: MESSAGING_PROVIDER_IDENTIFIER,
    });

    expect(bindResponse.body.errors).toBeUndefined();

    const boundResponse = await send({
      messageChannelId,
      messageThreadId,
      text: 'Tuesday works',
    });

    expect(boundResponse.body.errors).toBeUndefined();

    await bindChannel({
      messageChannelId,
      messagingProviderUniversalIdentifier: null,
    });

    const unboundAgainResponse = await send({
      messageChannelId,
      messageThreadId,
      text: 'Wednesday works',
    });

    expect(unboundAgainResponse.body.errors?.[0]?.extensions?.code).toBe(
      'NOT_FOUND',
    );
    expect(readSendExecutions()).toHaveLength(1);
  });

  it('refuses a messaging provider that uses another connection provider', async () => {
    const response = await createChannel({
      connectedAccountId: silentConnectionId,
      messagingProviderUniversalIdentifier: MESSAGING_PROVIDER_IDENTIFIER,
    });

    expect(response.body.errors?.[0]?.extensions?.code).toBe('BAD_USER_INPUT');
  });
});
