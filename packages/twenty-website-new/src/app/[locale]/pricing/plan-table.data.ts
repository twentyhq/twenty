import { msg } from '@lingui/core/macro';
import type { PlanTableDataType } from '@/sections/PlanTable/types';

export const PLAN_TABLE_DATA: PlanTableDataType = {
  featureColumnLabel: msg`Name`,
  rows: [
    {
      featureLabel: msg`Price`,
      selfHostTiers: {
        organization: { kind: 'text', text: msg`$19` },
        pro: { kind: 'text', text: msg`$0` },
      },
      tiers: {
        organization: { kind: 'text', text: msg`$19` },
        pro: { kind: 'text', text: msg`$9` },
      },
      type: 'row',
    },
    {
      featureLabel: msg`Seats limit`,
      tiers: {
        organization: { kind: 'text', text: msg`Unlimited` },
        pro: { kind: 'text', text: msg`Unlimited` },
      },
      type: 'row',
    },
    {
      title: msg`Workspace`,
      type: 'category',
    },
    {
      featureLabel: msg`Custom objects`,
      tiers: {
        organization: { kind: 'text', text: msg`Unlimited` },
        pro: { kind: 'text', text: msg`Unlimited` },
      },
      type: 'row',
    },
    {
      featureLabel: msg`Custom fields`,
      tiers: {
        organization: { kind: 'text', text: msg`Unlimited` },
        pro: { kind: 'text', text: msg`Unlimited` },
      },
      type: 'row',
    },
    {
      featureLabel: msg`Custom views`,
      tiers: {
        organization: { kind: 'text', text: msg`Unlimited` },
        pro: { kind: 'text', text: msg`Unlimited` },
      },
      type: 'row',
    },
    {
      featureLabel: msg`View types`,
      tiers: {
        organization: { kind: 'text', text: msg`Table, Kanban, Calendar` },
        pro: { kind: 'text', text: msg`Table, Kanban, Calendar` },
      },
      type: 'row',
    },
    {
      featureLabel: msg`Custom layout`,
      tiers: {
        organization: { kind: 'text', text: msg`Unlimited` },
        pro: { kind: 'text', text: msg`Unlimited` },
      },
      type: 'row',
    },
    {
      featureLabel: msg`Records`,
      tiers: {
        organization: { kind: 'text', text: msg`Unlimited` },
        pro: { kind: 'text', text: msg`Unlimited` },
      },
      type: 'row',
    },
    {
      featureLabel: msg`CSV import & export`,
      tiers: {
        organization: { kind: 'yes', label: msg`Yes` },
        pro: { kind: 'yes', label: msg`Yes` },
      },
      type: 'row',
    },
    {
      featureLabel: msg`Languages`,
      tiers: {
        organization: { kind: 'text', text: msg`30+` },
        pro: { kind: 'text', text: msg`30+` },
      },
      type: 'row',
    },
    {
      title: msg`Reports`,
      type: 'category',
    },
    {
      featureLabel: msg`Number of dashboards`,
      tiers: {
        organization: { kind: 'text', text: msg`Unlimited` },
        pro: { kind: 'text', text: msg`Unlimited` },
      },
      type: 'row',
    },
    {
      title: msg`Emails & Calendar`,
      type: 'category',
    },
    {
      featureLabel: msg`Internet accounts per user`,
      tiers: {
        organization: { kind: 'text', text: msg`Unlimited` },
        pro: { kind: 'text', text: msg`Unlimited` },
      },
      type: 'row',
    },
    {
      featureLabel: msg`Folder/Label import`,
      tiers: {
        organization: { kind: 'yes', label: msg`Yes` },
        pro: { kind: 'yes', label: msg`Yes` },
      },
      type: 'row',
    },
    {
      featureLabel: msg`Email sharing`,
      tiers: {
        organization: { kind: 'text', text: msg`Fully customizable` },
        pro: { kind: 'text', text: msg`Fully customizable` },
      },
      type: 'row',
    },
    {
      title: msg`AI & Automations`,
      type: 'category',
    },
    {
      featureLabel: msg`Workflows`,
      tiers: {
        organization: { kind: 'yes', label: msg`Yes` },
        pro: { kind: 'yes', label: msg`Yes` },
      },
      type: 'row',
    },
    {
      featureLabel: msg`AI agents`,
      tiers: {
        organization: { kind: 'yes', label: msg`Yes` },
        pro: { kind: 'yes', label: msg`Yes` },
      },
      type: 'row',
    },
    {
      featureLabel: msg`Custom AI models`,
      tiers: {
        organization: { kind: 'yes', label: msg`Yes` },
        pro: { kind: 'dash' },
      },
      type: 'row',
    },
    {
      title: msg`Security`,
      type: 'category',
    },
    {
      featureLabel: msg`Two-factor authentication`,
      tiers: {
        organization: { kind: 'yes', label: msg`Yes` },
        pro: { kind: 'yes', label: msg`Yes` },
      },
      type: 'row',
    },
    {
      featureLabel: msg`User roles`,
      tiers: {
        organization: { kind: 'text', text: msg`Unlimited` },
        pro: { kind: 'text', text: msg`Unlimited` },
      },
      type: 'row',
    },
    {
      featureLabel: msg`Read/Edit/Delete permissions`,
      tiers: {
        organization: { kind: 'text', text: msg`Unlimited` },
        pro: { kind: 'text', text: msg`Unlimited` },
      },
      type: 'row',
    },
    {
      featureLabel: msg`Field-level permissions`,
      tiers: {
        organization: { kind: 'text', text: msg`Unlimited` },
        pro: { kind: 'text', text: msg`Unlimited` },
      },
      type: 'row',
    },
    {
      featureLabel: msg`Row-level permissions`,
      tiers: {
        organization: { kind: 'text', text: msg`Unlimited` },
        pro: { kind: 'dash' },
      },
      type: 'row',
    },
    {
      featureLabel: msg`SSO`,
      tiers: {
        organization: { kind: 'yes', label: msg`Yes` },
        pro: { kind: 'dash' },
      },
      type: 'row',
    },
    {
      featureLabel: msg`Advanced Encryption`,
      tiers: {
        organization: { kind: 'yes', label: msg`Yes` },
        pro: { kind: 'dash' },
      },
      type: 'row',
    },
    {
      featureLabel: msg`Audit logs`,
      tiers: {
        organization: { kind: 'yes', label: msg`Yes` },
        pro: { kind: 'dash' },
      },
      type: 'row',
    },
    {
      featureLabel: msg`Environments`,
      tiers: {
        organization: { kind: 'text', text: msg`Local, Production` },
        pro: { kind: 'text', text: msg`Local, Production` },
      },
      type: 'row',
    },
    {
      featureLabel: msg`Impersonate users`,
      tiers: {
        organization: { kind: 'yes', label: msg`Yes` },
        pro: { kind: 'yes', label: msg`Yes` },
      },
      type: 'row',
    },
    {
      title: msg`Support`,
      type: 'category',
    },
    {
      featureLabel: msg`Community`,
      tiers: {
        organization: { kind: 'yes', label: msg`Yes` },
        pro: { kind: 'yes', label: msg`Yes` },
      },
      type: 'row',
    },
    {
      featureLabel: msg`Help center`,
      tiers: {
        organization: { kind: 'yes', label: msg`Yes` },
        pro: { kind: 'yes', label: msg`Yes` },
      },
      type: 'row',
    },
    {
      featureLabel: msg`Email and Chat`,
      selfHostTiers: {
        organization: { kind: 'yes', label: msg`Yes` },
        pro: { kind: 'dash' },
      },
      tiers: {
        organization: { kind: 'yes', label: msg`Yes` },
        pro: { kind: 'yes', label: msg`Yes` },
      },
      type: 'row',
    },
    {
      featureLabel: msg`Priority support`,
      tiers: {
        organization: { kind: 'yes', label: msg`Yes` },
        pro: { kind: 'dash' },
      },
      type: 'row',
    },
    {
      featureLabel: msg`Onboarding Packs`,
      selfHostTiers: {
        organization: { kind: 'yes', label: msg`Yes` },
        pro: { kind: 'dash' },
      },
      tiers: {
        organization: { kind: 'yes', label: msg`Yes` },
        pro: { kind: 'yes', label: msg`Yes` },
      },
      type: 'row',
    },
    {
      featureLabel: msg`Implementation partners`,
      tiers: {
        organization: { kind: 'yes', label: msg`Yes` },
        pro: { kind: 'dash' },
      },
      type: 'row',
    },
    {
      title: msg`Customization`,
      type: 'category',
    },
    {
      featureLabel: msg`Custom apps`,
      tiers: {
        organization: { kind: 'text', text: msg`Unlimited` },
        pro: { kind: 'text', text: msg`Unlimited` },
      },
      type: 'row',
    },
    {
      appliesTo: 'cloud',
      featureLabel: msg`Subdomain (yourco.twenty.com)`,
      tiers: {
        organization: { kind: 'yes', label: msg`Yes` },
        pro: { kind: 'yes', label: msg`Yes` },
      },
      type: 'row',
    },
    {
      appliesTo: 'cloud',
      featureLabel: msg`Custom domain (crm.yourco.com)`,
      tiers: {
        organization: { kind: 'yes', label: msg`Yes` },
        pro: { kind: 'yes', label: msg`Yes` },
      },
      type: 'row',
    },
    {
      title: msg`Developers`,
      type: 'category',
    },
    {
      featureLabel: msg`REST & GraphQL API`,
      tiers: {
        organization: { kind: 'yes', label: msg`Yes` },
        pro: { kind: 'yes', label: msg`Yes` },
      },
      type: 'row',
    },
    {
      featureLabel: msg`Webhooks`,
      tiers: {
        organization: { kind: 'yes', label: msg`Yes` },
        pro: { kind: 'yes', label: msg`Yes` },
      },
      type: 'row',
    },
    {
      featureLabel: msg`MCP server`,
      tiers: {
        organization: { kind: 'yes', label: msg`Yes` },
        pro: { kind: 'yes', label: msg`Yes` },
      },
      type: 'row',
    },
    {
      featureLabel: msg`Install shared tarball app`,
      tiers: {
        organization: { kind: 'yes', label: msg`Yes` },
        pro: { kind: 'dash' },
      },
      type: 'row',
    },
    {
      appliesTo: 'cloud',
      featureLabel: msg`API calls`,
      tiers: {
        organization: { kind: 'text', text: msg`200 per minute` },
        pro: { kind: 'text', text: msg`100 per minute` },
      },
      type: 'row',
    },
    {
      appliesTo: 'selfHost',
      title: msg`Self-hosting`,
      type: 'category',
    },
    {
      appliesTo: 'selfHost',
      featureLabel: msg`Source code access`,
      tiers: {
        organization: { kind: 'yes', label: msg`Yes` },
        pro: { kind: 'yes', label: msg`Yes` },
      },
      type: 'row',
    },
    {
      appliesTo: 'selfHost',
      featureLabel: msg`Commercial license (no AGPL obligations)`,
      tiers: {
        organization: { kind: 'yes', label: msg`Yes` },
        pro: { kind: 'dash' },
      },
      type: 'row',
    },
  ],
  initialVisibleRowCount: 15,
  seeMoreFeaturesCta: {
    collapseLabel: msg`Show less`,
    expandLabel: msg`See more features`,
  },
  tierColumns: [
    { id: 'pro', label: msg`Pro` },
    { id: 'organization', label: msg`Organization` },
  ],
};
