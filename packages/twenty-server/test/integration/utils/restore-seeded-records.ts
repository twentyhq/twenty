import { COMPANY_DATA_SEEDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/company-data-seeds.constant';
import { getDashboardDataSeeds } from 'src/engine/workspace-manager/dev-seeder/data/constants/dashboard-data-seeds.constant';
import { NOTE_DATA_SEEDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/note-data-seeds.constant';
import { NOTE_TARGET_DATA_SEEDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/note-target-data-seeds.constant';
import { OPPORTUNITY_DATA_SEEDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/opportunity-data-seeds.constant';
import { PERSON_DATA_SEEDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/person-data-seeds.constant';
import { PET_DATA_SEEDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/pet-data-seeds.constant';
import { ROCKET_DATA_SEEDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/rocket-data-seeds.constant';
import { SURVEY_RESULT_DATA_SEEDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/survey-result-data-seeds.constant';
import { TASK_DATA_SEEDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/task-data-seeds.constant';
import { TASK_TARGET_DATA_SEEDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/task-target-data-seeds.constant';

import {
  deleteAllRecords,
  TEST_SCHEMA_NAME,
  TEST_WORKSPACE_ID,
} from 'test/integration/utils/delete-all-records';

type SeedRecord = Record<string, unknown>;

const getSeedRecordsByTableName = (
  tableName: string,
): SeedRecord[] | undefined => {
  switch (tableName) {
    case 'person':
      return PERSON_DATA_SEEDS;
    case 'company':
      return COMPANY_DATA_SEEDS;
    case 'opportunity':
      return OPPORTUNITY_DATA_SEEDS;
    case 'note':
      return NOTE_DATA_SEEDS;
    case 'task':
      return TASK_DATA_SEEDS;
    case 'noteTarget':
      return NOTE_TARGET_DATA_SEEDS;
    case 'taskTarget':
      return TASK_TARGET_DATA_SEEDS;
    case 'dashboard':
      return getDashboardDataSeeds(TEST_WORKSPACE_ID);
    case '_pet':
      return PET_DATA_SEEDS;
    case '_surveyResult':
      return SURVEY_RESULT_DATA_SEEDS;
    case '_rocket':
      return ROCKET_DATA_SEEDS;
    default:
      return undefined;
  }
};

const insertSeedRecords = async (
  tableName: string,
  seedRecords: SeedRecord[],
) => {
  if (seedRecords.length === 0) {
    return;
  }

  const columns = Object.keys(seedRecords[0]);
  const quotedColumns = columns.map((column) => `"${column}"`).join(', ');

  const values: unknown[] = [];
  const rows = seedRecords.map((record) => {
    const placeholders = columns.map((column) => {
      values.push(record[column]);

      return `$${values.length}`;
    });

    return `(${placeholders.join(', ')})`;
  });

  await global.testDataSource.query(
    `INSERT INTO "${TEST_SCHEMA_NAME}"."${tableName}" (${quotedColumns}) VALUES ${rows.join(
      ', ',
    )} ON CONFLICT DO NOTHING`,
    values,
  );
};

export const restoreSeededRecords = async (objectNameSingular: string) => {
  const seedRecords = getSeedRecordsByTableName(objectNameSingular);

  if (seedRecords === undefined) {
    throw new Error(`No seed data found for "${objectNameSingular}"`);
  }

  await deleteAllRecords(objectNameSingular);

  await insertSeedRecords(objectNameSingular, seedRecords);
};
