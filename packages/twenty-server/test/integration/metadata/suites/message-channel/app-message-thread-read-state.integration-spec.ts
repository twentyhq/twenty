import { gql } from 'graphql-tag';
import { createOneOperation } from 'test/integration/graphql/utils/create-one-operation.util';
import { destroyOneOperationFactory } from 'test/integration/graphql/utils/destroy-one-operation-factory.util';
import { makeGraphqlApiRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import { findConnectionProvidersByApplication } from 'test/integration/metadata/suites/connection-provider/utils/find-connection-providers-by-application.util';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { generateAppleAdminApplicationTokenPair } from 'test/integration/utils/generate-apple-admin-application-token-pair.util';
import { waitForAllJobsToFinish } from 'test/integration/utils/wait-for-all-jobs-to-finish.util';
import {
  ConnectedAccountProvider,
  MessageChannelVisibility,
  MessageParticipantRole,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { USER_WORKSPACE_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-user-workspaces.util';

const APPLICATION_IDENTIFIER = v4();
const PROVIDER_IDENTIFIER = v4();

const WORKSPACE_SCHEMA = getWorkspaceSchemaName(SEED_APPLE_WORKSPACE_ID);

const CHANNEL_HANDLE = 'read-state-owner';
const THREAD_EXTERNAL_ID = `read-state-thread-${v4()}`;

const CREATE_CHANNEL_MUTATION = gql`
  mutation CreateAppMessageChannel($input: CreateAppMessageChannelInput!) {
    createAppMessageChannel(input: $input) {
      id
    }
  }
`;

const INGEST_MESSAGES_MUTATION = gql`
  mutation IngestAppMessages($input: IngestAppMessagesInput!) {
    ingestAppMessages(input: $input) {
      messages {
        externalId
        messageThreadId
      }
    }
  }
`;

const SET_THREAD_READ_STATE_MUTATION = gql`
  mutation SetAppMessageThreadReadState(
    $input: SetAppMessageThreadReadStateInput!
  ) {
    setAppMessageThreadReadState(input: $input) {
      updatedMessageCount
    }
  }
`;

const GET_TIMELINE_THREADS_QUERY = gql`
  query GetTimelineThreadsFromPersonId(
    $personId: UUID!
    $page: Int!
    $pageSize: Int!
  ) {
    getTimelineThreadsFromPersonId(
      personId: $personId
      page: $page
      pageSize: $pageSize
    ) {
      timelineThreads {
        id
        read
      }
    }
  }
`;

const FIND_ASSOCIATIONS_QUERY = gql`
  query MessageChannelMessageAssociations($messageChannelId: UUID!) {
    messageChannelMessageAssociations(
      filter: { messageChannelId: { eq: $messageChannelId } }
    ) {
      edges {
        node {
          messageExternalId
          isRead
        }
      }
    }
  }
`;

const MARK_THREAD_AS_READ_MUTATION = gql`
  mutation MarkMessageThreadAsRead($messageThreadId: UUID!) {
    markMessageThreadAsRead(messageThreadId: $messageThreadId)
  }
`;

type IngestedMessage = {
  externalId: string;
  senderHandle: string;
  receivedAt: string;
  isRead?: boolean;
};

describe('app message thread read state (e2e)', () => {
  let applicationToken: string;
  let applicationDbId: string;
  let connectedAccountId: string;
  let messageChannelId: string;
  let messageThreadId: string;
  const counterpartPersonId = v4();

  const asApplication = (
    operation: Parameters<typeof makeMetadataApiRequest>[0],
  ) => makeMetadataApiRequest(operation, applicationToken);

  const ingest = async (messages: IngestedMessage[]) => {
    const response = await asApplication({
      query: INGEST_MESSAGES_MUTATION,
      variables: {
        input: {
          messageChannelId,
          messages: messages.map(
            ({ externalId, senderHandle, receivedAt, isRead }) => ({
              externalId,
              threadExternalId: THREAD_EXTERNAL_ID,
              text: externalId,
              receivedAt,
              isRead,
              participants: [
                {
                  role: MessageParticipantRole.FROM,
                  handle: senderHandle,
                  ...(senderHandle === CHANNEL_HANDLE
                    ? {}
                    : { personId: counterpartPersonId }),
                },
              ],
            }),
          ),
        },
      },
    });

    await waitForAllJobsToFinish();

    expect(response.body.errors).toBeUndefined();

    const ingestedMessages: { externalId: string; messageThreadId: string }[] =
      response.body.data.ingestAppMessages.messages;

    return ingestedMessages;
  };

  const setThreadReadState = async (isRead: boolean): Promise<number> => {
    const response = await asApplication({
      query: SET_THREAD_READ_STATE_MUTATION,
      variables: {
        input: {
          messageChannelId,
          threadExternalId: THREAD_EXTERNAL_ID,
          isRead,
        },
      },
    });

    expect(response.body.errors).toBeUndefined();

    return response.body.data.setAppMessageThreadReadState.updatedMessageCount;
  };

  const isThreadReadOnTimeline = async (token?: string) => {
    const response = await makeGraphqlApiRequest(
      {
        query: GET_TIMELINE_THREADS_QUERY,
        variables: { personId: counterpartPersonId, page: 1, pageSize: 10 },
      },
      token,
    );

    expect(response.body.errors).toBeUndefined();

    const timelineThreads: { id: string; read: boolean }[] =
      response.body.data.getTimelineThreadsFromPersonId.timelineThreads;

    const timelineThread = timelineThreads.find(
      ({ id }) => id === messageThreadId,
    );

    return timelineThread?.read;
  };

  const readStateThroughApi = async (
    token?: string,
  ): Promise<Record<string, boolean>> => {
    const response = await makeGraphqlApiRequest(
      { query: FIND_ASSOCIATIONS_QUERY, variables: { messageChannelId } },
      token,
    );

    expect(response.body.errors).toBeUndefined();

    const edges: { node: { messageExternalId: string; isRead: boolean } }[] =
      response.body.data.messageChannelMessageAssociations.edges;

    return Object.fromEntries(
      edges.map(({ node }) => [node.messageExternalId, node.isRead]),
    );
  };

  const findReadStateByExternalId = async (): Promise<
    Record<string, boolean>
  > => {
    const rows: { messageExternalId: string; isRead: boolean }[] =
      await globalThis.testDataSource.query(
        `SELECT "messageExternalId", "isRead"
           FROM "${WORKSPACE_SCHEMA}"."messageChannelMessageAssociation"
          WHERE "messageChannelId" = $1`,
        [messageChannelId],
      );

    return Object.fromEntries(
      rows.map((row) => [row.messageExternalId, row.isRead]),
    );
  };

  beforeAll(async () => {
    const createPersonResponse = await createOneOperation({
      objectMetadataSingularName: 'person',
      input: { id: counterpartPersonId, name: { firstName: 'Counterpart' } },
    });

    expect(createPersonResponse.errors).toBeUndefined();

    await setupApplicationForSync({
      applicationUniversalIdentifier: APPLICATION_IDENTIFIER,
      name: 'App message thread read state',
      description: 'Read state carried by app message ingestion',
      sourcePath: 'app-message-thread-read-state',
    });

    const { errors } = await syncApplication({
      manifest: buildBaseManifest({
        appId: APPLICATION_IDENTIFIER,
        roleId: v4(),
        overrides: {
          connectionProviders: [
            {
              universalIdentifier: PROVIDER_IDENTIFIER,
              name: 'chat',
              displayName: 'Chat',
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
        },
      }),
    });

    expect(errors).toBeUndefined();
    jest.useRealTimers();

    const [provider] = await findConnectionProvidersByApplication(
      APPLICATION_IDENTIFIER,
    );

    applicationDbId = provider.applicationId;
    applicationToken = (
      await generateAppleAdminApplicationTokenPair({
        applicationId: applicationDbId,
      })
    ).applicationAccessToken.token;

    connectedAccountId = v4();
    await globalThis.testDataSource.query(
      `INSERT INTO core."connectedAccount"
         (id, handle, provider, scope, "workspaceId", "userWorkspaceId",
          "applicationId", "connectionProviderId")
       VALUES ($1, $2, $3, 'WORKSPACE', $4, $5, $6, $7)`,
      [
        connectedAccountId,
        CHANNEL_HANDLE,
        ConnectedAccountProvider.APP,
        SEED_APPLE_WORKSPACE_ID,
        USER_WORKSPACE_DATA_SEED_IDS.JANE,
        applicationDbId,
        provider.id,
      ],
    );

    const channelResponse = await asApplication({
      query: CREATE_CHANNEL_MUTATION,
      variables: {
        input: {
          connectedAccountId,
          handle: CHANNEL_HANDLE,
          visibility: MessageChannelVisibility.SHARE_EVERYTHING,
        },
      },
    });

    expect(channelResponse.body.errors).toBeUndefined();

    messageChannelId = channelResponse.body.data.createAppMessageChannel.id;
  }, 180000);

  afterAll(async () => {
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
    await makeGraphqlApiRequest(
      destroyOneOperationFactory({
        objectMetadataSingularName: 'person',
        recordId: counterpartPersonId,
        gqlFields: 'id',
      }),
    );
    await globalThis.testDataSource.query(
      `DELETE FROM core."connectedAccount" WHERE id = $1`,
      [connectedAccountId],
    );
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: APPLICATION_IDENTIFIER,
    });
  });

  it('stores the read state sent on ingestion and defaults to read', async () => {
    const [ingestedMessage] = await ingest([
      {
        externalId: 'incoming-read',
        senderHandle: 'counterpart',
        receivedAt: '2026-10-20T10:00:00.000Z',
        isRead: true,
      },
      {
        externalId: 'outgoing',
        senderHandle: CHANNEL_HANDLE,
        receivedAt: '2026-10-20T10:01:00.000Z',
      },
      {
        externalId: 'incoming-unread',
        senderHandle: 'counterpart',
        receivedAt: '2026-10-20T10:02:00.000Z',
        isRead: false,
      },
    ]);

    messageThreadId = ingestedMessage.messageThreadId;

    expect(await findReadStateByExternalId()).toEqual({
      'incoming-read': true,
      outgoing: true,
      'incoming-unread': false,
    });
  });

  it('shows the thread unread on the timeline to the channel owner only', async () => {
    expect(await isThreadReadOnTimeline()).toBe(false);
    expect(await isThreadReadOnTimeline(APPLE_JONY_MEMBER_ACCESS_TOKEN)).toBe(
      true,
    );
  });

  it('keeps the stored read state when a message is ingested again', async () => {
    await ingest([
      {
        externalId: 'incoming-unread',
        senderHandle: 'counterpart',
        receivedAt: '2026-10-20T10:02:00.000Z',
        isRead: true,
      },
    ]);

    expect((await findReadStateByExternalId())['incoming-unread']).toBe(false);
  });

  it('marks every message of the thread read', async () => {
    expect(await setThreadReadState(true)).toBe(1);
    expect(await setThreadReadState(true)).toBe(0);

    expect(Object.values(await findReadStateByExternalId())).toEqual([
      true,
      true,
      true,
    ]);
  });

  it('marks only the latest incoming message unread', async () => {
    expect(await setThreadReadState(false)).toBe(1);

    expect(await findReadStateByExternalId()).toEqual({
      'incoming-read': true,
      outgoing: true,
      'incoming-unread': false,
    });
  });

  it('shows read state through the API to the channel owner only', async () => {
    expect((await readStateThroughApi())['incoming-unread']).toBe(false);
    expect(
      (await readStateThroughApi(applicationToken))['incoming-unread'],
    ).toBe(false);
    expect(await readStateThroughApi(APPLE_JONY_MEMBER_ACCESS_TOKEN)).toEqual({
      'incoming-read': true,
      outgoing: true,
      'incoming-unread': true,
    });
  });

  it('lets the channel owner mark the thread read from Twenty', async () => {
    const response = await makeGraphqlApiRequest({
      query: MARK_THREAD_AS_READ_MUTATION,
      variables: { messageThreadId },
    });

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.markMessageThreadAsRead).toBe(true);
    expect((await findReadStateByExternalId())['incoming-unread']).toBe(true);
    expect(await isThreadReadOnTimeline()).toBe(true);
  });

  it('leaves the owner read state untouched when another member opens the thread', async () => {
    await setThreadReadState(false);

    const response = await makeGraphqlApiRequest(
      {
        query: MARK_THREAD_AS_READ_MUTATION,
        variables: { messageThreadId },
      },
      APPLE_JONY_MEMBER_ACCESS_TOKEN,
    );

    expect(response.body.errors).toBeUndefined();
    expect((await findReadStateByExternalId())['incoming-unread']).toBe(false);
  });
});
