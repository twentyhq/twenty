import { createHash } from 'crypto';

import { gql } from 'graphql-tag';
import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import { uploadApplicationFile } from 'test/integration/metadata/suites/application/utils/upload-application-file.util';
import { findConnectionProvidersByApplication } from 'test/integration/metadata/suites/connection-provider/utils/find-connection-providers-by-application.util';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { type MarkerServer } from 'test/integration/types/marker-server.type';
import { generateAppleAdminApplicationTokenPair } from 'test/integration/utils/generate-apple-admin-application-token-pair.util';
import { startMarkerServer } from 'test/integration/utils/start-marker-server.util';
import { type StartAppConversationPayload } from 'twenty-shared/application';
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
import { PERSON_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/person-data-seeds.constant';

const APPLICATION_IDENTIFIER = v4();
const CONNECTION_PROVIDER_IDENTIFIER = v4();
const SEND_MESSAGE_IDENTIFIER = v4();
const START_CONVERSATION_IDENTIFIER = v4();
const MESSAGING_PROVIDER_IDENTIFIER = v4();

const WORKSPACE_SCHEMA = getWorkspaceSchemaName(SEED_APPLE_WORKSPACE_ID);

const CHANNEL_HANDLE = 'urn:li:person:jane';
const PERSON_ID = PERSON_DATA_SEED_IDS.ID_1;
const PERSON_HANDLE = `urn:li:person:${PERSON_ID}`;

const CREATE_CHANNEL_MUTATION = gql`
  mutation CreateAppMessageChannel($input: CreateAppMessageChannelInput!) {
    createAppMessageChannel(input: $input) {
      id
    }
  }
`;

const START_CONVERSATION_MUTATION = gql`
  mutation StartAppChannelConversation(
    $input: StartAppChannelConversationInput!
  ) {
    startAppChannelConversation(input: $input) {
      messageId
      messageThreadId
    }
  }
`;

describe('startAppChannelConversation (e2e)', () => {
  let markerServer: MarkerServer;
  let startExecutionsUrl: string;
  let applicationToken: string;
  let applicationDbId: string;
  let janeConnectionId: string;

  const readStartExecutions = (): StartAppConversationPayload[] => {
    if (!markerServer.hasMarker(startExecutionsUrl)) {
      return [];
    }

    return markerServer
      .readMarker(startExecutionsUrl)
      .trim()
      .split('\n')
      .map((line) => JSON.parse(line));
  };

  const createChannel = async (): Promise<string> => {
    const response = await makeMetadataApiRequest(
      {
        query: CREATE_CHANNEL_MUTATION,
        variables: {
          input: {
            connectedAccountId: janeConnectionId,
            handle: CHANNEL_HANDLE,
            displayName: 'Jane Doe',
            visibility: MessageChannelVisibility.SHARE_EVERYTHING,
            messagingProviderUniversalIdentifier: MESSAGING_PROVIDER_IDENTIFIER,
          },
        },
      },
      applicationToken,
    );

    expect(response.body.errors).toBeUndefined();

    return response.body.data.createAppMessageChannel.id;
  };

  const startConversation = ({
    token,
    idempotencyKey = v4(),
    ...input
  }: {
    messageChannelId: string;
    personId: string;
    text: string;
    idempotencyKey?: string;
    token?: string;
  }) =>
    makeMetadataApiRequest(
      {
        query: START_CONVERSATION_MUTATION,
        variables: { input: { ...input, idempotencyKey } },
      },
      token,
    );

  beforeAll(async () => {
    markerServer = await startMarkerServer();
    startExecutionsUrl = markerServer.markerUrl('start-executions');

    await setupApplicationForSync({
      applicationUniversalIdentifier: APPLICATION_IDENTIFIER,
      name: 'App channel conversation start integration',
      description: 'Conversations started through an app message channel',
      sourcePath: 'app-channel-conversation-start-integration',
    });
    jest.useRealTimers();

    const sendMessageSource = `export const handler = async () => {
  throw new Error('replies are not part of this suite');
};`;
    const startConversationSource = `export const handler = async (payload) => {
  await fetch(${JSON.stringify(startExecutionsUrl)}, { method: 'POST', body: JSON.stringify(payload) + '\\n' });
  return {
    externalId: 'started:' + payload.idempotencyKey,
    threadExternalId: 'thread:' + payload.idempotencyKey,
    sentAt: '2026-10-21T10:00:00.000Z',
    recipients: payload.recipients.map((recipient) => ({
      personId: recipient.personId,
      handle: 'urn:li:person:' + recipient.personId,
    })),
  };
};`;

    for (const [name, source] of [
      ['send-message', sendMessageSource],
      ['start-conversation', startConversationSource],
    ]) {
      const uploaded = await uploadApplicationFile({
        applicationUniversalIdentifier: APPLICATION_IDENTIFIER,
        fileFolder: 'BuiltLogicFunction',
        filePath: `dist/${name}.mjs`,
        filename: `${name}.mjs`,
        contentType: 'application/javascript',
        fileBuffer: Buffer.from(source),
      });

      expect(uploaded.errors).toBeUndefined();
    }

    const buildLogicFunction = ({
      universalIdentifier,
      name,
      source,
    }: {
      universalIdentifier: string;
      name: string;
      source: string;
    }) => ({
      universalIdentifier,
      name,
      handlerName: 'handler',
      sourceHandlerPath: `src/${name}.ts`,
      builtHandlerPath: `dist/${name}.mjs`,
      builtHandlerChecksum: createHash('sha256').update(source).digest('hex'),
      timeoutSeconds: 10,
    });

    const { errors } = await syncApplication({
      manifest: buildBaseManifest({
        appId: APPLICATION_IDENTIFIER,
        roleId: v4(),
        overrides: {
          logicFunctions: [
            buildLogicFunction({
              universalIdentifier: SEND_MESSAGE_IDENTIFIER,
              name: 'send-message',
              source: sendMessageSource,
            }),
            buildLogicFunction({
              universalIdentifier: START_CONVERSATION_IDENTIFIER,
              name: 'start-conversation',
              source: startConversationSource,
            }),
          ],
          connectionProviders: [
            {
              universalIdentifier: CONNECTION_PROVIDER_IDENTIFIER,
              name: 'sending',
              displayName: 'Sending',
              type: 'oauth',
              oauth: {
                authorizationEndpoint: 'https://provider.example.com/authorize',
                tokenEndpoint: 'https://provider.example.com/token',
                scopes: [],
                clientIdVariable: 'CLIENT_ID',
                clientSecretVariable: 'CLIENT_SECRET',
              },
            },
          ],
          messagingProviders: [
            {
              universalIdentifier: MESSAGING_PROVIDER_IDENTIFIER,
              name: 'linkedin-messaging',
              displayName: 'LinkedIn Messages',
              connectionProvider: {
                universalIdentifier: CONNECTION_PROVIDER_IDENTIFIER,
              },
              sendMessageLogicFunction: {
                universalIdentifier: SEND_MESSAGE_IDENTIFIER,
              },
              startConversationLogicFunction: {
                universalIdentifier: START_CONVERSATION_IDENTIFIER,
              },
              conversationStyle: 'chat',
            },
          ],
        },
      }),
    });

    expect(errors).toBeUndefined();
    jest.useRealTimers();

    const [provider] = await findConnectionProvidersByApplication(
      APPLICATION_IDENTIFIER,
    );

    assertIsDefinedOrThrow(provider);

    applicationDbId = provider.applicationId;

    const tokenPair = await generateAppleAdminApplicationTokenPair({
      applicationId: applicationDbId,
    });

    applicationToken = tokenPair.applicationAccessToken.token;
    janeConnectionId = v4();

    await globalThis.testDataSource.query(
      `INSERT INTO core."connectedAccount"
         (id, handle, provider, scope, "workspaceId", "userWorkspaceId",
          "applicationId", "connectionProviderId")
       VALUES ($1, $2, $3, 'USER', $4, $5, $6, $7)`,
      [
        janeConnectionId,
        CHANNEL_HANDLE,
        ConnectedAccountProvider.APP,
        SEED_APPLE_WORKSPACE_ID,
        USER_WORKSPACE_DATA_SEED_IDS.JANE,
        applicationDbId,
        provider.id,
      ],
    );
  }, 180000);

  beforeEach(() => {
    markerServer.clearMarker(startExecutionsUrl);
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
      `DELETE FROM core."messageChannel" WHERE "connectedAccountId" = $1`,
      [janeConnectionId],
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
    await markerServer.close();
  }, 120000);

  it('starts a conversation through the app and records it in a new thread with the Person', async () => {
    const messageChannelId = await createChannel();

    const response = await startConversation({
      messageChannelId,
      personId: PERSON_ID,
      text: 'Hi, nice to meet you',
    });

    expect(response.body.errors).toBeUndefined();

    const { messageId, messageThreadId } =
      response.body.data.startAppChannelConversation;

    expect(messageThreadId).toEqual(expect.any(String));
    expect(readStartExecutions()).toEqual([
      expect.objectContaining({
        messageChannelId,
        connectedAccountId: janeConnectionId,
        text: 'Hi, nice to meet you',
        recipients: [expect.objectContaining({ personId: PERSON_ID })],
      }),
    ]);

    const participants: {
      handle: string;
      role: string;
      personId: string | null;
    }[] = await globalThis.testDataSource.query(
      `SELECT handle, role, "personId" FROM "${WORKSPACE_SCHEMA}"."messageParticipant"
        WHERE "messageId" = $1 ORDER BY role`,
      [messageId],
    );

    expect(participants).toEqual([
      expect.objectContaining({
        handle: CHANNEL_HANDLE,
        role: MessageParticipantRole.FROM,
      }),
      {
        handle: PERSON_HANDLE,
        role: MessageParticipantRole.TO,
        personId: PERSON_ID,
      },
    ]);
  });

  it('starts once and returns the recorded message when retried with the same idempotency key', async () => {
    const messageChannelId = await createChannel();
    const idempotencyKey = v4();

    const firstResponse = await startConversation({
      messageChannelId,
      personId: PERSON_ID,
      text: 'Hi again',
      idempotencyKey,
    });
    const retryResponse = await startConversation({
      messageChannelId,
      personId: PERSON_ID,
      text: 'Hi again',
      idempotencyKey,
    });

    expect(retryResponse.body.errors).toBeUndefined();
    expect(retryResponse.body.data.startAppChannelConversation).toEqual(
      firstResponse.body.data.startAppChannelConversation,
    );
    expect(readStartExecutions()).toHaveLength(1);
  });

  it('refuses a Person the caller cannot read without calling the app', async () => {
    const messageChannelId = await createChannel();

    const response = await startConversation({
      messageChannelId,
      personId: v4(),
      text: 'Hello?',
    });

    expect(response.body.errors).toBeDefined();
    expect(readStartExecutions()).toEqual([]);
  });

  it("refuses another member's channel without calling the app", async () => {
    const messageChannelId = await createChannel();

    const response = await startConversation({
      messageChannelId,
      personId: PERSON_ID,
      text: 'Hello from Jony',
      token: APPLE_JONY_MEMBER_ACCESS_TOKEN,
    });

    expect(response.body.errors).toBeDefined();
    expect(readStartExecutions()).toEqual([]);
  });
});
