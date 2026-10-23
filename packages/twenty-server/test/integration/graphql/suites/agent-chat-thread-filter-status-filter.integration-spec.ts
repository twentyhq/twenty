import { randomUUID } from 'node:crypto';

import { parse } from 'graphql';
import {
  AGENT_CHAT_THREAD_FILTER_STATUS,
  type AgentChatThreadFilterStatus,
  computeAgentChatThreadFilterStatusGqlFilter,
} from 'twenty-shared/ai';

import { findManyOperationFactory } from 'test/integration/graphql/utils/find-many-operation-factory.util';
import { makeGraphqlApiRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { destroyAgentChatThread } from 'test/integration/utils/destroy-agent-chat-thread.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';

import { type AgentChatThreadService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-thread.service';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { WORKSPACE_MEMBER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/workspace-member-data-seeds.constant';

const SCHEMA = getWorkspaceSchemaName(SEED_APPLE_WORKSPACE_ID);

const FILED_AT = '2026-01-01T10:00:00.000Z';
const BEFORE_FILED_AT = '2026-01-01T09:00:00.000Z';
const AFTER_FILED_AT = '2026-01-01T11:00:00.000Z';
const SNOOZED_UNTIL = '2099-01-01T00:00:00.000Z';

type ThreadState = {
  lastActivityAt?: string | null;
  pendingQuestionMessageId?: string;
  assigneeId?: string;
  participant?: {
    archivedAt?: string;
    snoozedUntil?: string;
    isSubscribed?: boolean;
    lastMentionedAt?: string;
  };
};

const THREAD_STATES = {
  open: {},
  needsInput: { pendingQuestionMessageId: randomUUID() },
  mentioned: { participant: { lastMentionedAt: FILED_AT } },
  assigned: { assigneeId: WORKSPACE_MEMBER_DATA_SEED_IDS.JANE },
  doneThenNewActivity: {
    lastActivityAt: AFTER_FILED_AT,
    participant: { archivedAt: FILED_AT },
  },
  snoozedThenNewActivity: {
    lastActivityAt: AFTER_FILED_AT,
    participant: { archivedAt: FILED_AT, snoozedUntil: SNOOZED_UNTIL },
  },
  done: {
    lastActivityAt: BEFORE_FILED_AT,
    participant: { archivedAt: FILED_AT },
  },
  doneWithoutActivity: {
    lastActivityAt: null,
    participant: { archivedAt: FILED_AT },
  },
  snoozed: {
    lastActivityAt: BEFORE_FILED_AT,
    participant: { archivedAt: FILED_AT, snoozedUntil: SNOOZED_UNTIL },
  },
  unsubscribed: {
    lastActivityAt: AFTER_FILED_AT,
    participant: { archivedAt: FILED_AT, isSubscribed: false },
  },
  notFollowed: { participant: { isSubscribed: false } },
} satisfies Record<string, ThreadState>;

type ThreadStateName = keyof typeof THREAD_STATES;

const EXPECTED_THREAD_STATES_BY_FILTER_STATUS: Record<
  AgentChatThreadFilterStatus,
  ThreadStateName[]
> = {
  active: [
    'open',
    'needsInput',
    'mentioned',
    'assigned',
    'doneThenNewActivity',
    'snoozedThenNewActivity',
  ],
  needsInput: ['needsInput'],
  mentions: ['mentioned'],
  assigned: ['assigned'],
  snoozed: ['snoozed'],
  done: ['done', 'doneWithoutActivity', 'unsubscribed'],
};

const createThreadInState = async ({
  lastActivityAt,
  pendingQuestionMessageId,
  assigneeId,
  participant = {},
}: ThreadState): Promise<string> => {
  const threadId = randomUUID();

  await getAppProviderByClassName<AgentChatThreadService>(
    'AgentChatThreadService',
  ).createThread({
    workspaceId: SEED_APPLE_WORKSPACE_ID,
    workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JANE,
    id: threadId,
    title: 'Filter status',
  });

  await global.testDataSource.query(
    `UPDATE ${SCHEMA}."agentChatThread"
     SET "lastActivityAt" = CASE WHEN $2 THEN $3::timestamptz ELSE "lastActivityAt" END,
       "pendingQuestionMessageId" = $4, "assigneeId" = $5
     WHERE id = $1`,
    [
      threadId,
      lastActivityAt !== undefined,
      lastActivityAt ?? null,
      pendingQuestionMessageId ?? null,
      assigneeId ?? null,
    ],
  );

  await global.testDataSource.query(
    `UPDATE ${SCHEMA}."agentChatThreadParticipant"
     SET "archivedAt" = $3, "snoozedUntil" = $4, "isSubscribed" = $5, "lastMentionedAt" = $6
     WHERE "threadId" = $1 AND "workspaceMemberId" = $2`,
    [
      threadId,
      WORKSPACE_MEMBER_DATA_SEED_IDS.JANE,
      participant.archivedAt ?? null,
      participant.snoozedUntil ?? null,
      participant.isSubscribed ?? true,
      participant.lastMentionedAt ?? null,
    ],
  );

  return threadId;
};

const UPDATE_INBOX_STATE_IN_FILTER_STATUS = parse(
  `mutation UpdateInboxStateInFilterStatus($filterStatus: AgentChatThreadFilterStatus!, $excludedThreadIds: [UUID!]!, $action: AgentChatInboxAction!) {
    updateAgentChatThreadInboxStateInFilterStatus(filterStatus: $filterStatus, excludedThreadIds: $excludedThreadIds, action: $action) { threadId archivedAt }
  }`,
);

const readArchivedAt = async (threadId: string) => {
  const [{ archivedAt }]: { archivedAt: Date | null }[] =
    await global.testDataSource.query(
      `SELECT "archivedAt" FROM ${SCHEMA}."agentChatThreadParticipant" WHERE "threadId" = $1 AND "workspaceMemberId" = $2`,
      [threadId, WORKSPACE_MEMBER_DATA_SEED_IDS.JANE],
    );

  return archivedAt;
};

describe('Agent chat thread filter status filter', () => {
  const threadIdByState = {} as Record<ThreadStateName, string>;

  beforeAll(async () => {
    for (const [stateName, state] of Object.entries(THREAD_STATES)) {
      threadIdByState[stateName as ThreadStateName] =
        await createThreadInState(state);
    }
  });

  afterAll(async () => {
    for (const threadId of Object.values(threadIdByState)) {
      await destroyAgentChatThread({ threadId });
    }
  });

  it.each(Object.values(AGENT_CHAT_THREAD_FILTER_STATUS))(
    'lists the chats the inbox places under %s',
    async (filterStatus) => {
      const response = await makeGraphqlApiRequest(
        findManyOperationFactory({
          objectMetadataSingularName: 'agentChatThread',
          objectMetadataPluralName: 'agentChatThreads',
          gqlFields: 'id',
          filter: {
            and: [
              { id: { in: Object.values(threadIdByState) } },
              computeAgentChatThreadFilterStatusGqlFilter({
                filterStatus,
                workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JANE,
              }),
            ],
          },
        }),
        APPLE_JANE_ADMIN_ACCESS_TOKEN,
      );

      expect(response.body.errors).toBeUndefined();

      const listedThreadIds = response.body.data.agentChatThreads.edges
        .map(({ node }: { node: { id: string } }) => node.id)
        .sort();

      expect(listedThreadIds).toEqual(
        EXPECTED_THREAD_STATES_BY_FILTER_STATUS[filterStatus]
          .map((stateName) => threadIdByState[stateName])
          .sort(),
      );
    },
  );
});

describe('Inbox action on every chat of a tab', () => {
  const createdThreadIds: string[] = [];

  const createTestThread = async (state: ThreadState) => {
    const threadId = await createThreadInState(state);

    createdThreadIds.push(threadId);

    return threadId;
  };

  const runInboxActionInFilterStatus = (variables: {
    filterStatus: string;
    excludedThreadIds: string[];
    action: string;
  }) =>
    makeMetadataApiRequest(
      { query: UPDATE_INBOX_STATE_IN_FILTER_STATUS, variables },
      APPLE_JANE_ADMIN_ACCESS_TOKEN,
    );

  afterEach(async () => {
    for (const threadId of createdThreadIds.splice(0)) {
      await destroyAgentChatThread({ threadId });
    }
  });

  it('marks every chat of the tab done but the ones left out', async () => {
    const firstOpenThreadId = await createTestThread(THREAD_STATES.open);
    const secondOpenThreadId = await createTestThread(
      THREAD_STATES.doneThenNewActivity,
    );
    const excludedThreadId = await createTestThread(THREAD_STATES.open);
    const snoozedThreadId = await createTestThread(THREAD_STATES.snoozed);
    const snoozedArchivedAt = await readArchivedAt(snoozedThreadId);

    const response = await runInboxActionInFilterStatus({
      filterStatus: 'ACTIVE',
      excludedThreadIds: [excludedThreadId],
      action: 'ARCHIVE',
    });

    expect(response.body.errors).toBeUndefined();
    expect(
      response.body.data.updateAgentChatThreadInboxStateInFilterStatus.map(
        ({ threadId }: { threadId: string }) => threadId,
      ),
    ).toEqual(expect.arrayContaining([firstOpenThreadId, secondOpenThreadId]));
    expect(await readArchivedAt(firstOpenThreadId)).not.toBeNull();
    expect(
      (await readArchivedAt(secondOpenThreadId))?.getTime(),
    ).toBeGreaterThan(new Date(AFTER_FILED_AT).getTime());
    expect(await readArchivedAt(excludedThreadId)).toBeNull();
    expect(await readArchivedAt(snoozedThreadId)).toEqual(snoozedArchivedAt);
  });

  it.each([
    [
      'an action that can fail on chats the member has not loaded',
      'ACTIVE',
      'UNSUBSCRIBE',
    ],
    ['an unknown tab', 'EVERYTHING', 'ARCHIVE'],
  ])('rejects %s', async (_, filterStatus, action) => {
    const response = await runInboxActionInFilterStatus({
      filterStatus,
      excludedThreadIds: [],
      action,
    });

    expect(response.body.errors?.[0]?.extensions?.code).toBe('BAD_USER_INPUT');
  });
});
