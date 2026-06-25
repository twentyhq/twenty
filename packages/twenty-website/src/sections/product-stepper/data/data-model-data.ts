import { type PRODUCT_STEPPER_SCENE } from '@/tokens/feature-scenes/product-stepper-scene';

import {
  type DataModelFieldIcon,
  type DataModelHeaderIcon,
} from '../components/DataModelIcons';

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

export const DATA_MODEL_GRAPH: {
  connections: EntityConnection[];
  entities: EntityDefinition[];
} = {
  entities: [
    {
      id: 'people',
      label: 'People',
      meta: '840',
      isCustom: false,
      headerIcon: 'userSmall',
      tone: 'green',
      fields: [
        { icon: 'building', label: 'Company' },
        { icon: 'target', label: 'Opportunities' },
      ],
      expandCount: 22,
      x: 40,
      y: 40,
    },
    {
      id: 'companies',
      label: 'Companies',
      meta: '120',
      isCustom: false,
      headerIcon: 'buildingSmall',
      tone: 'indigo',
      fields: [
        { icon: 'user', label: 'People' },
        { icon: 'target', label: 'Opportunities' },
      ],
      expandCount: 39,
      x: 330,
      y: 20,
    },
    {
      id: 'employment-history',
      label: 'Employment History',
      meta: '48',
      isCustom: true,
      headerIcon: 'briefcaseSmall',
      tone: 'purple',
      fields: [
        { icon: 'building', label: 'Company' },
        { icon: 'user', label: 'Person' },
      ],
      expandCount: 8,
      x: 40,
      y: 310,
    },
    {
      id: 'opportunities',
      label: 'Opportunities',
      meta: '64',
      isCustom: false,
      headerIcon: 'targetSmall',
      tone: 'red',
      fields: [
        { icon: 'building', label: 'Company' },
        { icon: 'user', label: 'Point of Contact' },
      ],
      expandCount: 11,
      x: 380,
      y: 190,
    },
    {
      id: 'demos',
      label: 'Demos',
      meta: '45',
      isCustom: true,
      headerIcon: 'userScreenSmall',
      tone: 'indigo',
      fields: [
        { icon: 'building', label: 'Company' },
        { icon: 'target', label: 'Opportunity' },
      ],
      expandCount: 6,
      x: 280,
      y: 400,
    },
  ],
  connections: [
    { from: 'people', to: 'companies' },
    { from: 'companies', to: 'opportunities' },
    { from: 'opportunities', to: 'demos' },
    { from: 'people', to: 'employment-history' },
  ],
};
