import type { ReactNode } from 'react';

import {
  IconApps,
  IconBuilding,
  IconBuildingSm,
  IconTag,
  IconTarget,
  IconUser,
  IconUserScreenSm,
  IconUserSm,
  IconUsersSm,
  IconTargetSm,
} from '../icons/DataModelIcons';

const COLOR_INDIGO_BG = '#d9e2fc';
const COLOR_INDIGO_BORDER = '#c6d4f9';
const COLOR_PURPLE_BG = '#eddbf9';
const COLOR_PURPLE_BORDER = '#e3ccf4';
const COLOR_RED_BG = '#fdd8d8';
const COLOR_RED_BORDER = '#f9c6c6';
const COLOR_GREEN_BG = '#d4f4e2';
const COLOR_GREEN_BORDER = '#b4e7cf';

export const BADGE_STANDARD_BG = '#f0f4ff';
export const BADGE_STANDARD_BORDER = '#e6edfe';
export const BADGE_STANDARD_TEXT = '#3e63dd';
export const BADGE_CUSTOM_BG = '#fff1e7';
export const BADGE_CUSTOM_BORDER = '#ffe8d7';
export const BADGE_CUSTOM_TEXT = '#f76808';

export type EntityDef = {
  expandCount: number;
  fields: { icon: ReactNode; label: string }[];
  headerIcon: ReactNode;
  iconBg: string;
  iconBorder: string;
  id: string;
  isCustom: boolean;
  label: string;
  meta: string;
  x: number;
  y: number;
};

export type ConnectionDef = {
  from: string;
  to: string;
};

export const ENTITIES: EntityDef[] = [
  {
    id: 'workspaces',
    label: 'Workspaces',
    meta: '22',
    isCustom: true,
    headerIcon: <IconUserScreenSm />,
    iconBg: COLOR_GREEN_BG,
    iconBorder: COLOR_GREEN_BORDER,
    fields: [
      { icon: <IconBuilding />, label: 'Company' },
      { icon: <IconUser />, label: 'Users' },
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
    headerIcon: <IconBuildingSm />,
    iconBg: COLOR_INDIGO_BG,
    iconBorder: COLOR_INDIGO_BORDER,
    fields: [
      { icon: <IconApps />, label: 'Workspace' },
      { icon: <IconTag />, label: '31 fields' },
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
    headerIcon: <IconUsersSm />,
    iconBg: COLOR_PURPLE_BG,
    iconBorder: COLOR_PURPLE_BORDER,
    fields: [
      { icon: <IconUser />, label: 'People' },
      { icon: <IconApps />, label: 'Workspace' },
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
    headerIcon: <IconUserSm />,
    iconBg: COLOR_INDIGO_BG,
    iconBorder: COLOR_INDIGO_BORDER,
    fields: [
      { icon: <IconBuilding />, label: 'Company' },
      { icon: <IconUser />, label: 'Users' },
      { icon: <IconTarget />, label: 'Opportunity' },
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
    headerIcon: <IconTargetSm />,
    iconBg: COLOR_RED_BG,
    iconBorder: COLOR_RED_BORDER,
    fields: [
      { icon: <IconBuilding />, label: 'Company' },
      { icon: <IconTag />, label: '12 fields' },
    ],
    expandCount: 23,
    x: 380,
    y: 190,
  },
];

export const CONNECTIONS: ConnectionDef[] = [
  { from: 'workspaces', to: 'companies' },
  { from: 'workspaces', to: 'users' },
  { from: 'users', to: 'people' },
  { from: 'companies', to: 'people' },
  { from: 'companies', to: 'opportunities' },
  { from: 'people', to: 'opportunities' },
];
