import { CALENDAR_EVENT_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/calendar-event-data-seeds.constant';
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

const GENERATE_CALENDAR_EVENT_PARTICIPANT_IDS = (): Record<string, string> => {
  const PARTICIPANT_IDS: Record<string, string> = {};

  for (let INDEX = 1; INDEX <= 2000; INDEX++) {
    const HEX_INDEX = INDEX.toString(16).padStart(4, '0');

    PARTICIPANT_IDS[`ID_${INDEX}`] =
      `20202020-${HEX_INDEX}-4e7c-8001-123456789def`;
  }

  return PARTICIPANT_IDS;
};

export const CALENDAR_EVENT_PARTICIPANT_DATA_SEED_IDS =
  GENERATE_CALENDAR_EVENT_PARTICIPANT_IDS();

const FAKE_PARTICIPANTS = [
  { name: 'Alex Johnson', email: 'alex.johnson@company.com' },
  { name: 'Sarah Williams', email: 'sarah.williams@company.com' },
  { name: 'Michael Chen', email: 'michael.chen@company.com' },
  { name: 'Emily Davis', email: 'emily.davis@company.com' },
  { name: 'David Rodriguez', email: 'david.rodriguez@company.com' },
  { name: 'Lisa Anderson', email: 'lisa.anderson@company.com' },
  { name: 'James Wilson', email: 'james.wilson@company.com' },
  { name: 'Jennifer Martinez', email: 'jennifer.martinez@company.com' },
  { name: 'Robert Taylor', email: 'robert.taylor@company.com' },
  { name: 'Maria Garcia', email: 'maria.garcia@company.com' },
];

const GENERATE_CALENDAR_EVENT_PARTICIPANT_SEEDS =
  (): CalendarEventParticipantDataSeed[] => {
    const PARTICIPANT_SEEDS: CalendarEventParticipantDataSeed[] = [];
    let PARTICIPANT_INDEX = 1;

    // Get all event IDs
    const EVENT_IDS = Object.keys(CALENDAR_EVENT_DATA_SEED_IDS).map(
      (key) =>
        CALENDAR_EVENT_DATA_SEED_IDS[
          key as keyof typeof CALENDAR_EVENT_DATA_SEED_IDS
        ],
    );

    // Get person and workspace member IDs
    const PERSON_IDS = Object.keys(PERSON_DATA_SEED_IDS).map(
      (key) => PERSON_DATA_SEED_IDS[key as keyof typeof PERSON_DATA_SEED_IDS],
    );
    const WORKSPACE_MEMBER_IDS = Object.values(WORKSPACE_MEMBER_DATA_SEED_IDS);

    // For each event, create 1-4 participants with weighted distribution
    EVENT_IDS.forEach((eventId) => {
      // Determine number of participants for this event
      const RAND = Math.random();
      let PARTICIPANT_COUNT: number;

      if (RAND < 0.2)
        PARTICIPANT_COUNT = 1; // 20% - single participant
      else if (RAND < 0.5)
        PARTICIPANT_COUNT = 2; // 30% - two participants
      else if (RAND < 0.8)
        PARTICIPANT_COUNT = 3; // 30% - three participants
      else PARTICIPANT_COUNT = 4; // 20% - four participants

      const USED_PERSON_IDS = new Set<string>();
      const USED_WORKSPACE_MEMBER_IDS = new Set<string>();

      for (let I = 0; I < PARTICIPANT_COUNT; I++) {
        const IS_ORGANIZER = I === 0;
        let PARTICIPANT_DATA: {
          handle: string;
          displayName: string;
          personId: string | null;
          workspaceMemberId: string | null;
        };

        // 40% person, 20% workspace member, 40% fake participant
        const PARTICIPANT_TYPE = Math.random();

        if (PARTICIPANT_TYPE < 0.4 && PERSON_IDS.length > 0) {
          // Use a person from database
          let PERSON_ID: string;
          let ATTEMPTS = 0;

          do {
            PERSON_ID =
              PERSON_IDS[Math.floor(Math.random() * PERSON_IDS.length)];
            ATTEMPTS++;
          } while (USED_PERSON_IDS.has(PERSON_ID) && ATTEMPTS < 10);

          if (!USED_PERSON_IDS.has(PERSON_ID)) {
            USED_PERSON_IDS.add(PERSON_ID);
            const PERSON_INDEX = PERSON_IDS.indexOf(PERSON_ID) + 1;

            PARTICIPANT_DATA = {
              handle: `person${PERSON_INDEX}@company.com`,
              displayName: `Person ${PERSON_INDEX}`,
              personId: PERSON_ID,
              workspaceMemberId: null,
            };
          } else {
            // Fallback to fake participant
            const FAKE =
              FAKE_PARTICIPANTS[
                Math.floor(Math.random() * FAKE_PARTICIPANTS.length)
              ];

            PARTICIPANT_DATA = {
              handle: FAKE.email,
              displayName: FAKE.name,
              personId: null,
              workspaceMemberId: null,
            };
          }
        } else if (PARTICIPANT_TYPE < 0.6 && WORKSPACE_MEMBER_IDS.length > 0) {
          // Use a workspace member
          let WORKSPACE_MEMBER_ID: string;
          let ATTEMPTS = 0;

          do {
            WORKSPACE_MEMBER_ID =
              WORKSPACE_MEMBER_IDS[
                Math.floor(Math.random() * WORKSPACE_MEMBER_IDS.length)
              ];
            ATTEMPTS++;
          } while (
            USED_WORKSPACE_MEMBER_IDS.has(WORKSPACE_MEMBER_ID) &&
            ATTEMPTS < 10
          );

          if (!USED_WORKSPACE_MEMBER_IDS.has(WORKSPACE_MEMBER_ID)) {
            USED_WORKSPACE_MEMBER_IDS.add(WORKSPACE_MEMBER_ID);

            // Map workspace member IDs to names
            if (WORKSPACE_MEMBER_ID === WORKSPACE_MEMBER_DATA_SEED_IDS.TIM) {
              PARTICIPANT_DATA = {
                handle: 'tim@apple.com',
                displayName: 'Tim Apple',
                personId: null,
                workspaceMemberId: WORKSPACE_MEMBER_ID,
              };
            } else if (
              WORKSPACE_MEMBER_ID === WORKSPACE_MEMBER_DATA_SEED_IDS.JONY
            ) {
              PARTICIPANT_DATA = {
                handle: 'jony.ive@apple.com',
                displayName: 'Jony Ive',
                personId: null,
                workspaceMemberId: WORKSPACE_MEMBER_ID,
              };
            } else if (
              WORKSPACE_MEMBER_ID === WORKSPACE_MEMBER_DATA_SEED_IDS.PHIL
            ) {
              PARTICIPANT_DATA = {
                handle: 'phil.schiller@apple.com',
                displayName: 'Phil Schiller',
                personId: null,
                workspaceMemberId: WORKSPACE_MEMBER_ID,
              };
            } else {
              PARTICIPANT_DATA = {
                handle: 'member@company.com',
                displayName: 'Workspace Member',
                personId: null,
                workspaceMemberId: WORKSPACE_MEMBER_ID,
              };
            }
          } else {
            // Fallback to fake participant
            const FAKE =
              FAKE_PARTICIPANTS[
                Math.floor(Math.random() * FAKE_PARTICIPANTS.length)
              ];

            PARTICIPANT_DATA = {
              handle: FAKE.email,
              displayName: FAKE.name,
              personId: null,
              workspaceMemberId: null,
            };
          }
        } else {
          // Use fake participant
          const FAKE =
            FAKE_PARTICIPANTS[
              Math.floor(Math.random() * FAKE_PARTICIPANTS.length)
            ];

          PARTICIPANT_DATA = {
            handle: FAKE.email,
            displayName: FAKE.name,
            personId: null,
            workspaceMemberId: null,
          };
        }

        // Determine response status
        let RESPONSE_STATUS: CalendarEventParticipantResponseStatus;

        if (IS_ORGANIZER) {
          RESPONSE_STATUS = CalendarEventParticipantResponseStatus.ACCEPTED;
        } else {
          const RESPONSE_RAND = Math.random();

          if (RESPONSE_RAND < 0.7) {
            RESPONSE_STATUS = CalendarEventParticipantResponseStatus.ACCEPTED;
          } else if (RESPONSE_RAND < 0.85) {
            RESPONSE_STATUS = CalendarEventParticipantResponseStatus.TENTATIVE;
          } else if (RESPONSE_RAND < 0.95) {
            RESPONSE_STATUS =
              CalendarEventParticipantResponseStatus.NEEDS_ACTION;
          } else {
            RESPONSE_STATUS = CalendarEventParticipantResponseStatus.DECLINED;
          }
        }

        PARTICIPANT_SEEDS.push({
          id: CALENDAR_EVENT_PARTICIPANT_DATA_SEED_IDS[
            `ID_${PARTICIPANT_INDEX}`
          ],
          calendarEventId: eventId,
          handle: PARTICIPANT_DATA.handle,
          displayName: PARTICIPANT_DATA.displayName,
          isOrganizer: IS_ORGANIZER,
          responseStatus: RESPONSE_STATUS,
          personId: PARTICIPANT_DATA.personId,
          workspaceMemberId: PARTICIPANT_DATA.workspaceMemberId,
        });

        PARTICIPANT_INDEX++;
      }
    });

    return PARTICIPANT_SEEDS;
  };

export const CALENDAR_EVENT_PARTICIPANT_DATA_SEEDS =
  GENERATE_CALENDAR_EVENT_PARTICIPANT_SEEDS();
