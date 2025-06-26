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

const GENERATE_CALENDAR_CHANNEL_IDS = (): Record<string, string> => {
  const CHANNEL_IDS: Record<string, string> = {};

  CHANNEL_IDS['TIM'] = '20202020-a40f-4faf-bb9f-c6f9945b8203';
  CHANNEL_IDS['JONY'] = '20202020-a40f-4faf-bb9f-c6f9945b8204';
  CHANNEL_IDS['PHIL'] = '20202020-a40f-4faf-bb9f-c6f9945b8205';
  CHANNEL_IDS['COMPANY_MAIN'] = '20202020-a40f-4faf-bb9f-c6f9945b8206';
  CHANNEL_IDS['TEAM_CALENDAR'] = '20202020-a40f-4faf-bb9f-c6f9945b8207';

  return CHANNEL_IDS;
};

export const CALENDAR_CHANNEL_DATA_SEED_IDS = GENERATE_CALENDAR_CHANNEL_IDS();

export const CALENDAR_CHANNEL_DATA_SEEDS: CalendarChannelDataSeed[] = [
  {
    id: CALENDAR_CHANNEL_DATA_SEED_IDS.TIM,
    connectedAccountId: CONNECTED_ACCOUNT_DATA_SEED_IDS.TIM,
    handle: 'tim@apple.dev',
    visibility: CalendarChannelVisibility.METADATA,
    isContactAutoCreationEnabled: true,
    isSyncEnabled: true,
  },
  {
    id: CALENDAR_CHANNEL_DATA_SEED_IDS.JONY,
    connectedAccountId: CONNECTED_ACCOUNT_DATA_SEED_IDS.JONY,
    handle: 'jony@apple.dev',
    visibility: CalendarChannelVisibility.SHARE_EVERYTHING,
    isContactAutoCreationEnabled: true,
    isSyncEnabled: true,
  },
  {
    id: CALENDAR_CHANNEL_DATA_SEED_IDS.PHIL,
    connectedAccountId: CONNECTED_ACCOUNT_DATA_SEED_IDS.PHIL,
    handle: 'phil@apple.dev',
    visibility: CalendarChannelVisibility.METADATA,
    isContactAutoCreationEnabled: true,
    isSyncEnabled: true,
  },
  {
    id: CALENDAR_CHANNEL_DATA_SEED_IDS.COMPANY_MAIN,
    connectedAccountId: CONNECTED_ACCOUNT_DATA_SEED_IDS.TIM,
    handle: 'company-main@apple.dev',
    visibility: CalendarChannelVisibility.SHARE_EVERYTHING,
    isContactAutoCreationEnabled: true,
    isSyncEnabled: true,
  },
  {
    id: CALENDAR_CHANNEL_DATA_SEED_IDS.TEAM_CALENDAR,
    connectedAccountId: CONNECTED_ACCOUNT_DATA_SEED_IDS.TIM,
    handle: 'team-calendar@apple.dev',
    visibility: CalendarChannelVisibility.SHARE_EVERYTHING,
    isContactAutoCreationEnabled: true,
    isSyncEnabled: true,
  },
];
