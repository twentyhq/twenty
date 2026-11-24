import { AgentChatThreadConversationType } from '@/ai/types/AgentChatThreadConversationType';
import { computeViewPresetFilterGqlFilter } from '@/ai/utils/compute-view-preset-filter-gql-filter.util';
import { ViewPresetFilter } from '@/types/ViewPresetFilter';

const WORKSPACE_MEMBER_ID = '20202020-463f-435b-828c-107e007a2711';

const PERSONAL_PRESET_FILTERS = [
  ViewPresetFilter.INBOX_OPEN,
  ViewPresetFilter.INBOX_SNOOZED,
  ViewPresetFilter.INBOX_DONE,
  ViewPresetFilter.INBOX_MENTIONS,
];

const CHANNEL_PRESET_FILTERS = [
  ViewPresetFilter.INBOX_CHANNEL_OPEN,
  ViewPresetFilter.INBOX_CHANNEL_SNOOZED,
  ViewPresetFilter.INBOX_CHANNEL_DONE,
];

const FILED_WITHOUT_ACTIVITY_SINCE = [
  { channelArchivedAt: { is: 'NOT_NULL' }, lastActivityAt: { is: 'NULL' } },
  { channelArchivedAt: { gteField: 'lastActivityAt' } },
];

describe('computeViewPresetFilterGqlFilter', () => {
  it.each([null, undefined])(
    'adds no condition for a view whose preset is %s',
    (presetFilter) => {
      expect(
        computeViewPresetFilterGqlFilter({
          presetFilter,
          currentWorkspaceMemberId: WORKSPACE_MEMBER_ID,
        }),
      ).toEqual({});
    },
  );

  it.each(PERSONAL_PRESET_FILTERS)(
    'leaves direct messages out of %s',
    (presetFilter) => {
      expect(
        computeViewPresetFilterGqlFilter({
          presetFilter,
          currentWorkspaceMemberId: WORKSPACE_MEMBER_ID,
        }),
      ).toMatchObject({
        conversationType: {
          neq: AgentChatThreadConversationType.DIRECT_MESSAGE,
        },
      });
    },
  );

  it.each(PERSONAL_PRESET_FILTERS)(
    'matches no record for %s without a workspace member',
    (presetFilter) => {
      expect(
        computeViewPresetFilterGqlFilter({
          presetFilter,
          currentWorkspaceMemberId: undefined,
        }),
      ).toEqual({ id: { is: 'NULL' } });
    },
  );

  it.each(CHANNEL_PRESET_FILTERS)(
    'reads %s from the thread alone',
    (presetFilter) => {
      const filter = computeViewPresetFilterGqlFilter({
        presetFilter,
        currentWorkspaceMemberId: undefined,
      });

      expect(JSON.stringify(filter)).not.toContain('participants');
      expect(filter).not.toHaveProperty('conversationType');
    },
  );

  it('keeps a channel chat open until it is filed, and again once it has newer activity', () => {
    expect(
      computeViewPresetFilterGqlFilter({
        presetFilter: ViewPresetFilter.INBOX_CHANNEL_OPEN,
        currentWorkspaceMemberId: WORKSPACE_MEMBER_ID,
      }),
    ).toEqual({
      or: [
        { channelArchivedAt: { is: 'NULL' } },
        { channelArchivedAt: { ltField: 'lastActivityAt' } },
      ],
    });
  });

  it.each([
    [ViewPresetFilter.INBOX_CHANNEL_SNOOZED, 'NOT_NULL'],
    [ViewPresetFilter.INBOX_CHANNEL_DONE, 'NULL'],
  ] as const)(
    'lists %s chats filed without activity since, including chats with no activity',
    (presetFilter, channelSnoozedUntil) => {
      expect(
        computeViewPresetFilterGqlFilter({
          presetFilter,
          currentWorkspaceMemberId: WORKSPACE_MEMBER_ID,
        }),
      ).toEqual({
        channelSnoozedUntil: { is: channelSnoozedUntil },
        or: FILED_WITHOUT_ACTIVITY_SINCE,
      });
    },
  );
});
