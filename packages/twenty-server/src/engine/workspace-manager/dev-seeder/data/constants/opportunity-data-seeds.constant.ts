import { COMPANY_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/company-data-seeds.constant';
import { PERSON_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/person-data-seeds.constant';
import { WORKSPACE_MEMBER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/workspace-member-data-seeds.constant';

type OpportunityDataSeed = {
  id: string;
  name: string;
  amountAmountMicros: number;
  amountCurrencyCode: string;
  closeDate: Date;
  stage: string;
  position: number;
  pointOfContactId: string;
  companyId: string;
  createdBySource: string;
  createdByWorkspaceMemberId: string;
  createdByName: string;
};

export const OPPORTUNITY_DATA_SEED_COLUMNS: (keyof OpportunityDataSeed)[] = [
  'id',
  'name',
  'amountAmountMicros',
  'amountCurrencyCode',
  'closeDate',
  'stage',
  'position',
  'pointOfContactId',
  'companyId',
  'createdBySource',
  'createdByWorkspaceMemberId',
  'createdByName',
];

export const OPPORTUNITY_DATA_SEED_IDS = {
  ID_1: '20202020-be10-422b-a663-16bd3c2228e1',
  ID_2: '20202020-0543-4cc2-9f96-95cc699960f2',
  ID_3: '20202020-2f89-406f-90ea-180f433b2445',
  ID_4: '20202020-35b1-4045-9cde-42f715148954',
};

export const OPPORTUNITY_DATA_SEEDS: OpportunityDataSeed[] = [
  {
    id: OPPORTUNITY_DATA_SEED_IDS.ID_1,
    name: 'Opportunity 1',
    amountAmountMicros: 100000,
    amountCurrencyCode: 'USD',
    closeDate: new Date(),
    stage: 'NEW',
    position: 1,
    pointOfContactId: PERSON_DATA_SEED_IDS.ID_1,
    companyId: COMPANY_DATA_SEED_IDS.ID_1,
    createdBySource: 'MANUAL',
    createdByWorkspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.TIM,
    createdByName: 'Tim Cook',
  },
  {
    id: OPPORTUNITY_DATA_SEED_IDS.ID_2,
    name: 'Opportunity 2',
    amountAmountMicros: 2000000,
    amountCurrencyCode: 'USD',
    closeDate: new Date(),
    stage: 'MEETING',
    position: 2,
    pointOfContactId: PERSON_DATA_SEED_IDS.ID_2,
    companyId: COMPANY_DATA_SEED_IDS.ID_2,
    createdBySource: 'MANUAL',
    createdByWorkspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.TIM,
    createdByName: 'Tim Cook',
  },
  {
    id: OPPORTUNITY_DATA_SEED_IDS.ID_3,
    name: 'Opportunity 3',
    amountAmountMicros: 300000,
    amountCurrencyCode: 'USD',
    closeDate: new Date(),
    stage: 'PROPOSAL',
    position: 3,
    pointOfContactId: PERSON_DATA_SEED_IDS.ID_3,
    companyId: COMPANY_DATA_SEED_IDS.ID_3,
    createdBySource: 'MANUAL',
    createdByWorkspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.TIM,
    createdByName: 'Tim Cook',
  },
  {
    id: OPPORTUNITY_DATA_SEED_IDS.ID_4,
    name: 'Opportunity 4',
    amountAmountMicros: 4000000,
    amountCurrencyCode: 'USD',
    closeDate: new Date(),
    stage: 'PROPOSAL',
    position: 4,
    pointOfContactId: PERSON_DATA_SEED_IDS.ID_4,
    companyId: COMPANY_DATA_SEED_IDS.ID_4,
    createdBySource: 'MANUAL',
    createdByWorkspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.TIM,
    createdByName: '',
  },
];
