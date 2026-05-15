import type { WorkflowIconName } from '../icons/WorkflowIcons';

export const COLOR_GREEN = '#30a46c';
const COLOR_AMBER = '#946800';
export const COLOR_GRAY = '#999';

export const COLOR_TEAL_BG = '#e7f9f5';
export const COLOR_GRAY_BG = '#f9f9f9';

export type NodeDef = {
  badge?: string;
  dimmed?: boolean;
  icon: WorkflowIconName;
  id: string;
  label: string;
  labelColor: string;
  type: string;
  x: number;
  y: number;
};

export type EdgeDef = {
  from: string;
  to: string;
};

const TRUNK_X = 55;
const RIGHT_X = 200;
const LEFT_X = 5;

export const NODES: NodeDef[] = [
  {
    id: 'trigger',
    type: 'Trigger',
    label: 'Record is Created',
    icon: 'playlist-add',
    labelColor: COLOR_GREEN,
    x: TRUNK_X,
    y: 16,
    badge: '1',
  },
  {
    id: 'search',
    type: 'Action',
    label: 'Search Records',
    icon: 'search',
    labelColor: COLOR_GREEN,
    x: TRUNK_X,
    y: 92,
    badge: '1',
  },
  {
    id: 'iterator',
    type: 'Flow',
    label: 'Iterator',
    icon: 'repeat',
    labelColor: COLOR_AMBER,
    x: TRUNK_X,
    y: 168,
  },
  {
    id: 'email',
    type: 'Action',
    label: 'Send Email',
    icon: 'send',
    labelColor: COLOR_AMBER,
    x: RIGHT_X,
    y: 280,
  },
  {
    id: 'update',
    type: 'Action',
    label: 'Update Record',
    icon: 'reload',
    labelColor: COLOR_GRAY,
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
    labelColor: COLOR_GREEN,
    x: RIGHT_X - 5,
    y: 400,
    badge: '1',
  },
];

export const EDGES: EdgeDef[] = [
  { from: 'trigger', to: 'search' },
  { from: 'search', to: 'iterator' },
  { from: 'iterator', to: 'update' },
  { from: 'email', to: 'create' },
];

export const ANIMATION_SEQUENCE = [
  'trigger',
  'search',
  'iterator',
  'email',
  'update',
  'create',
];

export const STEP_INTERVAL_MS = 800;
export const NODE_WIDTH = 170;
export const NODE_HEIGHT = 48;
