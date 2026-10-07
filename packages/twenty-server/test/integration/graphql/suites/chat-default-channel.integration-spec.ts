import { randomUUID } from 'node:crypto';

import { parse } from 'graphql';

import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';

import { type AgentChatDefaultChannelService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-default-channel.service';
import { type AgentChatThreadService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-thread.service';
import { type AgentInboxService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-inbox.service';
import { buildAgentChatDefaultChannelId } from 'src/engine/metadata-modules/ai/ai-chat/utils/build-agent-chat-default-channel-id.util';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { WORKSPACE_MEMBER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/workspace-member-data-seeds.constant';

const { JONY } = WORKSPACE_MEMBER_DATA_SEED_IDS;

const SCHEMA = getWorkspaceSchemaName(SEED_APPLE_WORKSPACE_ID);

const GENERAL_CHANNEL_ID = buildAgentChatDefaultChannelId({
  workspaceId: SEED_APPLE_WORKSPACE_ID,
  kind: 'GENERAL',
});

const SYSTEM_CHANNEL_ID = buildAgentChatDefaultChannelId({
  workspaceId: SEED_APPLE_WORKSPACE_ID,
  kind: 'SYSTEM',
});

const CHANNELS = parse(
  `query Channels { agentChatChannels { id name visibility isMember canManage isSystem } }`,
);

const DELETE_CHANNEL = parse(
  `mutation DeleteChannel($channelId: UUID!, $destinationChannelId: UUID) { deleteAgentChatChannel(channelId: $channelId, destinationChannelId: $destinationChannelId) }`,
);

const LEAVE_CHANNEL = parse(
  `mutation Leave($channelId: UUID!) { leaveAgentChatChannel(channelId: $channelId) }`,
);

const INBOX_THREAD_IDS = parse(
  `query Ids($view: AgentChatInboxViewInput!) { agentChatInboxThreadIds(view: $view, first: 200) { threadIds } }`,
);

type ListedChannel = {
  id: string;
  name: string;
  visibility: 'PUBLIC' | 'PRIVATE';
  isMember: boolean;
  canManage: boolean;
  isSystem: boolean;
};

const listChannels = async (
  token: string = APPLE_JANE_ADMIN_ACCESS_TOKEN,
): Promise<ListedChannel[]> => {
  const response = await makeMetadataApiRequest({ query: CHANNELS }, token);

  expect(response.body.errors).toBeUndefined();

  return response.body.data.agentChatChannels;
};

const findSystemThreadIds = async (
  channelStatus: 'OPEN' | 'DONE',
): Promise<string[]> => {
  const response = await makeMetadataApiRequest({
    query: INBOX_THREAD_IDS,
    variables: {
      view: { kind: 'CHANNEL', channelId: SYSTEM_CHANNEL_ID, channelStatus },
    },
  });

  expect(response.body.errors).toBeUndefined();

  return response.body.data.agentChatInboxThreadIds.threadIds;
};

describe('Default chat channels', () => {
  const createdThreadIds: string[] = [];

  // No member owns these chats, so none can destroy them through the API
  afterEach(async () => {
    await global.testDataSource.query(
      `DELETE FROM ${SCHEMA}."agentChatThread" WHERE id = ANY($1::uuid[])`,
      [createdThreadIds.splice(0)],
    );
  });

  it('gives everyone with AI access General, and the members who manage the workspace System', async () => {
    const janeChannels = await listChannels();
    const jonyChannels = await listChannels(APPLE_JONY_MEMBER_ACCESS_TOKEN);

    expect(janeChannels.find(({ id }) => id === GENERAL_CHANNEL_ID)).toEqual({
      id: GENERAL_CHANNEL_ID,
      name: 'General',
      visibility: 'PUBLIC',
      isMember: true,
      canManage: true,
      isSystem: false,
    });
    expect(janeChannels.find(({ id }) => id === SYSTEM_CHANNEL_ID)).toEqual({
      id: SYSTEM_CHANNEL_ID,
      name: 'System',
      visibility: 'PRIVATE',
      isMember: true,
      canManage: true,
      isSystem: true,
    });
    expect(jonyChannels.find(({ id }) => id === GENERAL_CHANNEL_ID)).toEqual(
      expect.objectContaining({ isMember: true, canManage: false }),
    );
    expect(jonyChannels.map(({ id }) => id)).not.toContain(SYSTEM_CHANNEL_ID);
  });

  it('keeps System, where conversations no member started land', async () => {
    const response = await makeMetadataApiRequest({
      query: DELETE_CHANNEL,
      variables: { channelId: SYSTEM_CHANNEL_ID },
    });

    expect(response.body.errors?.[0]?.extensions?.code).toBe('CONFLICT');
    expect((await listChannels()).map(({ id }) => id)).toContain(
      SYSTEM_CHANNEL_ID,
    );
  });

  it('files a conversation no member started in System as done, and brings it back on activity', async () => {
    const inboxService =
      getAppProviderByClassName<AgentInboxService>('AgentInboxService');
    const threadService = getAppProviderByClassName<AgentChatThreadService>(
      'AgentChatThreadService',
    );

    const { thread } = await inboxService.openThread({
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      sender: {
        type: 'workflow',
        workflowId: randomUUID(),
        workflowName: 'Nightly cleanup',
      },
      workspaceMemberId: null,
      threadKey: randomUUID(),
      title: 'Nightly cleanup',
    });

    createdThreadIds.push(thread.id);

    expect(thread.channelId).toBe(SYSTEM_CHANNEL_ID);
    expect(await findSystemThreadIds('DONE')).toContain(thread.id);
    expect(await findSystemThreadIds('OPEN')).not.toContain(thread.id);

    await threadService.recordThreadActivity({
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      threadId: thread.id,
      text: 'Which records should I delete?',
    });

    expect(await findSystemThreadIds('OPEN')).toContain(thread.id);
    expect(await findSystemThreadIds('DONE')).not.toContain(thread.id);
  });

  it('adds a member joining the workspace to General', async () => {
    const defaultChannelService =
      getAppProviderByClassName<AgentChatDefaultChannelService>(
        'AgentChatDefaultChannelService',
      );

    const leaveResponse = await makeMetadataApiRequest(
      { query: LEAVE_CHANNEL, variables: { channelId: GENERAL_CHANNEL_ID } },
      APPLE_JONY_MEMBER_ACCESS_TOKEN,
    );

    expect(leaveResponse.body.errors).toBeUndefined();
    expect(
      (await listChannels(APPLE_JONY_MEMBER_ACCESS_TOKEN)).find(
        ({ id }) => id === GENERAL_CHANNEL_ID,
      )?.isMember,
    ).toBe(false);

    await defaultChannelService.addMemberToGeneral({
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      workspaceMemberId: JONY,
    });

    expect(
      (await listChannels(APPLE_JONY_MEMBER_ACCESS_TOKEN)).find(
        ({ id }) => id === GENERAL_CHANNEL_ID,
      )?.isMember,
    ).toBe(true);
  });
});
