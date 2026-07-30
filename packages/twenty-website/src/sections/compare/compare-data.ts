import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';

// Competitor list prices, checked against each vendor's public pricing page
// on 2026-07-30 (annual billing unless stated). Keep every price cell paired
// with its source URL; re-verify before changing any number.

export type CompareCompetitorCell = {
  detail: MessageDescriptor;
  price: MessageDescriptor;
  sourceUrl?: string;
};

export type CompareRow = {
  competitor: CompareCompetitorCell;
  description: MessageDescriptor;
  feature: MessageDescriptor;
  twenty: { detail: MessageDescriptor };
};

export type CompareReceiptLine = {
  amount: MessageDescriptor;
  label: MessageDescriptor;
};

export type CompetitorComparison = {
  competitor: string;
  competitorColumnLabel: MessageDescriptor;
  eyebrow: MessageDescriptor;
  heading: MessageDescriptor;
  honest: MessageDescriptor;
  intro: MessageDescriptor;
  migrationLine: MessageDescriptor;
  receipt: {
    competitorLines: CompareReceiptLine[];
    competitorPerUser: MessageDescriptor;
    competitorTotalAmount: MessageDescriptor;
    competitorTotalSuffix: MessageDescriptor;
    multiplier: MessageDescriptor;
    scenario: MessageDescriptor;
    twentyLines: CompareReceiptLine[];
    twentyPerUser: MessageDescriptor;
    twentyTotalAmount: MessageDescriptor;
    twentyTotalSuffix: MessageDescriptor;
  };
  rows: CompareRow[];
  slug: string;
  sourceNote: MessageDescriptor;
  tableTitle: MessageDescriptor;
};

const HUBSPOT_PRICING_URL = 'https://www.hubspot.com/pricing/sales';
const SALESFORCE_PRICING_URL = 'https://www.salesforce.com/sales/pricing/';
const ATTIO_PRICING_URL = 'https://attio.com/pricing';
const PIPEDRIVE_PRICING_URL = 'https://www.pipedrive.com/en/pricing';
const DYNAMICS_PRICING_URL =
  'https://www.microsoft.com/en-us/dynamics-365/products/sales/pricing';

