import { CONNECTED_ACCOUNT_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/connected-account-data-seeds.constant';
import {
  MessageChannelSyncStage,
  MessageChannelVisibility,
} from 'src/modules/messaging/common/standard-objects/message-channel.workspace-entity';

type MessageChannelDataSeed = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  isContactAutoCreationEnabled: boolean;
  type: string;
  connectedAccountId: string;
  handle: string;
  isSyncEnabled: boolean;
  visibility: MessageChannelVisibility;
  syncStage: MessageChannelSyncStage;
};

export const MESSAGE_CHANNEL_DATA_SEED_COLUMNS: (keyof MessageChannelDataSeed)[] =
  [
    'id',
    'createdAt',
    'updatedAt',
    'deletedAt',
    'isContactAutoCreationEnabled',
    'type',
    'connectedAccountId',
    'handle',
    'isSyncEnabled',
    'visibility',
    'syncStage',
  ];

export const MESSAGE_CHANNEL_DATA_SEED_IDS = {
  TIM: '20202020-9b80-4c2c-a597-383db48de1d6',
  JONY: '20202020-5ffe-4b32-814a-983d5e4911cd',
  PHIL: '20202020-e2f1-49b5-85d2-5d3a3386990c',
};

export const MESSAGE_CHANNEL_DATA_SEEDS: MessageChannelDataSeed[] = [
  {
    id: MESSAGE_CHANNEL_DATA_SEED_IDS.TIM,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    isContactAutoCreationEnabled: true,
    type: 'email',
    connectedAccountId: CONNECTED_ACCOUNT_DATA_SEED_IDS.TIM,
    handle: 'tim@apple.dev',
    isSyncEnabled: false,
    visibility: MessageChannelVisibility.SHARE_EVERYTHING,
    syncStage: MessageChannelSyncStage.FULL_MESSAGE_LIST_FETCH_PENDING,
  },
  {
    id: MESSAGE_CHANNEL_DATA_SEED_IDS.JONY,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    isContactAutoCreationEnabled: true,
    type: 'email',
    connectedAccountId: CONNECTED_ACCOUNT_DATA_SEED_IDS.JONY,
    handle: 'jony.ive@apple.dev',
    isSyncEnabled: false,
    visibility: MessageChannelVisibility.SHARE_EVERYTHING,
    syncStage: MessageChannelSyncStage.FULL_MESSAGE_LIST_FETCH_PENDING,
  },
  {
    id: MESSAGE_CHANNEL_DATA_SEED_IDS.PHIL,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    isContactAutoCreationEnabled: true,
    type: 'email',
    connectedAccountId: CONNECTED_ACCOUNT_DATA_SEED_IDS.PHIL,
    handle: 'phil.schiler@apple.dev',
    isSyncEnabled: false,
    visibility: MessageChannelVisibility.SHARE_EVERYTHING,
    syncStage: MessageChannelSyncStage.FULL_MESSAGE_LIST_FETCH_PENDING,
  },
];
