type MessageThreadDataSeed = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
};

export const MESSAGE_THREAD_DATA_SEED_COLUMNS: (keyof MessageThreadDataSeed)[] =
  ['id', 'createdAt', 'updatedAt', 'deletedAt'];

export const MESSAGE_THREAD_DATA_SEED_IDS = {
  ID_1: '20202020-8bfa-453b-b99b-bc435a7d4da8',
  ID_2: '20202020-634a-4fde-aa7c-28a0eaf203ca',
  ID_3: '20202020-1b56-4f10-a2fa-2ccaddf81f6c',
  ID_4: '20202020-d51c-485a-b1b6-ed7c63e05d72',
  ID_5: '20202020-3f74-492d-a101-2a70f50a1645',
};

export const MESSAGE_THREAD_DATA_SEEDS: MessageThreadDataSeed[] = [
  {
    id: MESSAGE_THREAD_DATA_SEED_IDS.ID_1,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  },
  {
    id: MESSAGE_THREAD_DATA_SEED_IDS.ID_2,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  },
  {
    id: MESSAGE_THREAD_DATA_SEED_IDS.ID_3,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  },
  {
    id: MESSAGE_THREAD_DATA_SEED_IDS.ID_4,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  },
];
