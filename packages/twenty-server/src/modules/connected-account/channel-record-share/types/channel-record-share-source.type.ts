export type ChannelRecordShareSource = {
  channelTableName: 'messageChannel' | 'calendarChannel';
  shareEverythingVisibility: string;
  recordObjectUniversalIdentifier: string;
  // Selects "recordId" for every record the channel $2 of workspace $1 synced.
  buildChannelRecordIdsQuery: (schemaName: string) => string;
};
