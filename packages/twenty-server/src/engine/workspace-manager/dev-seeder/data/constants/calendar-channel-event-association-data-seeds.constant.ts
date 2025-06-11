import { CALENDAR_CHANNEL_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/calendar-channel-data-seeds.constant';
import { CALENDAR_EVENT_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/calendar-event-data-seeds.constant';

type CalendarChannelEventAssociationDataSeed = {
  id: string;
  calendarChannelId: string;
  calendarEventId: string;
  eventExternalId: string;
  recurringEventExternalId: string;
};

export const CALENDAR_CHANNEL_EVENT_ASSOCIATION_DATA_SEED_COLUMNS: (keyof CalendarChannelEventAssociationDataSeed)[] =
  [
    'id',
    'calendarChannelId',
    'calendarEventId',
    'eventExternalId',
    'recurringEventExternalId',
  ];

export const CALENDAR_CHANNEL_EVENT_ASSOCIATION_DATA_SEED_IDS = {
  ID_1: '20202020-0687-4c41-b707-ed1bfca972a2',
};

export const CALENDAR_CHANNEL_EVENT_ASSOCIATION_DATA_SEEDS: CalendarChannelEventAssociationDataSeed[] =
  [
    {
      id: CALENDAR_CHANNEL_EVENT_ASSOCIATION_DATA_SEED_IDS.ID_1,
      calendarChannelId: CALENDAR_CHANNEL_DATA_SEED_IDS.TIM,
      calendarEventId: CALENDAR_EVENT_DATA_SEED_IDS.ID_1,
      eventExternalId: 'exampleExternalId',
      recurringEventExternalId: 'exampleRecurringExternalId',
    },
  ];
