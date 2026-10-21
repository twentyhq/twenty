import { randomUUID } from 'node:crypto';

import { parse } from 'graphql';
import { type AgentChatInboxAction } from 'twenty-shared/ai';
import { NavigationMenuItemType } from 'twenty-shared/types';

import { assertGraphQLSuccessfulResponse } from 'test/integration/graphql/utils/graphql-test-assertions.util';
import { createNavigationMenuItem } from 'test/integration/metadata/suites/navigation-menu-item/utils/create-navigation-menu-item.util';
import { findNavigationMenuItems } from 'test/integration/metadata/suites/navigation-menu-item/utils/find-navigation-menu-items.util';
import { findOneRoleByLabel } from 'test/integration/metadata/suites/role/utils/find-one-role-by-label.util';
import { updateOneRole } from 'test/integration/metadata/suites/role/utils/update-one-role.util';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { destroyAgentChatThread } from 'test/integration/utils/destroy-agent-chat-thread.util';
import { expectEventually } from 'test/integration/utils/expect-eventually.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { listChatThreadIds } from 'test/integration/utils/list-chat-thread-ids.util';

import { type UpdateAgentChatChannelInput } from 'src/engine/metadata-modules/ai/ai-chat/dtos/update-agent-chat-channel.input';
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

const { JANE, JONY } = WORKSPACE_MEMBER_DATA_SEED_IDS;

type ChannelAccess = { roleIds?: string[] };

type ChannelThreadsFilter = {
  status?: 'OPEN' | 'SNOOZED' | 'DONE';
  assignment?: 'ANY' | 'UNASSIGNED' | 'ASSIGNED_TO_ME';
};

type ChannelThreadMutationName =
  | 'markAgentChatThreadAsDoneInChannel'
  | 'reopenAgentChatThreadInChannel';

const CREATE_CHANNEL = parse(
  `mutation CreateChannel($input: CreateAgentChatChannelInput!) { createAgentChatChannel(input: $input) { id name icon color roleIds isCustom } }`,
);

const UPDATE_CHANNEL = parse(
  `mutation UpdateChannel($channelId: UUID!, $input: UpdateAgentChatChannelInput!) { updateAgentChatChannel(channelId: $channelId, input: $input) { id name roleIds } }`,
);

const DELETE_CHANNEL = parse(
  `mutation DeleteChannel($channelId: UUID!, $destinationChannelId: UUID) { deleteAgentChatChannel(channelId: $channelId, destinationChannelId: $destinationChannelId) }`,
);

const CHANNEL_ROLES = parse(
  `query ChannelRoles { agentChatChannelRoles { id } }`,
);

const CHANNELS = parse(
  `query Channels { agentChatChannels { id name isCustom isAccessible } }`,
);

const CREATE_THREAD = parse(
  `mutation CreateThread($channelId: UUID) { createChatThread(channelId: $channelId) { id } }`,
);

const MOVE_THREAD = parse(
  `mutation Move($threadId: UUID!, $channelId: UUID) { moveAgentChatThreadToChannel(threadId: $threadId, channelId: $channelId) }`,
);

const THREAD_MUTATION = (name: ChannelThreadMutationName) =>
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

const CHANNEL_SUMMARIES = parse(
  `query Summaries { agentChatChannelSummaries { channelId openCount hasUnreadOpen } }`,
);

const OPEN_THREADS_SUMMARY = parse(
  `query Summary { agentChatOpenThreadsSummary { openThreadCount hasUnreadOpenThread } }`,
);

// Outlasts any test, yet within the delay the test queue fast-forwards
const buildFutureSnoozedUntil = () =>
  new Date(Date.now() + 30_000).toISOString();

const runThreadMutation = (
  name: ChannelThreadMutationName,
  threadId: string,
  token: string = APPLE_JANE_ADMIN_ACCESS_TOKEN,
) =>
  makeMetadataApiRequest(
    { query: THREAD_MUTATION(name), variables: { threadId } },
    token,
  );

const runInboxAction = (
  action: AgentChatInboxAction,
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

  assertGraphQLSuccessfulResponse(response);

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

  assertGraphQLSuccessfulResponse(response);

  return response.body.data.agentChatChannelSummaries;
};

const getOpenThreadCount = async (
  token: string = APPLE_JANE_ADMIN_ACCESS_TOKEN,
): Promise<number> => {
  const response = await makeMetadataApiRequest(
    { query: OPEN_THREADS_SUMMARY },
    token,
  );

  assertGraphQLSuccessfulResponse(response);

  return response.body.data.agentChatOpenThreadsSummary.openThreadCount;
};

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

