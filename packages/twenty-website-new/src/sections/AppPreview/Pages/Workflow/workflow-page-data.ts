import {
  IconCode,
  IconFilter,
  IconPlug,
  IconPlus,
  IconRepeat,
  IconSearch,
  IconSitemap,
} from '@tabler/icons-react';

import { WORKFLOW_PAGE_COLORS } from './workflow-page-theme';

export type WorkflowNodeDefinition = {
  Icon: typeof IconPlug;
  id: string;
  iconColor: string;
  label: 'Trigger' | 'Action';
  title: string;
  width: number;
  x: number;
  y: number;
};

export type WorkflowBranchLabel = {
  text: string;
  x: number;
  y: number;
};

export type WorkflowEdgeDefinition = {
  from: string;
  to: string;
  type: 'branch' | 'curve' | 'vertical';
};

export const workflowNodes: WorkflowNodeDefinition[] = [
  {
    id: 'trigger',
    x: 370,
    y: 80,
    width: 238,
    label: 'Trigger',
    title: 'Record is created or updated',
    Icon: IconPlug,
    iconColor: WORKFLOW_PAGE_COLORS.nodeTriggerIcon,
  },
  {
    id: 'is-personal-email',
    x: 620,
    y: 210,
    width: 220,
    label: 'Action',
    title: 'Is this a personal email?',
    Icon: IconCode,
    iconColor: WORKFLOW_PAGE_COLORS.nodeActionIcon,
  },
  {
    id: 'if-business-email',
    x: 640,
    y: 340,
    width: 180,
    label: 'Action',
    title: 'If business email',
    Icon: IconFilter,
    iconColor: WORKFLOW_PAGE_COLORS.nodeIconFallback,
  },
  {
    id: 'extract-domain',
    x: 620,
    y: 470,
    width: 220,
    label: 'Action',
    title: 'Extract domain from email',
    Icon: IconCode,
    iconColor: WORKFLOW_PAGE_COLORS.nodeActionIcon,
  },
  {
    id: 'search-company',
    x: 640,
    y: 600,
    width: 180,
    label: 'Action',
    title: 'Search Company',
    Icon: IconSearch,
    iconColor: WORKFLOW_PAGE_COLORS.nodeIconFallback,
  },
  {
    id: 'find-exact-match',
    x: 610,
    y: 730,
    width: 240,
    label: 'Action',
    title: 'Find exact company match',
    Icon: IconCode,
    iconColor: WORKFLOW_PAGE_COLORS.nodeActionIcon,
  },
  {
    id: 'company-already-exists',
    x: 600,
    y: 860,
    width: 260,
    label: 'Action',
    title: 'If a company already exists',
    Icon: IconSitemap,
    iconColor: WORKFLOW_PAGE_COLORS.nodeIconFallback,
  },
  {
    id: 'attach-existing-company',
    x: 370,
    y: 990,
    width: 240,
    label: 'Action',
    title: 'Attach person to existing company',
    Icon: IconRepeat,
    iconColor: WORKFLOW_PAGE_COLORS.nodeIconFallback,
  },
  {
    id: 'create-company',
    x: 840,
    y: 990,
    width: 220,
    label: 'Action',
    title: 'Create a new company',
    Icon: IconPlus,
    iconColor: WORKFLOW_PAGE_COLORS.nodeIconFallback,
  },
  {
    id: 'attach-created-company',
    x: 850,
    y: 1120,
    width: 240,
    label: 'Action',
    title: 'Attach person to this company',
    Icon: IconRepeat,
    iconColor: WORKFLOW_PAGE_COLORS.nodeIconFallback,
  },
];

export const workflowEdges: WorkflowEdgeDefinition[] = [
  {
    from: 'trigger',
    to: 'is-personal-email',
    type: 'curve',
  },
  {
    from: 'is-personal-email',
    to: 'if-business-email',
    type: 'vertical',
  },
  {
    from: 'if-business-email',
    to: 'extract-domain',
    type: 'vertical',
  },
  {
    from: 'extract-domain',
    to: 'search-company',
    type: 'vertical',
  },
  {
    from: 'search-company',
    to: 'find-exact-match',
    type: 'vertical',
  },
  {
    from: 'find-exact-match',
    to: 'company-already-exists',
    type: 'vertical',
  },
  {
    from: 'company-already-exists',
    to: 'attach-existing-company',
    type: 'branch',
  },
  {
    from: 'company-already-exists',
    to: 'create-company',
    type: 'branch',
  },
  {
    from: 'create-company',
    to: 'attach-created-company',
    type: 'vertical',
  },
];

export const workflowBranchLabels: WorkflowBranchLabel[] = [
  { x: 566, y: 944, text: 'if' },
  { x: 820, y: 944, text: 'else' },
];
