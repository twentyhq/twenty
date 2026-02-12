import { v4 } from 'uuid';

import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatNavigationMenuItemMaps } from 'src/engine/metadata-modules/flat-navigation-menu-item/types/flat-navigation-menu-item-maps.type';
import { addFlatNavigationMenuItemToMapsAndUpdateIndex } from 'src/engine/metadata-modules/flat-navigation-menu-item/utils/add-flat-navigation-menu-item-to-maps-and-update-index.util';
import { type FlatView } from 'src/engine/metadata-modules/flat-view/types/flat-view.type';
import { STANDARD_NAVIGATION_MENU_ITEMS } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-navigation-menu-item.constant';
import { createStandardNavigationMenuItemFlatMetadata } from 'src/engine/workspace-manager/twenty-standard-application/utils/navigation-menu-item/create-standard-navigation-menu-item-flat-metadata.util';
import {
  createStandardNavigationMenuItemFolderFlatMetadata,
  createStandardNavigationMenuItemFolderItemFlatMetadata,
} from 'src/engine/workspace-manager/twenty-standard-application/utils/navigation-menu-item/create-standard-navigation-menu-item-folder-flat-metadata.util';

const FLAT_NAVIGATION_MENU_ITEM_NAMES = [
  'allCompanies',
  'allDashboards',
  'allNotes',
  'allOpportunities',
  'allPeople',
  'allTasks',
] as const;

const WORKFLOWS_FOLDER_ITEM_NAMES = [
  'workflowsFolderAllWorkflows',
  'workflowsFolderAllWorkflowRuns',
  'workflowsFolderAllWorkflowVersions',
] as const;

export const buildStandardFlatNavigationMenuItemMaps = ({
  now,
  workspaceId,
  twentyStandardApplicationId,
  dependencyFlatEntityMaps: { flatViewMaps },
}: {
  now: string;
  workspaceId: string;
  twentyStandardApplicationId: string;
  dependencyFlatEntityMaps: {
    flatViewMaps: FlatEntityMaps<FlatView>;
  };
}): FlatNavigationMenuItemMaps => {
  const flatNavigationMenuItemMaps: FlatNavigationMenuItemMaps = {
    ...createEmptyFlatEntityMaps(),
    byUserWorkspaceIdAndFolderId: {},
  };

  for (const navigationMenuItemName of FLAT_NAVIGATION_MENU_ITEM_NAMES) {
    const navigationMenuItemDefinition =
      STANDARD_NAVIGATION_MENU_ITEMS[navigationMenuItemName];

    const flatNavigationMenuItem = createStandardNavigationMenuItemFlatMetadata(
      {
        workspaceId,
        navigationMenuItemName,
        viewUniversalIdentifier:
          navigationMenuItemDefinition.viewUniversalIdentifier,
        position: navigationMenuItemDefinition.position,
        navigationMenuItemId: v4(),
        dependencyFlatEntityMaps: {
          flatViewMaps,
        },
        twentyStandardApplicationId,
        now,
      },
    );

    addFlatNavigationMenuItemToMapsAndUpdateIndex({
      flatNavigationMenuItem,
      flatNavigationMenuItemMaps,
    });
  }

  const workflowsFolderDefinition =
    STANDARD_NAVIGATION_MENU_ITEMS.workflowsFolder;
  const workflowsFolderId = v4();
  const workflowsFolder = createStandardNavigationMenuItemFolderFlatMetadata({
    universalIdentifier: workflowsFolderDefinition.universalIdentifier,
    name: workflowsFolderDefinition.name,
    position: workflowsFolderDefinition.position,
    navigationMenuItemId: workflowsFolderId,
    workspaceId,
    twentyStandardApplicationId,
    now,
  });

  addFlatNavigationMenuItemToMapsAndUpdateIndex({
    flatNavigationMenuItem: workflowsFolder,
    flatNavigationMenuItemMaps,
  });

  for (const folderItemName of WORKFLOWS_FOLDER_ITEM_NAMES) {
    const folderItemDefinition = STANDARD_NAVIGATION_MENU_ITEMS[folderItemName];

    const folderItem = createStandardNavigationMenuItemFolderItemFlatMetadata({
      universalIdentifier: folderItemDefinition.universalIdentifier,
      viewUniversalIdentifier: folderItemDefinition.viewUniversalIdentifier,
      folderId: workflowsFolderId,
      folderUniversalIdentifier: folderItemDefinition.folderUniversalIdentifier,
      position: folderItemDefinition.position,
      navigationMenuItemId: v4(),
      workspaceId,
      twentyStandardApplicationId,
      dependencyFlatEntityMaps: {
        flatViewMaps,
      },
      now,
    });

    addFlatNavigationMenuItemToMapsAndUpdateIndex({
      flatNavigationMenuItem: folderItem,
      flatNavigationMenuItemMaps,
    });
  }

  return flatNavigationMenuItemMaps;
};
