import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';

import { type PRODUCT_STEPPER_SCENE } from '@/tokens/feature-scenes/product-stepper-scene';

import {
  type LayoutFieldIconType,
  type LayoutNavIconType,
} from '../components/LayoutIcons';

type NavColor = keyof typeof PRODUCT_STEPPER_SCENE.navTiles;

export type LayoutFieldDefinition = {
  icon: LayoutFieldIconType;
  id: string;
  label: MessageDescriptor;
  section: string;
  type: MessageDescriptor;
  visible: boolean;
};

export type LayoutNavItemDefinition = {
  children?: {
    color: NavColor;
    icon: LayoutNavIconType;
    label: MessageDescriptor;
  }[];
  color: NavColor;
  icon: LayoutNavIconType;
  isActive: boolean;
  isFolder?: boolean;
  label: MessageDescriptor;
};

export const LAYOUT_EDITOR_CONTENT: {
  fields: LayoutFieldDefinition[];
  navItems: LayoutNavItemDefinition[];
  sectionLabels: Record<string, MessageDescriptor>;
} = {
  fields: [
    {
      id: 'url',
      icon: 'link',
      label: msg`URL`,
      type: msg`Links`,
      section: 'General',
      visible: true,
    },
    {
      id: 'account-owner',
      icon: 'user',
      label: msg`Account Owner`,
      type: msg`Relation`,
      section: 'General',
      visible: true,
    },
    {
      id: 'revenue',
      icon: 'money',
      label: msg`Revenue`,
      type: msg`Currency`,
      section: 'General',
      visible: true,
    },
    {
      id: 'icp',
      icon: 'target',
      label: msg`ICP`,
      type: msg`True/False`,
      section: 'Additional',
      visible: false,
    },
    {
      id: 'employees',
      icon: 'users',
      label: msg`Employees`,
      type: msg`Number`,
      section: 'Other',
      visible: true,
    },
    {
      id: 'address',
      icon: 'map',
      label: msg`Address`,
      type: msg`Address`,
      section: 'Other',
      visible: true,
    },
    {
      id: 'creation-date',
      icon: 'calendar',
      label: msg`Creation date`,
      type: msg`Date and Time`,
      section: 'Other',
      visible: true,
    },
  ],
  navItems: [
    { icon: 'building', label: msg`Companies`, isActive: true, color: 'blue' },
    { icon: 'user', label: msg`People`, isActive: false, color: 'blue' },
    {
      icon: 'target',
      label: msg`Opportunities`,
      isActive: false,
      color: 'red',
    },
    {
      icon: 'checkbox',
      label: msg`Tasks`,
      isActive: false,
      color: 'turquoise',
    },
    { icon: 'notes', label: msg`Notes`, isActive: false, color: 'turquoise' },
    {
      icon: 'dashboard',
      label: msg`Dashboards`,
      isActive: false,
      color: 'gray',
    },
    {
      icon: 'automation',
      label: msg`Workflows`,
      isActive: false,
      color: 'orange',
      isFolder: true,
      children: [
        { icon: 'automation', label: msg`Workflows`, color: 'gray' },
        { icon: 'history', label: msg`Workflow Runs`, color: 'gray' },
        { icon: 'versions', label: msg`Workflow Versions`, color: 'gray' },
      ],
    },
  ],
  sectionLabels: {
    Additional: msg`Additional`,
    General: msg`General`,
    Other: msg`Other`,
  },
};
