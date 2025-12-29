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
  updatedBySource: string;
  updatedByWorkspaceMemberId: string;
  updatedByName: string;
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
  'updatedBySource',
  'updatedByWorkspaceMemberId',
  'updatedByName',
];

const GENERATE_OPPORTUNITY_IDS = (): Record<string, string> => {
  const OPPORTUNITY_IDS: Record<string, string> = {};

  for (let INDEX = 1; INDEX <= 50; INDEX++) {
    const HEX_INDEX = INDEX.toString(16).padStart(4, '0');

    OPPORTUNITY_IDS[`ID_${INDEX}`] =
      `50505050-${HEX_INDEX}-4e7c-8001-123456789abc`;
  }

  return OPPORTUNITY_IDS;
};

export const OPPORTUNITY_DATA_SEED_IDS = GENERATE_OPPORTUNITY_IDS();

// Credible opportunity names for Apple selling to various companies
const OPPORTUNITY_TEMPLATES = [
  { name: 'Enterprise iPad Deployment', amount: 2500000, stage: 'PROPOSAL' },
  { name: 'MacBook Pro Fleet Upgrade', amount: 1800000, stage: 'MEETING' },
  { name: 'iPhone Corporate Program', amount: 3200000, stage: 'NEW' },
  { name: 'Apple TV+ Enterprise License', amount: 450000, stage: 'SCREENING' },
  { name: 'Mac Studio Creative Suite', amount: 890000, stage: 'PROPOSAL' },
  { name: 'iPad Pro Design Team Setup', amount: 670000, stage: 'MEETING' },
  { name: 'Apple Watch Corporate Wellness', amount: 320000, stage: 'NEW' },
  {
    name: 'iMac Office Workstation Refresh',
    amount: 1200000,
    stage: 'CUSTOMER',
  },
  { name: 'Apple One Business Bundle', amount: 180000, stage: 'PROPOSAL' },
  { name: 'MacBook Air Remote Work Package', amount: 950000, stage: 'MEETING' },
  { name: 'Apple Pencil Educational License', amount: 85000, stage: 'NEW' },
  {
    name: 'Mac Pro Video Production Setup',
    amount: 2100000,
    stage: 'SCREENING',
  },
  { name: 'iPhone SE Frontline Workers', amount: 780000, stage: 'PROPOSAL' },
  { name: 'Apple CarPlay Integration', amount: 1500000, stage: 'MEETING' },
  { name: 'iPad Air Retail Deployment', amount: 620000, stage: 'NEW' },
  { name: 'Apple Music Business License', amount: 95000, stage: 'CUSTOMER' },
  { name: 'Mac mini Server Infrastructure', amount: 430000, stage: 'PROPOSAL' },
  { name: 'Apple Arcade Enterprise Gaming', amount: 75000, stage: 'SCREENING' },
  { name: 'iPhone 15 Pro Executive Program', amount: 540000, stage: 'MEETING' },
  { name: 'Apple Fitness+ Corporate Wellness', amount: 125000, stage: 'NEW' },
  { name: 'iPad Mini Field Operations', amount: 380000, stage: 'PROPOSAL' },
  {
    name: 'Apple News+ Business Subscription',
    amount: 45000,
    stage: 'CUSTOMER',
  },
  { name: 'MacBook Pro M3 Developer Team', amount: 1600000, stage: 'MEETING' },
  {
    name: 'Apple Vision Pro Prototype Lab',
    amount: 850000,
    stage: 'SCREENING',
  },
  { name: 'iPhone Photography Workshop', amount: 65000, stage: 'NEW' },
  { name: 'Apple Store Corporate Training', amount: 155000, stage: 'PROPOSAL' },
  { name: 'iPad Kiosk Solution Deployment', amount: 290000, stage: 'MEETING' },
  {
    name: 'Apple Pay Enterprise Integration',
    amount: 720000,
    stage: 'CUSTOMER',
  },
  { name: 'Mac Studio Animation Pipeline', amount: 1350000, stage: 'PROPOSAL' },
  { name: 'Apple Configurator MDM Setup', amount: 210000, stage: 'SCREENING' },
  {
    name: 'iPhone Accessibility Features Training',
    amount: 85000,
    stage: 'NEW',
  },
  { name: 'Apple Business Manager License', amount: 180000, stage: 'MEETING' },
  { name: 'iPad Pro AR Development Kit', amount: 490000, stage: 'PROPOSAL' },
  { name: 'Apple School Manager Education', amount: 320000, stage: 'CUSTOMER' },
  { name: 'MacBook Air Student Program', amount: 750000, stage: 'MEETING' },
  { name: 'Apple Watch Health Monitoring', amount: 280000, stage: 'SCREENING' },
  { name: 'iPhone Security Audit Services', amount: 195000, stage: 'NEW' },
  {
    name: 'Apple TV Digital Signage Solution',
    amount: 340000,
    stage: 'PROPOSAL',
  },
  { name: 'Mac Pro Rendering Farm Setup', amount: 2800000, stage: 'MEETING' },
  {
    name: 'Apple Pencil Digital Art License',
    amount: 120000,
    stage: 'CUSTOMER',
  },
  { name: 'iPad Point of Sale Integration', amount: 580000, stage: 'PROPOSAL' },
  {
    name: 'Apple Maps Business Integration',
    amount: 165000,
    stage: 'SCREENING',
  },
  { name: 'iPhone App Development Workshop', amount: 95000, stage: 'NEW' },
  {
    name: 'Apple Silicon Migration Consulting',
    amount: 420000,
    stage: 'MEETING',
  },
  {
    name: 'iPad Inventory Management System',
    amount: 350000,
    stage: 'PROPOSAL',
  },
  {
    name: 'Apple Podcast Enterprise Hosting',
    amount: 75000,
    stage: 'CUSTOMER',
  },
  {
    name: 'MacBook Pro Creative Cloud Bundle',
    amount: 1100000,
    stage: 'MEETING',
  },
  { name: 'Apple ID Enterprise SSO Setup', amount: 240000, stage: 'SCREENING' },
  { name: 'iPhone Field Service Optimization', amount: 680000, stage: 'NEW' },
  {
    name: 'Apple Retail Partnership Program',
    amount: 1950000,
    stage: 'PROPOSAL',
  },
];

