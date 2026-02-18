import { STANDARD_OBJECTS } from 'twenty-shared/metadata';

export const STANDARD_NAVIGATION_MENU_ITEMS = {
  allCompanies: {
    universalIdentifier: '20202020-b001-4b01-8b01-c0aba11c0001',
    viewUniversalIdentifier:
      STANDARD_OBJECTS.company.views.allCompanies.universalIdentifier,
    position: 0,
  },
  allDashboards: {
    universalIdentifier: '20202020-b002-4b02-8b02-c0aba11c0002',
    viewUniversalIdentifier:
      STANDARD_OBJECTS.dashboard.views.allDashboards.universalIdentifier,
    position: 1,
  },
  allNotes: {
    universalIdentifier: '20202020-b003-4b03-8b03-c0aba11c0003',
    viewUniversalIdentifier:
      STANDARD_OBJECTS.note.views.allNotes.universalIdentifier,
    position: 2,
  },
  allOpportunities: {
    universalIdentifier: '20202020-b004-4b04-8b04-c0aba11c0004',
    viewUniversalIdentifier:
      STANDARD_OBJECTS.opportunity.views.allOpportunities.universalIdentifier,
    position: 3,
  },
  allPeople: {
    universalIdentifier: '20202020-b005-4b05-8b05-c0aba11c0005',
    viewUniversalIdentifier:
      STANDARD_OBJECTS.person.views.allPeople.universalIdentifier,
    position: 4,
  },
  allTasks: {
    universalIdentifier: '20202020-b006-4b06-8b06-c0aba11c0006',
    viewUniversalIdentifier:
      STANDARD_OBJECTS.task.views.allTasks.universalIdentifier,
    position: 5,
  },
  workflowsFolder: {
    universalIdentifier: '20202020-b007-4b07-8b07-c0aba11c0007',
    name: 'Workflows',
    icon: 'IconSettingsAutomation',
    position: 6,
  },
  workflowsFolderAllWorkflows: {
    universalIdentifier: '20202020-b008-4b08-8b08-c0aba11c0008',
    viewUniversalIdentifier:
      STANDARD_OBJECTS.workflow.views.allWorkflows.universalIdentifier,
    folderUniversalIdentifier: '20202020-b007-4b07-8b07-c0aba11c0007',
    position: 0,
  },
  workflowsFolderAllWorkflowRuns: {
    universalIdentifier: '20202020-b009-4b09-8b09-c0aba11c0009',
    viewUniversalIdentifier:
      STANDARD_OBJECTS.workflowRun.views.allWorkflowRuns.universalIdentifier,
    folderUniversalIdentifier: '20202020-b007-4b07-8b07-c0aba11c0007',
    position: 1,
  },
  workflowsFolderAllWorkflowVersions: {
    universalIdentifier: '20202020-b00a-4b0a-8b0a-c0aba11c000a',
    viewUniversalIdentifier:
      STANDARD_OBJECTS.workflowVersion.views.allWorkflowVersions
        .universalIdentifier,
    folderUniversalIdentifier: '20202020-b007-4b07-8b07-c0aba11c0007',
    position: 2,
  },
} as const;
