import { USER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-users.util';

type WorkspaceMemberDataSeed = {
  id: string;
  nameFirstName: string;
  nameLastName: string;
  locale: string;
  colorScheme: string;
  userEmail: string;
  userId: string;
};

export const WORKSPACE_MEMBER_DATA_SEED_COLUMNS: (keyof WorkspaceMemberDataSeed)[] =
  [
    'id',
    'nameFirstName',
    'nameLastName',
    'locale',
    'colorScheme',
    'userEmail',
    'userId',
  ];

export const WORKSPACE_MEMBER_DATA_SEED_IDS = {
  TIM: '20202020-0687-4c41-b707-ed1bfca972a7',
  JONY: '20202020-77d5-4cb6-b60a-f4a835a85d61',
  PHIL: '20202020-1553-45c6-a028-5a9064cce07f',
  JANE: '20202020-463f-435b-828c-107e007a2711',
};

export const WORKSPACE_MEMBER_DATA_SEEDS: WorkspaceMemberDataSeed[] = [
  {
    id: WORKSPACE_MEMBER_DATA_SEED_IDS.TIM,
    nameFirstName: 'Tim',
    nameLastName: 'Apple',
    locale: 'en',
    colorScheme: 'Light',
    userEmail: 'tim@apple.dev',
    userId: USER_DATA_SEED_IDS.TIM,
  },
  {
    id: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
    nameFirstName: 'Jony',
    nameLastName: 'Ive',
    locale: 'en',
    colorScheme: 'Light',
    userEmail: 'jony.ive@apple.dev',
    userId: USER_DATA_SEED_IDS.JONY,
  },
  {
    id: WORKSPACE_MEMBER_DATA_SEED_IDS.PHIL,
    nameFirstName: 'Phil',
    nameLastName: 'Schiler',
    locale: 'en',
    colorScheme: 'Light',
    userEmail: 'phil.schiler@apple.dev',
    userId: USER_DATA_SEED_IDS.PHIL,
  },
  {
    id: WORKSPACE_MEMBER_DATA_SEED_IDS.JANE,
    nameFirstName: 'Jane',
    nameLastName: 'Austen',
    locale: 'en',
    colorScheme: 'Light',
    userEmail: 'jane.austen@apple.dev',
    userId: USER_DATA_SEED_IDS.JANE,
  },
];
