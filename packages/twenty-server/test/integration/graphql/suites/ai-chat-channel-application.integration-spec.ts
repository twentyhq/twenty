import { randomUUID } from 'node:crypto';

import { parse } from 'graphql';
import { SystemPermissionFlag } from 'twenty-shared/constants';
import { assertIsDefinedOrThrow, isDefined } from 'twenty-shared/utils';

import { assertGraphQLSuccessfulResponse } from 'test/integration/graphql/utils/graphql-test-assertions.util';
import { findWorkspaceCustomApplicationId } from 'test/integration/metadata/suites/application-default-role/utils/find-application-default-role.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import {
  type ApplicationWithResources,
  setupApplicationWithResources,
} from 'test/integration/metadata/suites/application/utils/setup-application-with-resources.util';
import { uninstallApplication } from 'test/integration/metadata/suites/application/utils/uninstall-application.util';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { destroyAgentChatThread } from 'test/integration/utils/destroy-agent-chat-thread.util';
import { generateAppleAdminApplicationTokenPair } from 'test/integration/utils/generate-apple-admin-application-token-pair.util';
import { generateApplicationTokenPair } from 'test/integration/utils/generate-application-token-pair.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { getCoreRepository } from 'test/integration/utils/get-core-repository.util';
import { removeAgentChatSnoozeEndJobs } from 'test/integration/utils/remove-agent-chat-snooze-end-jobs.util';

