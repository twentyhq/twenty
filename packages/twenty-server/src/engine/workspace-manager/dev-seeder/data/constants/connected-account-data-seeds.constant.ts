import { WORKSPACE_MEMBER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/workspace-member-data-seeds.constant';

type ConnectedAccountDataSeed = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  lastSyncHistoryId: string;
  accountOwnerId: string;
  refreshToken: string;
  accessToken: string;
  provider: string;
  handle: string;
};

export const CONNECTED_ACCOUNT_DATA_SEED_COLUMNS: (keyof ConnectedAccountDataSeed)[] =
  [
    'id',
    'createdAt',
    'updatedAt',
    'deletedAt',
    'lastSyncHistoryId',
    'accountOwnerId',
    'refreshToken',
    'accessToken',
    'provider',
    'handle',
  ];

export const CONNECTED_ACCOUNT_DATA_SEED_IDS = {
  TIM: '20202020-9ac0-4390-9a1a-ab4d2c4e1bb7',
  JONY: '20202020-0cc8-4d60-a3a4-803245698908',
  PHIL: '20202020-cafc-4323-908d-e5b42ad69fdf',
};

export const CONNECTED_ACCOUNT_DATA_SEEDS: ConnectedAccountDataSeed[] = [
  {
    id: CONNECTED_ACCOUNT_DATA_SEED_IDS.TIM,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    lastSyncHistoryId: 'exampleLastSyncHistory',
    accountOwnerId: WORKSPACE_MEMBER_DATA_SEED_IDS.TIM,
    refreshToken: 'exampleRefreshToken',
    accessToken: 'exampleAccessToken',
    provider: 'google',
    handle: 'tim@apple.dev',
  },
  {
    id: CONNECTED_ACCOUNT_DATA_SEED_IDS.JONY,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    lastSyncHistoryId: 'exampleLastSyncHistory',
    accountOwnerId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
    refreshToken: 'exampleRefreshToken',
    accessToken: 'exampleAccessToken',
    provider: 'google',
    handle: 'jony.ive@apple.dev',
  },
  {
    id: CONNECTED_ACCOUNT_DATA_SEED_IDS.PHIL,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    lastSyncHistoryId: 'exampleLastSyncHistory',
    accountOwnerId: WORKSPACE_MEMBER_DATA_SEED_IDS.PHIL,
    refreshToken: 'exampleRefreshToken',
    accessToken: 'exampleAccessToken',
    provider: 'google',
    handle: 'phil.schiler@apple.dev',
  },
];
