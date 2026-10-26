import { msg } from '@lingui/core/macro';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';

import { NavigationMenuItemType } from 'src/engine/metadata-modules/navigation-menu-item/enums/navigation-menu-item-type.enum';
import { i18nLabel } from 'src/engine/workspace-manager/twenty-standard-application/utils/i18n-label.util';

export const STANDARD_NAVIGATION_MENU_ITEMS = {
  inboxSection: {
    universalIdentifier: '20202020-b00d-4b0d-8b0d-c0aba11c000d',
    type: NavigationMenuItemType.AI_CHAT_TRIAGE,
    position: 0,
  },
  workspaceSection: {
    universalIdentifier: '20202020-b010-4b10-8b10-c0aba11c0010',
    type: NavigationMenuItemType.SECTION,
    name: i18nLabel(
      msg({ message: `Workspace`, context: 'navigationMenuItem.name' }),
    ),
    position: 1,
  },
  allCompanies: {
    universalIdentifier: '20202020-b001-4b01-8b01-c0aba11c0001',
    type: NavigationMenuItemType.OBJECT,
    viewUniversalIdentifier:
      STANDARD_OBJECTS.company.views.allCompanies.universalIdentifier,
    folderUniversalIdentifier: '20202020-b010-4b10-8b10-c0aba11c0010',
    position: 0,
  },
  allPeople: {
    universalIdentifier: '20202020-b005-4b05-8b05-c0aba11c0005',
    type: NavigationMenuItemType.OBJECT,
    viewUniversalIdentifier:
      STANDARD_OBJECTS.person.views.allPeople.universalIdentifier,
    folderUniversalIdentifier: '20202020-b010-4b10-8b10-c0aba11c0010',
    position: 1,
  },
  allOpportunities: {
    universalIdentifier: '20202020-b004-4b04-8b04-c0aba11c0004',
    type: NavigationMenuItemType.OBJECT,
    viewUniversalIdentifier:
      STANDARD_OBJECTS.opportunity.views.allOpportunities.universalIdentifier,
    folderUniversalIdentifier: '20202020-b010-4b10-8b10-c0aba11c0010',
    position: 2,
  },
  allTasks: {
    universalIdentifier: '20202020-b006-4b06-8b06-c0aba11c0006',
    type: NavigationMenuItemType.OBJECT,
    viewUniversalIdentifier:
      STANDARD_OBJECTS.task.views.allTasks.universalIdentifier,
    folderUniversalIdentifier: '20202020-b010-4b10-8b10-c0aba11c0010',
    position: 3,
  },
  allNotes: {
    universalIdentifier: '20202020-b003-4b03-8b03-c0aba11c0003',
    type: NavigationMenuItemType.OBJECT,
    viewUniversalIdentifier:
      STANDARD_OBJECTS.note.views.allNotes.universalIdentifier,
    folderUniversalIdentifier: '20202020-b010-4b10-8b10-c0aba11c0010',
    position: 4,
  },
  allDashboards: {
    universalIdentifier: '20202020-b002-4b02-8b02-c0aba11c0002',
    type: NavigationMenuItemType.OBJECT,
    viewUniversalIdentifier:
      STANDARD_OBJECTS.dashboard.views.allDashboards.universalIdentifier,
    folderUniversalIdentifier: '20202020-b010-4b10-8b10-c0aba11c0010',
    position: 5,
  },
  allMessageCampaigns: {
    universalIdentifier: '20202020-b00b-4b0b-8b0b-c0aba11c000b',
    type: NavigationMenuItemType.OBJECT,
    viewUniversalIdentifier:
      STANDARD_OBJECTS.messageCampaign.views.allMessageCampaigns
        .universalIdentifier,
    position: 7,
  },
  workflowsFolder: {
    universalIdentifier: '20202020-b007-4b07-8b07-c0aba11c0007',
    type: NavigationMenuItemType.FOLDER,
    name: i18nLabel(
      msg({ message: `Workflows`, context: 'navigationMenuItem.name' }),
    ),
    icon: 'IconSettingsAutomation',
    folderUniversalIdentifier: '20202020-b010-4b10-8b10-c0aba11c0010',
    position: 6,
  },
  workflowsFolderAllWorkflows: {
    universalIdentifier: '20202020-b008-4b08-8b08-c0aba11c0008',
    type: NavigationMenuItemType.OBJECT,
    viewUniversalIdentifier:
      STANDARD_OBJECTS.workflow.views.allWorkflows.universalIdentifier,
    folderUniversalIdentifier: '20202020-b007-4b07-8b07-c0aba11c0007',
    position: 0,
  },
  workflowsFolderAllWorkflowRuns: {
    universalIdentifier: '20202020-b009-4b09-8b09-c0aba11c0009',
    type: NavigationMenuItemType.OBJECT,
    viewUniversalIdentifier:
      STANDARD_OBJECTS.workflowRun.views.allWorkflowRuns.universalIdentifier,
    folderUniversalIdentifier: '20202020-b007-4b07-8b07-c0aba11c0007',
    position: 1,
  },
  workflowsFolderAllWorkflowVersions: {
    universalIdentifier: '20202020-b00a-4b0a-8b0a-c0aba11c000a',
    type: NavigationMenuItemType.OBJECT,
    viewUniversalIdentifier:
      STANDARD_OBJECTS.workflowVersion.views.allWorkflowVersions
        .universalIdentifier,
    folderUniversalIdentifier: '20202020-b007-4b07-8b07-c0aba11c0007',
    position: 2,
  },
  chatsTab: {
    universalIdentifier: '20202020-b00c-4b0c-8b0c-c0aba11c000c',
    type: NavigationMenuItemType.TAB,
    name: i18nLabel(
      msg({ message: `Chats`, context: 'navigationMenuItem.name' }),
    ),
    icon: 'IconMessage',
    position: 0,
  },
  chatsTabFavoriteChats: {
    universalIdentifier: '20202020-b00e-4b0e-8b0e-c0aba11c000e',
    type: NavigationMenuItemType.AI_CHAT_FAVORITES,
    folderUniversalIdentifier: '20202020-b00c-4b0c-8b0c-c0aba11c000c',
    position: 0,
  },
  chatsTabChannels: {
    universalIdentifier: '20202020-b011-4b11-8b11-c0aba11c0011',
    type: NavigationMenuItemType.AI_CHAT_CHANNELS,
    folderUniversalIdentifier: '20202020-b00c-4b0c-8b0c-c0aba11c000c',
    position: 1,
  },
  chatsTabRecentChats: {
    universalIdentifier: '20202020-b00f-4b0f-8b0f-c0aba11c000f',
    type: NavigationMenuItemType.AI_CHAT_RECENTS,
    folderUniversalIdentifier: '20202020-b00c-4b0c-8b0c-c0aba11c000c',
    position: 2,
  },
} as const;

export const STANDARD_NAVIGATION_MENU_ITEM_DEFAULT_COLORS: Partial<
  Record<keyof typeof STANDARD_NAVIGATION_MENU_ITEMS, string>
> = {
  allCompanies: 'blue',
  allPeople: 'blue',
  allTasks: 'turquoise',
  allNotes: 'turquoise',
  allOpportunities: 'red',
  workflowsFolder: 'orange',
  allMessageCampaigns: 'gray',
  allDashboards: 'gray',
  workflowsFolderAllWorkflows: 'gray',
  workflowsFolderAllWorkflowRuns: 'gray',
  workflowsFolderAllWorkflowVersions: 'gray',
};
