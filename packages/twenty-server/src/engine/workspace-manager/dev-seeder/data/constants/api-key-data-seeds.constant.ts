type ApiKeyDataSeed = {
  id: string;
  name: string;
  expiresAt: Date;
};

export const API_KEY_DATA_SEED_COLUMNS: (keyof ApiKeyDataSeed)[] = [
  'id',
  'name',
  'expiresAt',
];

export const API_KEY_DATA_SEED_IDS = {
  ID_1: '20202020-f401-4d8a-a731-64d007c27bad',
};

export const API_KEY_DATA_SEEDS: ApiKeyDataSeed[] = [
  {
    id: API_KEY_DATA_SEED_IDS.ID_1,
    name: 'My api key',
    expiresAt: new Date('2025-12-31T23:59:59Z'), // Use Z format directly
  },
];
