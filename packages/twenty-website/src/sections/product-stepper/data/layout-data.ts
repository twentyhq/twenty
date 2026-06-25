import { type PRODUCT_STEPPER_SCENE } from '@/tokens/feature-scenes/product-stepper-scene';

import {
  type LayoutFieldIconType,
  type LayoutNavIconType,
} from '../components/LayoutIcons';

type NavColor = keyof typeof PRODUCT_STEPPER_SCENE.navTiles;

export type LayoutFieldDefinition = {
  icon: LayoutFieldIconType;
  id: string;
  label: string;
  section: string;
  type: string;
  visible: boolean;
};

export type LayoutNavItemDefinition = {
  children?: { color: NavColor; icon: LayoutNavIconType; label: string }[];
  color: NavColor;
  icon: LayoutNavIconType;
  isActive: boolean;
  isFolder?: boolean;
  label: string;
};

export const LAYOUT_EDITOR_CONTENT: {
  fields: LayoutFieldDefinition[];
  navItems: LayoutNavItemDefinition[];
} = {
  fields: [
    {
      id: 'url',
      icon: 'link',
      label: 'URL',
      type: 'Links',
      section: 'General',
      visible: true,
    },
    {
      id: 'account-owner',
      icon: 'user',
      label: 'Account Owner',
      type: 'Relation',
      section: 'General',
      visible: true,
    },
    {
      id: 'revenue',
      icon: 'money',
      label: 'Revenue',
      type: 'Currency',
      section: 'General',
      visible: true,
    },
    {
      id: 'icp',
      icon: 'target',
      label: 'ICP',
      type: 'True/False',
      section: 'Additional',
      visible: false,
    },
    {
      id: 'employees',
      icon: 'users',
      label: 'Employees',
      type: 'Number',
      section: 'Other',
      visible: true,
    },
    {
      id: 'address',
      icon: 'map',
      label: 'Address',
      type: 'Address',
      section: 'Other',
      visible: true,
    },
    {
      id: 'creation-date',
      icon: 'calendar',
      label: 'Creation date',
      type: 'Date and Time',
      section: 'Other',
      visible: true,
    },
  ],
  navItems: [
    { icon: 'building', label: 'Companies', isActive: true, color: 'blue' },
    { icon: 'user', label: 'People', isActive: false, color: 'blue' },
    {
      icon: 'target',
      label: 'Opportunities',
      isActive: false,
      color: 'red',
    },
    { icon: 'checkbox', label: 'Tasks', isActive: false, color: 'turquoise' },
    { icon: 'notes', label: 'Notes', isActive: false, color: 'turquoise' },
    { icon: 'dashboard', label: 'Dashboards', isActive: false, color: 'gray' },
    {
      icon: 'automation',
      label: 'Workflows',
      isActive: false,
      color: 'orange',
      isFolder: true,
      children: [
        { icon: 'automation', label: 'Workflows', color: 'gray' },
        { icon: 'history', label: 'Workflow Runs', color: 'gray' },
        { icon: 'versions', label: 'Workflow Versions', color: 'gray' },
      ],
    },
  ],
};
