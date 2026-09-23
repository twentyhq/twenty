import { assertIsDefinedOrThrow } from 'twenty-shared/utils';

import { COMPANY_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/company-data-seeds.constant';
import { PERSON_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/person-data-seeds.constant';
import { TASK_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/task-data-seeds.constant';

type TaskTargetDataSeed = {
  id: string;
  taskId: string | null;
  targetPersonId: string | null;
  targetCompanyId: string | null;
  targetOpportunityId: string | null;
};

export const TASK_TARGET_DATA_SEED_COLUMNS: (keyof TaskTargetDataSeed)[] = [
  'id',
  'taskId',
  'targetPersonId',
  'targetCompanyId',
  'targetOpportunityId',
];

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

const GENERATE_TASK_TARGET_SEEDS = (): TaskTargetDataSeed[] => {
  const TASK_TARGET_SEEDS: TaskTargetDataSeed[] = [];

  for (let INDEX = 1; INDEX <= 1200; INDEX++) {
    const taskTargetDataSeedId = TASK_TARGET_DATA_SEED_IDS[`ID_${INDEX}`];

    assertIsDefinedOrThrow(taskTargetDataSeedId);
    const taskDataSeedId = TASK_DATA_SEED_IDS[`ID_${INDEX}`];

    assertIsDefinedOrThrow(taskDataSeedId);

    const PERSON_DATA_SEED_IDSItem =
      PERSON_DATA_SEED_IDS[`ID_${INDEX}` as keyof typeof PERSON_DATA_SEED_IDS];

    TASK_TARGET_SEEDS.push({
      id: taskTargetDataSeedId,
      taskId: taskDataSeedId,
      targetPersonId: PERSON_DATA_SEED_IDSItem,
      targetCompanyId: null,
      targetOpportunityId: null,
    });
  }

  for (let INDEX = 1201; INDEX <= 1800; INDEX++) {
    const COMPANY_INDEX = INDEX - 1200;

    const taskTargetId = TASK_TARGET_DATA_SEED_IDS[`ID_${INDEX}`];

    assertIsDefinedOrThrow(taskTargetId);
    const taskId = TASK_DATA_SEED_IDS[`ID_${INDEX}`];

    assertIsDefinedOrThrow(taskId);

    const COMPANY_DATA_SEED_IDSItem =
      COMPANY_DATA_SEED_IDS[
        `ID_${COMPANY_INDEX}` as keyof typeof COMPANY_DATA_SEED_IDS
      ];

    TASK_TARGET_SEEDS.push({
      id: taskTargetId,
      taskId,
      targetPersonId: null,
      targetCompanyId: COMPANY_DATA_SEED_IDSItem,
      targetOpportunityId: null,
    });
  }

  return TASK_TARGET_SEEDS;
};

export const TASK_TARGET_DATA_SEEDS = GENERATE_TASK_TARGET_SEEDS();

export const TASK_TARGET_DATA_SEEDS_MAP = new Map<string, TaskTargetDataSeed>(
  TASK_TARGET_DATA_SEEDS.filter((target) => target.taskId !== null).map(
    (target) => [target.taskId!, target],
  ),
);
