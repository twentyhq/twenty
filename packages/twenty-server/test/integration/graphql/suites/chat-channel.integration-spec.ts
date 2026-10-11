import { randomUUID } from 'node:crypto';

import { parse } from 'graphql';

import { deleteOneOperationFactory } from 'test/integration/graphql/utils/delete-one-operation-factory.util';
import { destroyOneOperationFactory } from 'test/integration/graphql/utils/destroy-one-operation-factory.util';
import { findManyOperationFactory } from 'test/integration/graphql/utils/find-many-operation-factory.util';
import { makeGraphqlApiRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { findOneRoleByLabel } from 'test/integration/metadata/suites/role/utils/find-one-role-by-label.util';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { destroyAgentChatThread } from 'test/integration/utils/destroy-agent-chat-thread.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';

import { type AgentChatThreadService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-thread.service';
import { type AgentChatThreadTriageService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-thread-triage.service';
import { detachAgentChatChannelThreadsFromWorkspaceMember } from 'src/engine/metadata-modules/ai/ai-chat/utils/detach-agent-chat-channel-threads-from-workspace-member.util';
import { type AgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/agent-history-repository';
import { getAgentHistoryRepositoryToken } from 'src/engine/metadata-modules/ai/ai-history/repositories/inject-agent-history-repository.decorator';
import { type AgentChatThreadWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-chat-thread.workspace-entity';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { type WorkspaceEventEmitter } from 'src/engine/workspace-event-emitter/workspace-event-emitter';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { WORKSPACE_MEMBER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/workspace-member-data-seeds.constant';

const SCHEMA = getWorkspaceSchemaName(SEED_APPLE_WORKSPACE_ID);

const { JANE, JONY, PHIL } = WORKSPACE_MEMBER_DATA_SEED_IDS;

type ChannelVisibility = 'PUBLIC' | 'PRIVATE';

type ChannelThreadsFilter = {
  status?: 'OPEN' | 'SNOOZED' | 'DONE';
  assignment?: 'ANY' | 'UNASSIGNED' | 'ASSIGNED_TO_ME';
};

type InboxAction =
  | 'READ'
  | 'ARCHIVE'
  | 'SNOOZE'
  | 'MOVE_TO_INBOX'
  | 'SUBSCRIBE';

const CREATE_CHANNEL = parse(
  `mutation CreateChannel($input: CreateAgentChatChannelInput!) { createAgentChatChannel(input: $input) { id name icon color visibility } }`,
);

const UPDATE_CHANNEL = parse(
  `mutation UpdateChannel($channelId: UUID!, $input: UpdateAgentChatChannelInput!) { updateAgentChatChannel(channelId: $channelId, input: $input) { id name visibility roleIds } }`,
);

const DELETE_CHANNEL = parse(
  `mutation DeleteChannel($channelId: UUID!, $destinationChannelId: UUID) { deleteAgentChatChannel(channelId: $channelId, destinationChannelId: $destinationChannelId) }`,
);

const CHANNEL_MUTATION = (name: string) =>
  parse(`mutation Run($channelId: UUID!) { ${name}(channelId: $channelId) }`);

const ADD_MEMBERS = parse(
  `mutation AddMembers($channelId: UUID!, $workspaceMemberIds: [UUID!]!) { addAgentChatChannelMembers(channelId: $channelId, workspaceMemberIds: $workspaceMemberIds) }`,
);

const REMOVE_MEMBER = parse(
  `mutation RemoveMember($channelId: UUID!, $memberWorkspaceMemberId: UUID!) { removeAgentChatChannelMember(channelId: $channelId, memberWorkspaceMemberId: $memberWorkspaceMemberId) }`,
);

const CREATE_THREAD = parse(
  `mutation CreateThread($channelId: UUID) { createChatThread(channelId: $channelId) { id } }`,
);

const MOVE_THREAD = parse(
  `mutation Move($threadId: UUID!, $channelId: UUID) { moveAgentChatThreadToChannel(threadId: $threadId, channelId: $channelId) }`,
);

const THREAD_MUTATION = (name: string) =>
  parse(`mutation Run($threadId: UUID!) { ${name}(threadId: $threadId) }`);

const UPDATE_INBOX_STATE = parse(
  `mutation Update($threadIds: [UUID!]!, $action: AgentChatInboxAction!, $snoozedUntil: DateTime) { updateAgentChatThreadInboxState(threadIds: $threadIds, action: $action, snoozedUntil: $snoozedUntil) { id } }`,
);

const SNOOZE_IN_CHANNEL = parse(
  `mutation Snooze($threadId: UUID!, $snoozedUntil: DateTime!) { snoozeAgentChatThreadInChannel(threadId: $threadId, snoozedUntil: $snoozedUntil) }`,
);

const ASSIGN = parse(
  `mutation Assign($threadId: UUID!, $assigneeWorkspaceMemberId: UUID) { assignAgentChatThread(threadId: $threadId, assigneeWorkspaceMemberId: $assigneeWorkspaceMemberId) }`,
);

const CHANNEL_THREAD_IDS = parse(
  `query Ids($channelId: UUID!, $status: AgentChatChannelThreadStatus, $assignment: AgentChatChannelAssignmentFilter, $first: Int, $after: String) { agentChatChannelThreadIds(channelId: $channelId, status: $status, assignment: $assignment, first: $first, after: $after) { threadIds hasNextPage endCursor } }`,
);

const CHANNELS = parse(
  `query Channels { agentChatChannels { id name visibility isMember canLeave canManage memberCount roleIds } }`,
);

const listChannels = async (
  token: string = APPLE_JANE_ADMIN_ACCESS_TOKEN,
): Promise<
  {
    id: string;
    name: string;
    visibility: ChannelVisibility;
    isMember: boolean;
    canLeave: boolean;
    canManage: boolean;
    memberCount: number;
    roleIds: string[];
  }[]
> => {
  const response = await makeMetadataApiRequest({ query: CHANNELS }, token);

  expectNoErrors(response);

  return response.body.data.agentChatChannels;
};

const CHANNEL_SUMMARIES = parse(
  `query Summaries { agentChatChannelSummaries { channelId openCount hasUnreadOpen } }`,
);

const OPEN_THREADS_SUMMARY = parse(
  `query Summary { agentChatOpenThreadsSummary { openThreadCount hasUnreadOpenThread } }`,
);

// Outlasts any test, yet within the delay the test queue fast-forwards
const buildFutureSnoozedUntil = () =>
  new Date(Date.now() + 30_000).toISOString();

const expectNoErrors = (response: { body: { errors?: unknown } }) =>
  expect(response.body.errors).toBeUndefined();

const runChannelMutation = (
  name: string,
  channelId: string,
  token: string = APPLE_JANE_ADMIN_ACCESS_TOKEN,
) =>
  makeMetadataApiRequest(
    { query: CHANNEL_MUTATION(name), variables: { channelId } },
    token,
  );

const runThreadMutation = (
  name: string,
  threadId: string,
  token: string = APPLE_JANE_ADMIN_ACCESS_TOKEN,
) =>
  makeMetadataApiRequest(
    { query: THREAD_MUTATION(name), variables: { threadId } },
    token,
  );

const runInboxAction = (
  action: InboxAction,
  threadId: string,
  token: string = APPLE_JANE_ADMIN_ACCESS_TOKEN,
  snoozedUntil: string | null = null,
) =>
  makeMetadataApiRequest(
    {
      query: UPDATE_INBOX_STATE,
      variables: { threadIds: [threadId], action, snoozedUntil },
    },
    token,
  );

const findChannelThreadIds = async (
  channelId: string,
  filter: ChannelThreadsFilter = {},
  token: string = APPLE_JANE_ADMIN_ACCESS_TOKEN,
  page: { first?: number; after?: string } = {},
): Promise<{
  threadIds: string[];
  hasNextPage: boolean;
  endCursor: string | null;
}> => {
  const response = await makeMetadataApiRequest(
    {
      query: CHANNEL_THREAD_IDS,
      variables: { channelId, ...filter, ...page, first: page.first ?? 200 },
    },
    token,
  );

  expectNoErrors(response);

  return response.body.data.agentChatChannelThreadIds;
};

const getChannelSummaries = async (
  token: string = APPLE_JANE_ADMIN_ACCESS_TOKEN,
): Promise<
  { channelId: string; openCount: number; hasUnreadOpen: boolean }[]
> => {
  const response = await makeMetadataApiRequest(
    { query: CHANNEL_SUMMARIES },
    token,
  );

  expectNoErrors(response);

  return response.body.data.agentChatChannelSummaries;
};

const getOpenThreadCount = async (
  token: string = APPLE_JANE_ADMIN_ACCESS_TOKEN,
): Promise<number> => {
  const response = await makeMetadataApiRequest(
    { query: OPEN_THREADS_SUMMARY },
    token,
  );

  expectNoErrors(response);

  return response.body.data.agentChatOpenThreadsSummary.openThreadCount;
};

// The member's own copy: null when they have no row yet
const readMemberCopy = async (threadId: string, workspaceMemberId: string) => {
  const [row]: {
    isSubscribed: boolean;
    archivedAt: Date | null;
    snoozedUntil: Date | null;
  }[] = await global.testDataSource.query(
    `SELECT "isSubscribed", "archivedAt", "snoozedUntil"
     FROM ${SCHEMA}."agentChatThreadParticipant"
     WHERE "threadId" = $1 AND "workspaceMemberId" = $2`,
    [threadId, workspaceMemberId],
  );

  return row ?? null;
};

const listReadableThreadIds = async (token: string): Promise<string[]> => {
  const response = await makeGraphqlApiRequest(
    findManyOperationFactory({
      objectMetadataSingularName: 'agentChatThread',
      objectMetadataPluralName: 'agentChatThreads',
      gqlFields: 'id',
      first: 200,
    }),
    token,
  );

  expectNoErrors(response);

  return response.body.data.agentChatThreads.edges.map(
    ({ node }: { node: { id: string } }) => node.id,
  );
};

const readChannelState = async (threadId: string) => {
  const [row]: {
    channelId: string | null;
    channelArchivedAt: Date | null;
    channelSnoozedUntil: Date | null;
  }[] = await global.testDataSource.query(
    `SELECT "channelId", "channelArchivedAt", "channelSnoozedUntil"
     FROM ${SCHEMA}."agentChatThread" WHERE id = $1`,
    [threadId],
  );

  return row;
};

const readMemberIds = async (channelId: string): Promise<string[]> => {
  const rows: { workspaceMemberId: string }[] =
    await global.testDataSource.query(
      `SELECT "workspaceMemberId" FROM ${SCHEMA}."agentChatChannelMember"
       WHERE "channelId" = $1 ORDER BY "workspaceMemberId"`,
      [channelId],
    );

  return rows.map(({ workspaceMemberId }) => workspaceMemberId);
};

// Stands in for a message landing in the chat
const touchThread = (threadId: string) =>
  global.testDataSource.query(
    `UPDATE ${SCHEMA}."agentChatThread" SET "lastActivityAt" = clock_timestamp() WHERE id = $1`,
    [threadId],
  );

describe('Chat channels through the authenticated API', () => {
  const createdThreadIds: string[] = [];
  const createdChannelIds: string[] = [];

  const createChannel = async (
    visibility: ChannelVisibility,
    memberIds: string[] = [],
    token: string = APPLE_JANE_ADMIN_ACCESS_TOKEN,
    roleIds: string[] = [],
  ): Promise<string> => {
    const response = await makeMetadataApiRequest(
      {
        query: CREATE_CHANNEL,
        variables: {
          input: {
            name: `  Channel ${randomUUID()} `,
            visibility,
            memberIds,
            roleIds,
          },
        },
      },
      token,
    );

    expectNoErrors(response);

    const channelId = response.body.data.createAgentChatChannel.id;

    createdChannelIds.push(channelId);

    return channelId;
  };

  const createThreadInChannel = async (
    channelId: string | null,
    token: string = APPLE_JANE_ADMIN_ACCESS_TOKEN,
  ): Promise<string> => {
    const response = await makeMetadataApiRequest(
      { query: CREATE_THREAD, variables: { channelId } },
      token,
    );

    expectNoErrors(response);

    const threadId = response.body.data.createChatThread.id;

    createdThreadIds.push(threadId);

    return threadId;
  };

  afterEach(async () => {
    jest.restoreAllMocks();

    for (const threadId of createdThreadIds.splice(0)) {
      await destroyAgentChatThread({ threadId });
    }
    for (const channelId of createdChannelIds.splice(0)) {
      await makeMetadataApiRequest({
        query: DELETE_CHANNEL,
        variables: { channelId },
      });
    }
  });

  it('creates a channel with its creator as a member, under a trimmed name', async () => {
    const channelId = await createChannel('PUBLIC', [JONY]);

    const [channel]: { name: string; visibility: string }[] =
      await global.testDataSource.query(
        `SELECT name, visibility FROM ${SCHEMA}."agentChatChannel" WHERE id = $1`,
        [channelId],
      );

    expect(channel.name.startsWith('Channel ')).toBe(true);
    expect(channel.name.endsWith(' ')).toBe(false);
    expect(channel.visibility).toBe('PUBLIC');
    expect(await readMemberIds(channelId)).toEqual([JANE, JONY].sort());
  });

  it('refuses a channel without a name', async () => {
    const response = await makeMetadataApiRequest({
      query: CREATE_CHANNEL,
      variables: { input: { name: '   ', visibility: 'PUBLIC' } },
    });

    expect(response.body.errors[0].extensions.code).toBe('BAD_USER_INPUT');
  });

  it('creates a new chat, on its first message, in the channel it was started from', async () => {
    const channelId = await createChannel('PRIVATE');
    const threadService = getAppProviderByClassName<AgentChatThreadService>(
      'AgentChatThreadService',
    );
    const threadId = randomUUID();

    createdThreadIds.push(threadId);

    await threadService.createThreadIfMissing({
      threadId,
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      workspaceMemberId: JANE,
      channelId,
    });

    expect((await readChannelState(threadId)).channelId).toBe(channelId);

    // Jony cannot write in the channel, so his chat is not created in it
    await expect(
      threadService.createThreadIfMissing({
        threadId: randomUUID(),
        workspaceId: SEED_APPLE_WORKSPACE_ID,
        workspaceMemberId: JONY,
        channelId,
      }),
    ).rejects.toThrow();
  });

  it('lets everyone read and reply in a public channel chat', async () => {
    const channelId = await createChannel('PUBLIC');
    const threadId = await createThreadInChannel(channelId);

    expect(
      await listReadableThreadIds(APPLE_JONY_MEMBER_ACCESS_TOKEN),
    ).toContain(threadId);
    expect(
      (
        await findChannelThreadIds(
          channelId,
          {},
          APPLE_JONY_MEMBER_ACCESS_TOKEN,
        )
      ).threadIds,
    ).toEqual([threadId]);

    expectNoErrors(
      await runInboxAction(
        'SUBSCRIBE',
        threadId,
        APPLE_JONY_MEMBER_ACCESS_TOKEN,
      ),
    );
  });

  it('keeps a private channel and its chats to its members', async () => {
    const channelId = await createChannel('PRIVATE');
    const threadId = await createThreadInChannel(channelId);

    expect(
      await listReadableThreadIds(APPLE_JONY_MEMBER_ACCESS_TOKEN),
    ).not.toContain(threadId);

    const viewResponse = await makeMetadataApiRequest(
      { query: CHANNEL_THREAD_IDS, variables: { channelId } },
      APPLE_JONY_MEMBER_ACCESS_TOKEN,
    );

    expect(viewResponse.body.errors[0].extensions.code).toBe('NOT_FOUND');

    const joinResponse = await runChannelMutation(
      'joinAgentChatChannel',
      channelId,
      APPLE_JONY_MEMBER_ACCESS_TOKEN,
    );

    expect(joinResponse.body.errors[0].extensions.code).toBe('NOT_FOUND');

    const createResponse = await makeMetadataApiRequest(
      { query: CREATE_THREAD, variables: { channelId } },
      APPLE_JONY_MEMBER_ACCESS_TOKEN,
    );

    expect(createResponse.body.errors[0].extensions.code).toBe('NOT_FOUND');

    expectNoErrors(
      await makeMetadataApiRequest({
        query: ADD_MEMBERS,
        variables: { channelId, workspaceMemberIds: [JONY] },
      }),
    );

    expect(
      await listReadableThreadIds(APPLE_JONY_MEMBER_ACCESS_TOKEN),
    ).toContain(threadId);

    expectNoErrors(
      await runChannelMutation(
        'leaveAgentChatChannel',
        channelId,
        APPLE_JONY_MEMBER_ACCESS_TOKEN,
      ),
    );

    expect(
      await listReadableThreadIds(APPLE_JONY_MEMBER_ACCESS_TOKEN),
    ).not.toContain(threadId);
    expect(await readMemberIds(channelId)).toEqual([JANE]);
  });

  it('opens a private channel to everyone holding one of its roles', async () => {
    const { id: memberRoleId } = await findOneRoleByLabel({ label: 'Member' });
    const channelId = await createChannel(
      'PRIVATE',
      [],
      APPLE_JANE_ADMIN_ACCESS_TOKEN,
      [memberRoleId],
    );
    const threadId = await createThreadInChannel(channelId);

    expect(
      await listReadableThreadIds(APPLE_JONY_MEMBER_ACCESS_TOKEN),
    ).toContain(threadId);
    expect(
      (await getChannelSummaries(APPLE_JONY_MEMBER_ACCESS_TOKEN)).find(
        (summary) => summary.channelId === channelId,
      ),
    ).toEqual({ channelId, openCount: 1, hasUnreadOpen: true });

    // Holding the role is enough to shape the channel, not to change who is in it
    expectNoErrors(
      await makeMetadataApiRequest(
        {
          query: UPDATE_CHANNEL,
          variables: { channelId, input: { name: 'Renamed through a role' } },
        },
        APPLE_JONY_MEMBER_ACCESS_TOKEN,
      ),
    );

    const roleChangeResponse = await makeMetadataApiRequest(
      {
        query: UPDATE_CHANNEL,
        variables: { channelId, input: { roleIds: [] } },
      },
      APPLE_JONY_MEMBER_ACCESS_TOKEN,
    );

    expect(roleChangeResponse.body.errors[0].extensions.code).toBe('FORBIDDEN');

    const updateResponse = await makeMetadataApiRequest({
      query: UPDATE_CHANNEL,
      variables: { channelId, input: { roleIds: [] } },
    });

    expectNoErrors(updateResponse);
    expect(updateResponse.body.data.updateAgentChatChannel.roleIds).toEqual([]);
    expect(
      await listReadableThreadIds(APPLE_JONY_MEMBER_ACCESS_TOKEN),
    ).not.toContain(threadId);
    expect(
      (await getChannelSummaries(APPLE_JONY_MEMBER_ACCESS_TOKEN)).map(
        (summary) => summary.channelId,
      ),
    ).not.toContain(channelId);
  });

  it('refuses a role from outside the workspace', async () => {
    const response = await makeMetadataApiRequest({
      query: CREATE_CHANNEL,
      variables: {
        input: {
          name: 'Channel with an unknown role',
          visibility: 'PRIVATE',
          roleIds: [randomUUID()],
        },
      },
    });

    expect(response.body.errors[0].extensions.code).toBe('BAD_USER_INPUT');
  });

  it('lets members add people to a public channel, and only its managers to a private one', async () => {
    const publicChannelId = await createChannel('PUBLIC', [JONY]);
    const privateChannelId = await createChannel('PRIVATE', [JONY]);

    expectNoErrors(
      await makeMetadataApiRequest(
        {
          query: ADD_MEMBERS,
          variables: { channelId: publicChannelId, workspaceMemberIds: [PHIL] },
        },
        APPLE_JONY_MEMBER_ACCESS_TOKEN,
      ),
    );

    const privateResponse = await makeMetadataApiRequest(
      {
        query: ADD_MEMBERS,
        variables: { channelId: privateChannelId, workspaceMemberIds: [PHIL] },
      },
      APPLE_JONY_MEMBER_ACCESS_TOKEN,
    );

    expect(privateResponse.body.errors[0].extensions.code).toBe('FORBIDDEN');
    expect(await readMemberIds(publicChannelId)).toEqual(
      [JANE, JONY, PHIL].sort(),
    );
    expect(await readMemberIds(privateChannelId)).toEqual([JANE, JONY].sort());
  });

  it('lets anyone join a public channel once', async () => {
    const channelId = await createChannel('PUBLIC');

    for (let attempt = 0; attempt < 2; attempt++) {
      expectNoErrors(
        await runChannelMutation(
          'joinAgentChatChannel',
          channelId,
          APPLE_JONY_MEMBER_ACCESS_TOKEN,
        ),
      );
    }

    expect(await readMemberIds(channelId)).toEqual([JANE, JONY].sort());

    const summaries = await getChannelSummaries(APPLE_JONY_MEMBER_ACCESS_TOKEN);

    expect(summaries.map(({ channelId }) => channelId)).toContain(channelId);
  });

  it('leaves who joins a private channel and who sees it to its managers', async () => {
    const channelId = await createChannel('PUBLIC', [JONY]);

    const visibilityResponse = await makeMetadataApiRequest(
      {
        query: UPDATE_CHANNEL,
        variables: { channelId, input: { visibility: 'PRIVATE' } },
      },
      APPLE_JONY_MEMBER_ACCESS_TOKEN,
    );

    expect(visibilityResponse.body.errors[0].extensions.code).toBe('FORBIDDEN');

    const renameResponse = await makeMetadataApiRequest(
      {
        query: UPDATE_CHANNEL,
        variables: { channelId, input: { name: 'Renamed by a member' } },
      },
      APPLE_JONY_MEMBER_ACCESS_TOKEN,
    );

    expectNoErrors(renameResponse);
    expect(renameResponse.body.data.updateAgentChatChannel.name).toBe(
      'Renamed by a member',
    );

    const removeResponse = await makeMetadataApiRequest(
      {
        query: REMOVE_MEMBER,
        variables: { channelId, memberWorkspaceMemberId: JANE },
      },
      APPLE_JONY_MEMBER_ACCESS_TOKEN,
    );

    expect(removeResponse.body.errors[0].extensions.code).toBe('FORBIDDEN');

    const deleteResponse = await makeMetadataApiRequest(
      { query: DELETE_CHANNEL, variables: { channelId } },
      APPLE_JONY_MEMBER_ACCESS_TOKEN,
    );

    expect(deleteResponse.body.errors[0].extensions.code).toBe('FORBIDDEN');
  });

  it('keeps chats a member only reads in a channel out of their own inbox', async () => {
    const channelId = await createChannel('PUBLIC', [JONY]);
    const jonyOpenThreadCount = await getOpenThreadCount(
      APPLE_JONY_MEMBER_ACCESS_TOKEN,
    );
    const threadId = await createThreadInChannel(channelId);

    expectNoErrors(
      await runInboxAction('READ', threadId, APPLE_JONY_MEMBER_ACCESS_TOKEN),
    );

    expect(await readMemberCopy(threadId, JONY)).toMatchObject({
      isSubscribed: false,
    });
    expect(await getOpenThreadCount(APPLE_JONY_MEMBER_ACCESS_TOKEN)).toBe(
      jonyOpenThreadCount,
    );

    // Filing it follows it, so new activity brings it back to his inbox
    expectNoErrors(
      await runInboxAction('ARCHIVE', threadId, APPLE_JONY_MEMBER_ACCESS_TOKEN),
    );

    expect(await readMemberCopy(threadId, JONY)).toMatchObject({
      isSubscribed: true,
    });

    expectNoErrors(
      await runInboxAction(
        'MOVE_TO_INBOX',
        threadId,
        APPLE_JONY_MEMBER_ACCESS_TOKEN,
      ),
    );

    expect(await getOpenThreadCount(APPLE_JONY_MEMBER_ACCESS_TOKEN)).toBe(
      jonyOpenThreadCount + 1,
    );
    // The creator follows the chat they started
    expect(await readMemberCopy(threadId, JANE)).toMatchObject({
      isSubscribed: true,
      archivedAt: null,
    });
  });

  it('files a chat for the channel, and for whoever files it if they follow it', async () => {
    const channelId = await createChannel('PUBLIC', [JONY]);
    const threadId = await createThreadInChannel(channelId);

    expectNoErrors(
      await runThreadMutation(
        'markAgentChatThreadAsDoneInChannel',
        threadId,
        APPLE_JONY_MEMBER_ACCESS_TOKEN,
      ),
    );

    expect(
      (await findChannelThreadIds(channelId, { status: 'DONE' })).threadIds,
    ).toEqual([threadId]);
    expect(
      (await findChannelThreadIds(channelId, { status: 'OPEN' })).threadIds,
    ).toEqual([]);
    // Jane follows it but did not file it, so it stays open for her
    expect((await readMemberCopy(threadId, JANE))?.archivedAt).toBeNull();
    // Jony did not follow it, so filing it for the channel leaves him out
    expect(
      (await readMemberCopy(threadId, JONY))?.archivedAt ?? null,
    ).toBeNull();

    expectNoErrors(
      await runThreadMutation('reopenAgentChatThreadInChannel', threadId),
    );
    expectNoErrors(
      await runThreadMutation('markAgentChatThreadAsDoneInChannel', threadId),
    );

    expect((await readMemberCopy(threadId, JANE))?.archivedAt).not.toBeNull();

    await touchThread(threadId);

    expect(
      (await findChannelThreadIds(channelId, { status: 'OPEN' })).threadIds,
    ).toEqual([threadId]);
  });

  it('refuses channel triage on a chat outside any channel', async () => {
    const threadId = await createThreadInChannel(null);
    const response = await runThreadMutation(
      'markAgentChatThreadAsDoneInChannel',
      threadId,
    );

    expect(response.body.errors[0].extensions.code).toBe('BAD_USER_INPUT');
  });

  it("files the channel's copy when the assignee files their own", async () => {
    const channelId = await createChannel('PUBLIC', [JONY]);
    const threadId = await createThreadInChannel(channelId);

    expectNoErrors(
      await makeMetadataApiRequest({
        query: ASSIGN,
        variables: { threadId, assigneeWorkspaceMemberId: JONY },
      }),
    );

    expect(
      (await findChannelThreadIds(channelId, { assignment: 'UNASSIGNED' }))
        .threadIds,
    ).toEqual([]);
    expect(
      (
        await findChannelThreadIds(
          channelId,
          { assignment: 'ASSIGNED_TO_ME' },
          APPLE_JONY_MEMBER_ACCESS_TOKEN,
        )
      ).threadIds,
    ).toEqual([threadId]);

    expectNoErrors(
      await runInboxAction('ARCHIVE', threadId, APPLE_JONY_MEMBER_ACCESS_TOKEN),
    );

    expect((await readChannelState(threadId)).channelArchivedAt).not.toBeNull();

    expectNoErrors(
      await runInboxAction(
        'SNOOZE',
        threadId,
        APPLE_JONY_MEMBER_ACCESS_TOKEN,
        buildFutureSnoozedUntil(),
      ),
    );

    expect(
      (await readChannelState(threadId)).channelSnoozedUntil,
    ).not.toBeNull();

    expectNoErrors(
      await runInboxAction(
        'MOVE_TO_INBOX',
        threadId,
        APPLE_JONY_MEMBER_ACCESS_TOKEN,
      ),
    );

    expect(await readChannelState(threadId)).toMatchObject({
      channelArchivedAt: null,
      channelSnoozedUntil: null,
    });
    expectNoErrors(
      await runInboxAction('ARCHIVE', threadId, APPLE_JONY_MEMBER_ACCESS_TOKEN),
    );

    // Anyone else filing their own copy leaves the channel's alone
    expectNoErrors(
      await runThreadMutation(
        'reopenAgentChatThreadInChannel',
        threadId,
        APPLE_JONY_MEMBER_ACCESS_TOKEN,
      ),
    );
    expectNoErrors(await runInboxAction('ARCHIVE', threadId));

    expect((await readChannelState(threadId)).channelArchivedAt).toBeNull();
  });

  it('snoozes a chat for the channel until its snooze ends', async () => {
    const channelId = await createChannel('PUBLIC');
    const threadId = await createThreadInChannel(channelId);

    const pastResponse = await makeMetadataApiRequest({
      query: SNOOZE_IN_CHANNEL,
      variables: {
        threadId,
        snoozedUntil: new Date(Date.now() - 60_000).toISOString(),
      },
    });

    expect(pastResponse.body.errors[0].extensions.code).toBe('BAD_USER_INPUT');

    expectNoErrors(
      await makeMetadataApiRequest({
        query: SNOOZE_IN_CHANNEL,
        variables: { threadId, snoozedUntil: buildFutureSnoozedUntil() },
      }),
    );

    expect(
      (await findChannelThreadIds(channelId, { status: 'SNOOZED' })).threadIds,
    ).toEqual([threadId]);
    // The creator follows it, so their own copy is snoozed too
    expect((await readMemberCopy(threadId, JANE))?.snoozedUntil).not.toBeNull();

    const snoozedUntil = new Date(Date.now() - 1000);

    await global.testDataSource.query(
      `UPDATE ${SCHEMA}."agentChatThread" SET "channelSnoozedUntil" = $2 WHERE id = $1`,
      [threadId, snoozedUntil],
    );

    const triageService =
      getAppProviderByClassName<AgentChatThreadTriageService>(
        'AgentChatThreadTriageService',
      );

    // A snooze replaced since has nothing to end
    await triageService.endChannelSnooze({
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      threadId,
      snoozedUntil: new Date(Date.now() - 5000).toISOString(),
    });

    expect((await readChannelState(threadId)).channelArchivedAt).not.toBeNull();

    await triageService.endChannelSnooze({
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      threadId,
      snoozedUntil: snoozedUntil.toISOString(),
    });

    const channelState = await readChannelState(threadId);

    expect(channelState.channelArchivedAt).toBeNull();
    expect(channelState.channelSnoozedUntil?.getTime()).toBe(
      snoozedUntil.getTime(),
    );
  });

  it('moves a chat between channels and back out, starting it open', async () => {
    const sourceChannelId = await createChannel('PRIVATE', [JONY]);
    const destinationChannelId = await createChannel('PRIVATE');
    const threadId = await createThreadInChannel(sourceChannelId);

    expectNoErrors(
      await runThreadMutation('markAgentChatThreadAsDoneInChannel', threadId),
    );

    // Jony cannot write in the destination
    const refusedResponse = await makeMetadataApiRequest(
      {
        query: MOVE_THREAD,
        variables: { threadId, channelId: destinationChannelId },
      },
      APPLE_JONY_MEMBER_ACCESS_TOKEN,
    );

    expect(refusedResponse.body.errors[0].extensions.code).toBe('NOT_FOUND');

    expectNoErrors(
      await makeMetadataApiRequest({
        query: MOVE_THREAD,
        variables: { threadId, channelId: destinationChannelId },
      }),
    );

    expect(await readChannelState(threadId)).toEqual({
      channelId: destinationChannelId,
      channelArchivedAt: null,
      channelSnoozedUntil: null,
    });
    expect(
      await listReadableThreadIds(APPLE_JONY_MEMBER_ACCESS_TOKEN),
    ).not.toContain(threadId);

    expectNoErrors(
      await makeMetadataApiRequest({
        query: MOVE_THREAD,
        variables: { threadId, channelId: null },
      }),
    );

    expect((await readChannelState(threadId)).channelId).toBeNull();
  });

  it('deletes a channel only once its chats have somewhere to go', async () => {
    const channelId = await createChannel('PUBLIC', [JONY]);
    const destinationChannelId = await createChannel('PUBLIC');
    const threadId = await createThreadInChannel(channelId);

    const refusedResponse = await makeMetadataApiRequest({
      query: DELETE_CHANNEL,
      variables: { channelId },
    });

    expect(refusedResponse.body.errors[0].extensions.code).toBe('CONFLICT');

    const selfResponse = await makeMetadataApiRequest({
      query: DELETE_CHANNEL,
      variables: { channelId, destinationChannelId: channelId },
    });

    expect(selfResponse.body.errors[0].extensions.code).toBe('BAD_USER_INPUT');

    const eventSpy = jest.spyOn(
      getAppProviderByClassName<WorkspaceEventEmitter>('WorkspaceEventEmitter'),
      'emitDatabaseBatchEvent',
    );

    expectNoErrors(
      await makeMetadataApiRequest({
        query: DELETE_CHANNEL,
        variables: { channelId, destinationChannelId },
      }),
    );

    expect((await readChannelState(threadId)).channelId).toBe(
      destinationChannelId,
    );
    expect(await readMemberIds(channelId)).toEqual([]);
    // Moved in SQL, so the move is sent for clients watching the chat
    expect(
      eventSpy.mock.calls.some(
        ([batchEvent]) =>
          batchEvent?.objectMetadataNameSingular === 'agentChatThread' &&
          batchEvent.events.some(
            (event) => 'recordId' in event && event.recordId === threadId,
          ),
      ),
    ).toBe(true);

    const grants: unknown[] = await global.testDataSource.query(
      `SELECT 1 FROM ${SCHEMA}."recordShare" WHERE "recordId" = $1`,
      [channelId],
    );

    expect(grants).toEqual([]);
  });

  it('counts open chats for each channel the member joined, and their own only once they follow', async () => {
    const channelId = await createChannel('PUBLIC', [JONY]);
    const janeOpenThreadCount = await getOpenThreadCount();
    const jonyOpenThreadCount = await getOpenThreadCount(
      APPLE_JONY_MEMBER_ACCESS_TOKEN,
    );
    const threadId = await createThreadInChannel(channelId);
    const doneThreadId = await createThreadInChannel(channelId);

    expectNoErrors(
      await runThreadMutation(
        'markAgentChatThreadAsDoneInChannel',
        doneThreadId,
      ),
    );
    await touchThread(threadId);

    for (const token of [
      APPLE_JANE_ADMIN_ACCESS_TOKEN,
      APPLE_JONY_MEMBER_ACCESS_TOKEN,
    ]) {
      expect(
        (await getChannelSummaries(token)).find(
          (summary) => summary.channelId === channelId,
        ),
      ).toEqual({ channelId, openCount: 1, hasUnreadOpen: true });
    }

    // Jane follows both chats she started, so filing one for the channel
    // files her own copy too
    expect(await getOpenThreadCount()).toBe(janeOpenThreadCount + 1);
    expect(await getOpenThreadCount(APPLE_JONY_MEMBER_ACCESS_TOKEN)).toBe(
      jonyOpenThreadCount,
    );
  });

  it('refuses channel writes through the record API', async () => {
    const channelId = await createChannel('PUBLIC');

    for (const operation of [
      deleteOneOperationFactory({
        objectMetadataSingularName: 'agentChatChannel',
        gqlFields: 'id',
        recordId: channelId,
      }),
      destroyOneOperationFactory({
        objectMetadataSingularName: 'agentChatChannel',
        gqlFields: 'id',
        recordId: channelId,
      }),
    ]) {
      const response = await makeGraphqlApiRequest(operation);

      expect(response.body.errors[0].extensions.code).toBe('FORBIDDEN');
    }

    const channels: unknown[] = await global.testDataSource.query(
      `SELECT 1 FROM ${SCHEMA}."agentChatChannel"
       WHERE id = $1 AND "deletedAt" IS NULL`,
      [channelId],
    );

    expect(channels).toHaveLength(1);
  });

  it('keeps the channel chats of a removed member in their channel', async () => {
    const channelId = await createChannel('PUBLIC', [JONY]);
    const channelThreadId = await createThreadInChannel(
      channelId,
      APPLE_JONY_MEMBER_ACCESS_TOKEN,
    );
    const ownThreadId = await createThreadInChannel(
      null,
      APPLE_JONY_MEMBER_ACCESS_TOKEN,
    );
    const { flatObjectMetadataMaps } =
      await getAppProviderByClassName<WorkspaceCacheService>(
        'WorkspaceCacheService',
      ).getOrRecompute(SEED_APPLE_WORKSPACE_ID, ['flatObjectMetadataMaps']);

    await detachAgentChatChannelThreadsFromWorkspaceMember({
      threadRepository: global.app.get<
        string,
        AgentHistoryRepository<AgentChatThreadWorkspaceEntity>
      >(getAgentHistoryRepositoryToken('agentChatThread'), { strict: false }),
      flatObjectMetadataMaps,
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      workspaceMemberId: JONY,
    });

    const owners: { id: string; workspaceMemberId: string | null }[] =
      await global.testDataSource.query(
        `SELECT id, "workspaceMemberId" FROM ${SCHEMA}."agentChatThread"
         WHERE id = ANY($1::uuid[]) ORDER BY id`,
        [[channelThreadId, ownThreadId]],
      );

    expect(owners).toEqual(
      [
        { id: channelThreadId, workspaceMemberId: null },
        { id: ownThreadId, workspaceMemberId: JONY },
      ].sort((threadA, threadB) => threadA.id.localeCompare(threadB.id)),
    );
    expect(await readMemberIds(channelId)).toEqual([JANE]);

    // Neither chat is Jane's to destroy any more
    await global.testDataSource.query(
      `DELETE FROM ${SCHEMA}."agentChatThread" WHERE id = ANY($1::uuid[])`,
      [[channelThreadId, ownThreadId]],
    );
    createdThreadIds.splice(
      0,
      createdThreadIds.length,
      ...createdThreadIds.filter(
        (threadId) => ![channelThreadId, ownThreadId].includes(threadId),
      ),
    );
  });

  it('lists the channels a member can read, the joined ones first', async () => {
    const publicChannelId = await createChannel('PUBLIC');
    const privateChannelId = await createChannel('PRIVATE');
    const sharedChannelId = await createChannel('PRIVATE', [JONY]);
    const { id: memberRoleId } = await findOneRoleByLabel({ label: 'Member' });
    const roleChannelId = await createChannel(
      'PRIVATE',
      [],
      APPLE_JANE_ADMIN_ACCESS_TOKEN,
      [memberRoleId],
    );

    const janeChannels = await listChannels();

    expect(janeChannels.find(({ id }) => id === publicChannelId)).toMatchObject(
      { isMember: true, canManage: true, memberCount: 1 },
    );

    const jonyChannels = await listChannels(APPLE_JONY_MEMBER_ACCESS_TOKEN);
    const jonyChannelIds = jonyChannels.map(({ id }) => id);

    expect(jonyChannelIds).not.toContain(privateChannelId);
    expect(jonyChannels.find(({ id }) => id === sharedChannelId)).toMatchObject(
      { isMember: true, canLeave: true, canManage: false, memberCount: 2 },
    );
    expect(jonyChannels.find(({ id }) => id === roleChannelId)).toMatchObject({
      isMember: true,
      canLeave: false,
      canManage: false,
      roleIds: [memberRoleId],
    });
    expect(jonyChannels.find(({ id }) => id === publicChannelId)).toMatchObject(
      { isMember: false, canManage: false },
    );
    expect(jonyChannelIds.indexOf(sharedChannelId)).toBeLessThan(
      jonyChannelIds.indexOf(publicChannelId),
    );
  });

  it('pages a channel by last activity', async () => {
    const channelId = await createChannel('PUBLIC');
    const olderThreadId = await createThreadInChannel(channelId);
    const newerThreadId = await createThreadInChannel(channelId);

    await touchThread(newerThreadId);

    const firstPage = await findChannelThreadIds(
      channelId,
      {},
      APPLE_JANE_ADMIN_ACCESS_TOKEN,
      { first: 1 },
    );

    expect(firstPage).toMatchObject({
      threadIds: [newerThreadId],
      hasNextPage: true,
    });

    const secondPage = await findChannelThreadIds(
      channelId,
      {},
      APPLE_JANE_ADMIN_ACCESS_TOKEN,
      { first: 1, after: firstPage.endCursor! },
    );

    expect(secondPage).toMatchObject({
      threadIds: [olderThreadId],
      hasNextPage: false,
    });

    const invalidResponse = await makeMetadataApiRequest({
      query: CHANNEL_THREAD_IDS,
      variables: { channelId, after: 'not-a-cursor' },
    });

    expect(invalidResponse.body.errors[0].extensions.code).toBe(
      'BAD_USER_INPUT',
    );
  });
});
