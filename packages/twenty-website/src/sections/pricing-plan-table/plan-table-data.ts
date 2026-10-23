import { msg } from '@lingui/core/macro';

import { type PlanTableDataType } from './plan-table-types';

export const PLAN_TABLE_DATA: PlanTableDataType = {
  featureColumnLabel: msg`Name`,
  initialVisibleRowCount: 15,
  rows: [
    { title: msg`Plan essentials`, type: 'category' },
    {
      featureLabel: msg`Price`,
      selfHostTiers: {
        enterprise: {
          kind: 'metric',
          prefix: msg`From`,
          unit: msg`/year`,
          value: msg`$50k`,
        },
        organization: {
          kind: 'metric',
          unit: msg`/user/month`,
          value: msg`$19`,
        },
        pro: { kind: 'metric', unit: msg`/user/month`, value: msg`$0` },
      },
      tiers: {
        enterprise: {
          kind: 'metric',
          prefix: msg`From`,
          unit: msg`/year`,
          value: msg`$50k`,
        },
        organization: {
          kind: 'metric',
          unit: msg`/user/month`,
          value: msg`$39`,
        },
        pro: { kind: 'metric', unit: msg`/user/month`, value: msg`$9` },
      },
      type: 'row',
    },
    {
      appliesTo: 'cloud',
      featureLabel: msg`Personal AI usage`,
      tiers: {
        enterprise: { kind: 'text', text: msg`Custom` },
        organization: {
          detail: msg`per member`,
          kind: 'metric',
          unit: msg`AI tasks/week`,
          value: msg`≈ 500`,
        },
        pro: {
          detail: msg`per member`,
          kind: 'metric',
          unit: msg`AI tasks/week`,
          value: msg`≈ 100`,
        },
      },
      tooltip: msg`Each member's own AI allowance, renewed every Monday. An AI task is one chat request, estimated with the default model; smarter models use more. When it runs out, chat continues on workspace credits unless an admin turns that off.`,
      type: 'row',
    },
    {
      appliesTo: 'cloud',
      featureLabel: msg`Workspace credits`,
      tiers: {
        enterprise: { kind: 'text', text: msg`Custom` },
        organization: {
          detail: msg`≈ 40,000 workflow steps`,
          kind: 'metric',
          unit: msg`credits/user/month`,
          value: msg`4`,
        },
        pro: {
          detail: msg`≈ 10,000 workflow steps`,
          kind: 'metric',
          unit: msg`credit/user/month`,
          value: msg`1`,
        },
      },
      tooltip: msg`Monthly credits shared by the workspace for workflows, AI agents and apps. 1 credit covers 10,000 workflow steps.`,
      type: 'row',
    },
    {
      featureLabel: msg`Permissions`,
      selfHostTiers: {
        organization: {
          kind: 'text',
          suffix: msg`down to fields and rows`,
          text: msg`Custom roles`,
        },
        pro: {
          kind: 'text',
          suffix: msg`down to fields`,
          text: msg`Custom roles`,
        },
      },
      tiers: {
        organization: {
          kind: 'text',
          suffix: msg`down to fields and rows`,
          text: msg`Custom roles`,
        },
        pro: { kind: 'text', text: msg`Admin & Member` },
      },
      type: 'row',
    },
    {
      featureLabel: msg`SSO`,
      tiers: {
        enterprise: { kind: 'text', text: msg`SAML/OIDC + SCIM` },
        organization: { kind: 'text', text: msg`SAML/OIDC` },
        pro: { kind: 'text', text: msg`No` },
      },
      type: 'row',
    },
    {
      featureLabel: msg`Support`,
      selfHostTiers: {
        enterprise: { kind: 'text', text: msg`Dedicated, with SLA` },
        organization: { kind: 'text', text: msg`Priority` },
        pro: { kind: 'text', text: msg`Community` },
      },
      tiers: {
        enterprise: { kind: 'text', text: msg`Dedicated, with SLA` },
        organization: { kind: 'text', text: msg`Priority` },
        pro: { kind: 'text', text: msg`Email and chat` },
      },
      type: 'row',
    },
    { title: msg`Workspace`, type: 'category' },
    {
      featureLabel: msg`Seats limit`,
      tiers: {
        organization: { kind: 'unlimited' },
        pro: { kind: 'unlimited' },
      },
      type: 'row',
    },
    {
      featureLabel: msg`Custom objects`,
      tiers: {
        organization: { kind: 'unlimited' },
        pro: { kind: 'unlimited' },
      },
      type: 'row',
    },
    {
      featureLabel: msg`Custom fields`,
      tiers: {
        organization: { kind: 'unlimited' },
        pro: { kind: 'unlimited' },
      },
      type: 'row',
    },
    {
      featureLabel: msg`Custom views`,
      tiers: {
        organization: { kind: 'unlimited' },
        pro: { kind: 'unlimited' },
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
        organization: { kind: 'unlimited' },
        pro: { kind: 'unlimited' },
      },
      type: 'row',
    },
    {
      featureLabel: msg`Records`,
      tiers: {
        organization: { kind: 'unlimited' },
        pro: { kind: 'unlimited' },
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
    { title: msg`Reports`, type: 'category' },
    {
      featureLabel: msg`Number of dashboards`,
      tiers: {
        organization: { kind: 'unlimited' },
        pro: { kind: 'unlimited' },
      },
      type: 'row',
    },
    { title: msg`Emails & Calendar`, type: 'category' },
    {
      featureLabel: msg`Internet accounts per user`,
      tiers: {
        organization: { kind: 'unlimited' },
        pro: { kind: 'unlimited' },
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
    { title: msg`AI & Automations`, type: 'category' },
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
      appliesTo: 'selfHost',
      featureLabel: msg`Custom AI models`,
      tiers: {
        organization: { kind: 'yes', label: msg`Yes` },
        pro: { kind: 'dash' },
      },
      type: 'row',
    },
    {
      appliesTo: 'cloud',
      featureLabel: msg`Extra credits`,
      tiers: {
        enterprise: { kind: 'text', text: msg`Custom` },
        organization: {
          detail: msg`$1 per credit, from $20/month`,
          kind: 'text',
          text: msg`Credit packs`,
        },
        pro: {
          detail: msg`$1 per credit, from $20/month`,
          kind: 'text',
          text: msg`Credit packs`,
        },
      },
      tooltip: msg`Add a credit pack to your monthly or yearly plan. Unused pack credits roll over, up to twice the pack.`,
      type: 'row',
    },
    { title: msg`Security`, type: 'category' },
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
      selfHostTiers: {
        organization: { kind: 'unlimited' },
        pro: { kind: 'unlimited' },
      },
      tiers: {
        organization: { kind: 'unlimited' },
        pro: { kind: 'text', text: msg`Admin & Member` },
      },
      type: 'row',
    },
    {
      featureLabel: msg`Read/Edit/Delete permissions`,
      selfHostTiers: {
        organization: { kind: 'unlimited' },
        pro: { kind: 'unlimited' },
      },
      tiers: {
        organization: { kind: 'unlimited' },
        pro: { kind: 'dash' },
      },
      type: 'row',
    },
    {
      featureLabel: msg`Field-level permissions`,
      selfHostTiers: {
        organization: { kind: 'unlimited' },
        pro: { kind: 'unlimited' },
      },
      tiers: {
        organization: { kind: 'unlimited' },
        pro: { kind: 'dash' },
      },
      type: 'row',
    },
    {
      featureLabel: msg`Row-level permissions`,
      tiers: {
        organization: { kind: 'unlimited' },
        pro: { kind: 'dash' },
      },
      type: 'row',
    },
    {
      featureLabel: msg`Encryption key rotation`,
      tiers: {
        organization: { kind: 'yes', label: msg`Yes` },
        pro: { kind: 'dash' },
      },
      type: 'row',
    },
    {
      featureLabel: msg`Record change logs`,
      tiers: {
        organization: { kind: 'yes', label: msg`Yes` },
        pro: { kind: 'yes', label: msg`Yes` },
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
      featureLabel: msg`Log retention`,
      tiers: {
        organization: { kind: 'text', text: msg`Custom, up to 3 years` },
        pro: { kind: 'text', text: msg`2 hours` },
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
      appliesTo: 'cloud',
      featureLabel: msg`Data Processing Agreement (DPA)`,
      tiers: {
        organization: { kind: 'yes', label: msg`Yes` },
        pro: { kind: 'yes', label: msg`Yes` },
      },
      type: 'row',
    },
    { title: msg`Support`, type: 'category' },
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
      featureLabel: msg`Dedicated support & SLA`,
      tiers: {
        enterprise: { kind: 'yes', label: msg`Yes` },
        organization: { kind: 'dash' },
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
    { title: msg`Customization`, type: 'category' },
    {
      featureLabel: msg`Custom apps`,
      tiers: {
        organization: { kind: 'unlimited' },
        pro: { kind: 'unlimited' },
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
        pro: { kind: 'dash' },
      },
      type: 'row',
    },
    { title: msg`Developers`, type: 'category' },
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
      featureLabel: msg`App logs`,
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
        enterprise: { kind: 'text', text: msg`Custom` },
        organization: { kind: 'text', text: msg`100 per minute` },
        pro: { kind: 'text', text: msg`50 per minute` },
      },
      type: 'row',
    },
    { appliesTo: 'selfHost', title: msg`Self-hosting`, type: 'category' },
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
    { title: msg`Enterprise`, type: 'category' },
    {
      appliesTo: 'cloud',
      featureLabel: msg`Single-tenant isolation`,
      tiers: {
        enterprise: { kind: 'yes', label: msg`Yes` },
        organization: { kind: 'dash' },
        pro: { kind: 'dash' },
      },
      type: 'row',
    },
    {
      appliesTo: 'cloud',
      featureLabel: msg`IP allow-listing`,
      tiers: {
        enterprise: { kind: 'yes', label: msg`Yes` },
        organization: { kind: 'dash' },
        pro: { kind: 'dash' },
      },
      type: 'row',
    },
    {
      featureLabel: msg`SCIM provisioning`,
      tiers: {
        enterprise: { kind: 'yes', label: msg`Yes` },
        organization: { kind: 'dash' },
        pro: { kind: 'dash' },
      },
      type: 'row',
    },
    {
      appliesTo: 'selfHost',
      featureLabel: msg`Air-gapped deployment`,
      tiers: {
        enterprise: { kind: 'yes', label: msg`Yes` },
        organization: { kind: 'dash' },
        pro: { kind: 'dash' },
      },
      type: 'row',
    },
    {
      appliesTo: 'selfHost',
      featureLabel: msg`LTS releases`,
      tiers: {
        enterprise: { kind: 'yes', label: msg`Yes` },
        organization: { kind: 'dash' },
        pro: { kind: 'dash' },
      },
      type: 'row',
    },
    {
      featureLabel: msg`Security reviews & custom contracts`,
      tiers: {
        enterprise: { kind: 'yes', label: msg`Yes` },
        organization: { kind: 'dash' },
        pro: { kind: 'dash' },
      },
      type: 'row',
    },
  ],
  seeMoreFeaturesCta: {
    collapseLabel: msg`Show less`,
    expandLabel: msg`See more features`,
  },
  tierColumns: [
    { id: 'pro', label: { cloud: msg`Pro`, selfHost: msg`Pro` } },
    {
      highlighted: true,
      id: 'organization',
      label: { cloud: msg`Organization`, selfHost: msg`Organization` },
    },
    {
      id: 'enterprise',
      label: { cloud: msg`Enterprise`, selfHost: msg`Enterprise` },
    },
  ],
};