export const HUBSPOT_COMPARISON: CompetitorComparison = {
  competitor: 'HubSpot',
  competitorColumnLabel: msg`On HubSpot`,
  eyebrow: msg`Twenty vs HubSpot`,
  heading: msg`What does\n*HubSpot* really cost?`,
  intro: msg`A feature-by-feature price check, with sources.\nMost of what HubSpot gates behind tiers is simply included in Twenty.`,
  migrationLine: msg`Import your data and see your own numbers. Most teams migrate from HubSpot in under a day.`,
  slug: 'hubspot',
  tableTitle: msg`What costs extra over there`,
  rows: [
    {
      feature: msg`Custom objects`,
      description: msg`Model deals, assets, or anything else`,
      competitor: {
        price: msg`$150/seat/mo`,
        detail: msg`Sales Hub Enterprise only`,
        sourceUrl: HUBSPOT_PRICING_URL,
      },
      twenty: { detail: msg`Included from Pro, $9/user` },
    },
    {
      feature: msg`Full workflow automation`,
      description: msg`Trigger actions on record changes`,
      competitor: {
        price: msg`$100/seat/mo`,
        detail: msg`Professional tier and up`,
        sourceUrl: HUBSPOT_PRICING_URL,
      },
      twenty: { detail: msg`Included from Pro` },
    },
    {
      feature: msg`Teams & permission sets`,
      description: msg`Control who sees and edits what`,
      competitor: {
        price: msg`$100/seat/mo`,
        detail: msg`Professional tier and up`,
        sourceUrl: HUBSPOT_PRICING_URL,
      },
      twenty: { detail: msg`Roles from Pro, row-level on Organization` },
    },
    {
      feature: msg`SAML SSO`,
      description: msg`Single sign-on for your team`,
      competitor: {
        price: msg`$150/seat/mo`,
        detail: msg`Enterprise only`,
        sourceUrl: HUBSPOT_PRICING_URL,
      },
      twenty: { detail: msg`Organization, $19/user` },
    },
    {
      feature: msg`Sandboxes`,
      description: msg`Test changes before production`,
      competitor: {
        price: msg`$150/seat/mo`,
        detail: msg`Enterprise only`,
        sourceUrl: HUBSPOT_PRICING_URL,
      },
      twenty: { detail: msg`Local environment included` },
    },
    {
      feature: msg`Getting started`,
      description: msg`Required onboarding on paid tiers`,
      competitor: {
        price: msg`$1,500 to $3,500`,
        detail: msg`One-time mandatory onboarding fee`,
        sourceUrl: HUBSPOT_PRICING_URL,
      },
      twenty: { detail: msg`None, start in minutes` },
    },
  ],
  receipt: {
    scenario: msg`A 20-person sales team, billed annually`,
    competitorLines: [
      {
        label: msg`20 × Sales Hub Enterprise ($150)`,
        amount: msg`$36,000/yr`,
      },
      { label: msg`Mandatory onboarding (one-time)`, amount: msg`$3,500` },
    ],
    competitorTotalAmount: msg`$39,500`,
    competitorTotalSuffix: msg`in year one`,
    competitorPerUser: msg`≈ $165 per user per month in year one`,
    twentyLines: [
      { label: msg`20 × Organization ($19)`, amount: msg`$4,560/yr` },
      { label: msg`Onboarding`, amount: msg`$0` },
    ],
    twentyTotalAmount: msg`$4,560`,
    twentyTotalSuffix: msg`in year one`,
    twentyPerUser: msg`$19 per user per month, that's it`,
    multiplier: msg`≈ 8× less`,
  },
  honest: msg`HubSpot brings a full marketing suite and a huge agency ecosystem. If you need marketing automation more than a CRM, it is a fair choice.`,
  sourceNote: msg`List prices from HubSpot's public pricing page, billed annually, checked on July 30, 2026.`,
};

export const SALESFORCE_COMPARISON: CompetitorComparison = {
  competitor: 'Salesforce',
  competitorColumnLabel: msg`On Salesforce`,
  eyebrow: msg`Twenty vs Salesforce`,
  heading: msg`What does\n*Salesforce* really cost?`,
  intro: msg`The list price is only the beginning.\nHere is what the invoice looks like once a real team is on it.`,
  migrationLine: msg`Import your data and see your own numbers. Twenty's importer handles Salesforce exports out of the box.`,
  slug: 'salesforce',
  tableTitle: msg`The line items add up`,
  rows: [
    {
      feature: msg`The CRM itself`,
      description: msg`Sales Cloud, per user`,
      competitor: {
        price: msg`$175/user/mo`,
        detail: msg`Enterprise edition`,
        sourceUrl: SALESFORCE_PRICING_URL,
      },
      twenty: { detail: msg`$9 to $19/user, everything included` },
    },
    {
      feature: msg`The AI edition`,
      description: msg`Agents and Data Cloud bundled`,
      competitor: {
        price: msg`$500/user/mo`,
        detail: msg`Agentforce 1 Sales edition`,
        sourceUrl: SALESFORCE_PRICING_URL,
      },
      twenty: { detail: msg`AI agents included, usage credits` },
    },
    {
      feature: msg`Agent conversations`,
      description: msg`When customers talk to your AI`,
      competitor: {
        price: msg`$2/conversation`,
        detail: msg`Agentforce list price`,
        sourceUrl: SALESFORCE_PRICING_URL,
      },
      twenty: { detail: msg`Credit-based, no per-chat fee` },
    },
    {
      feature: msg`Premier support`,
      description: msg`Faster answers when it matters`,
      competitor: {
        price: msg`+30% of spend`,
        detail: msg`Success plan uplift`,
        sourceUrl: SALESFORCE_PRICING_URL,
      },
      twenty: { detail: msg`Priority support on Organization` },
    },
    {
      feature: msg`Full sandbox`,
      description: msg`A real staging environment`,
      competitor: {
        price: msg`+30% of spend`,
        detail: msg`Add-on, per environment`,
        sourceUrl: SALESFORCE_PRICING_URL,
      },
      twenty: { detail: msg`Local environment included` },
    },
    {
      feature: msg`Implementation`,
      description: msg`Getting to a working CRM`,
      competitor: {
        price: msg`$10k to $100k+`,
        detail: msg`Typical partner project`,
      },
      twenty: { detail: msg`Self-serve, partners optional` },
    },
  ],
  receipt: {
    scenario: msg`A 20-person sales team, billed annually`,
    competitorLines: [
      {
        label: msg`20 × Sales Cloud Enterprise ($175)`,
        amount: msg`$42,000/yr`,
      },
      { label: msg`Premier support (+30%)`, amount: msg`$12,600/yr` },
    ],
    competitorTotalAmount: msg`$54,600`,
    competitorTotalSuffix: msg`per year`,
    competitorPerUser: msg`≈ $228 per user per month before add-ons`,
    twentyLines: [
      { label: msg`20 × Organization ($19)`, amount: msg`$4,560/yr` },
      { label: msg`Support`, amount: msg`Included` },
    ],
    twentyTotalAmount: msg`$4,560`,
    twentyTotalSuffix: msg`per year`,
    twentyPerUser: msg`$19 per user per month, that's it`,
    multiplier: msg`≈ 12× less`,
  },
  honest: msg`Salesforce remains the deepest enterprise platform, with an ecosystem for almost everything. At a thousand seats with a dedicated admin team, it is a different conversation.`,
  sourceNote: msg`List prices from Salesforce's public pricing page, billed annually, checked on July 30, 2026.`,
};

