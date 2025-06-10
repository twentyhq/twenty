import { CONNECTED_ACCOUNT_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/connected-account-data-seeds.constant';
import { CalendarChannelVisibility } from 'src/modules/calendar/common/standard-objects/calendar-channel.workspace-entity';

type CalendarChannelDataSeed = {
  id: string;
  connectedAccountId: string;
  handle: string;
  visibility: CalendarChannelVisibility;
  isContactAutoCreationEnabled: boolean;
  isSyncEnabled: boolean;
};

export const CALENDAR_CHANNEL_DATA_SEED_COLUMNS: (keyof CalendarChannelDataSeed)[] =
  [
    'id',
    'connectedAccountId',
    'handle',
    'visibility',
    'isContactAutoCreationEnabled',
    'isSyncEnabled',
  ];

export const CALENDAR_CHANNEL_DATA_SEED_IDS = {
  TIM: '20202020-a40f-4faf-bb9f-c6f9945b8203',
};

export const CALENDAR_CHANNEL_DATA_SEEDS: CalendarChannelDataSeed[] = [
  {
    id: CALENDAR_CHANNEL_DATA_SEED_IDS.TIM,
    connectedAccountId: CONNECTED_ACCOUNT_DATA_SEED_IDS.TIM,
    handle: 'tim@apple.dev',
    visibility: CalendarChannelVisibility.SHARE_EVERYTHING,
    isContactAutoCreationEnabled: true,
    isSyncEnabled: true,
  },
];