import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { AgentChatChannelRoleEntity } from 'src/engine/metadata-modules/agent-chat-channel/entities/agent-chat-channel-role.entity';
import { AgentChatChannelEntity } from 'src/engine/metadata-modules/agent-chat-channel/entities/agent-chat-channel.entity';
import { AiExceptionCode } from 'src/engine/metadata-modules/ai/ai.exception';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { STANDARD_AGENT_CHAT_CHANNEL } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-agent-chat-channel.constant';
import { WORKSPACE_MEMBER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/workspace-member-data-seeds.constant';
import { type WorkspaceEventEmitter } from 'src/engine/workspace-event-emitter/workspace-event-emitter';

const SCHEMA = getWorkspaceSchemaName(SEED_APPLE_WORKSPACE_ID);

const CHANNEL_MANAGER_PERMISSION_FLAGS = [
  SystemPermissionFlag.AI,
  SystemPermissionFlag.AI_SETTINGS,
];

type ListedChannel = {
  id: string;
  name: string;
  applicationId: string;
  isAccessible: boolean;
  roleIds: string[];
};

type ApplicationUnderTest = {
  application: ApplicationWithResources;
  token: string;
  userBoundToken: string;
  roleId: string;
};

const CHANNELS = parse(
  `query Channels { agentChatChannels { id name applicationId isAccessible roleIds } }`,
);

const CHANNEL_ROLES = parse(
  `query ChannelRoles { agentChatChannelRoles { id } }`,
);

const CREATE_CHANNEL = parse(
  `mutation CreateChannel($input: CreateAgentChatChannelInput!) { createAgentChatChannel(input: $input) { id name roleIds } }`,
);

const UPDATE_CHANNEL = parse(
  `mutation UpdateChannel($channelId: UUID!, $input: UpdateAgentChatChannelInput!) { updateAgentChatChannel(channelId: $channelId, input: $input) { id name roleIds } }`,
);

const DELETE_CHANNEL = parse(
  `mutation DeleteChannel($channelId: UUID!, $destinationChannelId: UUID) { deleteAgentChatChannel(channelId: $channelId, destinationChannelId: $destinationChannelId) }`,
);

const CREATE_THREAD = parse(
  `mutation CreateThread($channelId: UUID) { createChatThread(channelId: $channelId) { id } }`,
);

const CHANNEL_CONVERSATIONS = parse(
  `query Conversations($channelId: UUID!, $assignment: AgentChatChannelAssignmentFilter, $filter: AgentChatChannelThreadFilter) { agentChatChannelThreadIds(channelId: $channelId, assignment: $assignment, filter: $filter) { threadIds } agentChatChannelSummaries { channelId openCount mentionedCount assignedToMeCount assignedCount hasUnreadOpen } agentChatChannels { id isAccessible } }`,
);

const MOVE_AND_MARK_THREAD_DONE = parse(
  `mutation MoveAndMarkThreadDone($threadId: UUID!, $channelId: UUID) { moveAgentChatThreadToChannel(threadId: $threadId, channelId: $channelId) markAgentChatThreadAsDoneInChannel(threadId: $threadId) }`,
);

const MARK_THREAD_DONE = parse(
  `mutation MarkThreadDone($threadId: UUID!) { markAgentChatThreadAsDoneInChannel(threadId: $threadId) }`,
);

const SNOOZE_THREAD = parse(
  `mutation SnoozeThread($threadId: UUID!, $snoozedUntil: DateTime!) { snoozeAgentChatThreadInChannel(threadId: $threadId, snoozedUntil: $snoozedUntil) }`,
);

const REOPEN_THREAD = parse(
  `mutation ReopenThread($threadId: UUID!) { reopenAgentChatThreadInChannel(threadId: $threadId) }`,
);

const setupApplicationUnderTestOrThrow = async ({
  name,
  permissionFlagUniversalIdentifiers,
}: {
  name: string;
  permissionFlagUniversalIdentifiers: string[];
}): Promise<ApplicationUnderTest> => {
  const application = await setupApplicationWithResources({
    name,
    permissionFlagUniversalIdentifiers,
  });

  jest.useRealTimers();

  const [
    {
      applicationAccessToken: { token },
    },
    {
      applicationAccessToken: { token: userBoundToken },
    },
    { defaultRoleId },
  ] = await Promise.all([
    generateApplicationTokenPair({
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      applicationId: application.id,
    }),
    generateAppleAdminApplicationTokenPair({ applicationId: application.id }),
    getCoreRepository<ApplicationEntity>(ApplicationEntity).findOneOrFail({
      select: { defaultRoleId: true },
      where: { id: application.id, workspaceId: SEED_APPLE_WORKSPACE_ID },
    }),
  ]);

  assertIsDefinedOrThrow(defaultRoleId);

  return { application, token, userBoundToken, roleId: defaultRoleId };
};

const readChannelsWithUniversalIdentifier = async (
  universalIdentifier: string,
): Promise<{ id: string; applicationId: string }[]> =>
  getCoreRepository<AgentChatChannelEntity>(AgentChatChannelEntity).find({
    select: { id: true, applicationId: true },
    where: { workspaceId: SEED_APPLE_WORKSPACE_ID, universalIdentifier },
  });

const findGeneralChannelId = async (): Promise<string> => {
  const [{ id }] = await readChannelsWithUniversalIdentifier(
    STANDARD_AGENT_CHAT_CHANNEL.general.universalIdentifier,
  );

  return id;
};

const readChannelApplicationId = async (
  channelId: string,
): Promise<string | undefined> => {
  const channel = await getCoreRepository<AgentChatChannelEntity>(
    AgentChatChannelEntity,
  ).findOne({
    select: { applicationId: true },
    where: { id: channelId, workspaceId: SEED_APPLE_WORKSPACE_ID },
  });

  return channel?.applicationId;
};

const readChannelRoleApplicationIds = async (
  channelId: string,
): Promise<{ roleId: string; applicationId: string }[]> =>
  getCoreRepository<AgentChatChannelRoleEntity>(
    AgentChatChannelRoleEntity,
  ).find({
    select: { roleId: true, applicationId: true },
    where: { channelId, workspaceId: SEED_APPLE_WORKSPACE_ID },
    order: { roleId: 'ASC' },
  });

const readThreadChannelState = (threadId: string) =>
  global.testDataSource
    .createQueryBuilder()
    .select('thread."channelId"', 'channelId')
    .addSelect('thread."channelArchivedAt"', 'channelArchivedAt')
    .addSelect('thread."channelSnoozedUntil"', 'channelSnoozedUntil')
    .from(`${SCHEMA}.agentChatThread`, 'thread')
    .where('thread.id = :threadId', { threadId })
    .getRawOne<{
      channelId: string;
      channelArchivedAt: Date | null;
      channelSnoozedUntil: Date | null;
    }>();

const readThreadParticipants = (threadId: string) =>
  global.testDataSource
    .createQueryBuilder()
    .select('participant.*')
    .from(`${SCHEMA}.agentChatThreadParticipant`, 'participant')
    .where('participant."threadId" = :threadId', { threadId })
    .orderBy('participant.id')
    .getRawMany<Record<string, unknown>>();

const readChannelGrants = async (
  threadId: string,
): Promise<{ principalType: string; sourceId: string }[]> =>
  global.testDataSource
    .createQueryBuilder()
    .select('record_share."principalType"', 'principalType')
    .addSelect('record_share."sourceId"', 'sourceId')
    .distinct(true)
    .from(`${SCHEMA}.recordShare`, 'record_share')
    .where('record_share."recordId" = :threadId', { threadId })
    .andWhere('record_share."rowCause" = :rowCause', { rowCause: 'RULE' })
    .andWhere('record_share."deletedAt" IS NULL')
    .orderBy('record_share."principalType"')
    .getRawMany<{ principalType: string; sourceId: string }>();

const readChannelGrantRoleIds = async (threadId: string): Promise<string[]> =>
  (
    await global.testDataSource
      .createQueryBuilder()
      .select('record_share."principalId"', 'principalId')
      .from(`${SCHEMA}.recordShare`, 'record_share')
      .where('record_share."recordId" = :threadId', { threadId })
      .andWhere('record_share."rowCause" = :rowCause', { rowCause: 'RULE' })
      .andWhere('record_share."deletedAt" IS NULL')
      .andWhere('record_share."principalType" = :principalType', {
        principalType: 'ROLE',
      })
      .orderBy('record_share."principalId"')
      .getRawMany<{ principalId: string }>()
  ).map(({ principalId }) => principalId);

const listChannels = async (token: string): Promise<ListedChannel[]> => {
  const response = await makeMetadataApiRequest({ query: CHANNELS }, token);

  assertGraphQLSuccessfulResponse(response);

  return response.body.data.agentChatChannels;
};

const buildChannelName = () => `Application channel ${randomUUID()}`;

const createdThreadIds: string[] = [];

const createThreadInChannel = async (
  channelId: string | null,
): Promise<string> => {
  const response = await makeMetadataApiRequest({
    query: CREATE_THREAD,
    variables: { channelId },
  });

  assertGraphQLSuccessfulResponse(response);

  const threadId = response.body.data.createChatThread.id;

  createdThreadIds.push(threadId);

  return threadId;
};

const destroyCreatedThreads = async () => {
  for (const threadId of createdThreadIds.splice(0)) {
    await destroyAgentChatThread({ threadId });
  }
};

describe('Inbox channels for applications', () => {
  const createdChannelIds = new Set<string>();
  let channelManager: ApplicationUnderTest;
  let otherChannelManager: ApplicationUnderTest;
  let channelReader: ApplicationUnderTest;
  let generalChannelId: string;

  const createChannel = async ({
    input,
    token,
  }: {
    input: Record<string, unknown>;
    token: string;
  }) => {
    const response = await makeMetadataApiRequest(
      { query: CREATE_CHANNEL, variables: { input } },
      token,
    );
    const createdChannelId = response.body.data?.createAgentChatChannel?.id;

    if (isDefined(createdChannelId)) {
      createdChannelIds.add(createdChannelId);
    }

    return response;
  };

  const createChannelOrThrow = async ({
    input,
    token,
  }: {
    input: Record<string, unknown>;
    token: string;
  }): Promise<string> => {
    const response = await createChannel({ input, token });

    assertGraphQLSuccessfulResponse(response);

    return response.body.data.createAgentChatChannel.id;
  };

  const updateChannel = ({
    channelId,
    input,
    token,
  }: {
    channelId: string;
    input: Record<string, unknown>;
    token: string;
  }) =>
    makeMetadataApiRequest(
      { query: UPDATE_CHANNEL, variables: { channelId, input } },
      token,
    );

  const deleteChannel = ({
    channelId,
    token,
    destinationChannelId = null,
  }: {
    channelId: string;
    token: string;
    destinationChannelId?: string | null;
  }) =>
    makeMetadataApiRequest(
      {
        query: DELETE_CHANNEL,
        variables: { channelId, destinationChannelId },
      },
      token,
    );

  beforeAll(async () => {
    channelManager = await setupApplicationUnderTestOrThrow({
      name: 'Channel Manager Application',
      permissionFlagUniversalIdentifiers: CHANNEL_MANAGER_PERMISSION_FLAGS,
    });
    otherChannelManager = await setupApplicationUnderTestOrThrow({
      name: 'Other Channel Manager Application',
      permissionFlagUniversalIdentifiers: CHANNEL_MANAGER_PERMISSION_FLAGS,
    });
    channelReader = await setupApplicationUnderTestOrThrow({
      name: 'Channel Reader Application',
      permissionFlagUniversalIdentifiers: [SystemPermissionFlag.AI],
    });
    generalChannelId = await findGeneralChannelId();
  }, 180_000);

  afterEach(() =>
    removeAgentChatSnoozeEndJobs({ threadIds: createdThreadIds }),
  );

  afterAll(async () => {
    await destroyCreatedThreads();

    for (const channelId of createdChannelIds) {
      await deleteChannel({ channelId, token: APPLE_JANE_ADMIN_ACCESS_TOKEN });
    }

    for (const { application } of [
      channelManager,
      otherChannelManager,
      channelReader,
    ].filter(isDefined)) {
      await cleanupApplicationAndAppRegistration({
        applicationUniversalIdentifier: application.universalIdentifier,
      });
    }
  }, 120_000);

  it('lists only the channels open to the role of an application without AI settings, and keeps their settings closed', async () => {
    const openChannelId = await createChannelOrThrow({
      input: {
        name: buildChannelName(),
        roleIds: [channelManager.roleId, channelReader.roleId],
      },
      token: channelManager.token,
    });
    const closedChannelId = await createChannelOrThrow({
      input: { name: buildChannelName() },
      token: channelManager.token,
    });
    const managedChannels = await listChannels(channelManager.token);

    expect(
      managedChannels.find(({ id }) => id === openChannelId),
    ).toMatchObject({
      isAccessible: true,
    });
    expect(
      managedChannels.find(({ id }) => id === closedChannelId),
    ).toMatchObject({
      isAccessible: false,
    });

    const channelIds = (await listChannels(channelReader.token)).map(
      ({ id }) => id,
    );

    expect(channelIds).toContain(openChannelId);
    expect(channelIds).not.toContain(closedChannelId);
    expect(channelIds).not.toContain(generalChannelId);

    const rolesResponse = await makeMetadataApiRequest(
      { query: CHANNEL_ROLES },
      channelReader.token,
    );
    const createResponse = await createChannel({
      input: { name: buildChannelName() },
      token: channelReader.token,
    });

    for (const response of [rolesResponse, createResponse]) {
      expect(response.body.errors[0].extensions.code).toBe('FORBIDDEN');
    }
  });

  it('creates one application-owned channel for concurrent and repeated requests', async () => {
    const universalIdentifier = randomUUID();
    const name = buildChannelName();
    const responses = await Promise.all(
      [
        { identifier: universalIdentifier, token: channelManager.token },
        {
          identifier: universalIdentifier.toUpperCase(),
          token: channelManager.userBoundToken,
        },
      ].map(({ identifier, token }) =>
        createChannel({
          input: { name, universalIdentifier: identifier },
          token,
        }),
      ),
    );

    for (const response of responses) {
      assertGraphQLSuccessfulResponse(response);
    }

    const channelId = responses[0].body.data.createAgentChatChannel.id;
    const repeatedResponse = await createChannel({
      input: {
        name: buildChannelName(),
        universalIdentifier,
        roleIds: [channelManager.roleId],
      },
      token: channelManager.token,
    });

    assertGraphQLSuccessfulResponse(repeatedResponse);
    expect(responses[1].body.data.createAgentChatChannel.id).toBe(channelId);
    expect(repeatedResponse.body.data.createAgentChatChannel).toMatchObject({
      id: channelId,
      name,
      roleIds: [],
    });
    expect(
      await readChannelsWithUniversalIdentifier(universalIdentifier),
    ).toEqual([
      { id: channelId, applicationId: channelManager.application.id },
    ]);
  });

  it('cannot claim, reuse the name of, update or delete a channel owned by another application', async () => {
    const universalIdentifier = randomUUID();
    const name = buildChannelName();
    const channelId = await createChannelOrThrow({
      input: { name, universalIdentifier },
      token: otherChannelManager.token,
    });
    const claimResponse = await createChannel({
      input: { name: buildChannelName(), universalIdentifier },
      token: channelManager.token,
    });
    const sameNameResponse = await createChannel({
      input: { name },
      token: channelManager.token,
    });

    expect(claimResponse.body.errors[0].extensions).toMatchObject({
      code: 'CONFLICT',
      subCode: AiExceptionCode.CHAT_CHANNEL_UNIVERSAL_IDENTIFIER_TAKEN,
    });
    expect(sameNameResponse.body.errors[0].extensions).toMatchObject({
      code: 'BAD_USER_INPUT',
      subCode: AiExceptionCode.INVALID_CHAT_CHANNEL_NAME,
    });

    const responses = await Promise.all([
      updateChannel({
        channelId,
        input: { name: buildChannelName() },
        token: channelManager.token,
      }),
      deleteChannel({ channelId, token: channelManager.userBoundToken }),
    ]);

    for (const response of responses) {
      expect(response.body.errors[0].extensions.code).toBe('FORBIDDEN');
    }
    expect(await readChannelApplicationId(channelId)).toBe(
      otherChannelManager.application.id,
    );
  });

  it('updates and deletes its own channel, keeping the access it adds as its own', async () => {
    const channelId = await createChannelOrThrow({
      input: { name: buildChannelName(), universalIdentifier: randomUUID() },
      token: channelManager.token,
    });
    const renamedName = buildChannelName();

    const updateResponse = await updateChannel({
      channelId,
      input: { name: renamedName, roleIds: [channelManager.roleId] },
      token: channelManager.token,
    });

    assertGraphQLSuccessfulResponse(updateResponse);
    expect(updateResponse.body.data.updateAgentChatChannel).toMatchObject({
      id: channelId,
      name: renamedName,
      roleIds: [channelManager.roleId],
    });
    expect(await readChannelRoleApplicationIds(channelId)).toEqual([
      {
        roleId: channelManager.roleId,
        applicationId: channelManager.application.id,
      },
    ]);

    const memberUpdateResponse = await updateChannel({
      channelId,
      input: { roleIds: [channelReader.roleId] },
      token: APPLE_JANE_ADMIN_ACCESS_TOKEN,
    });

    assertGraphQLSuccessfulResponse(memberUpdateResponse);
    expect(await readChannelRoleApplicationIds(channelId)).toEqual([
      {
        roleId: channelReader.roleId,
        applicationId: await findWorkspaceCustomApplicationId(),
      },
    ]);

    assertGraphQLSuccessfulResponse(
      await deleteChannel({ channelId, token: channelManager.token }),
    );
    expect(await readChannelApplicationId(channelId)).toBeUndefined();
  });

  it('moves the chats of its deleted channel only to a channel its role can open', async () => {
    const channelId = await createChannelOrThrow({
      input: { name: buildChannelName(), roleIds: [channelManager.roleId] },
      token: channelManager.token,
    });
    const destinationChannelId = await createChannelOrThrow({
      input: { name: buildChannelName(), roleIds: [channelManager.roleId] },
      token: channelManager.token,
    });
    const threadId = await createThreadInChannel(channelId);

    const closedDestinationResponse = await deleteChannel({
      channelId,
      token: channelManager.token,
      destinationChannelId: generalChannelId,
    });

    expect(closedDestinationResponse.body.errors[0].extensions).toMatchObject({
      code: 'NOT_FOUND',
      subCode: AiExceptionCode.CHAT_CHANNEL_NOT_FOUND,
    });
    expect(await readThreadChannelState(threadId)).toMatchObject({
      channelId: channelId,
    });

    assertGraphQLSuccessfulResponse(
      await deleteChannel({
        channelId,
        token: channelManager.token,
        destinationChannelId,
      }),
    );
    expect(await readThreadChannelState(threadId)).toMatchObject({
      channelId: destinationChannelId,
    });
    expect(await readChannelGrants(threadId)).toEqual([
      { principalType: 'ROLE', sourceId: destinationChannelId },
    ]);
  });

  it('lists channel conversations without personal inbox state for an application', async () => {
    const channelId = await createChannelOrThrow({
      input: { name: buildChannelName(), roleIds: [channelReader.roleId] },
      token: APPLE_JANE_ADMIN_ACCESS_TOKEN,
    });
    const threadId = await createThreadInChannel(channelId);

    await global.testDataSource
      .createQueryBuilder()
      .update(`${SCHEMA}.agentChatThread`)
      .set({
        assigneeId: WORKSPACE_MEMBER_DATA_SEED_IDS.JANE,
        lastActivityAt: new Date(),
      })
      .where('id = :threadId', { threadId })
      .execute();
    await global.testDataSource
      .createQueryBuilder()
      .update(`${SCHEMA}.agentChatThreadParticipant`)
      .set({ lastMentionedAt: new Date() })
      .where('"threadId" = :threadId', { threadId })
      .execute();

    const response = await makeMetadataApiRequest(
      { query: CHANNEL_CONVERSATIONS, variables: { channelId } },
      channelReader.token,
    );

    assertGraphQLSuccessfulResponse(response);
    expect(response.body.data.agentChatChannelThreadIds.threadIds).toEqual([
      threadId,
    ]);
    expect(response.body.data.agentChatChannelSummaries).toContainEqual({
      channelId,
      openCount: 1,
      mentionedCount: 0,
      assignedToMeCount: 0,
      assignedCount: 1,
      hasUnreadOpen: false,
    });
    expect(response.body.data.agentChatChannels).toContainEqual({
      id: channelId,
      isAccessible: true,
    });
    expect(
      response.body.data.agentChatChannels.map(({ id }: { id: string }) => id),
    ).not.toContain(generalChannelId);

    for (const personalFilter of [
      { assignment: 'ASSIGNED_TO_ME' },
      { filter: 'MENTIONED' },
    ]) {
      const personalResponse = await makeMetadataApiRequest(
        {
          query: CHANNEL_CONVERSATIONS,
          variables: { channelId, ...personalFilter },
        },
        channelReader.token,
      );

      assertGraphQLSuccessfulResponse(personalResponse);
      expect(
        personalResponse.body.data.agentChatChannelThreadIds.threadIds,
      ).toEqual([]);
    }
  });

  it('moves and archives channel conversations without changing a member inbox', async () => {
    const channelIds: string[] = [];

    for (const name of [buildChannelName(), buildChannelName()]) {
      channelIds.push(
        await createChannelOrThrow({
          input: { name, roleIds: [channelReader.roleId] },
          token: APPLE_JANE_ADMIN_ACCESS_TOKEN,
        }),
      );
    }

    const [sourceChannelId, destinationChannelId] = channelIds;
    const threadId = await createThreadInChannel(sourceChannelId);
    const participantsBefore = await readThreadParticipants(threadId);
    const deniedResponse = await makeMetadataApiRequest(
      {
        query: MOVE_AND_MARK_THREAD_DONE,
        variables: { threadId, channelId: generalChannelId },
      },
      channelReader.token,
    );

    expect(participantsBefore).not.toHaveLength(0);
    expect(deniedResponse.body.errors[0].extensions).toMatchObject({
      code: 'NOT_FOUND',
      subCode: AiExceptionCode.CHAT_CHANNEL_NOT_FOUND,
    });

    const response = await makeMetadataApiRequest(
      {
        query: MOVE_AND_MARK_THREAD_DONE,
        variables: { threadId, channelId: destinationChannelId },
      },
      channelReader.token,
    );

    assertGraphQLSuccessfulResponse(response);
    expect(await readThreadChannelState(threadId)).toEqual({
      channelId: destinationChannelId,
      channelArchivedAt: expect.anything(),
      channelSnoozedUntil: null,
    });
    expect(await readThreadParticipants(threadId)).toEqual(participantsBefore);

    const snoozedUntil = new Date(Date.now() + 30_000);

    assertGraphQLSuccessfulResponse(
      await makeMetadataApiRequest(
        {
          query: SNOOZE_THREAD,
          variables: { threadId, snoozedUntil: snoozedUntil.toISOString() },
        },
        channelReader.token,
      ),
    );
    expect(
      (
        await readThreadChannelState(threadId)
      )?.channelSnoozedUntil?.toISOString(),
    ).toBe(snoozedUntil.toISOString());

    assertGraphQLSuccessfulResponse(
      await makeMetadataApiRequest(
        { query: REOPEN_THREAD, variables: { threadId } },
        channelReader.token,
      ),
    );
    expect(await readThreadChannelState(threadId)).toEqual({
      channelId: destinationChannelId,
      channelArchivedAt: null,
      channelSnoozedUntil: null,
    });
    expect(await readThreadParticipants(threadId)).toEqual(participantsBefore);
  });

  it('refuses an application without access to the conversation', async () => {
    const channelResponse = await makeMetadataApiRequest(
      {
        query: CHANNEL_CONVERSATIONS,
        variables: { channelId: generalChannelId },
      },
      channelReader.token,
    );

    expect(channelResponse.body.errors[0].extensions).toMatchObject({
      code: 'NOT_FOUND',
      subCode: AiExceptionCode.CHAT_CHANNEL_NOT_FOUND,
    });

    const threadId = await createThreadInChannel(generalChannelId);
    const response = await makeMetadataApiRequest(
      { query: MARK_THREAD_DONE, variables: { threadId } },
      channelReader.token,
    );

    expect(response.body.errors[0].extensions).toMatchObject({
      code: 'NOT_FOUND',
      subCode: AiExceptionCode.THREAD_NOT_FOUND,
    });
  });
});

describe('Uninstalling an application that created inbox channels', () => {
  let uninstalledApplication: ApplicationUnderTest;

  beforeAll(async () => {
    uninstalledApplication = await setupApplicationUnderTestOrThrow({
      name: 'Uninstalled Channel Application',
      permissionFlagUniversalIdentifiers: CHANNEL_MANAGER_PERMISSION_FLAGS,
    });
  }, 180_000);

  afterAll(async () => {
    await destroyCreatedThreads();

    if (!isDefined(uninstalledApplication)) {
      return;
    }

    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier:
        uninstalledApplication.application.universalIdentifier,
    });
  }, 120_000);

  it('deletes its channels and moves their chats to General with the access of General', async () => {
    const generalChannelId = await findGeneralChannelId();
    const createResponse = await makeMetadataApiRequest(
      {
        query: CREATE_CHANNEL,
        variables: {
          input: {
            name: buildChannelName(),
            roleIds: [uninstalledApplication.roleId],
          },
        },
      },
      uninstalledApplication.token,
    );

    assertGraphQLSuccessfulResponse(createResponse);

    const channelId = createResponse.body.data.createAgentChatChannel.id;
    const threadId = await createThreadInChannel(channelId);
    const generalThreadId = await createThreadInChannel(generalChannelId);
    const generalRoleIds = await readChannelGrantRoleIds(generalThreadId);

    expect(await readChannelGrantRoleIds(threadId)).toContain(
      uninstalledApplication.roleId,
    );

    const emitDatabaseBatchEventSpy = jest.spyOn(
      getAppProviderByClassName<WorkspaceEventEmitter>('WorkspaceEventEmitter'),
      'emitDatabaseBatchEvent',
    );

    try {
      const { errors } = await uninstallApplication({
        universalIdentifier:
          uninstalledApplication.application.universalIdentifier,
      });

      expect(errors).toBeUndefined();
      expect(await readChannelApplicationId(channelId)).toBeUndefined();
      expect(
        emitDatabaseBatchEventSpy.mock.calls.some(
          ([batchEvent]) =>
            batchEvent?.objectMetadataNameSingular === 'agentChatThread' &&
            batchEvent.events.some(
              (event) => 'recordId' in event && event.recordId === threadId,
            ),
        ),
      ).toBe(true);
    } finally {
      emitDatabaseBatchEventSpy.mockRestore();
    }

    expect(await readThreadChannelState(threadId)).toMatchObject({
      channelId: generalChannelId,
    });
    expect(await readChannelGrants(threadId)).toEqual([
      { principalType: 'ROLE', sourceId: generalChannelId },
    ]);
    expect(await readChannelGrantRoleIds(threadId)).toEqual(generalRoleIds);
  }, 60_000);
});