export const ATTIO_COMPARISON: CompetitorComparison = {
  competitor: 'Attio',
  competitorColumnLabel: msg`On Attio`,
  eyebrow: msg`Twenty vs Attio`,
  heading: msg`What does\n*Attio* really cost?`,
  intro: msg`Both are modern CRMs. One is open source.\nHere is the price of the difference.`,
  migrationLine: msg`Import your data and see your own numbers. Moving a workspace from Attio usually takes an afternoon.`,
  slug: 'attio',
  tableTitle: msg`The same features, priced differently`,
  rows: [
    {
      feature: msg`The modern CRM`,
      description: msg`Objects, pipelines, email sync`,
      competitor: {
        price: msg`$35/user/mo`,
        detail: msg`Plus plan, billed annually`,
        sourceUrl: ATTIO_PRICING_URL,
      },
      twenty: { detail: msg`$9/user on Pro` },
    },
    {
      feature: msg`The full platform`,
      description: msg`Advanced reporting and workflows`,
      competitor: {
        price: msg`$79/user/mo`,
        detail: msg`Pro plan, billed annually`,
        sourceUrl: ATTIO_PRICING_URL,
      },
      twenty: { detail: msg`Included from Pro, $9/user` },
    },
    {
      feature: msg`SAML SSO & advanced admin`,
      description: msg`Single sign-on, access control`,
      competitor: {
        price: msg`Custom pricing`,
        detail: msg`Enterprise plan only`,
        sourceUrl: ATTIO_PRICING_URL,
      },
      twenty: { detail: msg`Organization, $19/user` },
    },
    {
      feature: msg`Workflow credits`,
      description: msg`Automation that writes data or calls AI`,
      competitor: {
        price: msg`$150/mo per 10k`,
        detail: msg`Shared credit wallet top-up`,
        sourceUrl: ATTIO_PRICING_URL,
      },
      twenty: { detail: msg`Workflows included, credits for AI only` },
    },
    {
      feature: msg`Source code`,
      description: msg`Audit it, extend it, own it`,
      competitor: {
        price: msg`Closed`,
        detail: msg`Proprietary`,
      },
      twenty: { detail: msg`Open source` },
    },
  ],
  receipt: {
    scenario: msg`A 20-person team, billed annually`,
    competitorLines: [
      { label: msg`20 × Pro ($79)`, amount: msg`$18,960/yr` },
      {
        label: msg`SSO & advanced admin`,
        amount: msg`Enterprise upgrade`,
      },
    ],
    competitorTotalAmount: msg`$18,960+`,
    competitorTotalSuffix: msg`per year`,
    competitorPerUser: msg`$79 per user per month, before Enterprise`,
    twentyLines: [
      { label: msg`20 × Organization ($19)`, amount: msg`$4,560/yr` },
      { label: msg`SSO & advanced admin`, amount: msg`Included` },
    ],
    twentyTotalAmount: msg`$4,560`,
    twentyTotalSuffix: msg`per year`,
    twentyPerUser: msg`$19 per user per month, SSO included`,
    multiplier: msg`≈ 4× less`,
  },
  honest: msg`Attio is a polished, fast product with strong built-in enrichment. If you never need to extend or own your CRM, it is a credible pick.`,
  sourceNote: msg`List prices from Attio's public pricing page, billed annually, checked on July 30, 2026.`,
};

