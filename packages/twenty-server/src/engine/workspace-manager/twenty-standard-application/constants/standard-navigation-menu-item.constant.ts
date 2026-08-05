import { getObjectNavigationMenuItemUniversalIdentifier } from 'twenty-shared/application';
import {
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
  STANDARD_OBJECTS,
} from 'twenty-shared/metadata';

import { NavigationMenuItemType } from 'src/engine/metadata-modules/navigation-menu-item/enums/navigation-menu-item-type.enum';
import { TWENTY_STANDARD_APPLICATION } from 'src/engine/workspace-manager/twenty-standard-application/constants/twenty-standard-applications';

// OBJECT items converge on the engine convention: the identifier is derived
// from (application, object) by objectNavigationMenuItemOnCreate, so a standard
// item and the item the engine would emit for the same object are the same row.
const getStandardObjectNavigationMenuItemUniversalIdentifier = (
  objectName: keyof typeof STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
): string =>
  getObjectNavigationMenuItemUniversalIdentifier({
    applicationUniversalIdentifier:
      TWENTY_STANDARD_APPLICATION.universalIdentifier,
    objectUniversalIdentifier:
      STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS[objectName],
  });

export const STANDARD_NAVIGATION_MENU_ITEMS = {
  allCompanies: {
    universalIdentifier:
      getStandardObjectNavigationMenuItemUniversalIdentifier('company'),
    type: NavigationMenuItemType.OBJECT,
    viewUniversalIdentifier:
      STANDARD_OBJECTS.company.views.allCompanies.universalIdentifier,
    position: 0,
  },
  allPeople: {
    universalIdentifier:
      getStandardObjectNavigationMenuItemUniversalIdentifier('person'),
    type: NavigationMenuItemType.OBJECT,
    viewUniversalIdentifier:
      STANDARD_OBJECTS.person.views.allPeople.universalIdentifier,
    position: 1,
  },
  allOpportunities: {
    universalIdentifier:
      getStandardObjectNavigationMenuItemUniversalIdentifier('opportunity'),
    type: NavigationMenuItemType.OBJECT,
    viewUniversalIdentifier:
      STANDARD_OBJECTS.opportunity.views.allOpportunities.universalIdentifier,
    position: 2,
  },
  allTasks: {
    universalIdentifier:
      getStandardObjectNavigationMenuItemUniversalIdentifier('task'),
    type: NavigationMenuItemType.OBJECT,
    viewUniversalIdentifier:
      STANDARD_OBJECTS.task.views.allTasks.universalIdentifier,
    position: 3,
  },
  allNotes: {
    universalIdentifier:
      getStandardObjectNavigationMenuItemUniversalIdentifier('note'),
    type: NavigationMenuItemType.OBJECT,
    viewUniversalIdentifier:
      STANDARD_OBJECTS.note.views.allNotes.universalIdentifier,
    position: 4,
  },
  allDashboards: {
    universalIdentifier:
      getStandardObjectNavigationMenuItemUniversalIdentifier('dashboard'),
    type: NavigationMenuItemType.OBJECT,
    viewUniversalIdentifier:
      STANDARD_OBJECTS.dashboard.views.allDashboards.universalIdentifier,
    position: 5,
  },
  allMessageCampaigns: {
    universalIdentifier:
      getStandardObjectNavigationMenuItemUniversalIdentifier('messageCampaign'),
    type: NavigationMenuItemType.OBJECT,
    viewUniversalIdentifier:
      STANDARD_OBJECTS.messageCampaign.views.allMessageCampaigns
        .universalIdentifier,
    position: 7,
  },
  workflowsFolder: {
    universalIdentifier: '20202020-b007-4b07-8b07-c0aba11c0007',
    type: NavigationMenuItemType.FOLDER,
    name: 'Workflows',
    icon: 'IconSettingsAutomation',
    position: 6,
  },
  workflowsFolderAllWorkflows: {
    universalIdentifier:
      getStandardObjectNavigationMenuItemUniversalIdentifier('workflow'),
    type: NavigationMenuItemType.OBJECT,
    viewUniversalIdentifier:
      STANDARD_OBJECTS.workflow.views.allWorkflows.universalIdentifier,
    folderUniversalIdentifier: '20202020-b007-4b07-8b07-c0aba11c0007',
    position: 0,
  },
  workflowsFolderAllWorkflowRuns: {
    universalIdentifier:
      getStandardObjectNavigationMenuItemUniversalIdentifier('workflowRun'),
    type: NavigationMenuItemType.OBJECT,
    viewUniversalIdentifier:
      STANDARD_OBJECTS.workflowRun.views.allWorkflowRuns.universalIdentifier,
    folderUniversalIdentifier: '20202020-b007-4b07-8b07-c0aba11c0007',
    position: 1,
  },
  workflowsFolderAllWorkflowVersions: {
    universalIdentifier:
      getStandardObjectNavigationMenuItemUniversalIdentifier('workflowVersion'),
    type: NavigationMenuItemType.OBJECT,
    viewUniversalIdentifier:
      STANDARD_OBJECTS.workflowVersion.views.allWorkflowVersions
        .universalIdentifier,
    folderUniversalIdentifier: '20202020-b007-4b07-8b07-c0aba11c0007',
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
