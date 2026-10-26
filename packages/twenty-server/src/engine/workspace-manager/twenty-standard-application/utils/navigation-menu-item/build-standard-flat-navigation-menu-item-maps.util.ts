import { v4 } from 'uuid';

import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatNavigationMenuItemMaps } from 'src/engine/metadata-modules/flat-navigation-menu-item/types/flat-navigation-menu-item-maps.type';
import { addFlatNavigationMenuItemToMapsAndUpdateIndex } from 'src/engine/metadata-modules/flat-navigation-menu-item/utils/add-flat-navigation-menu-item-to-maps-and-update-index.util';
import { type FlatView } from 'src/engine/metadata-modules/flat-view/types/flat-view.type';
import { STANDARD_NAVIGATION_MENU_ITEMS } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-navigation-menu-item.constant';
import { createStandardNavigationMenuItemContainerFlatMetadata } from 'src/engine/workspace-manager/twenty-standard-application/utils/navigation-menu-item/create-standard-navigation-menu-item-container-flat-metadata.util';
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

const HOME_COMMAND_NAMES = ['commandsSectionSearch'] as const;

const CHATS_TAB_COMMAND_NAMES = [
  'chatsTabCommandsNewChat',
  'chatsTabCommandsSearch',
] as const;

const CHATS_TAB_SECTION_NAMES = [
  'chatsTabFavoriteChats',
  'chatsTabChannels',
  'chatsTabRecentChats',
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

  const addCommandsSection = ({
    sectionName,
    commandNames,
    folderId,
  }: {
    sectionName: 'commandsSection' | 'chatsTabCommands';
    commandNames: readonly (
      | (typeof HOME_COMMAND_NAMES)[number]
      | (typeof CHATS_TAB_COMMAND_NAMES)[number]
    )[];
    folderId: string | null;
  }) => {
    const sectionDefinition = STANDARD_NAVIGATION_MENU_ITEMS[sectionName];
    const sectionId = v4();

    addFlatNavigationMenuItemToMapsAndUpdateIndex({
      flatNavigationMenuItem:
        createStandardNavigationMenuItemContainerFlatMetadata({
          universalIdentifier: sectionDefinition.universalIdentifier,
          type: sectionDefinition.type,
          folderId,
          folderUniversalIdentifier:
            'folderUniversalIdentifier' in sectionDefinition
              ? sectionDefinition.folderUniversalIdentifier
              : null,
          position: sectionDefinition.position,
          navigationMenuItemId: sectionId,
          workspaceId,
          twentyStandardApplicationId,
          now,
        }),
      flatNavigationMenuItemMaps,
    });

    for (const commandName of commandNames) {
      const commandDefinition = STANDARD_NAVIGATION_MENU_ITEMS[commandName];

      addFlatNavigationMenuItemToMapsAndUpdateIndex({
        flatNavigationMenuItem:
          createStandardNavigationMenuItemContainerFlatMetadata({
            universalIdentifier: commandDefinition.universalIdentifier,
            type: commandDefinition.type,
            commandKey: commandDefinition.commandKey,
            folderId: sectionId,
            folderUniversalIdentifier:
              commandDefinition.folderUniversalIdentifier,
            position: commandDefinition.position,
            navigationMenuItemId: v4(),
            workspaceId,
            twentyStandardApplicationId,
            now,
          }),
        flatNavigationMenuItemMaps,
      });
    }
  };

  addCommandsSection({
    sectionName: 'commandsSection',
    commandNames: HOME_COMMAND_NAMES,
    folderId: null,
  });

  const inboxSectionDefinition = STANDARD_NAVIGATION_MENU_ITEMS.inboxSection;

  addFlatNavigationMenuItemToMapsAndUpdateIndex({
    flatNavigationMenuItem:
      createStandardNavigationMenuItemContainerFlatMetadata({
        universalIdentifier: inboxSectionDefinition.universalIdentifier,
        type: inboxSectionDefinition.type,
        position: inboxSectionDefinition.position,
        navigationMenuItemId: v4(),
        workspaceId,
        twentyStandardApplicationId,
        now,
      }),
    flatNavigationMenuItemMaps,
  });

  const workspaceSectionDefinition =
    STANDARD_NAVIGATION_MENU_ITEMS.workspaceSection;
  const workspaceSectionId = v4();

  addFlatNavigationMenuItemToMapsAndUpdateIndex({
    flatNavigationMenuItem:
      createStandardNavigationMenuItemContainerFlatMetadata({
        universalIdentifier: workspaceSectionDefinition.universalIdentifier,
        type: workspaceSectionDefinition.type,
        name: workspaceSectionDefinition.name,
        position: workspaceSectionDefinition.position,
        navigationMenuItemId: workspaceSectionId,
        workspaceId,
        twentyStandardApplicationId,
        now,
      }),
    flatNavigationMenuItemMaps,
  });

  for (const navigationMenuItemName of FLAT_NAVIGATION_MENU_ITEM_NAMES) {
    const navigationMenuItemDefinition =
      STANDARD_NAVIGATION_MENU_ITEMS[navigationMenuItemName];

    const flatNavigationMenuItem = createStandardNavigationMenuItemFlatMetadata(
      {
        workspaceId,
        navigationMenuItemName,
        viewUniversalIdentifier:
          navigationMenuItemDefinition.viewUniversalIdentifier,
        folderId: workspaceSectionId,
        folderUniversalIdentifier:
          navigationMenuItemDefinition.folderUniversalIdentifier,
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
    icon: workflowsFolderDefinition.icon,
    folderId: workspaceSectionId,
    folderUniversalIdentifier:
      workflowsFolderDefinition.folderUniversalIdentifier,
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

  const chatsTabDefinition = STANDARD_NAVIGATION_MENU_ITEMS.chatsTab;
  const chatsTabId = v4();

  addFlatNavigationMenuItemToMapsAndUpdateIndex({
    flatNavigationMenuItem:
      createStandardNavigationMenuItemContainerFlatMetadata({
        universalIdentifier: chatsTabDefinition.universalIdentifier,
        type: chatsTabDefinition.type,
        name: chatsTabDefinition.name,
        icon: chatsTabDefinition.icon,
        position: chatsTabDefinition.position,
        navigationMenuItemId: chatsTabId,
        workspaceId,
        twentyStandardApplicationId,
        now,
      }),
    flatNavigationMenuItemMaps,
  });

  addCommandsSection({
    sectionName: 'chatsTabCommands',
    commandNames: CHATS_TAB_COMMAND_NAMES,
    folderId: chatsTabId,
  });

  for (const chatsTabSectionName of CHATS_TAB_SECTION_NAMES) {
    const chatsTabSectionDefinition =
      STANDARD_NAVIGATION_MENU_ITEMS[chatsTabSectionName];

    addFlatNavigationMenuItemToMapsAndUpdateIndex({
      flatNavigationMenuItem:
        createStandardNavigationMenuItemContainerFlatMetadata({
          universalIdentifier: chatsTabSectionDefinition.universalIdentifier,
          type: chatsTabSectionDefinition.type,
          folderId: chatsTabId,
          folderUniversalIdentifier:
            chatsTabSectionDefinition.folderUniversalIdentifier,
          position: chatsTabSectionDefinition.position,
          visibleItemLimit: chatsTabSectionDefinition.visibleItemLimit,
          navigationMenuItemId: v4(),
          workspaceId,
          twentyStandardApplicationId,
          now,
        }),
      flatNavigationMenuItemMaps,
    });
  }

  return flatNavigationMenuItemMaps;
};
