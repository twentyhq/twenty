import { type WorkflowIconName } from '../components/WorkflowIcons';

export type WorkflowNodeDefinition = {
  accent: 'blue' | 'gray' | 'green' | 'pink' | 'red';
  icon: WorkflowIconName;
  id: string;
  label: string;
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
      accent: 'blue',
      x: TRUNK_X,
      y: 16,
    },
    {
      id: 'filter',
      type: 'Action',
      label: 'Filter',
      icon: 'filter',
      accent: 'green',
      x: TRUNK_X,
      y: 136,
    },
    {
      id: 'search',
      type: 'Action',
      label: 'Search Records',
      icon: 'search',
      accent: 'gray',
      x: TRUNK_X,
      y: 256,
    },
    {
      id: 'ai',
      type: 'Action',
      label: 'AI Agent',
      icon: 'brain',
      accent: 'pink',
      x: TRUNK_X,
      y: 376,
    },
    {
      id: 'update',
      type: 'Action',
      label: 'Update Record',
      icon: 'reload',
      accent: 'gray',
      x: LEFT_X,
      y: 496,
    },
    {
      id: 'email',
      type: 'Action',
      label: 'Send Email',
      icon: 'send',
      accent: 'red',
      x: TRUNK_X,
      y: 496,
    },
    {
      id: 'create',
      type: 'Action',
      label: 'Create Record',
      icon: 'plus',
      accent: 'gray',
      x: RIGHT_X,
      y: 496,
    },
  ],
  edges: [
    { from: 'trigger', to: 'filter' },
    { from: 'filter', to: 'search' },
    { from: 'search', to: 'ai' },
    { from: 'ai', to: 'update' },
    { from: 'ai', to: 'email' },
    { from: 'ai', to: 'create' },
  ],
  animationSequence: [
    'trigger',
    'filter',
    'search',
    'ai',
    'update',
    'email',
    'create',
  ],
  stepIntervalMs: 800,
  nodeWidthPx: 170,
  nodeHeightPx: 48,
};
