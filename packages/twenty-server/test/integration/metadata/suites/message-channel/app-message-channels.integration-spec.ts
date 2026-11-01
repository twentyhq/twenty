import { gql } from 'graphql-tag';
import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { generateAppleAdminApplicationTokenPair } from 'test/integration/utils/generate-apple-admin-application-token-pair.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import { findConnectionProvidersByApplication } from 'test/integration/metadata/suites/connection-provider/utils/find-connection-providers-by-application.util';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { type Manifest } from 'twenty-shared/application';
import {
  ConnectedAccountProvider,
  MessageChannelType,
  MessageChannelVisibility,
  MessageParticipantRole,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { v4 as uuidv4 } from 'uuid';

import { INGEST_APP_MESSAGES_MAX_BATCH_SIZE } from 'src/engine/metadata-modules/message-channel/dtos/ingest-app-messages.input';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { MessageDirection } from 'src/modules/messaging/common/enums/message-direction.enum';

const OWNING_APP_ID = uuidv4();
const OWNING_APP_ROLE_ID = uuidv4();
const OWNING_APP_PROVIDER_ID = uuidv4();

const OTHER_APP_ID = uuidv4();
const OTHER_APP_ROLE_ID = uuidv4();
const OTHER_APP_PROVIDER_ID = uuidv4();

const WORKSPACE_SCHEMA = getWorkspaceSchemaName(SEED_APPLE_WORKSPACE_ID);

const CHANNEL_HANDLE = 'workspace-bot@linkedin.test';

const CREATE_CHANNEL_MUTATION = gql`
  mutation CreateAppMessageChannel($input: CreateAppMessageChannelInput!) {
    createAppMessageChannel(input: $input) {
      id
      handle
      displayName
      type
      visibility
      isSyncEnabled
      connectedAccountId
    }
  }
`;

const LIST_CHANNELS_QUERY = gql`
  query AppMessageChannels($filter: ListAppMessageChannelsInput) {
    appMessageChannels(filter: $filter) {
      id
      handle
      type
      connectedAccountId
    }
  }
`;

const UPDATE_CHANNEL_MUTATION = gql`
  mutation UpdateAppMessageChannel($input: UpdateAppMessageChannelInput!) {
    updateAppMessageChannel(input: $input) {
      id
      displayName
      visibility
      isSyncEnabled
    }
  }
`;

const DELETE_CHANNEL_MUTATION = gql`
  mutation DeleteAppMessageChannel($id: UUID!) {
    deleteAppMessageChannel(id: $id) {
      id
    }
  }
`;

const INGEST_MESSAGES_MUTATION = gql`
  mutation IngestAppMessages($input: IngestAppMessagesInput!) {
    ingestAppMessages(input: $input) {
      messages {
        externalId
        messageId
        messageThreadId
      }
    }
  }
`;

const LIST_FOLDERS_QUERY = gql`
  query AppMessageFolders($filter: ListAppMessageFoldersInput) {
    appMessageFolders(filter: $filter) {
      id
      externalId
      name
      isSynced
      messageChannelId
    }
  }
`;

const SYNC_FOLDERS_MUTATION = gql`
  mutation SyncAppMessageFolders($input: SyncAppMessageFoldersInput!) {
    syncAppMessageFolders(input: $input) {
      id
      externalId
      name
      isSynced
      messageChannelId
    }
  }
`;

const UPDATE_MESSAGE_FOLDERS_MUTATION = gql`
  mutation UpdateMessageFolders($input: UpdateMessageFoldersInput!) {
    updateMessageFolders(input: $input) {
      id
      isSynced
    }
  }
`;

const buildManifestWithProvider = ({
  appId,
  roleId,
  roleLabel,
  providerId,
}: {
  appId: string;
  roleId: string;
  roleLabel: string;
  providerId: string;
}): Manifest =>
  buildBaseManifest({
    appId,
    roleId,
    overrides: {
      roles: [
        {
          universalIdentifier: roleId,
          label: roleLabel,
          description: 'A test role',
        },
      ],
      connectionProviders: [
        {
          universalIdentifier: providerId,
          name: 'linkedin',
          displayName: 'LinkedIn',
          type: 'oauth',
          oauth: {
            authorizationEndpoint:
              'https://www.linkedin.com/oauth/v2/authorization',
            tokenEndpoint: 'https://www.linkedin.com/oauth/v2/accessToken',
            scopes: ['r_liteprofile'],
            clientIdVariable: 'LINKEDIN_CLIENT_ID',
            clientSecretVariable: 'LINKEDIN_CLIENT_SECRET',
          },
        },
      ],
    },
  });

type AppMessageParticipantPayload = {
  role: MessageParticipantRole;
  handle: string;
  displayName?: string;
  personId?: string;
};

type AppMessagePayload = {
  externalId: string;
  threadExternalId: string;
  subject?: string;
  text: string;
  receivedAt: string;
  participants: AppMessageParticipantPayload[];
  folderExternalIds?: string[];
};

type AppMessageFolderPayload = {
  externalId: string;
  name: string;
  isSynced?: boolean;
};

const buildMessage = ({
  externalId,
  threadExternalId,
  senderHandle,
  text = 'Hi there',
  subject,
  personId,
}: {
  externalId: string;
  threadExternalId: string;
  senderHandle: string;
  text?: string;
  subject?: string;
  personId?: string;
}): AppMessagePayload => ({
  externalId,
  threadExternalId,
  subject,
  text,
  receivedAt: new Date('2026-01-01T10:00:00.000Z').toISOString(),
  participants: [
    {
      role: MessageParticipantRole.FROM,
      handle: senderHandle,
      displayName: 'Ada Lovelace',
      personId,
    },
    {
      role: MessageParticipantRole.TO,
      handle: 'recruiter@linkedin.test',
    },
  ],
});

describe('app message channels API (e2e)', () => {
  let owningApplicationToken: string;
  let otherApplicationToken: string;
  let adminUserWorkspaceId: string;
  let owningApplicationDbId: string;
  let owningProviderDbId: string;
  let otherApplicationDbId: string;
  let otherProviderDbId: string;

  let ownConnectionId: string;
  let otherAppConnectionId: string;
  let foreignMemberConnectionId: string;
  let foreignWorkspaceConnectionId: string;

  const insertAppConnection = async ({
    id,
    applicationId,
    connectionProviderId,
    scope,
    userWorkspaceId,
  }: {
    id: string;
    applicationId: string;
    connectionProviderId: string;
    scope: 'USER' | 'WORKSPACE';
    userWorkspaceId: string;
  }): Promise<void> => {
    await globalThis.testDataSource.query(
      `INSERT INTO core."connectedAccount"
         (id, handle, provider, scope, "workspaceId", "userWorkspaceId",
          "applicationId", "connectionProviderId")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        id,
        CHANNEL_HANDLE,
        ConnectedAccountProvider.APP,
        scope,
        SEED_APPLE_WORKSPACE_ID,
        userWorkspaceId,
        applicationId,
        connectionProviderId,
      ],
    );
  };

  const request = (
    operation: Parameters<typeof makeMetadataApiRequest>[0],
    token = owningApplicationToken,
  ) => makeMetadataApiRequest(operation, token);

  const createChannel = ({
    connectedAccountId = ownConnectionId,
    handle = CHANNEL_HANDLE,
    displayName,
    visibility = MessageChannelVisibility.SHARE_EVERYTHING,
    token,
  }: {
    connectedAccountId?: string;
    handle?: string;
    displayName?: string;
    visibility?: MessageChannelVisibility;
    token?: string;
  } = {}) =>
    request(
      {
        query: CREATE_CHANNEL_MUTATION,
        variables: {
          input: { connectedAccountId, handle, displayName, visibility },
        },
      },
      token,
    );

  const createChannelOrThrow = async (
    args: Parameters<typeof createChannel>[0] = {},
  ): Promise<{ id: string; handle: string }> => {
    const response = await createChannel(args);

    if (response.body.errors) {
      throw new Error(
        `Channel creation failed: ${JSON.stringify(response.body.errors)}`,
      );
    }

    return response.body.data.createAppMessageChannel;
  };

  const ingest = ({
    messageChannelId,
    messages,
    token,
  }: {
    messageChannelId: string;
    messages: AppMessagePayload[];
    token?: string;
  }) =>
    request(
      {
        query: INGEST_MESSAGES_MUTATION,
        variables: { input: { messageChannelId, messages } },
      },
      token,
    );

  const syncFolders = ({
    messageChannelId,
    folders,
    token,
  }: {
    messageChannelId: string;
    folders: AppMessageFolderPayload[];
    token?: string;
  }) =>
    request(
      {
        query: SYNC_FOLDERS_MUTATION,
        variables: { input: { messageChannelId, folders } },
      },
      token,
    );

  const findFolder = ({
    folders,
    externalId,
  }: {
    folders: { id: string; externalId: string }[];
    externalId: string;
  }) => {
    const folder = folders.find(
      (candidate) => candidate.externalId === externalId,
    );

    if (!isDefined(folder)) {
      throw new Error(`Folder ${externalId} was not returned`);
    }

    return folder;
  };

  const findLinkedFolderIds = async (messageId: string): Promise<string[]> => {
    const rows: { messageFolderId: string }[] =
      await globalThis.testDataSource.query(
        `SELECT folder."messageFolderId"
           FROM "${WORKSPACE_SCHEMA}"."messageChannelMessageAssociationMessageFolder" folder
           JOIN "${WORKSPACE_SCHEMA}"."messageChannelMessageAssociation" association
             ON association.id = folder."messageChannelMessageAssociationId"
          WHERE association."messageId" = $1`,
        [messageId],
      );

    return rows.map((row) => row.messageFolderId);
  };

  const findAssociation = async (
    messageId: string,
  ): Promise<{ direction: string; messageExternalId: string }> => {
    const [row] = await globalThis.testDataSource.query(
      `SELECT direction, "messageExternalId"
         FROM "${WORKSPACE_SCHEMA}"."messageChannelMessageAssociation"
        WHERE "messageId" = $1`,
      [messageId],
    );

    return row;
  };

  beforeAll(async () => {
    for (const { appId, roleId, providerId, sourcePath } of [
      {
        appId: OWNING_APP_ID,
        roleId: OWNING_APP_ROLE_ID,
        providerId: OWNING_APP_PROVIDER_ID,
        sourcePath: 'test-app-message-channels-owner',
      },
      {
        appId: OTHER_APP_ID,
        roleId: OTHER_APP_ROLE_ID,
        providerId: OTHER_APP_PROVIDER_ID,
        sourcePath: 'test-app-message-channels-other',
      },
    ]) {
      await setupApplicationForSync({
        applicationUniversalIdentifier: appId,
        name: sourcePath,
        description: 'App for testing the app-facing message channel API',
        sourcePath,
      });

      await syncApplication({
        manifest: buildManifestWithProvider({
          appId,
          roleId,
          roleLabel: `Test Role ${sourcePath}`,
          providerId,
        }),
        expectToFail: false,
      });
    }

    jest.useRealTimers();

    const [owningProvider] =
      await findConnectionProvidersByApplication(OWNING_APP_ID);
    const [otherProvider] =
      await findConnectionProvidersByApplication(OTHER_APP_ID);

    owningApplicationDbId = owningProvider.applicationId;
    owningProviderDbId = owningProvider.id;
    otherApplicationDbId = otherProvider.applicationId;
    otherProviderDbId = otherProvider.id;

    const [userWorkspace] = await globalThis.testDataSource.query(
      `SELECT id FROM core."userWorkspace" WHERE "workspaceId" = $1 LIMIT 1`,
      [SEED_APPLE_WORKSPACE_ID],
    );

    adminUserWorkspaceId = userWorkspace.id;

    // Carries the admin's userWorkspaceId: the shape of a member-triggered run rather than a cron.
    const tokenPair = await generateAppleAdminApplicationTokenPair({
      applicationId: owningApplicationDbId,
    });

    owningApplicationToken = tokenPair.applicationAccessToken.token;

    const otherApplicationTokenPair =
      await generateAppleAdminApplicationTokenPair({
        applicationId: otherApplicationDbId,
      });

    otherApplicationToken =
      otherApplicationTokenPair.applicationAccessToken.token;

    ownConnectionId = uuidv4();
    otherAppConnectionId = uuidv4();
    foreignMemberConnectionId = uuidv4();
    foreignWorkspaceConnectionId = uuidv4();

    await insertAppConnection({
      id: ownConnectionId,
      applicationId: owningApplicationDbId,
      connectionProviderId: owningProviderDbId,
      scope: 'WORKSPACE',
      userWorkspaceId: adminUserWorkspaceId,
    });

    await insertAppConnection({
      id: otherAppConnectionId,
      applicationId: otherApplicationDbId,
      connectionProviderId: otherProviderDbId,
      scope: 'WORKSPACE',
      userWorkspaceId: adminUserWorkspaceId,
    });

    await insertAppConnection({
      id: foreignMemberConnectionId,
      applicationId: owningApplicationDbId,
      connectionProviderId: owningProviderDbId,
      scope: 'USER',
      userWorkspaceId: uuidv4(),
    });

    await insertAppConnection({
      id: foreignWorkspaceConnectionId,
      applicationId: owningApplicationDbId,
      connectionProviderId: owningProviderDbId,
      scope: 'WORKSPACE',
      userWorkspaceId: uuidv4(),
    });
  }, 180000);

  afterEach(async () => {
    const ingestedMessages: { id: string; messageThreadId: string | null }[] =
      await globalThis.testDataSource.query(
        `SELECT id, "messageThreadId" FROM "${WORKSPACE_SCHEMA}"."message"
           WHERE "headerMessageId" LIKE $1`,
        [`app:${owningApplicationDbId}:%`],
      );

    const messageIds = ingestedMessages.map((message) => message.id);
    const messageThreadIds = [
      ...new Set(
        ingestedMessages
          .map((message) => message.messageThreadId)
          .filter(isDefined),
      ),
    ];

    if (messageIds.length > 0) {
      await globalThis.testDataSource.query(
        `DELETE FROM "${WORKSPACE_SCHEMA}"."messageChannelMessageAssociationMessageFolder"
           WHERE "messageChannelMessageAssociationId" IN (
             SELECT id FROM "${WORKSPACE_SCHEMA}"."messageChannelMessageAssociation"
              WHERE "messageId" = ANY($1))`,
        [messageIds],
      );
      await globalThis.testDataSource.query(
        `DELETE FROM "${WORKSPACE_SCHEMA}"."messageChannelMessageAssociation"
           WHERE "messageId" = ANY($1)`,
        [messageIds],
      );
      await globalThis.testDataSource.query(
        `DELETE FROM "${WORKSPACE_SCHEMA}"."messageParticipant"
           WHERE "messageId" = ANY($1)`,
        [messageIds],
      );
      await globalThis.testDataSource.query(
        `DELETE FROM "${WORKSPACE_SCHEMA}"."message" WHERE id = ANY($1)`,
        [messageIds],
      );
    }

    if (messageThreadIds.length > 0) {
      await globalThis.testDataSource.query(
        `DELETE FROM "${WORKSPACE_SCHEMA}"."messageThreadTarget"
           WHERE "messageThreadId" = ANY($1)`,
        [messageThreadIds],
      );
      await globalThis.testDataSource.query(
        `DELETE FROM "${WORKSPACE_SCHEMA}"."messageThread" WHERE id = ANY($1)`,
        [messageThreadIds],
      );
    }

    await globalThis.testDataSource.query(
      `DELETE FROM core."messageChannel" WHERE "connectedAccountId" = ANY($1)`,
      [
        [
          ownConnectionId,
          otherAppConnectionId,
          foreignMemberConnectionId,
          foreignWorkspaceConnectionId,
        ],
      ],
    );
  });

  afterAll(async () => {
    await globalThis.testDataSource.query(
      `DELETE FROM core."connectedAccount" WHERE "workspaceId" = $1
         AND "applicationId" IN ($2, $3)`,
      [SEED_APPLE_WORKSPACE_ID, owningApplicationDbId, otherApplicationDbId],
    );

    for (const appId of [OWNING_APP_ID, OTHER_APP_ID]) {
      await cleanupApplicationAndAppRegistration({
        applicationUniversalIdentifier: appId,
      });
    }
  }, 120000);

  describe('createAppMessageChannel', () => {
    it('creates an APP channel on a connection the application owns', async () => {
      const response = await createChannel({
        displayName: '  Ada at LinkedIn  ',
      });

      expect(response.body.errors).toBeUndefined();

      const channel = response.body.data.createAppMessageChannel;

      expect(channel).toMatchObject({
        handle: CHANNEL_HANDLE,
        // Trimmed so the UI never renders a padded label.
        displayName: 'Ada at LinkedIn',
        type: MessageChannelType.APP,
        visibility: MessageChannelVisibility.SHARE_EVERYTHING,
        isSyncEnabled: true,
        connectedAccountId: ownConnectionId,
      });
    });

    it('refuses a connection owned by another application', async () => {
      const response = await createChannel({
        connectedAccountId: otherAppConnectionId,
      });

      expect(response.body.errors?.[0]?.extensions?.code).toBe('FORBIDDEN');
    });

    it("refuses another member's private connection", async () => {
      const response = await createChannel({
        connectedAccountId: foreignMemberConnectionId,
      });

      expect(response.body.errors?.[0]?.extensions?.code).toBe('FORBIDDEN');
    });

    it('refuses a second channel for the same handle on the same connection', async () => {
      await createChannelOrThrow();

      const response = await createChannel();

      expect(response.body.errors?.[0]?.extensions?.code).toBe(
        'BAD_USER_INPUT',
      );
    });

    it('rejects a missing visibility rather than defaulting one', async () => {
      const response = await request({
        query: gql`
          mutation CreateAppMessageChannelWithoutVisibility(
            $connectedAccountId: UUID!
            $handle: String!
          ) {
            createAppMessageChannel(
              input: {
                connectedAccountId: $connectedAccountId
                handle: $handle
              }
            ) {
              id
            }
          }
        `,
        variables: {
          connectedAccountId: ownConnectionId,
          handle: CHANNEL_HANDLE,
        },
      });

      expect(response.body.errors).toBeDefined();
    });
  });

  describe('appMessageChannels', () => {
    it("lists the application's own channels and nothing else", async () => {
      const channel = await createChannelOrThrow();
      // Same workspace and type APP, so a list query not scoped by application would return it.
      const foreignChannel = await createChannelOrThrow({
        connectedAccountId: otherAppConnectionId,
        token: otherApplicationToken,
      });

      const response = await request({ query: LIST_CHANNELS_QUERY });

      expect(response.body.errors).toBeUndefined();

      const channels = response.body.data.appMessageChannels;

      expect(channels).toHaveLength(1);
      expect(channels[0]).toMatchObject({
        id: channel.id,
        type: MessageChannelType.APP,
        connectedAccountId: ownConnectionId,
      });
      expect(channels.map((listed: { id: string }) => listed.id)).not.toContain(
        foreignChannel.id,
      );
    });

    it('refuses a filter on a connection owned by another application', async () => {
      const response = await request({
        query: LIST_CHANNELS_QUERY,
        variables: { filter: { connectedAccountId: otherAppConnectionId } },
      });

      expect(response.body.errors?.[0]?.extensions?.code).toBe('FORBIDDEN');
    });
  });

  describe('updateAppMessageChannel', () => {
    it('updates the fields an app is allowed to change', async () => {
      const channel = await createChannelOrThrow();

      const response = await request({
        query: UPDATE_CHANNEL_MUTATION,
        variables: {
          input: {
            id: channel.id,
            displayName: 'Renamed',
            visibility: MessageChannelVisibility.METADATA,
            isSyncEnabled: false,
          },
        },
      });

      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.updateAppMessageChannel).toMatchObject({
        id: channel.id,
        displayName: 'Renamed',
        visibility: MessageChannelVisibility.METADATA,
        isSyncEnabled: false,
      });
    });

    it('does not tell another application that the channel exists', async () => {
      const channel = await createChannelOrThrow();

      const response = await request(
        {
          query: UPDATE_CHANNEL_MUTATION,
          variables: { input: { id: channel.id, displayName: 'Stolen' } },
        },
        otherApplicationToken,
      );

      expect(response.body.errors?.[0]?.extensions?.code).toBe('NOT_FOUND');
    });
  });

  describe('deleteAppMessageChannel', () => {
    it('removes the channel from the list', async () => {
      const channel = await createChannelOrThrow();

      const deleteResponse = await request({
        query: DELETE_CHANNEL_MUTATION,
        variables: { id: channel.id },
      });

      expect(deleteResponse.body.errors).toBeUndefined();
      expect(deleteResponse.body.data.deleteAppMessageChannel.id).toBe(
        channel.id,
      );

      const listResponse = await request({ query: LIST_CHANNELS_QUERY });

      expect(listResponse.body.data.appMessageChannels).toEqual([]);
    });
  });

  describe('ingestAppMessages', () => {
    it('lands two messages of one conversation in a single thread', async () => {
      const channel = await createChannelOrThrow();
      const threadExternalId = `thread-${uuidv4()}`;

      const response = await ingest({
        messageChannelId: channel.id,
        messages: [
          buildMessage({
            externalId: 'msg-1',
            threadExternalId,
            senderHandle: 'candidate@linkedin.test',
            subject: 'Interested in the role',
          }),
          buildMessage({
            externalId: 'msg-2',
            threadExternalId,
            senderHandle: 'candidate@linkedin.test',
          }),
        ],
      });

      expect(response.body.errors).toBeUndefined();

      const ingested = response.body.data.ingestAppMessages.messages;

      expect(
        ingested.map((message: { externalId: string }) => message.externalId),
      ).toEqual(['msg-1', 'msg-2']);
      expect(ingested[0].messageId).not.toBe(ingested[1].messageId);
      expect(ingested[0].messageThreadId).toBe(ingested[1].messageThreadId);

      const [message] = await globalThis.testDataSource.query(
        `SELECT subject, text FROM "${WORKSPACE_SCHEMA}"."message" WHERE id = $1`,
        [ingested[0].messageId],
      );

      expect(message).toMatchObject({
        subject: 'Interested in the role',
        text: 'Hi there',
      });
    });

    it('returns the same ids when a provider redelivers the same message', async () => {
      const channel = await createChannelOrThrow();
      const threadExternalId = `thread-${uuidv4()}`;
      const messages = [
        buildMessage({
          externalId: 'redelivered',
          threadExternalId,
          senderHandle: 'candidate@linkedin.test',
        }),
      ];

      const first = await ingest({ messageChannelId: channel.id, messages });
      const second = await ingest({ messageChannelId: channel.id, messages });

      expect(first.body.errors).toBeUndefined();
      expect(second.body.errors).toBeUndefined();
      expect(second.body.data.ingestAppMessages.messages).toEqual(
        first.body.data.ingestAppMessages.messages,
      );

      const [{ count }] = await globalThis.testDataSource.query(
        `SELECT count(*) AS count FROM "${WORKSPACE_SCHEMA}"."message"
           WHERE "headerMessageId" = $1`,
        [`app:${owningApplicationDbId}:${channel.id}:redelivered`],
      );

      expect(Number(count)).toBe(1);
    });

    it('derives direction from the sender, matching the handle case-insensitively', async () => {
      const channel = await createChannelOrThrow();
      const threadExternalId = `thread-${uuidv4()}`;

      const response = await ingest({
        messageChannelId: channel.id,
        messages: [
          buildMessage({
            externalId: 'sent-by-the-channel-owner',
            threadExternalId,
            // The channel's own handle, spelled the way a provider that upper-cases its profile API returns it.
            senderHandle: CHANNEL_HANDLE.toUpperCase(),
          }),
          buildMessage({
            externalId: 'sent-by-someone-else',
            threadExternalId,
            senderHandle: 'candidate@linkedin.test',
          }),
        ],
      });

      expect(response.body.errors).toBeUndefined();

      const [outgoing, incoming] =
        response.body.data.ingestAppMessages.messages;

      expect(await findAssociation(outgoing.messageId)).toMatchObject({
        direction: MessageDirection.OUTGOING,
        messageExternalId: 'sent-by-the-channel-owner',
      });
      expect(await findAssociation(incoming.messageId)).toMatchObject({
        direction: MessageDirection.INCOMING,
      });
    });

    it('refuses a channel owned by another application', async () => {
      const channel = await createChannelOrThrow();

      const response = await ingest({
        messageChannelId: channel.id,
        messages: [
          buildMessage({
            externalId: 'msg-1',
            threadExternalId: 'thread-1',
            senderHandle: 'candidate@linkedin.test',
          }),
        ],
        token: otherApplicationToken,
      });

      expect(response.body.errors?.[0]?.extensions?.code).toBe('NOT_FOUND');
    });

    it('refuses a channel whose sync the app turned off', async () => {
      const channel = await createChannelOrThrow();

      await request({
        query: UPDATE_CHANNEL_MUTATION,
        variables: { input: { id: channel.id, isSyncEnabled: false } },
      });

      const response = await ingest({
        messageChannelId: channel.id,
        messages: [
          buildMessage({
            externalId: 'msg-1',
            threadExternalId: 'thread-1',
            senderHandle: 'candidate@linkedin.test',
          }),
        ],
      });

      expect(response.body.errors?.[0]?.extensions?.code).toBe(
        'BAD_USER_INPUT',
      );
    });

    it('refuses a message that does not have exactly one sender', async () => {
      const channel = await createChannelOrThrow();

      const response = await ingest({
        messageChannelId: channel.id,
        messages: [
          {
            ...buildMessage({
              externalId: 'msg-1',
              threadExternalId: 'thread-1',
              senderHandle: 'candidate@linkedin.test',
            }),
            participants: [
              {
                role: MessageParticipantRole.TO,
                handle: 'recruiter@linkedin.test',
                displayName: 'Recruiter',
              },
            ],
          },
        ],
      });

      expect(response.body.errors?.[0]?.extensions?.code).toBe(
        'BAD_USER_INPUT',
      );
    });

    it('refuses a participant pointing at a person that does not exist', async () => {
      const channel = await createChannelOrThrow();

      const response = await ingest({
        messageChannelId: channel.id,
        messages: [
          buildMessage({
            externalId: 'msg-1',
            threadExternalId: 'thread-1',
            senderHandle: 'candidate@linkedin.test',
            personId: uuidv4(),
          }),
        ],
      });

      expect(response.body.errors?.[0]?.extensions?.code).toBe(
        'BAD_USER_INPUT',
      );
    });

    it('refuses a batch larger than the documented maximum', async () => {
      const channel = await createChannelOrThrow();
      const threadExternalId = `thread-${uuidv4()}`;

      const response = await ingest({
        messageChannelId: channel.id,
        messages: Array.from(
          { length: INGEST_APP_MESSAGES_MAX_BATCH_SIZE + 1 },
          (_unused, index) =>
            buildMessage({
              externalId: `msg-${index}`,
              threadExternalId,
              senderHandle: 'candidate@linkedin.test',
            }),
        ),
      });

      expect(response.body.errors).toBeDefined();

      const [{ count }] = await globalThis.testDataSource.query(
        `SELECT count(*) AS count FROM "${WORKSPACE_SCHEMA}"."message"
           WHERE "headerMessageId" LIKE $1`,
        [`app:${owningApplicationDbId}:${channel.id}:%`],
      );

      expect(Number(count)).toBe(0);
    });
  });

  describe('syncAppMessageFolders', () => {
    it('creates folders, synced unless the app says otherwise', async () => {
      const channel = await createChannelOrThrow();

      const response = await syncFolders({
        messageChannelId: channel.id,
        folders: [
          { externalId: 'inb_support', name: 'Support' },
          { externalId: 'inb_sales', name: 'Sales', isSynced: false },
        ],
      });

      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.syncAppMessageFolders).toEqual([
        expect.objectContaining({
          externalId: 'inb_sales',
          name: 'Sales',
          isSynced: false,
        }),
        expect.objectContaining({
          externalId: 'inb_support',
          name: 'Support',
          isSynced: true,
          messageChannelId: channel.id,
        }),
      ]);
    });

    it('renames, keeps an omitted isSynced and removes folders missing from the list', async () => {
      const channel = await createChannelOrThrow();

      const first = await syncFolders({
        messageChannelId: channel.id,
        folders: [
          { externalId: 'inb_support', name: 'Support', isSynced: false },
          { externalId: 'inb_sales', name: 'Sales' },
        ],
      });

      const supportFolder = findFolder({
        folders: first.body.data.syncAppMessageFolders,
        externalId: 'inb_support',
      });

      const second = await syncFolders({
        messageChannelId: channel.id,
        folders: [{ externalId: 'inb_support', name: 'Customer support' }],
      });

      expect(second.body.errors).toBeUndefined();
      expect(second.body.data.syncAppMessageFolders).toEqual([
        expect.objectContaining({
          id: supportFolder.id,
          name: 'Customer support',
          isSynced: false,
        }),
      ]);
    });

    it('refuses the same externalId twice in one list', async () => {
      const channel = await createChannelOrThrow();

      const response = await syncFolders({
        messageChannelId: channel.id,
        folders: [
          { externalId: 'inb_support', name: 'Support' },
          { externalId: 'inb_support', name: 'Support again' },
        ],
      });

      expect(response.body.errors?.[0]?.extensions?.code).toBe(
        'BAD_USER_INPUT',
      );
    });

    it('does not tell another application that the channel exists', async () => {
      const channel = await createChannelOrThrow();

      const response = await syncFolders({
        messageChannelId: channel.id,
        folders: [{ externalId: 'inb_support', name: 'Support' }],
        token: otherApplicationToken,
      });

      expect(response.body.errors?.[0]?.extensions?.code).toBe('NOT_FOUND');
    });
  });

  describe('appMessageFolders', () => {
    it("lists the channel's folders", async () => {
      const channel = await createChannelOrThrow();

      await syncFolders({
        messageChannelId: channel.id,
        folders: [{ externalId: 'inb_support', name: 'Support' }],
      });

      const response = await request({
        query: LIST_FOLDERS_QUERY,
        variables: { filter: { messageChannelId: channel.id } },
      });

      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.appMessageFolders).toEqual([
        expect.objectContaining({
          externalId: 'inb_support',
          name: 'Support',
          isSynced: true,
        }),
      ]);
    });

    it("lists folders across the application's channels and nothing else without a filter", async () => {
      const channel = await createChannelOrThrow();
      const otherHandleChannel = await createChannelOrThrow({
        handle: 'second-bot@linkedin.test',
      });
      const foreignChannel = await createChannelOrThrow({
        connectedAccountId: otherAppConnectionId,
        token: otherApplicationToken,
      });

      await syncFolders({
        messageChannelId: channel.id,
        folders: [{ externalId: 'inb_support', name: 'Support' }],
      });
      await syncFolders({
        messageChannelId: otherHandleChannel.id,
        folders: [{ externalId: 'inb_sales', name: 'Sales' }],
      });
      await syncFolders({
        messageChannelId: foreignChannel.id,
        folders: [{ externalId: 'inb_foreign', name: 'Foreign' }],
        token: otherApplicationToken,
      });

      const response = await request({ query: LIST_FOLDERS_QUERY });

      expect(response.body.errors).toBeUndefined();
      expect(
        response.body.data.appMessageFolders.map(
          (folder: { externalId: string }) => folder.externalId,
        ),
      ).toEqual(['inb_sales', 'inb_support']);
    });

    it("refuses another application's channel", async () => {
      const channel = await createChannelOrThrow();

      const response = await request(
        {
          query: LIST_FOLDERS_QUERY,
          variables: { filter: { messageChannelId: channel.id } },
        },
        otherApplicationToken,
      );

      expect(response.body.errors?.[0]?.extensions?.code).toBe('NOT_FOUND');
    });
  });

  describe('ingestAppMessages with folders', () => {
    it('links a message to its folders, adding folders on re-ingestion', async () => {
      const channel = await createChannelOrThrow();
      const threadExternalId = `thread-${uuidv4()}`;

      const syncResponse = await syncFolders({
        messageChannelId: channel.id,
        folders: [
          { externalId: 'inb_support', name: 'Support' },
          { externalId: 'inb_sales', name: 'Sales' },
        ],
      });

      const supportFolder = findFolder({
        folders: syncResponse.body.data.syncAppMessageFolders,
        externalId: 'inb_support',
      });
      const salesFolder = findFolder({
        folders: syncResponse.body.data.syncAppMessageFolders,
        externalId: 'inb_sales',
      });

      const message = buildMessage({
        externalId: 'in-support',
        threadExternalId,
        senderHandle: 'candidate@linkedin.test',
      });

      const first = await ingest({
        messageChannelId: channel.id,
        messages: [{ ...message, folderExternalIds: ['inb_support'] }],
      });

      expect(first.body.errors).toBeUndefined();

      const [{ messageId }] = first.body.data.ingestAppMessages.messages;

      expect(await findLinkedFolderIds(messageId)).toEqual([supportFolder.id]);

      const second = await ingest({
        messageChannelId: channel.id,
        messages: [{ ...message, folderExternalIds: ['inb_sales'] }],
      });

      expect(second.body.errors).toBeUndefined();
      expect((await findLinkedFolderIds(messageId)).sort()).toEqual(
        [supportFolder.id, salesFolder.id].sort(),
      );
    });

    it('refuses a folder the channel has not declared and saves nothing', async () => {
      const channel = await createChannelOrThrow();

      const response = await ingest({
        messageChannelId: channel.id,
        messages: [
          {
            ...buildMessage({
              externalId: 'in-unknown-folder',
              threadExternalId: `thread-${uuidv4()}`,
              senderHandle: 'candidate@linkedin.test',
            }),
            folderExternalIds: ['inb_unknown'],
          },
        ],
      });

      expect(response.body.errors?.[0]?.extensions?.code).toBe(
        'BAD_USER_INPUT',
      );

      const [{ count }] = await globalThis.testDataSource.query(
        `SELECT count(*) AS count FROM "${WORKSPACE_SCHEMA}"."message"
           WHERE "headerMessageId" LIKE $1`,
        [`app:${owningApplicationDbId}:${channel.id}:%`],
      );

      expect(Number(count)).toBe(0);
    });

    it('keeps the message when its folder is removed', async () => {
      const channel = await createChannelOrThrow();

      await syncFolders({
        messageChannelId: channel.id,
        folders: [{ externalId: 'inb_support', name: 'Support' }],
      });

      const response = await ingest({
        messageChannelId: channel.id,
        messages: [
          {
            ...buildMessage({
              externalId: 'outlives-its-folder',
              threadExternalId: `thread-${uuidv4()}`,
              senderHandle: 'candidate@linkedin.test',
            }),
            folderExternalIds: ['inb_support'],
          },
        ],
      });

      const [{ messageId }] = response.body.data.ingestAppMessages.messages;

      const removal = await syncFolders({
        messageChannelId: channel.id,
        folders: [],
      });

      expect(removal.body.errors).toBeUndefined();
      expect(removal.body.data.syncAppMessageFolders).toEqual([]);
      expect(await findLinkedFolderIds(messageId)).toEqual([]);
      expect(await findAssociation(messageId)).toMatchObject({
        messageExternalId: 'outlives-its-folder',
      });
    });
  });

  describe('updateMessageFolders on an app channel', () => {
    const createFolderOnForeignWorkspaceConnection = async () => {
      const channel = await createChannelOrThrow({
        connectedAccountId: foreignWorkspaceConnectionId,
      });

      const response = await syncFolders({
        messageChannelId: channel.id,
        folders: [{ externalId: 'inb_support', name: 'Support' }],
      });

      return findFolder({
        folders: response.body.data.syncAppMessageFolders,
        externalId: 'inb_support',
      });
    };

    const updateFolders = ({
      messageFolderIds,
      isSynced,
      token,
    }: {
      messageFolderIds: string[];
      isSynced: boolean;
      token: string;
    }) =>
      makeMetadataApiRequest(
        {
          query: UPDATE_MESSAGE_FOLDERS_MUTATION,
          variables: {
            input: { ids: messageFolderIds, update: { isSynced } },
          },
        },
        token,
      );

    it("lets a workspace admin toggle a folder on a workspace-shared connection they don't own", async () => {
      const folder = await createFolderOnForeignWorkspaceConnection();

      const response = await updateFolders({
        messageFolderIds: [folder.id],
        isSynced: false,
        token: APPLE_JANE_ADMIN_ACCESS_TOKEN,
      });

      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.updateMessageFolders).toEqual([
        { id: folder.id, isSynced: false },
      ]);
    });

    it('refuses a member without the applications permission', async () => {
      const folder = await createFolderOnForeignWorkspaceConnection();

      const response = await updateFolders({
        messageFolderIds: [folder.id],
        isSynced: false,
        token: APPLE_JONY_MEMBER_ACCESS_TOKEN,
      });

      expect(response.body.errors?.[0]?.extensions?.code).toBe('FORBIDDEN');

      const [storedFolder] = await globalThis.testDataSource.query(
        `SELECT "isSynced" FROM core."messageFolder" WHERE id = $1`,
        [folder.id],
      );

      expect(storedFolder.isSynced).toBe(true);
    });
  });
});
