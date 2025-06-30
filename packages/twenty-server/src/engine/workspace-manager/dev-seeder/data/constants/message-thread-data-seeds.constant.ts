type MessageThreadDataSeed = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
};

export const MESSAGE_THREAD_DATA_SEED_COLUMNS: (keyof MessageThreadDataSeed)[] =
  ['id', 'createdAt', 'updatedAt', 'deletedAt'];

const GENERATE_MESSAGE_THREAD_IDS = (): Record<string, string> => {
  const THREAD_IDS: Record<string, string> = {};

  for (let INDEX = 1; INDEX <= 300; INDEX++) {
    const HEX_INDEX = INDEX.toString(16).padStart(4, '0');

    THREAD_IDS[`ID_${INDEX}`] = `20202020-${HEX_INDEX}-4e7c-8001-123456789def`;
  }

  return THREAD_IDS;
};

export const MESSAGE_THREAD_DATA_SEED_IDS = GENERATE_MESSAGE_THREAD_IDS();

const GENERATE_MESSAGE_THREAD_SEEDS = (): MessageThreadDataSeed[] => {
  const THREAD_SEEDS: MessageThreadDataSeed[] = [];

  for (let INDEX = 1; INDEX <= 300; INDEX++) {
    const NOW = new Date();
    const RANDOM_DAYS_OFFSET = Math.floor(Math.random() * 90); // 0 to 90 days ago
    const CREATED_DATE = new Date(
      NOW.getTime() - RANDOM_DAYS_OFFSET * 24 * 60 * 60 * 1000,
    );

    // Updated date is between created date and now
    const DAYS_SINCE_CREATED = Math.floor(
      (NOW.getTime() - CREATED_DATE.getTime()) / (24 * 60 * 60 * 1000),
    );
    const UPDATE_OFFSET = Math.floor(Math.random() * (DAYS_SINCE_CREATED + 1));
    const UPDATED_DATE = new Date(
      CREATED_DATE.getTime() + UPDATE_OFFSET * 24 * 60 * 60 * 1000,
    );

    THREAD_SEEDS.push({
      id: MESSAGE_THREAD_DATA_SEED_IDS[`ID_${INDEX}`],
      createdAt: CREATED_DATE,
      updatedAt: UPDATED_DATE,
      deletedAt: null,
    });
  }

  return THREAD_SEEDS;
};

export const MESSAGE_THREAD_DATA_SEEDS = GENERATE_MESSAGE_THREAD_SEEDS();
