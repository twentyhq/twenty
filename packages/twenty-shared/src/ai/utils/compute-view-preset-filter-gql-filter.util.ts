import { AgentChatThreadConversationType } from '@/ai/types/AgentChatThreadConversationType';
import { type RecordGqlOperationFilter } from '@/types/RecordGqlOperationFilter';
import { type ViewPresetFilter } from '@/types/ViewPresetFilter';
import { isDefined } from '@/utils/validation/isDefined';

type NullCheck = 'NULL' | 'NOT_NULL';

type MemberInboxViewPresetFilter = `${
  | ViewPresetFilter.INBOX_OPEN
  | ViewPresetFilter.INBOX_SNOOZED
  | ViewPresetFilter.INBOX_DONE
  | ViewPresetFilter.INBOX_MENTIONS}`;

const MATCHES_NO_RECORD: RecordGqlOperationFilter = { id: { is: 'NULL' } };

const NOT_DIRECT_MESSAGE: RecordGqlOperationFilter = {
  conversationType: { neq: AgentChatThreadConversationType.DIRECT_MESSAGE },
};

const throughParticipants = (
  participantFilter: RecordGqlOperationFilter,
): RecordGqlOperationFilter => ({ participants: participantFilter });

// Keep in sync with getAgentChatThreadInboxStatus, which places loaded chats on the client
const computeMemberInboxStatusFilter = ({
  presetFilter,
  workspaceMemberId,
}: {
  presetFilter: MemberInboxViewPresetFilter;
  workspaceMemberId: string;
}): RecordGqlOperationFilter => {
  const memberParticipant = { workspaceMemberId: { eq: workspaceMemberId } };
  const subscribedParticipant = {
    ...memberParticipant,
    isSubscribed: { eq: true },
  };
  const openParticipant: RecordGqlOperationFilter = {
    ...subscribedParticipant,
    or: [
      { archivedAt: { is: 'NULL' } },
      { archivedAt: { ltField: 'thread.lastActivityAt' } },
    ],
  };
  const filedWithoutActivitySince = (
    snoozedUntil: NullCheck,
  ): RecordGqlOperationFilter[] => [
    {
      lastActivityAt: { is: 'NULL' },
      ...throughParticipants({
        ...subscribedParticipant,
        archivedAt: { is: 'NOT_NULL' },
        snoozedUntil: { is: snoozedUntil },
      }),
    },
    throughParticipants({
      ...subscribedParticipant,
      snoozedUntil: { is: snoozedUntil },
      archivedAt: { gteField: 'thread.lastActivityAt' },
    }),
  ];

  switch (presetFilter) {
    case 'INBOX_OPEN':
      return throughParticipants(openParticipant);
    case 'INBOX_MENTIONS':
      return throughParticipants({
        ...openParticipant,
        lastMentionedAt: { is: 'NOT_NULL' },
        and: [
          {
            or: [
              { mentionsResolvedAt: { is: 'NULL' } },
              { mentionsResolvedAt: { ltField: 'lastMentionedAt' } },
            ],
          },
        ],
      });
    case 'INBOX_SNOOZED':
      return { or: filedWithoutActivitySince('NOT_NULL') };
    case 'INBOX_DONE':
      return {
        or: [
          throughParticipants({
            ...memberParticipant,
            isSubscribed: { eq: false },
            archivedAt: { is: 'NOT_NULL' },
          }),
          ...filedWithoutActivitySince('NULL'),
        ],
      };
  }
};

const computeChannelFiledStatusFilter = (
  channelSnoozedUntil: NullCheck,
): RecordGqlOperationFilter => ({
  channelSnoozedUntil: { is: channelSnoozedUntil },
  or: [
    {
      channelArchivedAt: { is: 'NOT_NULL' },
      lastActivityAt: { is: 'NULL' },
    },
    { channelArchivedAt: { gteField: 'lastActivityAt' } },
  ],
});

export const computeViewPresetFilterGqlFilter = ({
  presetFilter,
  currentWorkspaceMemberId,
}: {
  presetFilter: `${ViewPresetFilter}` | null | undefined;
  currentWorkspaceMemberId: string | undefined;
}): RecordGqlOperationFilter => {
  if (!isDefined(presetFilter)) {
    return {};
  }

  switch (presetFilter) {
    case 'INBOX_OPEN':
    case 'INBOX_SNOOZED':
    case 'INBOX_DONE':
    case 'INBOX_MENTIONS':
      return isDefined(currentWorkspaceMemberId)
        ? {
            ...NOT_DIRECT_MESSAGE,
            ...computeMemberInboxStatusFilter({
              presetFilter,
              workspaceMemberId: currentWorkspaceMemberId,
            }),
          }
        : MATCHES_NO_RECORD;
    case 'INBOX_CHANNEL_OPEN':
      return {
        or: [
          { channelArchivedAt: { is: 'NULL' } },
          { channelArchivedAt: { ltField: 'lastActivityAt' } },
        ],
      };
    case 'INBOX_CHANNEL_SNOOZED':
      return computeChannelFiledStatusFilter('NOT_NULL');
    case 'INBOX_CHANNEL_DONE':
      return computeChannelFiledStatusFilter('NULL');
  }
};
