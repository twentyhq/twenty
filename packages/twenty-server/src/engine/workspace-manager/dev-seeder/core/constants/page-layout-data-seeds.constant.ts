import { PageLayoutType } from 'src/engine/core-modules/page-layout/enums/page-layout-type.enum';

export const PAGE_LAYOUT_SEED_IDS = {
  SALES_DASHBOARD: '20202020-1af3-467c-866d-5b2fdf7851ac',
  CUSTOMER_DASHBOARD: '20202020-249e-4bee-be65-d3a89b0a2ffb',
  TEAM_DASHBOARD: '20202020-78dd-41f5-9bbf-6d0fe532ac94',
  REVENUE_ANALYTICS: '20202020-7d8e-4c0e-bae0-e46ecf3aee6c',
  MARKETING_METRICS: '20202020-1939-4ffa-8f84-1ca4e29e3e92',
  SUPPORT_DASHBOARD: '20202020-ffcc-47c5-ae0f-667d9c223a3d',
  PRODUCT_USAGE: '20202020-a2d4-4c48-bedf-c4f64bd02d3e',
  OPERATIONS_KPI: '20202020-41c1-4e73-8abc-46b3cca612b3',
  FINANCE_OVERVIEW: '20202020-553b-4552-bc6f-2805906ee792',
  EXECUTIVE_SUMMARY: '20202020-0fce-4d5b-a7d8-d5c1b0fa4970',
};

type PageLayoutSeed = {
  id: string;
  name: string;
  type: PageLayoutType;
  objectMetadataId: string | null;
  workspaceId: string;
};

export const getPageLayoutDataSeeds = (
  workspaceId: string,
): PageLayoutSeed[] => [
  {
    id: PAGE_LAYOUT_SEED_IDS.SALES_DASHBOARD,
    name: 'Sales Dashboard Layout',
    type: PageLayoutType.DASHBOARD,
    objectMetadataId: null,
    workspaceId,
  },
  {
    id: PAGE_LAYOUT_SEED_IDS.CUSTOMER_DASHBOARD,
    name: 'Customer Dashboard Layout',
    type: PageLayoutType.DASHBOARD,
    objectMetadataId: null,
    workspaceId,
  },
  {
    id: PAGE_LAYOUT_SEED_IDS.TEAM_DASHBOARD,
    name: 'Team Dashboard Layout',
    type: PageLayoutType.DASHBOARD,
    objectMetadataId: null,
    workspaceId,
  },
  {
    id: PAGE_LAYOUT_SEED_IDS.REVENUE_ANALYTICS,
    name: 'Revenue Analytics Layout',
    type: PageLayoutType.DASHBOARD,
    objectMetadataId: null,
    workspaceId,
  },
  {
    id: PAGE_LAYOUT_SEED_IDS.MARKETING_METRICS,
    name: 'Marketing Metrics Layout',
    type: PageLayoutType.DASHBOARD,
    objectMetadataId: null,
    workspaceId,
  },
  {
    id: PAGE_LAYOUT_SEED_IDS.SUPPORT_DASHBOARD,
    name: 'Support Dashboard Layout',
    type: PageLayoutType.DASHBOARD,
    objectMetadataId: null,
    workspaceId,
  },
  {
    id: PAGE_LAYOUT_SEED_IDS.PRODUCT_USAGE,
    name: 'Product Usage Layout',
    type: PageLayoutType.DASHBOARD,
    objectMetadataId: null,
    workspaceId,
  },
  {
    id: PAGE_LAYOUT_SEED_IDS.OPERATIONS_KPI,
    name: 'Operations KPI Layout',
    type: PageLayoutType.DASHBOARD,
    objectMetadataId: null,
    workspaceId,
  },
  {
    id: PAGE_LAYOUT_SEED_IDS.FINANCE_OVERVIEW,
    name: 'Finance Overview Layout',
    type: PageLayoutType.DASHBOARD,
    objectMetadataId: null,
    workspaceId,
  },
  {
    id: PAGE_LAYOUT_SEED_IDS.EXECUTIVE_SUMMARY,
    name: 'Executive Summary Layout',
    type: PageLayoutType.DASHBOARD,
    objectMetadataId: null,
    workspaceId,
  },
];
