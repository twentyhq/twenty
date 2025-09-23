import { PageLayoutType } from 'src/engine/core-modules/page-layout/enums/page-layout-type.enum';
import { PAGE_LAYOUT_SEEDS } from 'src/engine/workspace-manager/dev-seeder/core/constants/page-layout-seeds.constant';
import { generateSeedId } from 'src/engine/workspace-manager/dev-seeder/core/utils/generate-seed-id.util';

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
    id: generateSeedId(workspaceId, PAGE_LAYOUT_SEEDS.SALES_DASHBOARD),
    name: 'Sales Dashboard Layout',
    type: PageLayoutType.DASHBOARD,
    objectMetadataId: null,
    workspaceId,
  },
  {
    id: generateSeedId(workspaceId, PAGE_LAYOUT_SEEDS.CUSTOMER_DASHBOARD),
    name: 'Customer Dashboard Layout',
    type: PageLayoutType.DASHBOARD,
    objectMetadataId: null,
    workspaceId,
  },
  {
    id: generateSeedId(workspaceId, PAGE_LAYOUT_SEEDS.TEAM_DASHBOARD),
    name: 'Team Dashboard Layout',
    type: PageLayoutType.DASHBOARD,
    objectMetadataId: null,
    workspaceId,
  },
  {
    id: generateSeedId(workspaceId, PAGE_LAYOUT_SEEDS.REVENUE_ANALYTICS),
    name: 'Revenue Analytics Layout',
    type: PageLayoutType.DASHBOARD,
    objectMetadataId: null,
    workspaceId,
  },
  {
    id: generateSeedId(workspaceId, PAGE_LAYOUT_SEEDS.MARKETING_METRICS),
    name: 'Marketing Metrics Layout',
    type: PageLayoutType.DASHBOARD,
    objectMetadataId: null,
    workspaceId,
  },
  {
    id: generateSeedId(workspaceId, PAGE_LAYOUT_SEEDS.SUPPORT_DASHBOARD),
    name: 'Support Dashboard Layout',
    type: PageLayoutType.DASHBOARD,
    objectMetadataId: null,
    workspaceId,
  },
  {
    id: generateSeedId(workspaceId, PAGE_LAYOUT_SEEDS.PRODUCT_USAGE),
    name: 'Product Usage Layout',
    type: PageLayoutType.DASHBOARD,
    objectMetadataId: null,
    workspaceId,
  },
  {
    id: generateSeedId(workspaceId, PAGE_LAYOUT_SEEDS.OPERATIONS_KPI),
    name: 'Operations KPI Layout',
    type: PageLayoutType.DASHBOARD,
    objectMetadataId: null,
    workspaceId,
  },
  {
    id: generateSeedId(workspaceId, PAGE_LAYOUT_SEEDS.FINANCE_OVERVIEW),
    name: 'Finance Overview Layout',
    type: PageLayoutType.DASHBOARD,
    objectMetadataId: null,
    workspaceId,
  },
  {
    id: generateSeedId(workspaceId, PAGE_LAYOUT_SEEDS.EXECUTIVE_SUMMARY),
    name: 'Executive Summary Layout',
    type: PageLayoutType.DASHBOARD,
    objectMetadataId: null,
    workspaceId,
  },
];
