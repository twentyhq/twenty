import { randomUUID } from 'node:crypto';

import { parse } from 'graphql';
import { SystemPermissionFlag } from 'twenty-shared/constants';
import { assertIsDefinedOrThrow, isDefined } from 'twenty-shared/utils';

import { UPDATE_CHANNEL } from 'test/integration/graphql/suites/chat-channel/utils/chat-channel-test.util';
import { assertGraphQLSuccessfulResponse } from 'test/integration/graphql/utils/graphql-test-assertions.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import {
  type ApplicationWithResources,
  setupApplicationWithResources,
} from 'test/integration/metadata/suites/application/utils/setup-application-with-resources.util';
import { uninstallApplication } from 'test/integration/metadata/suites/application/utils/uninstall-application.util';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { destroyAgentChatThread } from 'test/integration/utils/destroy-agent-chat-thread.util';
import { generateApplicationTokenPair } from 'test/integration/utils/generate-application-token-pair.util';
import { getCoreRepository } from 'test/integration/utils/get-core-repository.util';
import { removeAgentChatSnoozeEndJobs } from 'test/integration/utils/remove-agent-chat-snooze-end-jobs.util';

import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { AgentChatChannelEntity } from 'src/engine/metadata-modules/agent-chat-channel/entities/agent-chat-channel.entity';
import { AiExceptionCode } from 'src/engine/metadata-modules/ai/ai.exception';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { STANDARD_AGENT_CHAT_CHANNEL } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-agent-chat-channel.constant';
import { WORKSPACE_MEMBER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/workspace-member-data-seeds.constant';

const SCHEMA = getWorkspaceSchemaName(SEED_APPLE_WORKSPACE_ID);

const CHANNEL_MANAGER_PERMISSION_FLAGS = [
  SystemPermissionFlag.AI,
  SystemPermissionFlag.AI_SETTINGS,
];

type ApplicationUnderTest = {
  application: ApplicationWithResources;
  token: string;
  roleId: string;
};

const CREATE_CHANNEL = parse(
  `mutation CreateChannel($input: CreateAgentChatChannelInput!) { createAgentChatChannel(input: $input) { id name roleIds } }`,
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
    { defaultRoleId },
  ] = await Promise.all([
    generateApplicationTokenPair({
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      applicationId: application.id,
    }),
    getCoreRepository<ApplicationEntity>(ApplicationEntity).findOneOrFail({
      select: { defaultRoleId: true },
      where: { id: application.id, workspaceId: SEED_APPLE_WORKSPACE_ID },
    }),
  ]);

  assertIsDefinedOrThrow(defaultRoleId);

  return { application, token, roleId: defaultRoleId };
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

    for (const { application } of [channelManager, channelReader].filter(
      isDefined,
    )) {
      await cleanupApplicationAndAppRegistration({
        applicationUniversalIdentifier: application.universalIdentifier,
      });
    }
  }, 120_000);

  it('returns the channel it already created under the same universal identifier', async () => {
    const universalIdentifier = randomUUID();
    const name = buildChannelName();
    const channelId = await createChannelOrThrow({
      input: { name, universalIdentifier },
      token: channelManager.token,
    });

    const repeatedResponse = await createChannel({
      input: {
        name: buildChannelName(),
        universalIdentifier: universalIdentifier.toUpperCase(),
        roleIds: [channelManager.roleId],
      },
      token: channelManager.token,
    });

    assertGraphQLSuccessfulResponse(repeatedResponse);
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

  it('cannot claim, update or delete a channel it does not own, and takes the next free name', async () => {
    const universalIdentifier = randomUUID();
    const name = buildChannelName();
    const channelId = await createChannelOrThrow({
      input: { name, universalIdentifier },
      token: APPLE_JANE_ADMIN_ACCESS_TOKEN,
    });

    const claimResponse = await createChannel({
      input: { name: buildChannelName(), universalIdentifier },
      token: channelManager.token,
    });
    const sameNameResponse = await createChannel({
      input: { name },
      token: channelManager.token,
    });
    const updateResponse = await updateChannel({
      channelId,
      input: { name: buildChannelName() },
      token: channelManager.token,
    });
    const deleteResponse = await deleteChannel({
      channelId,
      token: channelManager.token,
    });

    expect(claimResponse.body.errors[0].extensions).toMatchObject({
      code: 'CONFLICT',
      subCode: AiExceptionCode.CHAT_CHANNEL_UNIVERSAL_IDENTIFIER_TAKEN,
    });
    assertGraphQLSuccessfulResponse(sameNameResponse);
    expect(sameNameResponse.body.data.createAgentChatChannel.name).toBe(
      `${name} 2`,
    );

    for (const response of [updateResponse, deleteResponse]) {
      expect(response.body.errors[0].extensions.code).toBe('FORBIDDEN');
    }
  });

  it('updates and deletes its own channel, which members still manage', async () => {
    const channelId = await createChannelOrThrow({
      input: { name: buildChannelName() },
      token: channelManager.token,
    });

    const updateResponse = await updateChannel({
      channelId,
      input: { roleIds: [channelManager.roleId] },
      token: channelManager.token,
    });

    assertGraphQLSuccessfulResponse(updateResponse);
    expect(updateResponse.body.data.updateAgentChatChannel.roleIds).toEqual([
      channelManager.roleId,
    ]);
    assertGraphQLSuccessfulResponse(
      await updateChannel({
        channelId,
        input: { roleIds: [channelReader.roleId] },
        token: APPLE_JANE_ADMIN_ACCESS_TOKEN,
      }),
    );
    assertGraphQLSuccessfulResponse(
      await deleteChannel({ channelId, token: channelManager.token }),
    );
    expect(await readChannelApplicationId(channelId)).toBeUndefined();
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

  it('deletes its channels and moves their chats to General', async () => {
    const createResponse = await makeMetadataApiRequest(
      {
        query: CREATE_CHANNEL,
        variables: { input: { name: buildChannelName() } },
      },
      uninstalledApplication.token,
    );

    assertGraphQLSuccessfulResponse(createResponse);

    const channelId = createResponse.body.data.createAgentChatChannel.id;
    const threadId = await createThreadInChannel(channelId);

    const { errors } = await uninstallApplication({
      universalIdentifier:
        uninstalledApplication.application.universalIdentifier,
    });

    expect(errors).toBeUndefined();
    expect(await readChannelApplicationId(channelId)).toBeUndefined();
    expect(await readThreadChannelState(threadId)).toMatchObject({
      channelId: await findGeneralChannelId(),
    });
  }, 60_000);
});
