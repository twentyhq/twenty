import { PAGE_LAYOUT_SEEDS } from 'src/engine/workspace-manager/dev-seeder/core/constants/page-layout-seeds.constant';
import { generateSeedId } from 'src/engine/workspace-manager/dev-seeder/core/utils/generate-seed-id.util';
import { WORKSPACE_MEMBER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/workspace-member-data-seeds.constant';

type DashboardDataSeed = {
  id: string;
  title: string;
  pageLayoutId: string;
  createdBySource: string;
  createdByWorkspaceMemberId: string;
  createdByName: string;
  updatedBySource: string;
  updatedByWorkspaceMemberId: string;
  updatedByName: string;
  position: number;
};

export const DASHBOARD_DATA_SEED_COLUMNS: (keyof DashboardDataSeed)[] = [
  'id',
  'title',
  'pageLayoutId',
  'createdBySource',
  'createdByWorkspaceMemberId',
  'createdByName',
  'updatedBySource',
  'updatedByWorkspaceMemberId',
  'updatedByName',
  'position',
];

export const DASHBOARD_DATA_SEED_IDS = {
  SALES_OVERVIEW: '20202020-9e82-4342-91ef-c9e70f16a675',
  CUSTOMER_INSIGHTS: '20202020-d64e-4588-98cc-c56ba821247b',
  TEAM_PERFORMANCE: '20202020-b888-4c58-8975-76b4c2035d3a',
};

export const getDashboardDataSeeds = (
  workspaceId: string,
): DashboardDataSeed[] => [
  {
    id: DASHBOARD_DATA_SEED_IDS.SALES_OVERVIEW,
    title: 'Sales Overview',
    pageLayoutId: generateSeedId(
      workspaceId,
      PAGE_LAYOUT_SEEDS.SALES_DASHBOARD,
    ),
    createdBySource: 'MANUAL',
    createdByWorkspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.TIM,
    createdByName: 'Tim Apple',
    updatedBySource: 'MANUAL',
    updatedByWorkspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.TIM,
    updatedByName: 'Tim Apple',
    position: 0,
  },
  {
    id: DASHBOARD_DATA_SEED_IDS.CUSTOMER_INSIGHTS,
    title: 'Customer Insights',
    pageLayoutId: generateSeedId(
      workspaceId,
      PAGE_LAYOUT_SEEDS.CUSTOMER_DASHBOARD,
    ),
    createdBySource: 'MANUAL',
    createdByWorkspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
    createdByName: 'Jony Ive',
    updatedBySource: 'MANUAL',
    updatedByWorkspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
    updatedByName: 'Jony Ive',
    position: 1,
  },
  {
    id: DASHBOARD_DATA_SEED_IDS.TEAM_PERFORMANCE,
    title: 'Team & Activity',
    pageLayoutId: generateSeedId(workspaceId, PAGE_LAYOUT_SEEDS.TEAM_DASHBOARD),
    createdBySource: 'MANUAL',
    createdByWorkspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.PHIL,
    createdByName: 'Phil Schiller',
    updatedBySource: 'MANUAL',
    updatedByWorkspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.PHIL,
    updatedByName: 'Phil Schiller',
    position: 2,
  },
];
