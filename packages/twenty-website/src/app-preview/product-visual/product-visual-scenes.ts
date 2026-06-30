import { sharedAssetUrls } from '../data/shared-asset-urls';
import { PAGE_ITEM_IDS } from './page-item-ids';

export type ResponseChip = {
  logoUrl: string;
  name: string;
};

type ProductVisualSceneKind =
  | 'leadCreation'
  | 'opportunityReview'
  | 'taskCreation'
  | 'dashboardCreation'
  | 'workflowCreation';

export type AgentToolIcon =
  | 'search'
  | 'filter'
  | 'notes'
  | 'tasks'
  | 'record'
  | 'workflow'
  | 'mail';

export type AgentStep =
  | { kind: 'thinking'; durationMs: number }
  | {
      kind: 'tool';
      icon: AgentToolIcon;
      running: string;
      done: string;
      durationMs: number;
    };

export type ProductVisualSceneDefinition = {
  initialPageItemId: string;
  kind: ProductVisualSceneKind;
  label: string;
  responseChips: ResponseChip[];
  responseText: string[];
  sidebarMode?: 'collapsed' | 'expanded';
  steps?: AgentStep[];
};

function companyLogo(domain: string): string {
  const url = sharedAssetUrls.companyLogoForDomain(domain);
  if (url === undefined) {
    throw new Error(`Missing shared company logo for "${domain}"`);
  }
  return url;
}

export const PRODUCT_VISUAL_SCENES: ProductVisualSceneDefinition[] = [
  {
    initialPageItemId: PAGE_ITEM_IDS.companies,
    kind: 'leadCreation',
    label: 'Add a new lead',
    responseText: [],
    responseChips: [],
    sidebarMode: 'expanded',
  },
  {
    initialPageItemId: PAGE_ITEM_IDS.opportunities,
    kind: 'opportunityReview',
    label: 'Build a pipeline board grouped by stage',
    responseText: [
      'Organized your open deals into a **pipeline board** grouped by stage — **New**, **Screening**, **Meeting**, **Proposal**, and **Customer**.',
      'Drag a card to move a deal forward, or open one to see the full history.',
    ],
    responseChips: [
      { name: 'Anthropic', logoUrl: companyLogo('anthropic.com') },
      { name: 'Notion', logoUrl: companyLogo('notion.com') },
      { name: 'Github', logoUrl: companyLogo('github.com') },
      { name: 'Airbnb', logoUrl: companyLogo('airbnb.com') },
      { name: 'Figma', logoUrl: companyLogo('figma.com') },
      { name: 'Stripe', logoUrl: companyLogo('stripe.com') },
      { name: 'Mailchimp', logoUrl: companyLogo('mailchimp.com') },
    ],
    sidebarMode: 'collapsed',
    steps: [
      { kind: 'thinking', durationMs: 1200 },
      {
        kind: 'tool',
        icon: 'search',
        running: 'Reading your open deals',
        done: 'Read 24 deals',
        durationMs: 1000,
      },
      {
        kind: 'tool',
        icon: 'record',
        running: 'Building the pipeline board',
        done: 'Built the board',
        durationMs: 800,
      },
    ],
  },
  {
    initialPageItemId: PAGE_ITEM_IDS.tasks,
    kind: 'taskCreation',
    label:
      'Generate follow-up tasks for my top 10 accounts using notes to gather context',
    responseText: [
      'Created **10 follow-up tasks** dated **Nov 1 through Nov 8**.',
      'The first rows cover Anthropic, Slack, Figma, Notion, and Github, followed by Airbnb, Stripe, Sequoia, Accel, and Google.',
    ],
    responseChips: [
      { name: 'Anthropic', logoUrl: companyLogo('anthropic.com') },
      { name: 'Slack', logoUrl: companyLogo('slack.com') },
      { name: 'Figma', logoUrl: companyLogo('figma.com') },
      { name: 'Notion', logoUrl: companyLogo('notion.com') },
      { name: 'Github', logoUrl: companyLogo('github.com') },
      { name: 'Airbnb', logoUrl: companyLogo('airbnb.com') },
      { name: 'Stripe', logoUrl: companyLogo('stripe.com') },
      { name: 'Sequoia', logoUrl: companyLogo('sequoia.com') },
      { name: 'Accel', logoUrl: companyLogo('accel.com') },
      { name: 'Google', logoUrl: companyLogo('google.com') },
    ],
    sidebarMode: 'collapsed',
    steps: [
      { kind: 'thinking', durationMs: 1200 },
      {
        kind: 'tool',
        icon: 'notes',
        running: 'Reading notes on your top 10 accounts',
        done: 'Read 10 accounts',
        durationMs: 1100,
      },
      {
        kind: 'tool',
        icon: 'tasks',
        running: 'Creating 10 follow-up tasks',
        done: 'Created 10 tasks',
        durationMs: 900,
      },
    ],
  },
  {
    initialPageItemId: PAGE_ITEM_IDS.salesDashboard,
    kind: 'dashboardCreation',
    label: 'Build a dashboard of pipeline by stage and ARR',
    responseText: [
      'Built a **Sales dashboard** with live KPIs — **$12.9M pipeline**, **$2.4M won this quarter**, and a **38% win rate** — plus charts for deals by stage and ARR over time.',
      'It refreshes automatically as your data changes.',
    ],
    responseChips: [],
    sidebarMode: 'collapsed',
    steps: [
      { kind: 'thinking', durationMs: 1200 },
      {
        kind: 'tool',
        icon: 'search',
        running: 'Aggregating pipeline and revenue',
        done: 'Aggregated 24 deals',
        durationMs: 1000,
      },
      {
        kind: 'tool',
        icon: 'record',
        running: 'Assembling the dashboard',
        done: 'Built the dashboard',
        durationMs: 900,
      },
    ],
  },
  {
    initialPageItemId: PAGE_ITEM_IDS.workflowEmailSequence,
    kind: 'workflowCreation',
    label: 'Draft a workflow that sends an email sequence',
    responseText: [
      'Created and activated a sequence with a **Manual trigger**, an **Iterator**, and a **Send Email** step.',
      'It is ready to run now, and filters or email copy can be refined next.',
    ],
    responseChips: [],
    sidebarMode: 'collapsed',
    steps: [
      { kind: 'thinking', durationMs: 1200 },
      {
        kind: 'tool',
        icon: 'workflow',
        running: 'Designing the workflow',
        done: 'Designed 3 steps',
        durationMs: 1000,
      },
      {
        kind: 'tool',
        icon: 'mail',
        running: 'Activating the sequence',
        done: 'Activated sequence',
        durationMs: 800,
      },
    ],
  },
];
