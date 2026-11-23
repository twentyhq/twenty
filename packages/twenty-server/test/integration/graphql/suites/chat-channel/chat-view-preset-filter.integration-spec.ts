import {
  AGENT_CHAT_THREAD_PRESET_FILTER,
  AgentChatThreadConversationType,
  computeViewPresetFilterGqlFilter,
  getAgentChatThreadInboxStatus,
  isAgentChatThreadInPresetFilter,
  type AgentChatInboxState,
} from 'twenty-shared/ai';
import {
  type RecordGqlOperationFilter,
  ViewPresetFilter,
} from 'twenty-shared/types';
import { findManyOperationFactory } from 'test/integration/graphql/utils/find-many-operation-factory.util';
import { makeGraphqlApiRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { WORKSPACE_MEMBER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/workspace-member-data-seeds.constant';
import {
  SCHEMA,
  findChannelThreadIds,
  setUpChatChannelTests,
} from 'test/integration/graphql/suites/chat-channel/utils/chat-channel-test.util';

const { JANE } = WORKSPACE_MEMBER_DATA_SEED_IDS;

const ACTIVITY = new Date('2026-01-01T12:00:00.000Z');
const BEFORE_ACTIVITY = new Date('2026-01-01T11:00:00.000Z');
const AFTER_ACTIVITY = new Date('2026-01-01T13:00:00.000Z');
const SNOOZED_UNTIL = new Date('2030-01-01T00:00:00.000Z');

type ThreadState = {
  conversationType: AgentChatThreadConversationType;
  lastActivityAt: Date | null;
  filedAt: Date | null;
  snoozedUntil: Date | null;
  isSubscribed: boolean;
  lastMentionedAt: Date | null;
  mentionsResolvedAt: Date | null;
};

const OPEN: ThreadState = {
  conversationType: AgentChatThreadConversationType.STANDARD,
  lastActivityAt: ACTIVITY,
  filedAt: null,
  snoozedUntil: null,
  isSubscribed: true,
  lastMentionedAt: null,
  mentionsResolvedAt: null,
};

const THREAD_STATES: ThreadState[] = [
  OPEN,
  { ...OPEN, filedAt: AFTER_ACTIVITY },
  { ...OPEN, filedAt: ACTIVITY },
  { ...OPEN, filedAt: BEFORE_ACTIVITY },
  { ...OPEN, filedAt: AFTER_ACTIVITY, snoozedUntil: SNOOZED_UNTIL },
  { ...OPEN, filedAt: BEFORE_ACTIVITY, snoozedUntil: SNOOZED_UNTIL },
  { ...OPEN, lastActivityAt: null },
  { ...OPEN, lastActivityAt: null, filedAt: AFTER_ACTIVITY },
  {
    ...OPEN,
    lastActivityAt: null,
    filedAt: AFTER_ACTIVITY,
    snoozedUntil: SNOOZED_UNTIL,
  },
  { ...OPEN, isSubscribed: false },
  { ...OPEN, isSubscribed: false, filedAt: BEFORE_ACTIVITY },
  { ...OPEN, lastMentionedAt: AFTER_ACTIVITY },
  {
    ...OPEN,
    lastMentionedAt: AFTER_ACTIVITY,
    mentionsResolvedAt: BEFORE_ACTIVITY,
  },
  {
    ...OPEN,
    lastMentionedAt: BEFORE_ACTIVITY,
    mentionsResolvedAt: AFTER_ACTIVITY,
  },
  { ...OPEN, filedAt: AFTER_ACTIVITY, lastMentionedAt: AFTER_ACTIVITY },
  {
    ...OPEN,
    conversationType: AgentChatThreadConversationType.DIRECT_MESSAGE,
  },
];

type LoadedThread = {
  id: string;
  conversationType: AgentChatThreadConversationType;
  lastActivityAt: string | null;
  participants: {
    edges: { node: AgentChatInboxState & { workspaceMemberId: string } }[];
  };
};

const findThreads = async (
  filter: RecordGqlOperationFilter,
): Promise<LoadedThread[]> => {
  const response = await makeGraphqlApiRequest(
    findManyOperationFactory({
      objectMetadataSingularName: 'agentChatThread',
      objectMetadataPluralName: 'agentChatThreads',
      gqlFields:
        'id conversationType lastActivityAt participants { edges { node { workspaceMemberId lastReadAt archivedAt snoozedUntil isSubscribed lastMentionedAt mentionsResolvedAt } } }',
      filter,
      first: 200,
    }),
    APPLE_JANE_ADMIN_ACCESS_TOKEN,
  );

  expect(response.body.errors).toBeUndefined();

  return response.body.data.agentChatThreads.edges.map(
    ({ node }: { node: LoadedThread }) => node,
  );
};

const findThreadIds = async (
  filter: RecordGqlOperationFilter,
): Promise<string[]> => (await findThreads(filter)).map(({ id }) => id).sort();

describe('Chat view preset filters through the record API', () => {
  const { createChannel, createThreadInChannel } = setUpChatChannelTests();

  const createThreadsInEveryState = async () => {
    const channelId = await createChannel();
    const threadIds: string[] = [];

    for (const threadState of THREAD_STATES) {
      const threadId = await createThreadInChannel(channelId);

      await global.testDataSource.query(
        `UPDATE ${SCHEMA}."agentChatThread"
         SET "conversationType" = $2, "lastActivityAt" = $3, "channelArchivedAt" = $4, "channelSnoozedUntil" = $5
         WHERE id = $1`,
        [
          threadId,
          threadState.conversationType,
          threadState.lastActivityAt,
          threadState.filedAt,
          threadState.snoozedUntil,
        ],
      );
      await global.testDataSource.query(
        `UPDATE ${SCHEMA}."agentChatThreadParticipant"
         SET "archivedAt" = $3, "snoozedUntil" = $4, "isSubscribed" = $5, "lastMentionedAt" = $6, "mentionsResolvedAt" = $7
         WHERE "threadId" = $1 AND "workspaceMemberId" = $2`,
        [
          threadId,
          JANE,
          threadState.filedAt,
          threadState.snoozedUntil,
          threadState.isSubscribed,
          threadState.lastMentionedAt,
          threadState.mentionsResolvedAt,
        ],
      );

      threadIds.push(threadId);
    }

    return { channelId, threadIds };
  };

  it('lists the same chats as the inbox tabs for each personal preset', async () => {
    const { threadIds } = await createThreadsInEveryState();
    const threads = await findThreads({ id: { in: threadIds } });

    expect(threads).toHaveLength(THREAD_STATES.length);

    for (const [viewPresetFilter, tabPresetFilter] of [
      [ViewPresetFilter.INBOX_OPEN, AGENT_CHAT_THREAD_PRESET_FILTER.OPEN],
      [ViewPresetFilter.INBOX_SNOOZED, AGENT_CHAT_THREAD_PRESET_FILTER.SNOOZED],
      [ViewPresetFilter.INBOX_DONE, AGENT_CHAT_THREAD_PRESET_FILTER.DONE],
      [
        ViewPresetFilter.INBOX_MENTIONS,
        AGENT_CHAT_THREAD_PRESET_FILTER.MENTIONS,
      ],
    ] as const) {
      const threadIdsInTab = threads
        .filter((thread) =>
          isAgentChatThreadInPresetFilter({
            thread,
            inboxStatus: {
              ...getAgentChatThreadInboxStatus({
                lastActivityAt: thread.lastActivityAt,
                participant: thread.participants.edges.find(
                  ({ node }) => node.workspaceMemberId === JANE,
                )?.node,
              }),
              isAssignedToMe: false,
            },
            presetFilter: tabPresetFilter,
          }),
        )
        .map(({ id }) => id)
        .sort();

      expect(threadIdsInTab.length).toBeGreaterThan(0);
      expect(
        await findThreadIds({
          and: [
            { id: { in: threadIds } },
            computeViewPresetFilterGqlFilter({
              presetFilter: viewPresetFilter,
              currentWorkspaceMemberId: JANE,
            }),
          ],
        }),
      ).toEqual(threadIdsInTab);
    }
  });

  it('lists the same chats as the channel status query for each channel preset', async () => {
    const { channelId } = await createThreadsInEveryState();

    for (const [viewPresetFilter, status] of [
      [ViewPresetFilter.INBOX_CHANNEL_OPEN, 'OPEN'],
      [ViewPresetFilter.INBOX_CHANNEL_SNOOZED, 'SNOOZED'],
      [ViewPresetFilter.INBOX_CHANNEL_DONE, 'DONE'],
    ] as const) {
      const { threadIds: threadIdsInChannelStatus } =
        await findChannelThreadIds(channelId, { status });

      expect(threadIdsInChannelStatus.length).toBeGreaterThan(0);
      expect(
        await findThreadIds({
          and: [
            { channelId: { eq: channelId } },
            computeViewPresetFilterGqlFilter({
              presetFilter: viewPresetFilter,
              currentWorkspaceMemberId: undefined,
            }),
          ],
        }),
      ).toEqual([...threadIdsInChannelStatus].sort());
    }
  });
});
