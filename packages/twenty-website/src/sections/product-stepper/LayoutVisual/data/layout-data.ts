import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';

import { type LayoutFieldDefinition } from '../types/layout-field-definition';
import { type LayoutNavItemDefinition } from '../types/layout-nav-item-definition';

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
      type: msg`Boolean`,
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
      type: msg`Date & Time`,
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
