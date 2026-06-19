import { type PRODUCT_STEPPER_SCENE } from '@/tokens/feature-scenes/product-stepper-scene';

import {
  type LayoutFieldIconType,
  type LayoutNavIconType,
} from './LayoutIcons';

type NavTint = keyof typeof PRODUCT_STEPPER_SCENE.navTints;

export type LayoutFieldDefinition = {
  icon: LayoutFieldIconType;
  id: string;
  label: string;
  section: string;
  type: string;
  visible: boolean;
};

export type LayoutNavItemDefinition = {
  background: NavTint;
  children?: { background: NavTint; icon: LayoutNavIconType; label: string }[];
  icon: LayoutNavIconType;
  isActive: boolean;
  isFolder?: boolean;
  label: string;
  suffix?: string;
};

// Mock fiction layout editor content (product-screenshot copy, English).
export const LAYOUT_EDITOR_CONTENT: {
  fields: LayoutFieldDefinition[];
  navItems: LayoutNavItemDefinition[];
} = {
  fields: [
    {
      id: 'url',
      icon: 'link',
      label: 'URL',
      type: 'Link',
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
      type: 'Boolean',
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
      type: 'Date & Time',
      section: 'Other',
      visible: true,
    },
  ],
  navItems: [
    {
      icon: 'building',
      label: 'Companies',
      isActive: true,
      background: 'indigo',
    },
    { icon: 'user', label: 'People', isActive: false, background: 'indigo' },
    {
      icon: 'target',
      label: 'Opportunities',
      isActive: false,
      background: 'red',
    },
    {
      icon: 'checkbox',
      label: 'Tasks',
      isActive: false,
      background: 'teal',
    },
    { icon: 'notes', label: 'Notes', isActive: false, background: 'teal' },
    {
      icon: 'letterS',
      label: 'Sales Dashboard',
      isActive: false,
      background: 'yellow',
      suffix: 'Dashboard',
    },
    {
      icon: 'automation',
      label: 'Workflows',
      isActive: false,
      background: 'peach',
      isFolder: true,
      children: [
        { icon: 'automation', label: 'Workflows', background: 'gray' },
        { icon: 'play', label: 'Workflows runs', background: 'gray' },
        {
          icon: 'versions',
          label: 'Workflows versions',
          background: 'gray',
        },
      ],
    },
    { icon: 'ai', label: 'Claude', isActive: false, background: 'gray' },
    {
      icon: 'stripeS',
      label: 'Stripe',
      isActive: false,
      background: 'gray',
      isFolder: true,
    },
  ],
};
