import { findRecordNodesByFilter } from 'test/integration/utils/find-records-by-filter.util';

export const findCalendarEventAssociationChannelIds = async (
  eventExternalId: string,
): Promise<string[]> => {
  const associations = await findRecordNodesByFilter<{
    calendarChannelId: string;
  }>(
    'calendarChannelEventAssociation',
    'calendarChannelEventAssociations',
    'calendarChannelId',
    { eventExternalId: { eq: eventExternalId } },
  );

  return associations.map(({ calendarChannelId }) => calendarChannelId).sort();
};
