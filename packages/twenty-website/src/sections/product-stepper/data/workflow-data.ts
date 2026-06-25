import { type WorkflowIconName } from '../components/WorkflowIcons';

export type WorkflowNodeDefinition = {
  badge?: string;
  dimmed?: boolean;
  icon: WorkflowIconName;
  id: string;
  label: string;
  labelTone: 'amber' | 'gray' | 'green';
  type: string;
  x: number;
  y: number;
};

export type WorkflowEdgeDefinition = {
  from: string;
  to: string;
};

const TRUNK_X = 185;
const LEFT_X = 10;
const RIGHT_X = 360;

export const WORKFLOW_GRAPH: {
  animationSequence: string[];
  edges: WorkflowEdgeDefinition[];
  nodeHeightPx: number;
  nodeWidthPx: number;
  nodes: WorkflowNodeDefinition[];
  stepIntervalMs: number;
} = {
  nodes: [
    {
      id: 'trigger',
      type: 'Trigger',
      label: 'Record is Created',
      icon: 'playlistAdd',
      labelTone: 'green',
      x: TRUNK_X,
      y: 16,
      badge: '1',
    },
    {
      id: 'filter',
      type: 'Flow',
      label: 'Filter',
      icon: 'filter',
      labelTone: 'amber',
      x: TRUNK_X,
      y: 86,
      badge: '1',
    },
    {
      id: 'search',
      type: 'Action',
      label: 'Search Records',
      icon: 'search',
      labelTone: 'green',
      x: TRUNK_X,
      y: 156,
      badge: '1',
    },
    {
      id: 'iterator',
      type: 'Flow',
      label: 'Iterator',
      icon: 'repeat',
      labelTone: 'amber',
      x: TRUNK_X,
      y: 226,
    },
    {
      id: 'update',
      type: 'Action',
      label: 'Update Record',
      icon: 'reload',
      labelTone: 'gray',
      x: LEFT_X,
      y: 312,
      badge: '3',
      dimmed: true,
    },
    {
      id: 'ai',
      type: 'Action',
      label: 'AI Agent',
      icon: 'sparkles',
      labelTone: 'green',
      x: TRUNK_X,
      y: 312,
      badge: '1',
    },
    {
      id: 'email',
      type: 'Action',
      label: 'Send Email',
      icon: 'send',
      labelTone: 'amber',
      x: TRUNK_X,
      y: 386,
    },
    {
      id: 'create',
      type: 'Action',
      label: 'Create Record',
      icon: 'plus',
      labelTone: 'green',
      x: RIGHT_X,
      y: 312,
      badge: '1',
    },
  ],
  edges: [
    { from: 'trigger', to: 'filter' },
    { from: 'filter', to: 'search' },
    { from: 'search', to: 'iterator' },
    { from: 'iterator', to: 'update' },
    { from: 'iterator', to: 'ai' },
    { from: 'iterator', to: 'create' },
    { from: 'ai', to: 'email' },
  ],
  animationSequence: [
    'trigger',
    'filter',
    'search',
    'iterator',
    'update',
    'ai',
    'email',
    'create',
  ],
  stepIntervalMs: 800,
  nodeWidthPx: 170,
  nodeHeightPx: 48,
};
