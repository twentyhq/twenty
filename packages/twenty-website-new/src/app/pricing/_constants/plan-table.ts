import type { PlanTableDataType } from '@/sections/PlanTable/types';

export const PLAN_TABLE_DATA: PlanTableDataType = {
  featureColumnLabel: 'Name',
  rows: [
    {
      featureLabel: 'Price',
      tiers: {
        organization: { kind: 'text', text: '$19' },
        pro: { kind: 'text', text: '$9' },
      },
      type: 'row',
    },
    {
      featureLabel: 'Self-hosting discount',
      tiers: {
        organization: { kind: 'text', text: 'Free for up to 20 seats' },
        pro: { kind: 'text', text: 'Free for up to 20 seats' },
      },
      type: 'row',
    },
    {
      featureLabel: 'Seats limit',
      tiers: {
        organization: { kind: 'text', text: 'Unlimited' },
        pro: { kind: 'text', text: 'Unlimited' },
      },
      type: 'row',
    },
    {
      title: 'Workspace',
      type: 'category',
    },
    {
      featureLabel: 'Custom objects',
      tiers: {
        organization: { kind: 'text', text: 'Unlimited' },
        pro: { kind: 'text', text: 'Unlimited' },
      },
      type: 'row',
    },
    {
      featureLabel: 'Custom fields',
      tiers: {
        organization: { kind: 'text', text: 'Unlimited' },
        pro: { kind: 'text', text: 'Unlimited' },
      },
      type: 'row',
    },
    {
      featureLabel: 'Custom views',
      tiers: {
        organization: { kind: 'text', text: 'Unlimited' },
        pro: { kind: 'text', text: 'Unlimited' },
      },
      type: 'row',
    },
    {
      featureLabel: 'Custom layout',
      tiers: {
        organization: { kind: 'text', text: 'Unlimited' },
        pro: { kind: 'text', text: 'Unlimited' },
      },
      type: 'row',
    },
    {
      featureLabel: 'Records',
      tiers: {
        organization: { kind: 'text', text: 'Unlimited' },
        pro: { kind: 'text', text: 'Unlimited' },
      },
      type: 'row',
    },
    {
      title: 'Reports',
      type: 'category',
    },
    {
      featureLabel: 'Number of dashboards',
      tiers: {
        organization: { kind: 'text', text: 'Unlimited' },
        pro: { kind: 'text', text: 'Unlimited' },
      },
      type: 'row',
    },
    {
      title: 'Emails & Calendar',
      type: 'category',
    },
    {
      featureLabel: 'Internet accounts per user',
      tiers: {
        organization: { kind: 'text', text: 'Unlimited' },
        pro: { kind: 'text', text: 'Unlimited' },
      },
      type: 'row',
    },
    {
      featureLabel: 'Folder/Label import',
      tiers: {
        organization: { kind: 'yes', label: 'Yes' },
        pro: { kind: 'yes', label: 'Yes' },
      },
      type: 'row',
    },
    {
      featureLabel: 'Email sharing',
      tiers: {
        organization: { kind: 'text', text: 'Fully customizable' },
        pro: { kind: 'text', text: 'Fully customizable' },
      },
      type: 'row',
    },
    {
      title: 'Automations',
      type: 'category',
    },
    {
      featureLabel: 'Workflows',
      tiers: {
        organization: { kind: 'yes', label: 'Yes' },
        pro: { kind: 'yes', label: 'Yes' },
      },
      type: 'row',
    },
    {
      featureLabel: 'AI agents',
      tiers: {
        organization: { kind: 'yes', label: 'Yes' },
        pro: { kind: 'yes', label: 'Yes' },
      },
      type: 'row',
    },
    {
      featureLabel: 'Automations credits',
      tiers: {
        organization: { kind: 'text', text: '2k' },
        pro: { kind: 'text', text: '1k' },
      },
      type: 'row',
    },
    {
      title: 'Security',
      type: 'category',
    },
    {
      featureLabel: 'User roles',
      tiers: {
        organization: { kind: 'text', text: 'Unlimited' },
        pro: { kind: 'text', text: 'Admin, Members' },
      },
      type: 'row',
    },
    {
      featureLabel: 'Read/Edit/Delete permissions',
      tiers: {
        organization: { kind: 'text', text: 'Unlimited' },
        pro: { kind: 'dash' },
      },
      type: 'row',
    },
    {
      featureLabel: 'Field-level permissions',
      tiers: {
        organization: { kind: 'text', text: 'Unlimited' },
        pro: { kind: 'dash' },
      },
      type: 'row',
    },
    {
      featureLabel: 'Row-level permissions',
      tiers: {
        organization: { kind: 'text', text: 'Unlimited' },
        pro: { kind: 'dash' },
      },
      type: 'row',
    },
    {
      featureLabel: 'SSO',
      tiers: {
        organization: { kind: 'yes', label: 'Yes' },
        pro: { kind: 'dash' },
      },
      type: 'row',
    },
    {
      featureLabel: 'Environments',
      tiers: {
        organization: { kind: 'text', text: 'Local, Production' },
        pro: { kind: 'text', text: 'Local, Production' },
      },
      type: 'row',
    },
    {
      featureLabel: 'Impersonate users',
      tiers: {
        organization: { kind: 'yes', label: 'Yes' },
        pro: { kind: 'yes', label: 'Yes' },
      },
      type: 'row',
    },
    {
      title: 'Support',
      type: 'category',
    },
    {
      featureLabel: 'Community',
      tiers: {
        organization: { kind: 'yes', label: 'Yes' },
        pro: { kind: 'yes', label: 'Yes' },
      },
      type: 'row',
    },
    {
      featureLabel: 'Help center',
      tiers: {
        organization: { kind: 'yes', label: 'Yes' },
        pro: { kind: 'yes', label: 'Yes' },
      },
      type: 'row',
    },
    {
      featureLabel: 'Email and Chat',
      tiers: {
        organization: { kind: 'yes', label: 'Yes' },
        pro: { kind: 'yes', label: 'Yes' },
      },
      type: 'row',
    },
    {
      featureLabel: 'Priority support',
      tiers: {
        organization: { kind: 'yes', label: 'Yes' },
        pro: { kind: 'dash' },
      },
      type: 'row',
    },
    {
      featureLabel: 'Professional services',
      tiers: {
        organization: { kind: 'yes', label: 'Yes' },
        pro: { kind: 'yes', label: 'Yes' },
      },
      type: 'row',
    },
    {
      title: 'Customization',
      type: 'category',
    },
    {
      featureLabel: 'Custom apps',
      tiers: {
        organization: { kind: 'text', text: 'Unlimited' },
        pro: { kind: 'text', text: 'Unlimited' },
      },
      type: 'row',
    },
    {
      featureLabel: 'Custom domain',
      tiers: {
        organization: { kind: 'yes', label: 'Yes' },
        pro: { kind: 'yes', label: 'Yes' },
      },
      type: 'row',
    },
    {
      title: 'Developers',
      type: 'category',
    },
    {
      featureLabel: 'API calls',
      tiers: {
        organization: { kind: 'text', text: '200 per minute' },
        pro: { kind: 'text', text: '100 per minute' },
      },
      type: 'row',
    },
  ],
  initialVisibleRowCount: 15,
  seeMoreFeaturesCta: {
    collapseLabel: 'Show less',
    expandLabel: 'See more features',
  },
  tierColumns: [
    { id: 'pro', label: 'Pro' },
    { id: 'organization', label: 'Organization' },
  ],
};
