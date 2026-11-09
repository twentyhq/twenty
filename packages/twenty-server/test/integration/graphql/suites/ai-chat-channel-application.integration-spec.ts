import { randomUUID } from 'node:crypto';

import { parse } from 'graphql';
import { SystemPermissionFlag } from 'twenty-shared/constants';
import { assertIsDefinedOrThrow, isDefined } from 'twenty-shared/utils';

import { assertGraphQLSuccessfulResponse } from 'test/integration/graphql/utils/graphql-test-assertions.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import {
  type ApplicationWithResources,
  setupApplicationWithResources,
} from 'test/integration/metadata/suites/application/utils/setup-application-with-resources.util';
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

    if (isDefined(channelReader)) {
      await cleanupApplicationAndAppRegistration({
        applicationUniversalIdentifier:
          channelReader.application.universalIdentifier,
      });
    }
  }, 120_000);

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