const listChannels = async (
  token: string = APPLE_JANE_ADMIN_ACCESS_TOKEN,
): Promise<
  {
    id: string;
    name: string;
    isCustom: boolean;
    isAccessible: boolean;
  }[]
> => {
  const response = await makeMetadataApiRequest({ query: CHANNELS }, token);

  assertGraphQLSuccessfulResponse(response);

  return response.body.data.agentChatChannels;
};

const readChannelGrants = async (
  threadId: string,
): Promise<{ principalType: string; sourceId: string }[]> =>
  global.testDataSource.query(
    `SELECT DISTINCT "principalType", "sourceId" FROM ${SCHEMA}."recordShare"
     WHERE "recordId" = $1 AND "rowCause" = 'RULE' AND "deletedAt" IS NULL
     ORDER BY "principalType"`,
    [threadId],
  );

const readChannelGrantRoleIds = async (threadId: string): Promise<string[]> =>
  (
    await global.testDataSource.query(
      `SELECT "principalId" FROM ${SCHEMA}."recordShare"
       WHERE "recordId" = $1 AND "rowCause" = 'RULE' AND "deletedAt" IS NULL
         AND "principalType" = 'ROLE'`,
      [threadId],
    )
  ).map(({ principalId }: { principalId: string }) => principalId);

const setRoleAllChannelsAccess = async (
  roleId: string,
  canAccessAllAgentChatChannels: boolean,
) => {
  const { errors } = await updateOneRole({
    input: {
      idToUpdate: roleId,
      updatePayload: { canAccessAllAgentChatChannels },
    },
    gqlFields: 'id',
  });

  expect(errors).toBeUndefined();
};

const simulateNewMessageActivity = (threadId: string) =>
  global.testDataSource.query(
    `UPDATE ${SCHEMA}."agentChatThread" SET "lastActivityAt" = clock_timestamp() WHERE id = $1`,
    [threadId],
  );

