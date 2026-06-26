import { msg } from '@lingui/core/macro';

import { type EntityConnection } from '../types/entity-connection';
import { type EntityDefinition } from '../types/entity-definition';

export const DATA_MODEL_GRAPH: {
  connections: EntityConnection[];
  entities: EntityDefinition[];
} = {
  entities: [
    {
      id: 'people',
      label: msg`People`,
      meta: '840',
      isCustom: false,
      headerIcon: 'userSmall',
      tone: 'green',
      fields: [
        { id: 'company', icon: 'building', label: msg`Company` },
        { id: 'opportunities', icon: 'target', label: msg`Opportunities` },
      ],
      expandCount: 22,
      x: 40,
      y: 40,
    },
    {
      id: 'companies',
      label: msg`Companies`,
      meta: '120',
      isCustom: false,
      headerIcon: 'buildingSmall',
      tone: 'indigo',
      fields: [
        { id: 'people', icon: 'user', label: msg`People` },
        { id: 'opportunities', icon: 'target', label: msg`Opportunities` },
      ],
      expandCount: 39,
      x: 330,
      y: 20,
    },
    {
      id: 'employment-history',
      label: msg`Employment History`,
      meta: '48',
      isCustom: true,
      headerIcon: 'briefcaseSmall',
      tone: 'purple',
      fields: [
        { id: 'company', icon: 'building', label: msg`Company` },
        { id: 'person', icon: 'user', label: msg`Person` },
      ],
      expandCount: 8,
      x: 40,
      y: 310,
    },
    {
      id: 'opportunities',
      label: msg`Opportunities`,
      meta: '64',
      isCustom: false,
      headerIcon: 'targetSmall',
      tone: 'red',
      fields: [
        { id: 'company', icon: 'building', label: msg`Company` },
        { id: 'point-of-contact', icon: 'user', label: msg`Point of Contact` },
      ],
      expandCount: 11,
      x: 380,
      y: 190,
    },
    {
      id: 'demos',
      label: msg`Demos`,
      meta: '45',
      isCustom: true,
      headerIcon: 'userScreenSmall',
      tone: 'indigo',
      fields: [
        { id: 'company', icon: 'building', label: msg`Company` },
        { id: 'opportunity', icon: 'target', label: msg`Opportunity` },
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