export const PIPEDRIVE_COMPARISON: CompetitorComparison = {
  competitor: 'Pipedrive',
  competitorColumnLabel: msg`On Pipedrive`,
  eyebrow: msg`Twenty vs Pipedrive`,
  heading: msg`What does\n*Pipedrive* really cost?`,
  intro: msg`A friendly price on the front page.\nThe caps show up after you sign.`,
  migrationLine: msg`Import your data and see your own numbers. Pipedrive exports map cleanly onto Twenty objects.`,
  slug: 'pipedrive',
  tableTitle: msg`Where the caps and gates are`,
  rows: [
    {
      feature: msg`The CRM`,
      description: msg`Pipeline, contacts, email sync`,
      competitor: {
        price: msg`$49/user/mo`,
        detail: msg`Premium plan, billed annually`,
        sourceUrl: PIPEDRIVE_PRICING_URL,
      },
      twenty: { detail: msg`$9/user on Pro` },
    },
    {
      feature: msg`SAML SSO & security rules`,
      description: msg`Single sign-on, access policies`,
      competitor: {
        price: msg`$79/user/mo`,
        detail: msg`Ultimate plan only`,
        sourceUrl: PIPEDRIVE_PRICING_URL,
      },
      twenty: { detail: msg`Organization, $19/user` },
    },
    {
      feature: msg`Active automations`,
      description: msg`Company-wide, not per user`,
      competitor: {
        price: msg`Capped per tier`,
        detail: msg`Shared limit below Ultimate`,
        sourceUrl: PIPEDRIVE_PRICING_URL,
      },
      twenty: { detail: msg`Unlimited workflows` },
    },
    {
      feature: msg`Custom fields`,
      description: msg`Shape records to your business`,
      competitor: {
        price: msg`Capped per tier`,
        detail: msg`Unlimited on top tiers only`,
        sourceUrl: PIPEDRIVE_PRICING_URL,
      },
      twenty: { detail: msg`Unlimited from Pro` },
    },
    {
      feature: msg`Custom objects`,
      description: msg`Beyond deals and contacts`,
      competitor: {
        price: msg`Not available`,
        detail: msg`Deals, contacts and products only`,
      },
      twenty: { detail: msg`Included from Pro` },
    },
  ],
  receipt: {
    scenario: msg`A 20-person sales team, billed annually`,
    competitorLines: [
      { label: msg`20 × Premium ($49)`, amount: msg`$11,760/yr` },
      {
        label: msg`SSO & security rules: move to Ultimate`,
        amount: msg`+$7,200/yr`,
      },
    ],
    competitorTotalAmount: msg`$18,960`,
    competitorTotalSuffix: msg`per year with SSO`,
    competitorPerUser: msg`$79 per user per month with SSO`,
    twentyLines: [
      { label: msg`20 × Organization ($19)`, amount: msg`$4,560/yr` },
      { label: msg`SSO & row-level permissions`, amount: msg`Included` },
    ],
    twentyTotalAmount: msg`$4,560`,
    twentyTotalSuffix: msg`per year`,
    twentyPerUser: msg`$19 per user per month, SSO included`,
    multiplier: msg`≈ 4× less`,
  },
  honest: msg`Pipedrive's pipeline UX is famously simple, and its entry tier is genuinely affordable for very small teams.`,
  sourceNote: msg`List prices from Pipedrive's public pricing page, billed annually, checked on July 30, 2026.`,
};

