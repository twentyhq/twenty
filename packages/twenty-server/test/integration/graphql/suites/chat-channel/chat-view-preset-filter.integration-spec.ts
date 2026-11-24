import {
  AGENT_CHAT_THREAD_PRESET_FILTER,
  type AgentChatInboxAction,
  type AgentChatInboxState,
  type AgentChatThreadConversationType,
  computeViewPresetFilterGqlFilter,
  getAgentChatThreadInboxStatus,
  isAgentChatThreadInPresetFilter,
} from 'twenty-shared/ai';
import {
  type RecordGqlOperationFilter,
  ViewPresetFilter,
} from 'twenty-shared/types';
import { assertGraphQLSuccessfulResponse } from 'test/integration/graphql/utils/graphql-test-assertions.util';
import { findManyOperationFactory } from 'test/integration/graphql/utils/find-many-operation-factory.util';
import { makeGraphqlApiRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { type AgentChatThreadService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-thread.service';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { WORKSPACE_MEMBER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/workspace-member-data-seeds.constant';
import {
  SNOOZE_IN_CHANNEL,
  buildFutureSnoozedUntil,
  findChannelThreadIds,
  runInboxAction,
  runThreadMutation,
  setUpChatChannelTests,
} from 'test/integration/graphql/suites/chat-channel/utils/chat-channel-test.util';
import { addParticipants } from 'test/integration/graphql/suites/chat-thread-participant/utils/chat-thread-participant-test.util';

const { JANE, JONY } = WORKSPACE_MEMBER_DATA_SEED_IDS;

type ThreadStateStep = (threadId: string) => Promise<unknown>;

const runMemberAction =
  (action: AgentChatInboxAction): ThreadStateStep =>
  async (threadId) =>
    assertGraphQLSuccessfulResponse(
      await runInboxAction(
        action,
        threadId,
        APPLE_JANE_ADMIN_ACCESS_TOKEN,
        action === 'SNOOZE' ? buildFutureSnoozedUntil() : null,
      ),
    );

const markAsDoneInChannel: ThreadStateStep = async (threadId) =>
  assertGraphQLSuccessfulResponse(
    await runThreadMutation('markAgentChatThreadAsDoneInChannel', threadId),
  );

const snoozeInChannel: ThreadStateStep = async (threadId) =>
  assertGraphQLSuccessfulResponse(
    await makeMetadataApiRequest({
      query: SNOOZE_IN_CHANNEL,
      variables: { threadId, snoozedUntil: buildFutureSnoozedUntil() },
    }),
  );

const mentionJane: ThreadStateStep = (threadId) =>
  addParticipants({
    threadId,
    workspaceMemberIds: [JANE],
    workspaceMemberId: JONY,
  });

const addNewActivity: ThreadStateStep = (threadId) =>
  getAppProviderByClassName<AgentChatThreadService>(
    'AgentChatThreadService',
  ).recordThreadActivity({
    workspaceId: SEED_APPLE_WORKSPACE_ID,
    threadId,
    text: 'New activity',
  });

const MEMBER_THREAD_STATES: ThreadStateStep[][] = [
  [],
  [runMemberAction('ARCHIVE')],
  [runMemberAction('ARCHIVE'), addNewActivity],
  [runMemberAction('SNOOZE')],
  [runMemberAction('SNOOZE'), addNewActivity],
  [runMemberAction('UNSUBSCRIBE')],
  [mentionJane],
  [mentionJane, runMemberAction('READ')],
];

const CHANNEL_THREAD_STATES: ThreadStateStep[][] = [
  [],
  [markAsDoneInChannel],
  [markAsDoneInChannel, addNewActivity],
  [snoozeInChannel],
  [snoozeInChannel, addNewActivity],
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

  const createThreadsInStates = async (threadStates: ThreadStateStep[][]) => {
    const channelId = await createChannel();
    const threadIds: string[] = [];

    for (const threadStateSteps of threadStates) {
      const threadId = await createThreadInChannel(channelId);

      for (const threadStateStep of threadStateSteps) {
        await threadStateStep(threadId);
      }

      threadIds.push(threadId);
    }

    return { channelId, threadIds };
  };

  it('lists the same chats as the inbox tabs for each personal preset', async () => {
    const { threadIds } = await createThreadsInStates(MEMBER_THREAD_STATES);
    const threads = await findThreads({ id: { in: threadIds } });

    expect(threads).toHaveLength(MEMBER_THREAD_STATES.length);

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
    const { channelId } = await createThreadsInStates(CHANNEL_THREAD_STATES);

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
