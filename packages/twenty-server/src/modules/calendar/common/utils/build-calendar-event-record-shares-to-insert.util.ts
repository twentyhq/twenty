import { CalendarChannelVisibility } from 'twenty-shared/types';

import { type RecordShareInput } from 'src/engine/record-share/types/record-share-input.type';
import { buildChannelRecordShares } from 'src/engine/record-share/utils/build-channel-record-shares.util';
import { type CalendarChannelRecordShareSource } from 'src/modules/calendar/common/types/calendar-channel-record-share-source.type';

const CALENDAR_CHANNEL_VISIBILITIES_SHARED_WITH_EVERYONE: CalendarChannelVisibility[] =
  [
    CalendarChannelVisibility.METADATA,
    CalendarChannelVisibility.SHARE_EVERYTHING,
  ];

export const buildCalendarEventRecordSharesToInsert = ({
  calendarChannel,
  calendarEventIds,
  calendarEventObjectMetadataId,
}: {
  calendarChannel: CalendarChannelRecordShareSource;
  calendarEventIds: string[];
  calendarEventObjectMetadataId: string;
}): RecordShareInput[] =>
  buildChannelRecordShares({
    sourceId: calendarChannel.calendarChannelId,
    ownerWorkspaceMemberId: calendarChannel.ownerWorkspaceMemberId,
    isSharedWithEveryone:
      CALENDAR_CHANNEL_VISIBILITIES_SHARED_WITH_EVERYONE.includes(
        calendarChannel.visibility,
      ),
    records: Array.from(new Set(calendarEventIds), (recordId) => ({
      recordId,
      objectMetadataId: calendarEventObjectMetadataId,
    })),
  });
