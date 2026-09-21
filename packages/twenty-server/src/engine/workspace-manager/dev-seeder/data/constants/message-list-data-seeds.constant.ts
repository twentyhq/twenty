type MessageListDataSeed = {
  id: string;
  position: number;
  name: string;
};

export const MESSAGE_LIST_DATA_SEED_COLUMNS: (keyof MessageListDataSeed)[] = [
  'id',
  'position',
  'name',
];

export const MESSAGE_LIST_DATA_SEED_IDS = {
  DEVELOPER_PROGRAM: '20202020-6c69-4f2a-8b1e-4d5f00000001',
  FOUNDERS: '20202020-6c69-4f2a-8b1e-4d5f00000002',
};

export const MESSAGE_LIST_DATA_SEEDS: MessageListDataSeed[] = [
  {
    id: MESSAGE_LIST_DATA_SEED_IDS.DEVELOPER_PROGRAM,
    position: 0,
    name: 'Developer program members',
  },
  {
    id: MESSAGE_LIST_DATA_SEED_IDS.FOUNDERS,
    position: 1,
    name: 'Founders and executives',
  },
];
