import { COMPANY_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/company-data-seeds.constant';
import { PERSON_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/person-data-seeds.constant';
import { TASK_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/task-data-seeds.constant';

type TaskTargetDataSeed = {
  id: string;
  taskId: string | null;
  personId: string | null;
  companyId: string | null;
  opportunityId: string | null;
};

export const TASK_TARGET_DATA_SEED_COLUMNS: (keyof TaskTargetDataSeed)[] = [
  'id',
  'taskId',
  'personId',
  'companyId',
  'opportunityId',
];

// Generate all task target IDs
const GENERATE_TASK_TARGET_IDS = (): Record<string, string> => {
  const TASK_TARGET_IDS: Record<string, string> = {};

  // Person task targets (ID_1 to ID_1200)
  for (let INDEX = 1; INDEX <= 1200; INDEX++) {
    const HEX_INDEX = INDEX.toString(16).padStart(4, '0');

    TASK_TARGET_IDS[`ID_${INDEX}`] =
      `60606060-${HEX_INDEX}-4e7c-8001-123456789def`;
  }

  // Company task targets (ID_1201 to ID_1800)
  for (let INDEX = 1201; INDEX <= 1800; INDEX++) {
    const HEX_INDEX = INDEX.toString(16).padStart(4, '0');

    TASK_TARGET_IDS[`ID_${INDEX}`] =
      `60606060-${HEX_INDEX}-4e7c-9001-123456789def`;
  }

  return TASK_TARGET_IDS;
};

const TASK_TARGET_DATA_SEED_IDS = GENERATE_TASK_TARGET_IDS();

// Generate task target data seeds
const GENERATE_TASK_TARGET_SEEDS = (): TaskTargetDataSeed[] => {
  const TASK_TARGET_SEEDS: TaskTargetDataSeed[] = [];

  // Person task targets (link each person task to its corresponding person)
  for (let INDEX = 1; INDEX <= 1200; INDEX++) {
    TASK_TARGET_SEEDS.push({
      id: TASK_TARGET_DATA_SEED_IDS[`ID_${INDEX}`],
      taskId: TASK_DATA_SEED_IDS[`ID_${INDEX}`],
      personId:
        PERSON_DATA_SEED_IDS[
          `ID_${INDEX}` as keyof typeof PERSON_DATA_SEED_IDS
        ],
      companyId: null,
      opportunityId: null,
    });
  }

  // Company task targets (link each company task to its corresponding company)
  for (let INDEX = 1201; INDEX <= 1800; INDEX++) {
    const COMPANY_INDEX = INDEX - 1200;

    TASK_TARGET_SEEDS.push({
      id: TASK_TARGET_DATA_SEED_IDS[`ID_${INDEX}`],
      taskId: TASK_DATA_SEED_IDS[`ID_${INDEX}`],
      personId: null,
      companyId:
        COMPANY_DATA_SEED_IDS[
          `ID_${COMPANY_INDEX}` as keyof typeof COMPANY_DATA_SEED_IDS
        ],
      opportunityId: null,
    });
  }

  return TASK_TARGET_SEEDS;
};

export const TASK_TARGET_DATA_SEEDS = GENERATE_TASK_TARGET_SEEDS();

// Map for O(1) lookups by task ID
export const TASK_TARGET_DATA_SEEDS_MAP = new Map<string, TaskTargetDataSeed>(
  TASK_TARGET_DATA_SEEDS.filter((target) => target.taskId !== null).map(
    (target) => [target.taskId!, target],
  ),
);