export const DYNAMICS_COMPARISON: CompetitorComparison = {
  competitor: 'Microsoft Dynamics',
  competitorColumnLabel: msg`On Dynamics 365`,
  eyebrow: msg`Twenty vs Microsoft Dynamics`,
  heading: msg`What does\n*Dynamics 365* really cost?`,
  intro: msg`Nobody buys Dynamics, they license it.\nHere is what it costs once storage and add-ons land.`,
  migrationLine: msg`Import your data and see your own numbers. Twenty's importer handles Dynamics exports without a consulting project.`,
  slug: 'microsoft-dynamics',
  tableTitle: msg`The licensing maze, priced`,
  rows: [
    {
      feature: msg`The CRM`,
      description: msg`Dynamics 365 Sales, per user`,
      competitor: {
        price: msg`$105/user/mo`,
        detail: msg`Sales Enterprise edition`,
        sourceUrl: DYNAMICS_PRICING_URL,
      },
      twenty: { detail: msg`$9 to $19/user, everything included` },
    },
    {
      feature: msg`The AI edition`,
      description: msg`Sales Premium with AI insights`,
      competitor: {
        price: msg`$150/user/mo`,
        detail: msg`Minimum 10 users`,
        sourceUrl: DYNAMICS_PRICING_URL,
      },
      twenty: { detail: msg`AI agents included, usage credits` },
    },
    {
      feature: msg`Database storage`,
      description: msg`Beyond the pooled entitlement`,
      competitor: {
        price: msg`$40/GB/month`,
        detail: msg`Dataverse database add-on`,
        sourceUrl: DYNAMICS_PRICING_URL,
      },
      twenty: { detail: msg`Included` },
    },
    {
      feature: msg`Customization apps`,
      description: msg`Extend beyond the CRM screens`,
      competitor: {
        price: msg`$20/user/mo`,
        detail: msg`Separate Power Apps licensing`,
        sourceUrl: DYNAMICS_PRICING_URL,
      },
      twenty: { detail: msg`Full customization included` },
    },
    {
      feature: msg`Implementation`,
      description: msg`Getting to a working CRM`,
      competitor: {
        price: msg`$15k to $100k+`,
        detail: msg`Typical partner project`,
      },
      twenty: { detail: msg`Self-serve, partners optional` },
    },
  ],
  receipt: {
    scenario: msg`A 20-person sales team, billed annually`,
    competitorLines: [
      {
        label: msg`20 × Sales Enterprise ($105)`,
        amount: msg`$25,200/yr`,
      },
      {
        label: msg`Extra Dataverse storage (10 GB)`,
        amount: msg`$4,800/yr`,
      },
    ],
    competitorTotalAmount: msg`$30,000`,
    competitorTotalSuffix: msg`per year`,
    competitorPerUser: msg`≈ $125 per user per month`,
    twentyLines: [
      { label: msg`20 × Organization ($19)`, amount: msg`$4,560/yr` },
      { label: msg`Storage`, amount: msg`Included` },
    ],
    twentyTotalAmount: msg`$4,560`,
    twentyTotalSuffix: msg`per year`,
    twentyPerUser: msg`$19 per user per month, that's it`,
    multiplier: msg`≈ 6× less`,
  },
  honest: msg`If your company lives in Microsoft 365 and already runs on the Power Platform, Dynamics integrates like nothing else.`,
  sourceNote: msg`List prices from Microsoft's public Dynamics 365 pricing page, billed annually, checked on July 30, 2026.`,
};
