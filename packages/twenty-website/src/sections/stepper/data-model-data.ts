import { type PRODUCT_STEPPER_SCENE } from '@/tokens/feature-scenes/product-stepper-scene';

import {
  type DataModelFieldIcon,
  type DataModelHeaderIcon,
} from './DataModelIcons';

export type EntityTone = keyof typeof PRODUCT_STEPPER_SCENE.entityTones;

export type EntityDefinition = {
  expandCount: number;
  fields: { icon: DataModelFieldIcon; label: string }[];
  headerIcon: DataModelHeaderIcon;
  id: string;
  isCustom: boolean;
  label: string;
  meta: string;
  tone: EntityTone;
  x: number;
  y: number;
};

export type EntityConnection = {
  from: string;
  to: string;
};

// Mock fiction entity graph (product-screenshot copy, English).
export const DATA_MODEL_GRAPH: {
  connections: EntityConnection[];
  entities: EntityDefinition[];
} = {
  entities: [
    {
      id: 'workspaces',
      label: 'Workspaces',
      meta: '22',
      isCustom: true,
      headerIcon: 'userScreenSmall',
      tone: 'green',
      fields: [
        { icon: 'building', label: 'Company' },
        { icon: 'user', label: 'Users' },
      ],
      expandCount: 21,
      x: 40,
      y: 40,
    },
    {
      id: 'companies',
      label: 'Companies',
      meta: '39',
      isCustom: false,
      headerIcon: 'buildingSmall',
      tone: 'indigo',
      fields: [
        { icon: 'apps', label: 'Workspace' },
        { icon: 'tag', label: '31 fields' },
      ],
      expandCount: 8,
      x: 290,
      y: 20,
    },
    {
      id: 'users',
      label: 'Users',
      meta: '497',
      isCustom: true,
      headerIcon: 'usersSmall',
      tone: 'purple',
      fields: [
        { icon: 'user', label: 'People' },
        { icon: 'apps', label: 'Workspace' },
      ],
      expandCount: 32,
      x: 40,
      y: 310,
    },
    {
      id: 'people',
      label: 'People',
      meta: '648',
      isCustom: false,
      headerIcon: 'userSmall',
      tone: 'indigo',
      fields: [
        { icon: 'building', label: 'Company' },
        { icon: 'user', label: 'Users' },
        { icon: 'target', label: 'Opportunity' },
      ],
      expandCount: 4,
      x: 280,
      y: 400,
    },
    {
      id: 'opportunities',
      label: 'Opportunities',
      meta: '42',
      isCustom: false,
      headerIcon: 'targetSmall',
      tone: 'red',
      fields: [
        { icon: 'building', label: 'Company' },
        { icon: 'tag', label: '12 fields' },
      ],
      expandCount: 23,
      x: 380,
      y: 190,
    },
  ],
  connections: [
    { from: 'workspaces', to: 'companies' },
    { from: 'workspaces', to: 'users' },
    { from: 'users', to: 'people' },
    { from: 'companies', to: 'people' },
    { from: 'companies', to: 'opportunities' },
    { from: 'people', to: 'opportunities' },
  ],
};
