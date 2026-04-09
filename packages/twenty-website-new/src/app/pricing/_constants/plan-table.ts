import type { PlanTableDataType } from '@/sections/PlanTable/types';

const EMAIL_OUTREACH_TASK = {
  label: 'Tasks',
  options: ['email outreach'],
  value: 'email outreach',
} as const;

export const PLAN_TABLE_DATA: PlanTableDataType = {
  featureColumnLabel: 'Feature',
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
      featureLabel: 'Self Hosting discount',
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
      featureLabel: 'AI Agent',
      tiers: {
        organization: { kind: 'yes', label: 'Yes' },
        pro: { kind: 'yes', label: 'Yes' },
      },
      type: 'row',
    },
    {
      featureLabel: 'Automation credits',
      tiers: {
        organization: { kind: 'text', text: '1,000' },
        pro: { kind: 'text', text: '1,000' },
      },
      type: 'row',
    },
    {
      featureLabel: 'Extra credits',
      tiers: {
        organization: { kind: 'dash' },
        pro: {
          kind: 'text',
          text: '1,000 for $10  -  5,000 for $48',
        },
      },
      type: 'row',
    },
    {
      calculator: {
        priceLine: {
          amount: '700€',
          label: 'Price',
          periodSuffix: '/month',
        },
        sections: [
          {
            id: 'intelligence-ai',
            modelField: {
              label: 'Model',
              options: ['GPT 5'],
              value: 'GPT 5',
            },
            requestField: { label: 'Requests', value: 100 },
            tasksField: {
              label: EMAIL_OUTREACH_TASK.label,
              options: [...EMAIL_OUTREACH_TASK.options],
              value: EMAIL_OUTREACH_TASK.value,
            },
            title: 'Intelligence AI',
          },
          {
            id: 'compute',
            requestField: { label: 'Requests', value: 100 },
            tasksField: {
              label: EMAIL_OUTREACH_TASK.label,
              options: [...EMAIL_OUTREACH_TASK.options],
              value: EMAIL_OUTREACH_TASK.value,
            },
            title: 'Compute',
          },
          {
            id: 'storage',
            requestField: { label: 'Requests', value: 100 },
            tasksField: {
              label: EMAIL_OUTREACH_TASK.label,
              options: [...EMAIL_OUTREACH_TASK.options],
              value: EMAIL_OUTREACH_TASK.value,
            },
            title: 'Storage',
          },
        ],
        visual: {
          body: {
            text: 'Estimate your costs effortlessly with our price calculator customize your workspace in just a few clicks!',
          },
          heading: [
            { fontFamily: 'serif', text: 'Get a glimpse of ' },
            { fontFamily: 'sans', text: "what it'll cost" },
          ],
        },
      },
      type: 'calculator',
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
      featureLabel: 'API access',
      tiers: {
        organization: { kind: 'yes', label: 'Yes' },
        pro: { kind: 'yes', label: 'Yes' },
      },
      type: 'row',
    },
    {
      featureLabel: 'Webhooks',
      tiers: {
        organization: { kind: 'yes', label: 'Yes' },
        pro: { kind: 'yes', label: 'Yes' },
      },
      type: 'row',
    },
    {
      title: 'Security',
      type: 'category',
    },
    {
      featureLabel: 'SSO / SAML',
      tiers: {
        organization: { kind: 'yes', label: 'Yes' },
        pro: { kind: 'dash' },
      },
      type: 'row',
    },
    {
      featureLabel: 'Audit logs',
      tiers: {
        organization: { kind: 'yes', label: 'Yes' },
        pro: { kind: 'dash' },
      },
      type: 'row',
    },
    {
      featureLabel: 'Role-based access control',
      tiers: {
        organization: { kind: 'yes', label: 'Yes' },
        pro: { kind: 'dash' },
      },
      type: 'row',
    },
  ],
  initialVisibleRowCount: 13,
  seeMoreFeaturesCta: {
    collapseLabel: 'Show less',
    expandLabel: 'See more features',
  },
  tierColumns: [
    { id: 'pro', label: 'Pro' },
    { id: 'organization', label: 'Organization' },
  ],
};
