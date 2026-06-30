import { COMPANY_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/company-data-seeds.constant';
import { PERSON_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/person-data-seeds.constant';

type EmploymentHistoryDataSeed = {
  id: string;
  personId: string;
  companyId: string;
};

export const EMPLOYMENT_HISTORY_DATA_SEED_COLUMNS: (keyof EmploymentHistoryDataSeed)[] =
  ['id', 'personId', 'companyId'];

export const EMPLOYMENT_HISTORY_DATA_SEED_IDS = {
  ID_1: '20202020-e001-4000-8000-000000000001',
  ID_2: '20202020-e001-4000-8000-000000000002',
  ID_3: '20202020-e001-4000-8000-000000000003',
  ID_4: '20202020-e001-4000-8000-000000000004',
  ID_5: '20202020-e001-4000-8000-000000000005',
};

// Sample employment histories: some people have worked at different companies
export const EMPLOYMENT_HISTORY_DATA_SEEDS: EmploymentHistoryDataSeed[] = [
  // Mark Young (Person 1) previously worked at Company 2
  {
    id: EMPLOYMENT_HISTORY_DATA_SEED_IDS.ID_1,
    personId: PERSON_DATA_SEED_IDS.ID_1,
    companyId: COMPANY_DATA_SEED_IDS.ID_2,
  },
  // Mark Young (Person 1) also previously worked at Company 3
  {
    id: EMPLOYMENT_HISTORY_DATA_SEED_IDS.ID_2,
    personId: PERSON_DATA_SEED_IDS.ID_1,
    companyId: COMPANY_DATA_SEED_IDS.ID_3,
  },
  // Gabriel Robinson (Person 2) previously worked at Company 4
  {
    id: EMPLOYMENT_HISTORY_DATA_SEED_IDS.ID_3,
    personId: PERSON_DATA_SEED_IDS.ID_2,
    companyId: COMPANY_DATA_SEED_IDS.ID_4,
  },
  // Kimberly Gordon (Person 3) previously worked at Company 1
  {
    id: EMPLOYMENT_HISTORY_DATA_SEED_IDS.ID_4,
    personId: PERSON_DATA_SEED_IDS.ID_3,
    companyId: COMPANY_DATA_SEED_IDS.ID_1,
  },
  // Cindy Baker (Person 4) previously worked at Company 5
  {
    id: EMPLOYMENT_HISTORY_DATA_SEED_IDS.ID_5,
    personId: PERSON_DATA_SEED_IDS.ID_4,
    companyId: COMPANY_DATA_SEED_IDS.ID_5,
  },
];
