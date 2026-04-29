import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { type FlatNavigationMenuItem } from 'src/engine/metadata-modules/flat-navigation-menu-item/types/flat-navigation-menu-item.type';
import { NavigationMenuItemType } from 'src/engine/metadata-modules/navigation-menu-item/enums/navigation-menu-item-type.enum';
import { NAVIGATION_MENU_ITEM_SEEDS } from 'src/engine/workspace-manager/dev-seeder/core/constants/navigation-menu-item-seeds.constant';
import { PAGE_LAYOUT_SEEDS } from 'src/engine/workspace-manager/dev-seeder/core/constants/page-layout-seeds.constant';
import { generateSeedId } from 'src/engine/workspace-manager/dev-seeder/core/utils/generate-seed-id.util';

export const getNavigationMenuItemFlatEntitySeeds = ({
  workspaceId,
  flatApplication,
}: {
  workspaceId: string;
  flatApplication: FlatApplication;
}): FlatNavigationMenuItem[] => {
  const now = new Date().toISOString();

  return [
    {
      id: generateSeedId(
        workspaceId,
        NAVIGATION_MENU_ITEM_SEEDS.DOCUMENTATION_PAGE,
      ),
      universalIdentifier: generateSeedId(
        workspaceId,
        NAVIGATION_MENU_ITEM_SEEDS.DOCUMENTATION_PAGE,
      ),
      applicationId: flatApplication.id,
      applicationUniversalIdentifier: flatApplication.universalIdentifier,
      workspaceId,
      type: NavigationMenuItemType.PAGE_LAYOUT,
      name: 'Star History',
      icon: 'IconStar',
      color: 'yellow',
      position: 9999,
      link: null,
      userWorkspaceId: null,
      targetRecordId: null,
      targetObjectMetadataId: null,
      targetObjectMetadataUniversalIdentifier: null,
      viewId: null,
      viewUniversalIdentifier: null,
      folderId: null,
      folderUniversalIdentifier: null,
      pageLayoutId: generateSeedId(
        workspaceId,
        PAGE_LAYOUT_SEEDS.DOCUMENTATION_STANDALONE_PAGE,
      ),
      pageLayoutUniversalIdentifier: generateSeedId(
        workspaceId,
        PAGE_LAYOUT_SEEDS.DOCUMENTATION_STANDALONE_PAGE,
      ),
      createdAt: now,
      updatedAt: now,
    },
  ];
};
