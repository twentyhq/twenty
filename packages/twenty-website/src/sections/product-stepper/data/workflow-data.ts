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

const TRUNK_X = 55;
const RIGHT_X = 200;
const LEFT_X = 5;

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
      id: 'search',
      type: 'Action',
      label: 'Search Records',
      icon: 'search',
      labelTone: 'green',
      x: TRUNK_X,
      y: 92,
      badge: '1',
    },
    {
      id: 'iterator',
      type: 'Flow',
      label: 'Iterator',
      icon: 'repeat',
      labelTone: 'amber',
      x: TRUNK_X,
      y: 168,
    },
    {
      id: 'email',
      type: 'Action',
      label: 'Send Email',
      icon: 'send',
      labelTone: 'amber',
      x: RIGHT_X,
      y: 280,
    },
    {
      id: 'update',
      type: 'Action',
      label: 'Update Record',
      icon: 'reload',
      labelTone: 'gray',
      x: LEFT_X,
      y: 340,
      badge: '3',
      dimmed: true,
    },
    {
      id: 'create',
      type: 'Action',
      label: 'Create Record',
      icon: 'plus',
      labelTone: 'green',
      x: RIGHT_X - 5,
      y: 400,
      badge: '1',
    },
  ],
  edges: [
    { from: 'trigger', to: 'search' },
    { from: 'search', to: 'iterator' },
    { from: 'iterator', to: 'update' },
    { from: 'email', to: 'create' },
  ],
  animationSequence: [
    'trigger',
    'search',
    'iterator',
    'email',
    'update',
    'create',
  ],
  stepIntervalMs: 800,
  nodeWidthPx: 170,
  nodeHeightPx: 48,
};
