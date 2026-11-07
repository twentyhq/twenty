import { randomUUID } from 'node:crypto';
import { parse } from 'graphql';
import { type AgentChatInboxAction } from 'twenty-shared/ai';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { isNonEmptyArray } from 'twenty-shared/utils';
import { type QueryRunner } from 'typeorm';
import { assertGraphQLSuccessfulResponse } from 'test/integration/graphql/utils/graphql-test-assertions.util';
import { findOneRoleByLabel } from 'test/integration/metadata/suites/role/utils/find-one-role-by-label.util';
import { updateOneRole } from 'test/integration/metadata/suites/role/utils/update-one-role.util';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { destroyAgentChatThread } from 'test/integration/utils/destroy-agent-chat-thread.util';
import { removeAgentChatSnoozeEndJobs } from 'test/integration/utils/remove-agent-chat-snooze-end-jobs.util';
import { expectEventually } from 'test/integration/utils/expect-eventually.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { waitForAllJobsToFinish } from 'test/integration/utils/wait-for-all-jobs-to-finish.util';
import { type AgentChatChannelMetadataService } from 'src/engine/metadata-modules/agent-chat-channel/services/agent-chat-channel-metadata.service';
import { type AgentChatChannelSummaryDTO } from 'src/engine/metadata-modules/ai/ai-chat/dtos/agent-chat-channel-summary.dto';
import { type UpdateAgentChatChannelInput } from 'src/engine/metadata-modules/ai/ai-chat/dtos/update-agent-chat-channel.input';
import { type AgentChatChannelAccessService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-channel-access.service';
import { type AgentChatChannelGrantService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-channel-grant.service';
import { acquireAgentChatChannelGrantLocks } from 'src/engine/metadata-modules/ai/ai-chat/utils/acquire-agent-chat-channel-grant-locks.util';
import { buildAgentChatChannelDeletionLockKey } from 'src/engine/metadata-modules/ai/ai-chat/utils/build-agent-chat-channel-deletion-lock-key.util';
import { buildAgentChatChannelGrantLockKey } from 'src/engine/metadata-modules/ai/ai-chat/utils/build-agent-chat-channel-grant-lock-key.util';
import { type MetadataEventEmitter } from 'src/engine/subscriptions/metadata-event/metadata-event-emitter';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { type WorkspaceEventEmitter } from 'src/engine/workspace-event-emitter/workspace-event-emitter';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

export const SCHEMA = getWorkspaceSchemaName(SEED_APPLE_WORKSPACE_ID);

type ChannelAccess = { roleIds?: string[] };

type ChannelThreadsFilter = {
  status?: 'OPEN' | 'SNOOZED' | 'DONE';
  assignment?: 'ANY' | 'ASSIGNED' | 'UNASSIGNED' | 'ASSIGNED_TO_ME';
  filter?: 'ANY' | 'NEEDS_INPUT' | 'MENTIONED';
};

type ChannelThreadMutationName =
  | 'markAgentChatThreadAsDoneInChannel'
  | 'reopenAgentChatThreadInChannel';

export const CREATE_CHANNEL = parse(
  `mutation CreateChannel($input: CreateAgentChatChannelInput!) { createAgentChatChannel(input: $input) { id name icon color roleIds applicationId } }`,
);

const UPDATE_CHANNEL = parse(
  `mutation UpdateChannel($channelId: UUID!, $input: UpdateAgentChatChannelInput!) { updateAgentChatChannel(channelId: $channelId, input: $input) { id name roleIds } }`,
);

export const DELETE_CHANNEL = parse(
  `mutation DeleteChannel($channelId: UUID!, $destinationChannelId: UUID) { deleteAgentChatChannel(channelId: $channelId, destinationChannelId: $destinationChannelId) }`,
);

export const CHANNEL_ROLES = parse(
  `query ChannelRoles { agentChatChannelRoles { id } }`,
);

const CHANNELS = parse(
  `query Channels { agentChatChannels { id name applicationId isCustom isAccessible } }`,
);

export const CREATE_THREAD = parse(
  `mutation CreateThread($channelId: UUID) { createChatThread(channelId: $channelId) { id } }`,
);

export const MOVE_THREAD = parse(
  `mutation Move($threadId: UUID!, $channelId: UUID) { moveAgentChatThreadToChannel(threadId: $threadId, channelId: $channelId) }`,
);

const THREAD_MUTATION = (name: ChannelThreadMutationName) =>
  parse(`mutation Run($threadId: UUID!) { ${name}(threadId: $threadId) }`);

const UPDATE_INBOX_STATE = parse(
  `mutation Update($threadIds: [UUID!]!, $action: AgentChatInboxAction!, $snoozedUntil: DateTime) { updateAgentChatThreadInboxState(threadIds: $threadIds, action: $action, snoozedUntil: $snoozedUntil) { id } }`,
);

export const SNOOZE_IN_CHANNEL = parse(
  `mutation Snooze($threadId: UUID!, $snoozedUntil: DateTime!) { snoozeAgentChatThreadInChannel(threadId: $threadId, snoozedUntil: $snoozedUntil) }`,
);

export const ASSIGN = parse(
  `mutation Assign($threadId: UUID!, $assigneeWorkspaceMemberId: UUID) { assignAgentChatThread(threadId: $threadId, assigneeWorkspaceMemberId: $assigneeWorkspaceMemberId) }`,
);

export const CHANNEL_THREAD_IDS = parse(
  `query Ids($channelId: UUID!, $status: AgentChatChannelThreadStatus, $assignment: AgentChatChannelAssignmentFilter, $filter: AgentChatChannelThreadFilter, $first: Int, $after: String) { agentChatChannelThreadIds(channelId: $channelId, status: $status, assignment: $assignment, filter: $filter, first: $first, after: $after) { threadIds hasNextPage endCursor } }`,
);

const CHANNEL_SUMMARIES = parse(
  `query Summaries { agentChatChannelSummaries { channelId openCount assignedToMeCount snoozedCount doneCount hasUnreadOpen hasUnreadAssignedToMe } }`,
);

const OPEN_THREADS_SUMMARY = parse(
  `query Summary { agentChatOpenThreadsSummary { openThreadCount hasUnreadOpenThread } }`,
);

// Outlasts any test, yet within the delay the test queue fast-forwards
export const buildFutureSnoozedUntil = () =>
  new Date(Date.now() + 30_000).toISOString();

export const runThreadMutation = (
  name: ChannelThreadMutationName,
  threadId: string,
  token: string = APPLE_JANE_ADMIN_ACCESS_TOKEN,
) =>
  makeMetadataApiRequest(
    { query: THREAD_MUTATION(name), variables: { threadId } },
    token,
  );

export const runInboxAction = (
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

export const findChannelThreadIds = async (
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

export const getChannelSummaries = async (
  token: string = APPLE_JANE_ADMIN_ACCESS_TOKEN,
): Promise<AgentChatChannelSummaryDTO[]> => {
  const response = await makeMetadataApiRequest(
    { query: CHANNEL_SUMMARIES },
    token,
  );

  assertGraphQLSuccessfulResponse(response);

  return response.body.data.agentChatChannelSummaries;
};

export const getOpenThreadCount = async (
  token: string = APPLE_JANE_ADMIN_ACCESS_TOKEN,
): Promise<number> => {
  const response = await makeMetadataApiRequest(
    { query: OPEN_THREADS_SUMMARY },
    token,
  );

  assertGraphQLSuccessfulResponse(response);

  return response.body.data.agentChatOpenThreadsSummary.openThreadCount;
};

export const readMemberCopy = async (
  threadId: string,
  workspaceMemberId: string,
) => {
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

export const readChannelState = async (threadId: string) => {
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

export const listChannels = async (
  token: string = APPLE_JANE_ADMIN_ACCESS_TOKEN,
): Promise<
  {
    id: string;
    name: string;
    applicationId: string;
    isCustom: boolean;
    isAccessible: boolean;
  }[]
> => {
  const response = await makeMetadataApiRequest({ query: CHANNELS }, token);

  assertGraphQLSuccessfulResponse(response);

  return response.body.data.agentChatChannels;
};

export const readChannelGrants = async (
  threadId: string,
): Promise<{ principalType: string; sourceId: string }[]> =>
  global.testDataSource.query(
    `SELECT DISTINCT "principalType", "sourceId" FROM ${SCHEMA}."recordShare"
     WHERE "recordId" = $1 AND "rowCause" = 'RULE' AND "deletedAt" IS NULL
     ORDER BY "principalType"`,
    [threadId],
  );

export const readChannelGrantRoleIds = async (
  threadId: string,
): Promise<string[]> =>
  (
    await global.testDataSource.query(
      `SELECT "principalId" FROM ${SCHEMA}."recordShare"
       WHERE "recordId" = $1 AND "rowCause" = 'RULE' AND "deletedAt" IS NULL
         AND "principalType" = 'ROLE'`,
      [threadId],
    )
  ).map(({ principalId }: { principalId: string }) => principalId);

export const setRoleAllChannelsAccess = async (
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

export const waitForChannelGrantRewrites = async () => {
  await getAppProviderByClassName<MetadataEventEmitter>(
    'MetadataEventEmitter',
  ).drain();
  await waitForAllJobsToFinish();
};

export const getChannelGrantService = () =>
  getAppProviderByClassName<AgentChatChannelGrantService>(
    'AgentChatChannelGrantService',
  );

export const waitForBlockedChannelGrantLock = (channelId: string) =>
  expectEventually(async () => {
    const [{ count }]: { count: number }[] = await global.testDataSource.query(
      `WITH lock_key AS (SELECT hashtextextended($1, 0) AS value)
       SELECT count(*)::int AS count FROM pg_locks, lock_key
       WHERE pg_locks.locktype = 'advisory' AND NOT pg_locks.granted
         AND pg_locks.objsubid = 1
         AND pg_locks.database = (SELECT oid FROM pg_database WHERE datname = current_database())
         AND pg_locks.classid = ((lock_key.value >> 32) & 4294967295)::oid
         AND pg_locks.objid = (lock_key.value & 4294967295)::oid`,
      [
        buildAgentChatChannelGrantLockKey({
          workspaceId: SEED_APPLE_WORKSPACE_ID,
          channelId,
        }),
      ],
    );

    expect(count).toBeGreaterThanOrEqual(1);
  });

export const isChannelInCore = async (channelId: string): Promise<boolean> =>
  isNonEmptyArray(
    await global.testDataSource.query(
      `SELECT id FROM core."agentChatChannel" WHERE id = $1`,
      [channelId],
    ),
  );

export const countThreadsInChannel = async (
  channelId: string,
): Promise<number> => {
  const [{ count }]: { count: number }[] = await global.testDataSource.query(
    `SELECT count(*)::int AS count FROM ${SCHEMA}."agentChatThread" WHERE "channelId" = $1`,
    [channelId],
  );

  return count;
};

const countThreadsInDeletedChannels = async (
  channelIds: string[],
): Promise<number> => {
  const [{ count }]: { count: number }[] = await global.testDataSource.query(
    `SELECT count(*)::int AS count FROM ${SCHEMA}."agentChatThread" thread
     WHERE thread."channelId" = ANY($1::uuid[])
       AND NOT EXISTS (
         SELECT 1 FROM core."agentChatChannel" channel
         WHERE channel.id = thread."channelId"
       )`,
    [channelIds],
  );

  return count;
};

export const watchThreadEvents = () => {
  const eventSpy = jest.spyOn(
    getAppProviderByClassName<WorkspaceEventEmitter>('WorkspaceEventEmitter'),
    'emitDatabaseBatchEvent',
  );

  const findEmittedThreadEvent = (threadId: string) =>
    eventSpy.mock.calls
      .flatMap(([batchEvent]) =>
        batchEvent?.objectMetadataNameSingular === 'agentChatThread'
          ? batchEvent.events
          : [],
      )
      .find((event) => 'recordId' in event && event.recordId === threadId);

  return { findEmittedThreadEvent };
};

export const getChannelMetadataService = () =>
  getAppProviderByClassName<AgentChatChannelMetadataService>(
    'AgentChatChannelMetadataService',
  );

export const deleteChannelBehindStaleCache = async (channelId: string) => {
  const staleChannel = await getChannelMetadataService().findChannelOrThrow({
    workspaceId: SEED_APPLE_WORKSPACE_ID,
    channelId,
  });

  assertGraphQLSuccessfulResponse(
    await makeMetadataApiRequest({
      query: DELETE_CHANNEL,
      variables: { channelId },
    }),
  );

  const channelAccessService =
    getAppProviderByClassName<AgentChatChannelAccessService>(
      'AgentChatChannelAccessService',
    );

  jest
    .spyOn(channelAccessService, 'assertChannelAccess')
    .mockResolvedValue(staleChannel);
  jest
    .spyOn(channelAccessService, 'assertCallerChannelAccessOrThrow')
    .mockResolvedValue(staleChannel);
};

export const insertChannelGrant = ({
  queryRunner,
  threadId,
  roleId,
  channelId,
}: {
  queryRunner: QueryRunner;
  threadId: string;
  roleId: string;
  channelId: string;
}) =>
  queryRunner.query(
    `INSERT INTO ${SCHEMA}."recordShare"
       ("objectMetadataId", "recordId", "principalId", "principalType", "accessLevel", "rowCause", "sourceId")
     SELECT metadata.id, $1, $2, 'ROLE', 'READ_WRITE', 'RULE', $3
     FROM core."objectMetadata" metadata
     WHERE metadata."workspaceId" = $4 AND metadata."universalIdentifier" = $5`,
    [
      threadId,
      roleId,
      channelId,
      SEED_APPLE_WORKSPACE_ID,
      STANDARD_OBJECTS.agentChatThread.universalIdentifier,
    ],
  );

export const simulateNewMessageActivity = (threadId: string) =>
  global.testDataSource.query(
    `UPDATE ${SCHEMA}."agentChatThread" SET "lastActivityAt" = clock_timestamp() WHERE id = $1`,
    [threadId],
  );

export const setUpChatChannelTests = () => {
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
  const heldQueryRunners: QueryRunner[] = [];
  let isChannelCacheStale = false;

  const markChannelCacheStale = () => {
    isChannelCacheStale = true;
  };

  const startHeldTransaction = async (): Promise<QueryRunner> => {
    const queryRunner = global.testDataSource.createQueryRunner();

    await queryRunner.connect();
    heldQueryRunners.push(queryRunner);
    await queryRunner.startTransaction();

    return queryRunner;
  };

  const holdChannelGrantLock = async ({
    channelId,
    mode,
  }: {
    channelId: string;
    mode: 'shared' | 'exclusive';
  }): Promise<QueryRunner> => {
    const queryRunner = await startHeldTransaction();

    await acquireAgentChatChannelGrantLocks({
      transactionScope: {
        executeRawQuery: (sql, parameters) =>
          queryRunner.query(sql, parameters),
      },
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      channelIds: [channelId],
      mode,
    });

    return queryRunner;
  };

  const holdChannelDeletionLock = async (
    channelId: string,
  ): Promise<QueryRunner> => {
    const queryRunner = await startHeldTransaction();

    await queryRunner.query(
      'SELECT pg_advisory_xact_lock(hashtextextended($1, 0))',
      [
        buildAgentChatChannelDeletionLockKey({
          workspaceId: SEED_APPLE_WORKSPACE_ID,
          channelId,
        }),
      ],
    );

    return queryRunner;
  };

  const fileThreadIntoHeldChannel = async ({
    threadId,
    channelId,
  }: {
    threadId: string;
    channelId: string;
  }): Promise<QueryRunner> => {
    const queryRunner = await startHeldTransaction();

    await queryRunner.query(
      'SELECT pg_advisory_xact_lock_shared(hashtextextended($1, 0))',
      [
        buildAgentChatChannelDeletionLockKey({
          workspaceId: SEED_APPLE_WORKSPACE_ID,
          channelId,
        }),
      ],
    );
    await queryRunner.query(
      `UPDATE ${SCHEMA}."agentChatThread" SET "channelId" = $1 WHERE id = $2`,
      [channelId, threadId],
    );

    return queryRunner;
  };

  // Jony holds Member, which reaches every channel unless a test closes it
  const closeMemberAllChannelsAccess = async (): Promise<string> => {
    const { id: memberRoleId } = await findOneRoleByLabel({ label: 'Member' });

    await setRoleAllChannelsAccess(memberRoleId, false);
    roleIdsToReopenToAllChannels.add(memberRoleId);
    await waitForChannelGrantRewrites();

    return memberRoleId;
  };

  afterEach(async () => {
    jest.restoreAllMocks();
    await removeAgentChatSnoozeEndJobs({ threadIds: createdThreadIds });

    const orphanedThreadCount =
      await countThreadsInDeletedChannels(createdChannelIds);

    for (const queryRunner of heldQueryRunners.splice(0)) {
      if (queryRunner.isTransactionActive) {
        await queryRunner.rollbackTransaction();
      }
      await queryRunner.release();
    }

    if (isChannelCacheStale) {
      await getAppProviderByClassName<WorkspaceCacheService>(
        'WorkspaceCacheService',
      ).invalidateAndRecompute(SEED_APPLE_WORKSPACE_ID, [
        'flatAgentChatChannelMaps',
        'flatAgentChatChannelRoleMaps',
        'flatRoleMaps',
      ]);
      isChannelCacheStale = false;
    }

    const hasRolesToReopen = roleIdsToReopenToAllChannels.size > 0;

    for (const roleId of roleIdsToReopenToAllChannels) {
      await setRoleAllChannelsAccess(roleId, true);
    }
    roleIdsToReopenToAllChannels.clear();

    if (hasRolesToReopen) {
      await waitForChannelGrantRewrites();
    }

    for (const threadId of createdThreadIds.splice(0)) {
      await destroyAgentChatThread({ threadId });
    }
    for (const channelId of createdChannelIds.splice(0)) {
      await makeMetadataApiRequest({
        query: DELETE_CHANNEL,
        variables: { channelId },
      });
    }

    expect(orphanedThreadCount).toBe(0);
  });

  return {
    createdThreadIds,
    createdChannelIds,
    createChannel,
    updateChannel,
    createThreadInChannel,
    roleIdsToReopenToAllChannels,
    heldQueryRunners,
    markChannelCacheStale,
    startHeldTransaction,
    holdChannelGrantLock,
    holdChannelDeletionLock,
    fileThreadIntoHeldChannel,
    closeMemberAllChannelsAccess,
  };
};
