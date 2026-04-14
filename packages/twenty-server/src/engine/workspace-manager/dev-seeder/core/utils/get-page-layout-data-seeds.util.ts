import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { type FlatPageLayout } from 'src/engine/metadata-modules/flat-page-layout/types/flat-page-layout.type';
import { PageLayoutType } from 'src/engine/metadata-modules/page-layout/enums/page-layout-type.enum';
import { PAGE_LAYOUT_SEEDS } from 'src/engine/workspace-manager/dev-seeder/core/constants/page-layout-seeds.constant';
import { generateSeedId } from 'src/engine/workspace-manager/dev-seeder/core/utils/generate-seed-id.util';

export const getPageLayoutFlatEntitySeeds = ({
  workspaceId,
  flatApplication,
}: {
  workspaceId: string;
  flatApplication: FlatApplication;
}): FlatPageLayout[] => {
  const now = new Date().toISOString();

  return [
    {
      id: generateSeedId(workspaceId, PAGE_LAYOUT_SEEDS.SALES_DASHBOARD),
      universalIdentifier: generateSeedId(
        workspaceId,
        PAGE_LAYOUT_SEEDS.SALES_DASHBOARD,
      ),
      applicationId: flatApplication.id,
      applicationUniversalIdentifier: flatApplication.universalIdentifier,
      workspaceId,
      name: 'Sales Dashboard Layout',
      type: PageLayoutType.DASHBOARD,
      objectMetadataId: null,
      objectMetadataUniversalIdentifier: null,
      tabIds: [],
      tabUniversalIdentifiers: [],
      defaultTabToFocusOnMobileAndSidePanelId: null,
      defaultTabToFocusOnMobileAndSidePanelUniversalIdentifier: null,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    },
    {
      id: generateSeedId(workspaceId, PAGE_LAYOUT_SEEDS.CUSTOMER_DASHBOARD),
      universalIdentifier: generateSeedId(
        workspaceId,
        PAGE_LAYOUT_SEEDS.CUSTOMER_DASHBOARD,
      ),
      applicationId: flatApplication.id,
      applicationUniversalIdentifier: flatApplication.universalIdentifier,
      workspaceId,
      name: 'Customer Dashboard Layout',
      type: PageLayoutType.DASHBOARD,
      objectMetadataId: null,
      objectMetadataUniversalIdentifier: null,
      tabIds: [],
      tabUniversalIdentifiers: [],
      defaultTabToFocusOnMobileAndSidePanelId: null,
      defaultTabToFocusOnMobileAndSidePanelUniversalIdentifier: null,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    },
    {
      id: generateSeedId(workspaceId, PAGE_LAYOUT_SEEDS.TEAM_DASHBOARD),
      universalIdentifier: generateSeedId(
        workspaceId,
        PAGE_LAYOUT_SEEDS.TEAM_DASHBOARD,
      ),
      applicationId: flatApplication.id,
      applicationUniversalIdentifier: flatApplication.universalIdentifier,
      workspaceId,
      name: 'Team Dashboard Layout',
      type: PageLayoutType.DASHBOARD,
      objectMetadataId: null,
      objectMetadataUniversalIdentifier: null,
      tabIds: [],
      tabUniversalIdentifiers: [],
      defaultTabToFocusOnMobileAndSidePanelId: null,
      defaultTabToFocusOnMobileAndSidePanelUniversalIdentifier: null,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    },
    {
      id: generateSeedId(
        workspaceId,
        PAGE_LAYOUT_SEEDS.DOCUMENTATION_STANDALONE_PAGE,
      ),
      universalIdentifier: generateSeedId(
        workspaceId,
        PAGE_LAYOUT_SEEDS.DOCUMENTATION_STANDALONE_PAGE,
      ),
      applicationId: flatApplication.id,
      applicationUniversalIdentifier: flatApplication.universalIdentifier,
      workspaceId,
      name: 'Documentation',
      type: PageLayoutType.STANDALONE_PAGE,
      objectMetadataId: null,
      objectMetadataUniversalIdentifier: null,
      tabIds: [],
      tabUniversalIdentifiers: [],
      defaultTabToFocusOnMobileAndSidePanelId: null,
      defaultTabToFocusOnMobileAndSidePanelUniversalIdentifier: null,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    },
  ];
};
