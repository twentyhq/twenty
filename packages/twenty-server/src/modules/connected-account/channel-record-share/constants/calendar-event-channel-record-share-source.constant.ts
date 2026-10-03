import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { CalendarChannelVisibility } from 'twenty-shared/types';

import { type ChannelRecordShareSource } from 'src/modules/connected-account/channel-record-share/types/channel-record-share-source.type';

export const CALENDAR_EVENT_CHANNEL_RECORD_SHARE_SOURCE: ChannelRecordShareSource =
  {
    channelTableName: 'calendarChannel',
    shareEverythingVisibility: CalendarChannelVisibility.SHARE_EVERYTHING,
    recordObjectUniversalIdentifier:
      STANDARD_OBJECTS.calendarEvent.universalIdentifier,
    buildChannelRecordIdsQuery: (schemaName) =>
      `SELECT association."calendarEventId" AS "recordId"
       FROM ${schemaName}."calendarChannelEventAssociation" association
       JOIN core."calendarChannel" channel ON channel.id = association."calendarChannelId"
         AND channel."workspaceId" = $1
       WHERE association."calendarChannelId" = $2
         AND association."deletedAt" IS NULL`,
  };