const GENERATE_OPPORTUNITY_SEEDS = (): OpportunityDataSeed[] => {
  const OPPORTUNITY_SEEDS: OpportunityDataSeed[] = [];

  for (let INDEX = 1; INDEX <= 50; INDEX++) {
    const TEMPLATE_INDEX = (INDEX - 1) % OPPORTUNITY_TEMPLATES.length;
    const TEMPLATE = OPPORTUNITY_TEMPLATES[TEMPLATE_INDEX];

    const DAYS_AHEAD = Math.floor(Math.random() * 90) + 1;
    const CLOSE_DATE = new Date();

    CLOSE_DATE.setDate(CLOSE_DATE.getDate() + DAYS_AHEAD);

    OPPORTUNITY_SEEDS.push({
      id: OPPORTUNITY_DATA_SEED_IDS[`ID_${INDEX}`],
      name: TEMPLATE.name,
      amountAmountMicros: TEMPLATE.amount * 1000000,
      amountCurrencyCode: 'USD',
      closeDate: CLOSE_DATE,
      stage: TEMPLATE.stage,
      position: INDEX,
      pointOfContactId:
        PERSON_DATA_SEED_IDS[
          `ID_${INDEX}` as keyof typeof PERSON_DATA_SEED_IDS
        ] || PERSON_DATA_SEED_IDS.ID_1,
      companyId:
        COMPANY_DATA_SEED_IDS[
          `ID_${Math.ceil(INDEX / 2)}` as keyof typeof COMPANY_DATA_SEED_IDS
        ] || COMPANY_DATA_SEED_IDS.ID_1,
      createdBySource: 'MANUAL',
      createdByWorkspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.TIM,
      createdByName: 'Tim Cook',
      updatedBySource: 'MANUAL',
      updatedByWorkspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.TIM,
      updatedByName: 'Tim Cook',
    });
  }

  return OPPORTUNITY_SEEDS;
};

export const OPPORTUNITY_DATA_SEEDS = GENERATE_OPPORTUNITY_SEEDS();
