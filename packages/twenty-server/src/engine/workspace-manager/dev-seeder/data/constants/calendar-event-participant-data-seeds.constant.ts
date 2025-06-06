import { PERSON_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/person-data-seeds.constant';
import { WORKSPACE_MEMBER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/workspace-member-data-seeds.constant';
import { CalendarEventParticipantResponseStatus } from 'src/modules/calendar/common/standard-objects/calendar-event-participant.workspace-entity';

type CalendarEventParticipantDataSeed = {
  id: string;
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
  'calendarEventId',
  'handle',
  'displayName',
  'isOrganizer',
  'responseStatus',
  'personId',
  'workspaceMemberId',
];

export const CALENDAR_EVENT_PARTICIPANT_DATA_SEED_IDS = {
  ONE: '20202020-8055-49ad-b7e4-9c9d5bbc1ecc',
  TWO: '20202020-e1ab9e1b-df6e-438e-a788-11c96dcecdd3',
};

export const CALENDAR_EVENT_PARTICIPANT_DATA_SEEDS: CalendarEventParticipantDataSeed[] =
  [
    {
      id: CALENDAR_EVENT_PARTICIPANT_DATA_SEED_IDS.ONE,
      calendarEventId: '86083141-1c0e-494c-a1b6-85b1c6fefaa5',
      handle: 'christoph.calisto@linkedin.com',
      displayName: 'Christoph Calisto',
      isOrganizer: true,
      responseStatus: CalendarEventParticipantResponseStatus.ACCEPTED,
      personId: PERSON_DATA_SEED_IDS.ID_1,
      workspaceMemberId: null,
    },
    {
      id: CALENDAR_EVENT_PARTICIPANT_DATA_SEED_IDS.TWO,
      calendarEventId: '86083141-1c0e-494c-a1b6-85b1c6fefaa5',
      handle: 'tim@apple.com',
      displayName: 'Tim Apple',
      isOrganizer: false,
      responseStatus: CalendarEventParticipantResponseStatus.ACCEPTED,
      personId: null,
      workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.TIM,
    },
  ];
