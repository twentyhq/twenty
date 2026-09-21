import { msg } from '@lingui/core/macro';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';

import { NavigationMenuItemType } from 'src/engine/metadata-modules/navigation-menu-item/enums/navigation-menu-item-type.enum';
import { i18nLabel } from 'src/engine/workspace-manager/twenty-standard-application/utils/i18n-label.util';

export const STANDARD_NAVIGATION_MENU_ITEMS = {
  allCompanies: {
    universalIdentifier: '20202020-b001-4b01-8b01-c0aba11c0001',
    type: NavigationMenuItemType.OBJECT,
    viewUniversalIdentifier:
      STANDARD_OBJECTS.company.views.allCompanies.universalIdentifier,
    position: 0,
  },
  allPeople: {
    universalIdentifier: '20202020-b005-4b05-8b05-c0aba11c0005',
    type: NavigationMenuItemType.OBJECT,
    viewUniversalIdentifier:
      STANDARD_OBJECTS.person.views.allPeople.universalIdentifier,
    position: 1,
  },
  allOpportunities: {
    universalIdentifier: '20202020-b004-4b04-8b04-c0aba11c0004',
    type: NavigationMenuItemType.OBJECT,
    viewUniversalIdentifier:
      STANDARD_OBJECTS.opportunity.views.allOpportunities.universalIdentifier,
    position: 2,
  },
  allTasks: {
    universalIdentifier: '20202020-b006-4b06-8b06-c0aba11c0006',
    type: NavigationMenuItemType.OBJECT,
    viewUniversalIdentifier:
      STANDARD_OBJECTS.task.views.allTasks.universalIdentifier,
    position: 3,
  },
  allNotes: {
    universalIdentifier: '20202020-b003-4b03-8b03-c0aba11c0003',
    type: NavigationMenuItemType.OBJECT,
    viewUniversalIdentifier:
      STANDARD_OBJECTS.note.views.allNotes.universalIdentifier,
    position: 4,
  },
  allDashboards: {
    universalIdentifier: '20202020-b002-4b02-8b02-c0aba11c0002',
    type: NavigationMenuItemType.OBJECT,
    viewUniversalIdentifier:
      STANDARD_OBJECTS.dashboard.views.allDashboards.universalIdentifier,
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
    position: 7,
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
  taskManager: {
    universalIdentifier: '20202020-b00b-4b0b-8b0b-c0aba11c000b',
    type: NavigationMenuItemType.LINK,
    name: 'Task Manager',
    link: '/task',
    icon: 'IconLayoutKanban',
    position: 8,
  },
  shiftTracker: {
    universalIdentifier: '117117dd-9191-411f-98b8-945c61c9c045',
    type: NavigationMenuItemType.LINK,
    name: 'Shifts',
    link: '/shift',
    icon: 'IconCalendarClock',
    position: 9,
  },
  allShiftTemplates: {
    universalIdentifier: 'c8404305-c783-4f36-a31e-336570455584',
    type: NavigationMenuItemType.OBJECT,
    viewUniversalIdentifier:
      STANDARD_OBJECTS.shiftTemplate.views.allShiftTemplates
        .universalIdentifier,
    position: 10,
  },
  allSpecialDays: {
    universalIdentifier: '9713ecf5-8a52-4159-8206-9909bbae94d3',
    type: NavigationMenuItemType.OBJECT,
    viewUniversalIdentifier:
      STANDARD_OBJECTS.specialDay.views.allSpecialDays.universalIdentifier,
    position: 11,
  },
  allMerchants: {
    universalIdentifier: '30e9b078-09a8-4bbe-b42f-5dbebe56fe9b',
    type: NavigationMenuItemType.OBJECT,
    viewUniversalIdentifier:
      STANDARD_OBJECTS.merchant.views.allMerchants.universalIdentifier,
    position: 12,
  },
} as const;

export const STANDARD_NAVIGATION_MENU_ITEM_DEFAULT_COLORS: Partial<
  Record<keyof typeof STANDARD_NAVIGATION_MENU_ITEMS, string>
> = {
  allCompanies: 'blue',
  allPeople: 'blue',
  allTasks: 'turquoise',
  allNotes: 'turquoise',
  allIssues: 'turquoise',
  allMerchants: 'green',
  allOpportunities: 'red',
  taskManager: 'turquoise',
  shiftTracker: 'turquoise',
  allShiftTemplates: 'turquoise',
  allSpecialDays: 'turquoise',
  workflowsFolder: 'orange',
  allMessageCampaigns: 'gray',
  allDashboards: 'gray',
  workflowsFolderAllWorkflows: 'gray',
  workflowsFolderAllWorkflowRuns: 'gray',
  workflowsFolderAllWorkflowVersions: 'gray',
};
