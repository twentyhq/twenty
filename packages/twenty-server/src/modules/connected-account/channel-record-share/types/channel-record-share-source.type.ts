import {
  type CalendarChannelVisibility,
  type MessageChannelVisibility,
} from 'twenty-shared/types';

export type ChannelRecordShareSource = {
  channelTableName: 'messageChannel' | 'calendarChannel';
  shareEverythingVisibility:
    | MessageChannelVisibility.SHARE_EVERYTHING
    | CalendarChannelVisibility.SHARE_EVERYTHING;
  recordObjectUniversalIdentifier: string;
  // Selects "recordId" for every record the channel $2 of workspace $1 synced.
  buildChannelRecordIdsQuery: (schemaName: string) => string;
};
