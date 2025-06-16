import { CALENDAR_EVENT_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/calendar-event-data-seeds.constant';
import { PERSON_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/person-data-seeds.constant';
import { WORKSPACE_MEMBER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/workspace-member-data-seeds.constant';
import { CalendarEventParticipantResponseStatus } from 'src/modules/calendar/common/standard-objects/calendar-event-participant.workspace-entity';

type CalendarEventParticipantDataSeed = {
  id: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  calendarEventId: string;
  handle: string;
  displayName: string;
  isOrganizer: boolean;
  responseStatus: CalendarEventParticipantResponseStatus;
  personId: string | null;
  workspaceMemberId: string | null;
};

export const CALENDAR_EVENT_PARTICIPANT_DATA_SEED_COLUMNS = [
  'id',
  'createdAt',
  'updatedAt',
  'deletedAt',
  'calendarEventId',
  'handle',
  'displayName',
  'isOrganizer',
  'responseStatus',
  'personId',
  'workspaceMemberId',
];

export const CALENDAR_EVENT_PARTICIPANT_DATA_SEED_IDS = {
  ONE: '20202020-fb8f-4f0d-a36e-950e185401d4',
  TWO: '20202020-0722-40d7-9e55-cb5d00cfb654',
};

export const CALENDAR_EVENT_PARTICIPANT_DATA_SEEDS: CalendarEventParticipantDataSeed[] =
  [
    {
      id: CALENDAR_EVENT_PARTICIPANT_DATA_SEED_IDS.ONE,
      createdAt: '2025-06-16T20:15:47.451Z',
      updatedAt: '2025-06-16T20:15:47.451Z',
      deletedAt: null,
      calendarEventId: CALENDAR_EVENT_DATA_SEED_IDS.ID_1,
      handle: 'christoph.calisto@linkedin.com',
      displayName: 'Christoph Calisto',
      isOrganizer: true,
      responseStatus: CalendarEventParticipantResponseStatus.ACCEPTED,
      personId: PERSON_DATA_SEED_IDS.ID_1,
      workspaceMemberId: null,
    },
    {
      id: CALENDAR_EVENT_PARTICIPANT_DATA_SEED_IDS.TWO,
      createdAt: '2025-06-16T20:15:47.451Z',
      updatedAt: '2025-06-16T20:15:47.451Z',
      deletedAt: null,
      calendarEventId: CALENDAR_EVENT_DATA_SEED_IDS.ID_1,
      handle: 'tim@apple.com',
      displayName: 'Tim Apple',
      isOrganizer: false,
      responseStatus: CalendarEventParticipantResponseStatus.ACCEPTED,
      personId: null,
      workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.TIM,
    },
  ];
