import { AGENT_CHAT_THREAD_FILTER_STATUS } from '@/ai/constants/agent-chat-thread-filter-status.const';
import { computeAgentChatThreadFilterStatusGqlFilter } from '@/ai/utils/compute-agent-chat-thread-filter-status-gql-filter.util';
import { type RecordGqlOperationFilter } from '@/types/RecordGqlOperationFilter';
import { isPlainObject } from '@/utils/typeguard/isPlainObject';

const WORKSPACE_MEMBER_ID = '20202020-463f-435b-828c-107e007a2711';

const OPEN_PARTICIPANT = {
  workspaceMemberId: { eq: WORKSPACE_MEMBER_ID },
  isSubscribed: { eq: true },
  or: [
    { archivedAt: { is: 'NULL' } },
    { archivedAt: { ltField: 'thread.lastActivityAt' } },
  ],
};

const collectParticipantFilters = (filter: unknown): unknown[] => {
  if (Array.isArray(filter)) {
    return filter.flatMap(collectParticipantFilters);
  }

  if (!isPlainObject(filter)) {
    return [];
  }

  return Object.entries(filter).flatMap(([key, value]) =>
    key === 'participants' ? [value] : collectParticipantFilters(value),
  );
};

const computeFilter = (
  filterStatus: Parameters<
    typeof computeAgentChatThreadFilterStatusGqlFilter
  >[0]['filterStatus'],
): RecordGqlOperationFilter =>
  computeAgentChatThreadFilterStatusGqlFilter({
    filterStatus,
    workspaceMemberId: WORKSPACE_MEMBER_ID,
  });

describe('computeAgentChatThreadFilterStatusGqlFilter', () => {
  it.each(Object.values(AGENT_CHAT_THREAD_FILTER_STATUS))(
    'reads only the member own participant row for %s',
    (filterStatus) => {
      const participantFilters = collectParticipantFilters(
        computeFilter(filterStatus),
      );

      expect(participantFilters.length).toBeGreaterThan(0);

      for (const participantFilter of participantFilters) {
        expect(participantFilter).toMatchObject({
          workspaceMemberId: { eq: WORKSPACE_MEMBER_ID },
        });
      }
    },
  );

  it('keeps a filed chat open once it has newer activity', () => {
    expect(computeFilter('active')).toEqual({
      participants: OPEN_PARTICIPANT,
    });
  });

  it('counts a mention until it is resolved', () => {
    expect(computeFilter('mentions')).toEqual({
      participants: {
        ...OPEN_PARTICIPANT,
        lastMentionedAt: { is: 'NOT_NULL' },
        and: [
          {
            or: [
              { mentionsResolvedAt: { is: 'NULL' } },
              { mentionsResolvedAt: { ltField: 'lastMentionedAt' } },
            ],
          },
        ],
      },
    });
  });

  it.each([
    ['assigned', { eq: WORKSPACE_MEMBER_ID }],
    ['assignedToAnyone', { is: 'NOT_NULL' }],
    ['unassigned', { is: 'NULL' }],
  ] as const)(
    'filters open chats on their assignee for %s',
    (filterStatus, assigneeId) => {
      expect(computeFilter(filterStatus)).toEqual({
        assigneeId,
        participants: OPEN_PARTICIPANT,
      });
    },
  );

  it('lists snoozed chats without activity since they were filed', () => {
    expect(computeFilter('snoozed')).toEqual({
      or: [
        {
          lastActivityAt: { is: 'NULL' },
          participants: {
            workspaceMemberId: { eq: WORKSPACE_MEMBER_ID },
            isSubscribed: { eq: true },
            archivedAt: { is: 'NOT_NULL' },
            snoozedUntil: { is: 'NOT_NULL' },
          },
        },
        {
          participants: {
            workspaceMemberId: { eq: WORKSPACE_MEMBER_ID },
            isSubscribed: { eq: true },
            snoozedUntil: { is: 'NOT_NULL' },
            archivedAt: { gteField: 'thread.lastActivityAt' },
          },
        },
      ],
    });
  });

  it('lists unsubscribed chats under done whatever their activity', () => {
    expect(computeFilter('done')).toMatchObject({
      or: expect.arrayContaining([
        {
          participants: {
            workspaceMemberId: { eq: WORKSPACE_MEMBER_ID },
            isSubscribed: { eq: false },
            archivedAt: { is: 'NOT_NULL' },
          },
        },
      ]),
    });
  });
});
