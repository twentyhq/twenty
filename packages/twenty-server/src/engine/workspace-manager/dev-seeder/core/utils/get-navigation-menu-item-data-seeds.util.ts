import { v4 } from 'uuid';

import { NavigationMenuItemType } from 'src/engine/metadata-modules/navigation-menu-item/enums/navigation-menu-item-type.enum';
import { NAVIGATION_MENU_ITEM_SEEDS } from 'src/engine/workspace-manager/dev-seeder/core/constants/navigation-menu-item-seeds.constant';
import { PAGE_LAYOUT_SEEDS } from 'src/engine/workspace-manager/dev-seeder/core/constants/page-layout-seeds.constant';
import { generateSeedId } from 'src/engine/workspace-manager/dev-seeder/core/utils/generate-seed-id.util';

type NavigationMenuItemSeed = {
  id: string;
  type: NavigationMenuItemType;
  name: string;
  icon: string;
  pageLayoutId: string;
  position: number;
  workspaceId: string;
  universalIdentifier: string;
  applicationId: string;
};

export const getNavigationMenuItemDataSeeds = (
  workspaceId: string,
  applicationId: string,
): NavigationMenuItemSeed[] => [
  {
    id: generateSeedId(
      workspaceId,
      NAVIGATION_MENU_ITEM_SEEDS.DOCUMENTATION_PAGE,
    ),
    type: NavigationMenuItemType.PAGE_LAYOUT,
    name: 'Documentation',
    icon: 'IconBook',
    pageLayoutId: generateSeedId(
      workspaceId,
      PAGE_LAYOUT_SEEDS.DOCUMENTATION_STANDALONE_PAGE,
    ),
    position: 7,
    workspaceId,
    universalIdentifier: v4(),
    applicationId,
  },
];
