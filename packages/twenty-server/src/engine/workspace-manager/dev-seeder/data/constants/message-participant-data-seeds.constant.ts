import { MESSAGE_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/message-data-seeds.constant';
import { PERSON_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/person-data-seeds.constant';
import { WORKSPACE_MEMBER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/workspace-member-data-seeds.constant';

type MessageParticipantDataSeed = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  workspaceMemberId: string;
  personId: string;
  displayName: string;
  handle: string;
  role: string;
  messageId: string;
};

export const MESSAGE_PARTICIPANT_DATA_SEED_COLUMNS: (keyof MessageParticipantDataSeed)[] =
  [
    'id',
    'createdAt',
    'updatedAt',
    'deletedAt',
    'workspaceMemberId',
    'personId',
    'displayName',
    'handle',
    'role',
    'messageId',
  ];

const GENERATE_MESSAGE_PARTICIPANT_IDS = (): Record<string, string> => {
  const PARTICIPANT_IDS: Record<string, string> = {};

  for (let INDEX = 1; INDEX <= 1500; INDEX++) {
    const HEX_INDEX = INDEX.toString(16).padStart(4, '0');

    PARTICIPANT_IDS[`ID_${INDEX}`] =
      `20202020-${HEX_INDEX}-4e7c-8001-123456789cde`;
  }

  return PARTICIPANT_IDS;
};

export const MESSAGE_PARTICIPANT_DATA_SEED_IDS =
  GENERATE_MESSAGE_PARTICIPANT_IDS();

const FAKE_EMAIL_PARTICIPANTS = [
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
  { name: 'John Smith', email: 'john.smith@external.com' },
  { name: 'Emma Johnson', email: 'emma.johnson@external.com' },
  { name: 'Oliver Brown', email: 'oliver.brown@external.com' },
  { name: 'Sophia Davis', email: 'sophia.davis@external.com' },
  { name: 'William Miller', email: 'william.miller@external.com' },
];

const GENERATE_MESSAGE_PARTICIPANT_SEEDS = (): MessageParticipantDataSeed[] => {
  const PARTICIPANT_SEEDS: MessageParticipantDataSeed[] = [];
  let PARTICIPANT_INDEX = 1;

  // Get all message IDs
  const MESSAGE_IDS = Object.keys(MESSAGE_DATA_SEED_IDS).map(
    (key) => MESSAGE_DATA_SEED_IDS[key as keyof typeof MESSAGE_DATA_SEED_IDS],
  );

  // Get person and workspace member IDs
  const PERSON_IDS = Object.keys(PERSON_DATA_SEED_IDS).map(
    (key) => PERSON_DATA_SEED_IDS[key as keyof typeof PERSON_DATA_SEED_IDS],
  );
  const WORKSPACE_MEMBER_IDS = Object.values(WORKSPACE_MEMBER_DATA_SEED_IDS);

  // For each message, create participants (sender + 1-3 recipients)
  MESSAGE_IDS.forEach((messageId) => {
    // Random number of participants per message (2-4 total: 1 sender + 1-3 recipients)
    const RECIPIENT_COUNT = 1 + Math.floor(Math.random() * 3); // 1-3 recipients
    const TOTAL_PARTICIPANTS = 1 + RECIPIENT_COUNT; // sender + recipients

    const USED_PERSON_IDS = new Set<string>();
    const USED_WORKSPACE_MEMBER_IDS = new Set<string>();

    for (let I = 0; I < TOTAL_PARTICIPANTS; I++) {
      const IS_SENDER = I === 0;
      const ROLE = IS_SENDER ? 'from' : 'to';
      const HANDLE = IS_SENDER ? 'outgoing' : 'incoming';

      // Random date within the last 3 months
      const NOW = new Date();
      const RANDOM_DAYS_OFFSET = Math.floor(Math.random() * 90);
      const PARTICIPANT_DATE = new Date(
        NOW.getTime() - RANDOM_DAYS_OFFSET * 24 * 60 * 60 * 1000,
      );

      const PARTICIPANT_TYPE = Math.random();

      let PARTICIPANT_DATA = {
        workspaceMemberId: WORKSPACE_MEMBER_IDS[0], // Default to TIM
        personId: PERSON_IDS[0], // Default person
        displayName: '',
      };

      // Try to use a person from database (40% chance)
      if (PARTICIPANT_TYPE < 0.4 && PERSON_IDS.length > 0) {
        let PERSON_ID: string;
        let ATTEMPTS = 0;

        do {
          PERSON_ID = PERSON_IDS[Math.floor(Math.random() * PERSON_IDS.length)];
          ATTEMPTS++;
        } while (USED_PERSON_IDS.has(PERSON_ID) && ATTEMPTS < 10);

        if (!USED_PERSON_IDS.has(PERSON_ID)) {
          USED_PERSON_IDS.add(PERSON_ID);
          const PERSON_INDEX = PERSON_IDS.indexOf(PERSON_ID) + 1;

          PARTICIPANT_DATA = {
            workspaceMemberId: WORKSPACE_MEMBER_IDS[0], // Default to TIM
            personId: PERSON_ID,
            displayName: `Person ${PERSON_INDEX}`,
          };
        } else {
          // Fallback to fake participant
          const FAKE =
            FAKE_EMAIL_PARTICIPANTS[
              Math.floor(Math.random() * FAKE_EMAIL_PARTICIPANTS.length)
            ];

          PARTICIPANT_DATA.displayName = FAKE.name;
        }
      }

      // Try to use a workspace member (30% chance) if person type doesn't match
      if (
        PARTICIPANT_TYPE >= 0.4 &&
        PARTICIPANT_TYPE < 0.7 &&
        WORKSPACE_MEMBER_IDS.length > 0
      ) {
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

          if (WORKSPACE_MEMBER_ID === WORKSPACE_MEMBER_DATA_SEED_IDS.TIM) {
            PARTICIPANT_DATA = {
              workspaceMemberId: WORKSPACE_MEMBER_ID,
              personId: PERSON_IDS[0], // Default person
              displayName: 'Tim Apple',
            };
          } else if (
            WORKSPACE_MEMBER_ID === WORKSPACE_MEMBER_DATA_SEED_IDS.JONY
          ) {
            PARTICIPANT_DATA = {
              workspaceMemberId: WORKSPACE_MEMBER_ID,
              personId: PERSON_IDS[1], // Second person
              displayName: 'Jony Ive',
            };
          } else if (
            WORKSPACE_MEMBER_ID === WORKSPACE_MEMBER_DATA_SEED_IDS.PHIL
          ) {
            PARTICIPANT_DATA = {
              workspaceMemberId: WORKSPACE_MEMBER_ID,
              personId: PERSON_IDS[2], // Third person
              displayName: 'Phil Schiller',
            };
          } else {
            PARTICIPANT_DATA = {
              workspaceMemberId: WORKSPACE_MEMBER_ID,
              personId: PERSON_IDS[0], // Default person
              displayName: 'Workspace Member',
            };
          }
        } else {
          // Fallback to fake participant
          const FAKE =
            FAKE_EMAIL_PARTICIPANTS[
              Math.floor(Math.random() * FAKE_EMAIL_PARTICIPANTS.length)
            ];

          PARTICIPANT_DATA.displayName = FAKE.name;
        }
      }

      // Use fake participant for remaining cases (30% chance)
      if (PARTICIPANT_TYPE >= 0.7) {
        const FAKE =
          FAKE_EMAIL_PARTICIPANTS[
            Math.floor(Math.random() * FAKE_EMAIL_PARTICIPANTS.length)
          ];

        PARTICIPANT_DATA = {
          workspaceMemberId: WORKSPACE_MEMBER_IDS[0], // Default to TIM
          personId:
            PERSON_IDS[
              Math.floor(Math.random() * Math.min(10, PERSON_IDS.length))
            ], // Random person from first 10
          displayName: FAKE.name,
        };
      }

      // Ensure displayName is set if still empty
      if (!PARTICIPANT_DATA.displayName) {
        const FAKE =
          FAKE_EMAIL_PARTICIPANTS[
            Math.floor(Math.random() * FAKE_EMAIL_PARTICIPANTS.length)
          ];

        PARTICIPANT_DATA.displayName = FAKE.name;
      }

      PARTICIPANT_SEEDS.push({
        id: MESSAGE_PARTICIPANT_DATA_SEED_IDS[`ID_${PARTICIPANT_INDEX}`],
        createdAt: PARTICIPANT_DATE,
        updatedAt: PARTICIPANT_DATE,
        deletedAt: null,
        workspaceMemberId: PARTICIPANT_DATA.workspaceMemberId,
        personId: PARTICIPANT_DATA.personId,
        displayName: PARTICIPANT_DATA.displayName,
        handle: HANDLE,
        role: ROLE,
        messageId: messageId,
      });

      PARTICIPANT_INDEX++;
    }
  });

  return PARTICIPANT_SEEDS;
};

export const MESSAGE_PARTICIPANT_DATA_SEEDS =
  GENERATE_MESSAGE_PARTICIPANT_SEEDS();
