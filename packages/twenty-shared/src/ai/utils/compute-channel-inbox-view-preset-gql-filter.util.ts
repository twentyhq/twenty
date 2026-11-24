import { type ChannelInboxViewPresetFilter } from '@/ai/types/ChannelInboxViewPresetFilter';
import { type RecordGqlOperationFilter } from '@/types/RecordGqlOperationFilter';

export const computeChannelInboxViewPresetGqlFilter = (
  presetFilter: ChannelInboxViewPresetFilter,
): RecordGqlOperationFilter => {
  if (presetFilter === 'INBOX_CHANNEL_OPEN') {
    return {
      or: [
        { channelArchivedAt: { is: 'NULL' } },
        { channelArchivedAt: { ltField: 'lastActivityAt' } },
      ],
    };
  }

  return {
    channelSnoozedUntil: {
      is: presetFilter === 'INBOX_CHANNEL_SNOOZED' ? 'NOT_NULL' : 'NULL',
    },
    or: [
      {
        channelArchivedAt: { is: 'NOT_NULL' },
        lastActivityAt: { is: 'NULL' },
      },
      { channelArchivedAt: { gteField: 'lastActivityAt' } },
    ],
  };
};
