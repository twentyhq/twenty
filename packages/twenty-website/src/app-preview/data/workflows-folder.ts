// The Workflows folder — the two named workflows and the three list
// tables, extracted verbatim from the old data.
import { APP_PREVIEW_TONES } from '@/tokens/app-preview/app-preview-tones';

import { sharedAssetUrls } from './shared-asset-urls';
import {
  type NavbarAction,
  type SidebarFolderDef,
  type TablePageDefinition,
} from '../types';

const NAMED_WORKFLOW_NAVBAR_ACTIONS = [
  { icon: 'chevronDown', variant: 'icon' },
  { icon: 'chevronUp', variant: 'icon' },
  { icon: 'heart', variant: 'icon' },
  { icon: 'playerPause', label: 'Deactivate' },
  { icon: 'repeat', label: 'See Runs' },
  { icon: 'plus', label: 'Add a Node' },
  { icon: 'dotsVertical', trailingLabel: '\u2318K' },
] satisfies NavbarAction[];

const PEOPLE_AVATAR_URLS = sharedAssetUrls.peopleAvatars;

const WORKFLOW_LIST_TABLE: TablePageDefinition = {
  type: 'table',
  header: {
    title: 'All Workflows',
    count: 2,
  },
  columns: [
    {
      id: 'name',
      label: 'Name',
      width: 240,
      isFirstColumn: true,
    },
    { id: 'status', label: 'Status', width: 140 },
    { id: 'lastRun', label: 'Last Run', width: 200 },
  ],
  rows: [
    {
      id: 'create-company-when-adding-a-new-person',
      cells: {
        name: {
          type: 'text',
          value: 'Create company when adding a new person',
          shortLabel: 'C',
          tone: 'orange',
        },
        status: {
          type: 'select',
          color: 'green',
          value: 'Active',
        },
        lastRun: { type: 'text', value: 'Oct 24, 2023 10:00 am' },
      },
    },
    {
      id: 'nurture',
      cells: {
        name: {
          type: 'text',
          value: 'Nurture Sequence',
          shortLabel: 'N',
          tone: 'amber',
        },
        status: { type: 'select', value: 'Inactive' },
        lastRun: { type: 'text', value: 'Oct 20, 2023 3:15 pm' },
      },
    },
  ],
};

const WORKFLOW_RUNS_TABLE: TablePageDefinition = {
  type: 'table',
  header: {
    title: 'All Runs',
    count: 2,
  },
  columns: [
    {
      id: 'runId',
      label: 'Run ID',
      width: 160,
      isFirstColumn: true,
    },
    { id: 'workflow', label: 'Workflow', width: 200 },
    { id: 'status', label: 'Status', width: 120 },
    { id: 'startedAt', label: 'Started At', width: 200 },
    { id: 'duration', label: 'Duration', width: 120 },
  ],
  rows: [
    {
      id: 'run-12345',
      cells: {
        runId: {
          type: 'text',
          value: 'run_12345',
          shortLabel: 'R',
          tone: 'amber',
        },
        workflow: { type: 'text', value: 'New Lead Assignment' },
        status: {
          type: 'select',
          color: 'green',
          value: 'Success',
        },
        startedAt: {
          type: 'text',
          value: 'Oct 24, 2023 10:00 am',
        },
        duration: { type: 'text', value: '2s' },
      },
    },
    {
      id: 'run-12346',
      cells: {
        runId: {
          type: 'text',
          value: 'run_12346',
          shortLabel: 'R',
          tone: 'amber',
        },
        workflow: { type: 'text', value: 'Nurture Sequence' },
        status: { type: 'select', color: 'red', value: 'Failed' },
        startedAt: {
          type: 'text',
          value: 'Oct 20, 2023 3:15 pm',
        },
        duration: { type: 'text', value: '5s' },
      },
    },
  ],
};

const WORKFLOW_VERSIONS_TABLE: TablePageDefinition = {
  type: 'table',
  header: {
    title: 'All Versions',
    count: 2,
  },
  columns: [
    {
      id: 'version',
      label: 'Version',
      width: 120,
      isFirstColumn: true,
    },
    { id: 'workflow', label: 'Workflow', width: 200 },
    { id: 'publishedAt', label: 'Published At', width: 200 },
    { id: 'publishedBy', label: 'Published By', width: 160 },
  ],
  rows: [
    {
      id: 'v2-lead',
      cells: {
        version: {
          type: 'text',
          value: 'v2',
          shortLabel: 'V',
          tone: 'amber',
        },
        workflow: { type: 'text', value: 'New Lead Assignment' },
        publishedAt: {
          type: 'text',
          value: 'Oct 15, 2023 9:00 am',
        },
        publishedBy: {
          type: 'person',
          name: 'Ivan Zhao',
          shortLabel: 'I',
          tone: 'gray',
          kind: 'person',
          avatarUrl: PEOPLE_AVATAR_URLS.ivanZhao,
        },
      },
    },
    {
      id: 'v1-lead',
      cells: {
        version: {
          type: 'text',
          value: 'v1',
          shortLabel: 'V',
          tone: 'amber',
        },
        workflow: { type: 'text', value: 'New Lead Assignment' },
        publishedAt: {
          type: 'text',
          value: 'Sep 10, 2023 1:00 pm',
        },
        publishedBy: {
          type: 'person',
          name: 'Ivan Zhao',
          shortLabel: 'I',
          tone: 'gray',
          kind: 'person',
          avatarUrl: PEOPLE_AVATAR_URLS.ivanZhao,
        },
      },
    },
  ],
};

export const WORKFLOWS_FOLDER: SidebarFolderDef = {
  id: 'workflows',
  label: 'Workflows',
  icon: { kind: 'tabler', name: 'settingsAutomation', tone: 'orange' },
  items: [
    {
      id: 'workflow-create-company-when-adding-a-new-person',
      label: 'Create company when adding a new person',
      icon: {
        color: APP_PREVIEW_TONES.workflowAvatarInk,
        kind: 'avatar',
        label: 'C',
        tone: 'orange',
        shape: 'circle',
      },
      page: {
        type: 'workflow',
        header: {
          navbarActions: NAMED_WORKFLOW_NAVBAR_ACTIONS,
          title: 'Create company when adding a new person',
        },
      },
    },
    {
      id: 'workflow-send-email-sequence',
      hidden: true,
      label: 'Send email sequence when deal is engaged',
      icon: {
        color: APP_PREVIEW_TONES.workflowAvatarInk,
        kind: 'avatar',
        label: 'S',
        tone: 'orange',
        shape: 'circle',
      },
      page: {
        type: 'workflow',
        header: {
          navbarActions: NAMED_WORKFLOW_NAVBAR_ACTIONS,
          title: 'Send email sequence when deal is engaged',
        },
      },
    },
    {
      id: 'workflow-list',
      label: 'All Workflows',
      icon: { kind: 'tabler', name: 'settingsAutomation', tone: 'gray' },
      page: WORKFLOW_LIST_TABLE,
    },
    {
      id: 'workflow-runs',
      label: 'Workflows runs',
      icon: { kind: 'tabler', name: 'playerPlay', tone: 'gray' },
      page: WORKFLOW_RUNS_TABLE,
    },
    {
      id: 'workflow-versions',
      label: 'Workflows versions',
      icon: { kind: 'tabler', name: 'versions', tone: 'gray' },
      page: WORKFLOW_VERSIONS_TABLE,
    },
  ],
};
