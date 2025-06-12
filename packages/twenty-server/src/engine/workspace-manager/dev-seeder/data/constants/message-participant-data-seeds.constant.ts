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

export const MESSAGE_PARTICIPANT_DATA_SEED_IDS = {
  ID_1: '20202020-0f2a-49d8-8aa2-ec8786153a0b',
  ID_2: '20202020-4e83-41ec-93e2-fd70ff09f68c',
  ID_3: '20202020-e716-4dd5-ac61-3315bc559e2d',
  ID_4: '20202020-fc7d-4ad8-9aea-b78bcbf79cdd',
  ID_5: '20202020-564c-4a3c-abbf-e942e8c3f9c9',
  ID_6: '20202020-7e4a-489a-ba6b-1ae6b7d721ac',
};

export const MESSAGE_PARTICIPANT_DATA_SEEDS: MessageParticipantDataSeed[] = [
  {
    id: MESSAGE_PARTICIPANT_DATA_SEED_IDS.ID_1,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.TIM,
    personId: PERSON_DATA_SEED_IDS.ID_1,
    displayName: 'Christoph',
    handle: 'outgoing',
    role: 'from',
    messageId: MESSAGE_DATA_SEED_IDS.ID_1,
  },
  {
    id: MESSAGE_PARTICIPANT_DATA_SEED_IDS.ID_2,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.TIM,
    personId: PERSON_DATA_SEED_IDS.ID_2,
    displayName: 'Sylvie',
    handle: 'incoming',
    role: 'to',
    messageId: MESSAGE_DATA_SEED_IDS.ID_1,
  },
  {
    id: MESSAGE_PARTICIPANT_DATA_SEED_IDS.ID_3,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.TIM,
    personId: PERSON_DATA_SEED_IDS.ID_3,
    displayName: 'Christopher',
    handle: 'incoming',
    role: 'to',
    messageId: MESSAGE_DATA_SEED_IDS.ID_1,
  },
  {
    id: MESSAGE_PARTICIPANT_DATA_SEED_IDS.ID_4,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.TIM,
    personId: PERSON_DATA_SEED_IDS.ID_1,
    displayName: 'Christoph',
    handle: 'outgoing',
    role: 'from',
    messageId: MESSAGE_DATA_SEED_IDS.ID_2,
  },
  {
    id: MESSAGE_PARTICIPANT_DATA_SEED_IDS.ID_5,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.TIM,
    personId: PERSON_DATA_SEED_IDS.ID_2,
    displayName: 'Sylvie',
    handle: 'incoming',
    role: 'to',
    messageId: MESSAGE_DATA_SEED_IDS.ID_2,
  },
  {
    id: MESSAGE_PARTICIPANT_DATA_SEED_IDS.ID_6,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.TIM,
    personId: PERSON_DATA_SEED_IDS.ID_3,
    displayName: 'Christopher',
    handle: 'incoming',
    role: 'to',
    messageId: MESSAGE_DATA_SEED_IDS.ID_2,
  },
];
