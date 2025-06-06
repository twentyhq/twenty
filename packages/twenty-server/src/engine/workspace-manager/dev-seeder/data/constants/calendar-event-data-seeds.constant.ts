type CalendarEventDataSeed = {
  id: string;
  title: string;
  isCanceled: boolean;
  isFullDay: boolean;
  startsAt: string;
  endsAt: string;
  externalCreatedAt: string;
  externalUpdatedAt: string;
  description: string;
  location: string;
  iCalUID: string;
  conferenceSolution: string;
  conferenceLinkPrimaryLinkLabel: string;
  conferenceLinkPrimaryLinkUrl: string;
};

export const CALENDAR_EVENT_DATA_SEED_COLUMNS: (keyof CalendarEventDataSeed)[] =
  [
    'id',
    'title',
    'isCanceled',
    'isFullDay',
    'startsAt',
    'endsAt',
    'externalCreatedAt',
    'externalUpdatedAt',
    'description',
    'location',
    'conferenceSolution',
    'conferenceLinkPrimaryLinkLabel',
    'conferenceLinkPrimaryLinkUrl',
  ];

export const CALENDAR_EVENT_DATA_SEED_IDS = {
  ID_1: '20202020-1c0e-494c-a1b6-85b1c6fefaa5',
};

export const CALENDAR_EVENT_DATA_SEEDS: CalendarEventDataSeed[] = [
  {
    id: CALENDAR_EVENT_DATA_SEED_IDS.ID_1,
    title: 'Meeting with Christoph',
    isCanceled: false,
    isFullDay: false,
    startsAt: new Date(new Date().setHours(10, 0)).toISOString(),
    endsAt: new Date(new Date().setHours(11, 0)).toISOString(),
    externalCreatedAt: new Date().toISOString(),
    externalUpdatedAt: new Date().toISOString(),
    description: 'Discuss project progress',
    location: 'Seattle',
    iCalUID: 'event1@calendar.com',
    conferenceSolution: 'Zoom',
    conferenceLinkPrimaryLinkLabel: 'https://zoom.us/j/1234567890',
    conferenceLinkPrimaryLinkUrl: 'https://zoom.us/j/1234567890',
  },
];
