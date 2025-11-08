type RocketDataSeed = {
  id: string;
  name: string;
};

export const ROCKET_DATA_SEED_COLUMNS: (keyof RocketDataSeed)[] = [
  'id',
  'name',
];

export const ROCKET_DATA_SEED_IDS = {
  ID_1: '20202020-77d2-4000-8ce4-6a70b9720b32',
  ID_2: '20202020-ed89-413a-b31a-962986a3546f',
  ID_3: '20202020-1f3b-4e2a-9c1b-8d9e0f1a2b3c',
};

export const ROCKET_DATA_SEEDS: RocketDataSeed[] = [
  {
    id: ROCKET_DATA_SEED_IDS.ID_1,
    name: 'Falcon 9',
  },
  {
    id: ROCKET_DATA_SEED_IDS.ID_2,
    name: 'Starship',
  },
  {
    id: ROCKET_DATA_SEED_IDS.ID_3,
    name: 'Falcon Heavy',
  },
];
