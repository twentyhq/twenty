import type { LayoutFieldIconType } from '../icons/LayoutIcons';

export type FieldDef = {
  icon: LayoutFieldIconType;
  id: string;
  label: string;
  section: string;
  type: string;
  visible: boolean;
};

export const FIELDS: FieldDef[] = [
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
];

export const NAV = [
  { icon: 'building', label: 'Companies', active: true, bg: '#d9e2fc' },
  { icon: 'user', label: 'People', active: false, bg: '#d9e2fc' },
  { icon: 'target', label: 'Opportunities', active: false, bg: '#fdd8d8' },
  { icon: 'checkbox', label: 'Tasks', active: false, bg: '#c7ebe5' },
  { icon: 'notes', label: 'Notes', active: false, bg: '#c7ebe5' },
  {
    icon: 'letter-S',
    label: 'Sales Dashboard',
    active: false,
    bg: '#fef2a4',
    suffix: 'Dashboard',
  },
  {
    icon: 'automation',
    label: 'Workflows',
    active: false,
    bg: '#ffdcc3',
    folder: true,
    children: [
      { icon: 'automation', label: 'Workflows', bg: '#ebebeb' },
      { icon: 'play', label: 'Workflows runs', bg: '#ebebeb' },
      { icon: 'versions', label: 'Workflows versions', bg: '#ebebeb' },
    ],
  },
  { icon: 'ai', label: 'Claude', active: false, bg: '#ebebeb' },
  {
    icon: 'stripe-S',
    label: 'Stripe',
    active: false,
    bg: '#ebebeb',
    folder: true,
  },
] as const;