describe('Chat channels through the authenticated API', () => {
  const createdThreadIds: string[] = [];
  const createdChannelIds: string[] = [];

  const createChannel = async (
    { roleIds = [] }: ChannelAccess = {},
    token: string = APPLE_JANE_ADMIN_ACCESS_TOKEN,
  ): Promise<string> => {
    const response = await makeMetadataApiRequest(
      {
        query: CREATE_CHANNEL,
        variables: {
          input: {
            name: `  Channel ${randomUUID()} `,
            roleIds,
          },
        },
      },
      token,
    );

    assertGraphQLSuccessfulResponse(response);

    const channelId = response.body.data.createAgentChatChannel.id;

    createdChannelIds.push(channelId);

    return channelId;
  };

  const updateChannel = (
    channelId: string,
    input: UpdateAgentChatChannelInput,
    token: string = APPLE_JANE_ADMIN_ACCESS_TOKEN,
  ) =>
    makeMetadataApiRequest(
      { query: UPDATE_CHANNEL, variables: { channelId, input } },
      token,
    );

  const createThreadInChannel = async (
    channelId: string | null,
    token: string = APPLE_JANE_ADMIN_ACCESS_TOKEN,
  ): Promise<string> => {
    const response = await makeMetadataApiRequest(
      { query: CREATE_THREAD, variables: { channelId } },
      token,
    );

    assertGraphQLSuccessfulResponse(response);

    const threadId = response.body.data.createChatThread.id;

    createdThreadIds.push(threadId);

    return threadId;
  };

  const roleIdsToReopenToAllChannels = new Set<string>();

  // Jony holds Member, which reaches every channel unless a test closes it
  const closeMemberAllChannelsAccess = async (): Promise<string> => {
    const { id: memberRoleId } = await findOneRoleByLabel({ label: 'Member' });

    await setRoleAllChannelsAccess(memberRoleId, false);
    roleIdsToReopenToAllChannels.add(memberRoleId);

    return memberRoleId;
  };

  afterEach(async () => {
    jest.restoreAllMocks();

    for (const roleId of roleIdsToReopenToAllChannels) {
      await setRoleAllChannelsAccess(roleId, true);
    }
    roleIdsToReopenToAllChannels.clear();

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

  it('creates a channel under a trimmed name, after General', async () => {
    const channelId = await createChannel();

    const [channel]: { name: string }[] = await global.testDataSource.query(
      `SELECT name FROM core."agentChatChannel" WHERE id = $1`,
      [channelId],
    );

    expect(channel.name.startsWith('Channel ')).toBe(true);
    expect(channel.name.endsWith(' ')).toBe(false);

    const channels = await listChannels(APPLE_JONY_MEMBER_ACCESS_TOKEN);

    expect(channels[0]).toMatchObject({ name: 'General', isCustom: false });
    expect(channels[channels.length - 1]).toMatchObject({
      id: channelId,
      isCustom: true,
      isAccessible: true,
    });
  });

  it('refuses a channel without a name, or with the name of another one', async () => {
    const response = await makeMetadataApiRequest({
      query: CREATE_CHANNEL,
      variables: { input: { name: '   ' } },
    });

    expect(response.body.errors[0].extensions.code).toBe('BAD_USER_INPUT');

    const duplicateResponse = await makeMetadataApiRequest({
      query: CREATE_CHANNEL,
      variables: { input: { name: 'General' } },
    });

    expect(duplicateResponse.body.errors[0].extensions.code).toBe(
      'METADATA_VALIDATION_FAILED',
    );
  });

  it('leaves setting channels up to who manages AI settings', async () => {
    const channelId = await createChannel();

    const createResponse = await makeMetadataApiRequest(
      { query: CREATE_CHANNEL, variables: { input: { name: 'By a member' } } },
      APPLE_JONY_MEMBER_ACCESS_TOKEN,
    );
    const updateResponse = await updateChannel(
      channelId,
      { name: 'Renamed by a member' },
      APPLE_JONY_MEMBER_ACCESS_TOKEN,
    );
    const deleteResponse = await makeMetadataApiRequest(
      { query: DELETE_CHANNEL, variables: { channelId } },
      APPLE_JONY_MEMBER_ACCESS_TOKEN,
    );
    const rolesResponse = await makeMetadataApiRequest(
      { query: CHANNEL_ROLES },
      APPLE_JONY_MEMBER_ACCESS_TOKEN,
    );

    for (const response of [
      createResponse,
      updateResponse,
      deleteResponse,
      rolesResponse,
    ]) {
      expect(response.body.errors[0].extensions.code).toBe('FORBIDDEN');
    }
  });

  it('keeps General and its chats, as the standard sync would bring it back', async () => {
    const [general] = await listChannels();

    expect(general).toMatchObject({ name: 'General', isCustom: false });

    const destinationChannelId = await createChannel();
    const threadId = await createThreadInChannel(general.id);

    const response = await makeMetadataApiRequest({
      query: DELETE_CHANNEL,
      variables: { channelId: general.id, destinationChannelId },
    });

    expect(response.body.errors[0].extensions.code).toBe('FORBIDDEN');
    expect((await readChannelState(threadId)).channelId).toBe(general.id);
  });

  it('lets the roles with access to all channels read and reply in its chats', async () => {
    const { id: adminRoleId } = await findOneRoleByLabel({ label: 'Admin' });
    const { id: memberRoleId } = await findOneRoleByLabel({ label: 'Member' });
    const channelId = await createChannel();
    const threadId = await createThreadInChannel(channelId);

    expect(await readChannelGrants(threadId)).toEqual([
      { principalType: 'ROLE', sourceId: channelId },
    ]);
    expect(await readChannelGrantRoleIds(threadId)).toEqual(
      expect.arrayContaining([adminRoleId, memberRoleId]),
    );
    expect(await listChatThreadIds(APPLE_JONY_MEMBER_ACCESS_TOKEN)).toContain(
      threadId,
    );
    expect(
      (
        await findChannelThreadIds(
          channelId,
          {},
          APPLE_JONY_MEMBER_ACCESS_TOKEN,
        )
      ).threadIds,
    ).toEqual([threadId]);

    assertGraphQLSuccessfulResponse(
      await runInboxAction(
        'SUBSCRIBE',
        threadId,
        APPLE_JONY_MEMBER_ACCESS_TOKEN,
      ),
    );
  });

  it('keeps a channel open to roles, and its chats, to who holds them', async () => {
    const { id: adminRoleId } = await findOneRoleByLabel({ label: 'Admin' });
    const memberRoleId = await closeMemberAllChannelsAccess();
    const channelId = await createChannel({ roleIds: [adminRoleId] });
    const threadId = await createThreadInChannel(channelId);

    expect(
      await listChatThreadIds(APPLE_JONY_MEMBER_ACCESS_TOKEN),
    ).not.toContain(threadId);
    expect(
      (await listChannels(APPLE_JONY_MEMBER_ACCESS_TOKEN)).map(({ id }) => id),
    ).not.toContain(channelId);

    for (const response of [
      await makeMetadataApiRequest(
        { query: CHANNEL_THREAD_IDS, variables: { channelId } },
        APPLE_JONY_MEMBER_ACCESS_TOKEN,
      ),
      await makeMetadataApiRequest(
        { query: CREATE_THREAD, variables: { channelId } },
        APPLE_JONY_MEMBER_ACCESS_TOKEN,
      ),
    ]) {
      expect(response.body.errors[0].extensions.code).toBe('NOT_FOUND');
    }

    const openResponse = await updateChannel(channelId, {
      roleIds: [adminRoleId, memberRoleId],
    });

    assertGraphQLSuccessfulResponse(openResponse);
    expect(
      [...openResponse.body.data.updateAgentChatChannel.roleIds].sort(),
    ).toEqual([adminRoleId, memberRoleId].sort());
    expect(await listChatThreadIds(APPLE_JONY_MEMBER_ACCESS_TOKEN)).toContain(
      threadId,
    );
    expect(
      (await getChannelSummaries(APPLE_JONY_MEMBER_ACCESS_TOKEN)).find(
        (summary) => summary.channelId === channelId,
      ),
    ).toEqual({ channelId, openCount: 1, hasUnreadOpen: true });

    assertGraphQLSuccessfulResponse(
      await updateChannel(channelId, { roleIds: [adminRoleId] }),
    );

    expect(
      await listChatThreadIds(APPLE_JONY_MEMBER_ACCESS_TOKEN),
    ).not.toContain(threadId);
    expect(
      (await getChannelSummaries(APPLE_JONY_MEMBER_ACCESS_TOKEN)).map(
        (summary) => summary.channelId,
      ),
    ).not.toContain(channelId);
  });

  it('opens every channel to a role given access to all channels, and back', async () => {
    const memberRoleId = await closeMemberAllChannelsAccess();
    const channelId = await createChannel();
    const threadId = await createThreadInChannel(channelId);

    await expectEventually(async () =>
      expect(
        await listChatThreadIds(APPLE_JONY_MEMBER_ACCESS_TOKEN),
      ).not.toContain(threadId),
    );

    await setRoleAllChannelsAccess(memberRoleId, true);

    await expectEventually(async () =>
      expect(await listChatThreadIds(APPLE_JONY_MEMBER_ACCESS_TOKEN)).toContain(
        threadId,
      ),
    );
    expect(
      (await listChannels(APPLE_JONY_MEMBER_ACCESS_TOKEN)).find(
        ({ id }) => id === channelId,
      ),
    ).toMatchObject({ isAccessible: true });

    await setRoleAllChannelsAccess(memberRoleId, false);

    await expectEventually(async () =>
      expect(
        await listChatThreadIds(APPLE_JONY_MEMBER_ACCESS_TOKEN),
      ).not.toContain(threadId),
    );
  });

  it('refuses a role from outside the workspace', async () => {
    const response = await makeMetadataApiRequest({
      query: CREATE_CHANNEL,
      variables: {
        input: {
          name: 'Channel with an unknown role',
          roleIds: [randomUUID()],
        },
      },
    });

    expect(response.body.errors[0].extensions.code).toBe('BAD_USER_INPUT');
  });

  it('keeps chats a member only reads in a channel out of their own inbox', async () => {
    const channelId = await createChannel();
    const jonyOpenThreadCount = await getOpenThreadCount(
      APPLE_JONY_MEMBER_ACCESS_TOKEN,
    );
    const threadId = await createThreadInChannel(channelId);

    assertGraphQLSuccessfulResponse(
      await runInboxAction('READ', threadId, APPLE_JONY_MEMBER_ACCESS_TOKEN),
    );

    expect(await readMemberCopy(threadId, JONY)).toMatchObject({
      isSubscribed: false,
    });
    expect(await getOpenThreadCount(APPLE_JONY_MEMBER_ACCESS_TOKEN)).toBe(
      jonyOpenThreadCount,
    );

    // Filing it follows it, so new activity brings it back to his inbox
    assertGraphQLSuccessfulResponse(
      await runInboxAction('ARCHIVE', threadId, APPLE_JONY_MEMBER_ACCESS_TOKEN),
    );

    expect(await readMemberCopy(threadId, JONY)).toMatchObject({
      isSubscribed: true,
    });

    assertGraphQLSuccessfulResponse(
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
    const channelId = await createChannel();
    const threadId = await createThreadInChannel(channelId);

    assertGraphQLSuccessfulResponse(
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

    assertGraphQLSuccessfulResponse(
      await runThreadMutation('reopenAgentChatThreadInChannel', threadId),
    );
    assertGraphQLSuccessfulResponse(
      await runThreadMutation('markAgentChatThreadAsDoneInChannel', threadId),
    );

    expect(await readMemberCopy(threadId, JANE)).toMatchObject({
      archivedAt: expect.anything(),
    });

    await simulateNewMessageActivity(threadId);

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
    const channelId = await createChannel();
    const threadId = await createThreadInChannel(channelId);

    assertGraphQLSuccessfulResponse(
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

    assertGraphQLSuccessfulResponse(
      await runInboxAction('ARCHIVE', threadId, APPLE_JONY_MEMBER_ACCESS_TOKEN),
    );

    expect((await readChannelState(threadId)).channelArchivedAt).not.toBeNull();

    assertGraphQLSuccessfulResponse(
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

    assertGraphQLSuccessfulResponse(
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
    assertGraphQLSuccessfulResponse(
      await runInboxAction('ARCHIVE', threadId, APPLE_JONY_MEMBER_ACCESS_TOKEN),
    );

    // Anyone else filing their own copy leaves the channel's alone
    assertGraphQLSuccessfulResponse(
      await runThreadMutation(
        'reopenAgentChatThreadInChannel',
        threadId,
        APPLE_JONY_MEMBER_ACCESS_TOKEN,
      ),
    );
    assertGraphQLSuccessfulResponse(await runInboxAction('ARCHIVE', threadId));

    expect((await readChannelState(threadId)).channelArchivedAt).toBeNull();
  });

  it('snoozes a chat for the channel until its snooze ends', async () => {
    const channelId = await createChannel();
    const threadId = await createThreadInChannel(channelId);

    const pastResponse = await makeMetadataApiRequest({
      query: SNOOZE_IN_CHANNEL,
      variables: {
        threadId,
        snoozedUntil: new Date(Date.now() - 60_000).toISOString(),
      },
    });

    expect(pastResponse.body.errors[0].extensions.code).toBe('BAD_USER_INPUT');

    assertGraphQLSuccessfulResponse(
      await makeMetadataApiRequest({
        query: SNOOZE_IN_CHANNEL,
        variables: { threadId, snoozedUntil: buildFutureSnoozedUntil() },
      }),
    );

    expect(
      (await findChannelThreadIds(channelId, { status: 'SNOOZED' })).threadIds,
    ).toEqual([threadId]);
    // The creator follows it, so their own copy is snoozed too
    expect(await readMemberCopy(threadId, JANE)).toMatchObject({
      snoozedUntil: expect.anything(),
    });

    const snoozedUntil = new Date(Date.now() - 1000);

    await global.testDataSource.query(
      `UPDATE ${SCHEMA}."agentChatThread" SET "channelSnoozedUntil" = $2 WHERE id = $1`,
      [threadId, snoozedUntil],
    );

    const triageService =
      getAppProviderByClassName<AgentChatThreadTriageService>(
        'AgentChatThreadTriageService',
      );

    const replacedSnoozedUntil = new Date(Date.now() - 5000).toISOString();

    await triageService.endChannelSnooze({
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      threadId,
      snoozedUntil: replacedSnoozedUntil,
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
    const { id: adminRoleId } = await findOneRoleByLabel({ label: 'Admin' });

    const memberRoleId = await closeMemberAllChannelsAccess();
    const sourceChannelId = await createChannel({ roleIds: [memberRoleId] });
    const destinationChannelId = await createChannel({
      roleIds: [adminRoleId],
    });
    const threadId = await createThreadInChannel(sourceChannelId);

    assertGraphQLSuccessfulResponse(
      await runThreadMutation('markAgentChatThreadAsDoneInChannel', threadId),
    );

    // Jony cannot reach the destination
    const refusedResponse = await makeMetadataApiRequest(
      {
        query: MOVE_THREAD,
        variables: { threadId, channelId: destinationChannelId },
      },
      APPLE_JONY_MEMBER_ACCESS_TOKEN,
    );

    expect(refusedResponse.body.errors[0].extensions.code).toBe('NOT_FOUND');

    assertGraphQLSuccessfulResponse(
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
    expect(await readChannelGrants(threadId)).toEqual([
      { principalType: 'ROLE', sourceId: destinationChannelId },
    ]);
    expect(
      await listChatThreadIds(APPLE_JONY_MEMBER_ACCESS_TOKEN),
    ).not.toContain(threadId);

    assertGraphQLSuccessfulResponse(
      await makeMetadataApiRequest({
        query: MOVE_THREAD,
        variables: { threadId, channelId: null },
      }),
    );

    expect((await readChannelState(threadId)).channelId).toBeNull();
    expect(await readChannelGrants(threadId)).toEqual([]);
  });

  it('deletes a channel only once its chats have somewhere to go', async () => {
    const channelId = await createChannel();
    const destinationChannelId = await createChannel();
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

    assertGraphQLSuccessfulResponse(
      await makeMetadataApiRequest({
        query: DELETE_CHANNEL,
        variables: { channelId, destinationChannelId },
      }),
    );

    expect((await readChannelState(threadId)).channelId).toBe(
      destinationChannelId,
    );
    expect(await readChannelGrants(threadId)).toEqual([
      { principalType: 'ROLE', sourceId: destinationChannelId },
    ]);
    expect((await listChannels()).map(({ id }) => id)).not.toContain(channelId);
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
  });

  it('pins a channel to the sidebar until the channel is deleted', async () => {
    const channelId = await createChannel();

    const { errors: missingChannelErrors } = await createNavigationMenuItem({
      input: { type: NavigationMenuItemType.AGENT_CHAT_CHANNEL },
      expectToFail: true,
    });

    expect(missingChannelErrors).toBeDefined();

    const { data } = await createNavigationMenuItem({
      input: {
        type: NavigationMenuItemType.AGENT_CHAT_CHANNEL,
        agentChatChannelId: channelId,
      },
      gqlFields: 'id agentChatChannelId',
    });
    const navigationMenuItemId = data.createNavigationMenuItem.id;

    expect(data.createNavigationMenuItem.agentChatChannelId).toBe(channelId);

    assertGraphQLSuccessfulResponse(
      await makeMetadataApiRequest({
        query: DELETE_CHANNEL,
        variables: { channelId },
      }),
    );

    const { data: afterDeleteData } = await findNavigationMenuItems({
      input: undefined,
      gqlFields: 'id',
    });

    expect(
      afterDeleteData.navigationMenuItems.map(({ id }) => id),
    ).not.toContain(navigationMenuItemId);
  });

  it('counts open chats for each channel the member reaches, and their own only once they follow', async () => {
    const channelId = await createChannel();
    const janeOpenThreadCount = await getOpenThreadCount();
    const jonyOpenThreadCount = await getOpenThreadCount(
      APPLE_JONY_MEMBER_ACCESS_TOKEN,
    );
    const threadId = await createThreadInChannel(channelId);
    const doneThreadId = await createThreadInChannel(channelId);

    assertGraphQLSuccessfulResponse(
      await runThreadMutation(
        'markAgentChatThreadAsDoneInChannel',
        doneThreadId,
      ),
    );
    await simulateNewMessageActivity(threadId);

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

  it('keeps the channel chats of a removed member in their channel', async () => {
    const channelId = await createChannel();
    const channelThreadId = await createThreadInChannel(
      channelId,
      APPLE_JONY_MEMBER_ACCESS_TOKEN,
    );
    const ownThreadId = await createThreadInChannel(
      null,
      APPLE_JONY_MEMBER_ACCESS_TOKEN,
    );
    const { flatFieldMetadataMaps } =
      await getAppProviderByClassName<WorkspaceCacheService>(
        'WorkspaceCacheService',
      ).getOrRecompute(SEED_APPLE_WORKSPACE_ID, ['flatFieldMetadataMaps']);

    await detachAgentChatChannelThreadsFromWorkspaceMember({
      threadRepository: global.app.get<
        string,
        AgentHistoryRepository<AgentChatThreadWorkspaceEntity>
      >(getAgentHistoryRepositoryToken('agentChatThread'), { strict: false }),
      flatFieldMetadataMaps,
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

    const leaveResponse = await makeMetadataApiRequest({
      query: MOVE_THREAD,
      variables: { threadId: channelThreadId, channelId: null },
    });

    expect(leaveResponse.body.errors[0].extensions.code).toBe('BAD_USER_INPUT');

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

  it('pages a channel by last activity', async () => {
    const channelId = await createChannel();
    const olderThreadId = await createThreadInChannel(channelId);
    const newerThreadId = await createThreadInChannel(channelId);

    await simulateNewMessageActivity(newerThreadId);

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
