import { type MarketplacePartner } from './marketplace-partner';

export const DUMMY_PARTNERS: MarketplacePartner[] = [
  {
    slug: 'atelier-sigma',
    name: 'Atelier Sigma',
    description: `**Senior CRM partner for venture-backed teams, with Twenty at the core.**

We migrate startups, scale-ups and investment firms onto Twenty and design the RevOps layer around it: data model, pipelines, automations and the integrations that keep everything clean. Five years in, with more than 40 rollouts behind us across France, the UK and the wider EU.

Twenty is the foundation. Around it we build modular GTM stacks that are structured, automated and genuinely maintainable, so your team can run them without us in the room.

#### Who we work with
- Seed to Series C teams moving off spreadsheets or a first CRM
- Teams migrating from Salesforce, HubSpot, Pipedrive, Affinity or Zoho
- Operators who want a system they own, not a black box

#### Why teams pick us
- 100% focused on Twenty and its ecosystem
- Five years and 40+ rollouts running in production
- Open-source-native: we build on the core, not around it`,
    calendarLink: 'https://cal.com/atelier-sigma/intro',
    partnerScope: ['SOLUTIONING', 'DEVELOPMENT', 'HOSTING'],
    region: ['EUROPE', 'MENA'],
    languagesSpoken: ['FRENCH', 'ENGLISH'],
    hourlyRateUsd: 140,
    projectBudgetMinUsd: 8000,
    links: {
      website: 'https://ateliersigma.com',
      linkedin: 'https://linkedin.com/company/atelier-sigma',
      x: 'https://x.com/ateliersigma',
      github: 'https://github.com/atelier-sigma',
    },
    profilePictureUrl: 'https://picsum.photos/seed/atelier-sigma-team/600/600',
    city: 'Paris',
    country: 'France',
    skills: ['Migrations', 'RevOps', 'API & SDK'],
    services: [
      {
        title: 'CRM migration',
        description:
          'Controlled moves from Salesforce, HubSpot, Pipedrive or spreadsheets. We restructure the data model first, then cut over with no lost history.',
      },
      {
        title: 'RevOps architecture',
        description:
          'Pipelines, stages, scoring and reporting designed around how your team actually sells, not a generic template.',
      },
      {
        title: 'Custom Twenty development',
        description:
          "Workflows, custom objects and API or SDK integrations built on Twenty's open-source core.",
      },
      {
        title: 'Ongoing support',
        description:
          'A monthly retainer for changes, training and new automations as the team grows.',
      },
    ],
    portfolio: [
      {
        client: 'Brevio Health',
        title: 'Salesforce to Twenty, 22k contacts, zero downtime',
        body: `We restructured a nine-year-old Salesforce org into a clean Twenty data model, then cut a 40-person sales team over in a single weekend.

- 22,000 contacts migrated with full history preserved
- Live on Monday morning with no downtime
- 14 legacy custom objects collapsed into 5`,
        imageUrl: 'https://picsum.photos/seed/brevio-health/960/540',
        link: 'https://example.com/case/brevio',
      },
      {
        client: 'Lumen Freight',
        title: 'A RevOps stack for an outbound team',
        body: `Designed the pipelines, lead scoring and Clay plus Lemlist integrations that an outbound growth team runs on day to day.

- Lead scoring wired to enrichment from Clay
- Sequenced outreach synced back into Twenty
- Qualified-meeting throughput up across the quarter`,
        imageUrl: 'https://picsum.photos/seed/lumen-freight/960/540',
        link: null,
      },
      {
        client: 'Maison Valette',
        title: 'Self-hosted Twenty for a regulated client',
        body: `Deployed and hardened a self-hosted Twenty instance for a private-bank client with strict EU data residency.

- SSO and audit logging on a private VPC
- EU-only data residency, no third-party processors
- Handover with runbooks and on-call training`,
        imageUrl: null,
        link: 'https://example.com/case/valette',
      },
    ],
    clients: [
      {
        name: 'Stripe',
        logoUrl:
          'https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg',
      },
      {
        name: 'Notion',
        logoUrl:
          'https://upload.wikimedia.org/wikipedia/commons/e/e9/Notion-logo.svg',
      },
      {
        name: 'Figma',
        logoUrl:
          'https://upload.wikimedia.org/wikipedia/commons/3/33/Figma-logo.svg',
      },
      {
        name: 'Slack',
        logoUrl:
          'https://upload.wikimedia.org/wikipedia/commons/b/b9/Slack_Technologies_Logo.svg',
      },
      {
        name: 'Airtable',
        logoUrl:
          'https://upload.wikimedia.org/wikipedia/commons/4/4b/Airtable_Logo.svg',
      },
      {
        name: 'Intercom',
        logoUrl:
          'https://upload.wikimedia.org/wikipedia/commons/0/0b/Intercom_logotype.png',
      },
      {
        name: 'GitLab',
        logoUrl:
          'https://upload.wikimedia.org/wikipedia/commons/e/e1/GitLab_logo.svg',
      },
      {
        name: 'Asana',
        logoUrl:
          'https://upload.wikimedia.org/wikipedia/commons/3/3b/Asana_logo.svg',
      },
      {
        name: 'Vercel',
        logoUrl:
          'https://upload.wikimedia.org/wikipedia/commons/5/5e/Vercel_logo_black.svg',
      },
      {
        name: 'Dropbox',
        logoUrl:
          'https://upload.wikimedia.org/wikipedia/commons/c/cb/Dropbox_logo_2017.svg',
      },
    ],
  },
  {
    slug: 'northbeam-studio',
    name: 'Northbeam Studio',
    description:
      'RevOps and reporting for B2B SaaS teams that have outgrown spreadsheets and their first CRM. We turn messy pipelines into forecasts leadership actually trusts, redesign stages and scoring around how reps really sell, wire up the dashboards your board keeps asking for, connect the enrichment and outreach tools your growth team already runs, and document every last piece of it so the system keeps working long after we hand it back over. Based in London, working across the UK and EU in English, and yes this sentence is deliberately far too long to prove the card never breaks no matter how much a partner writes.',
    calendarLink: 'https://cal.com/northbeam-studio/intro',
    partnerScope: ['ADVISORY', 'SOLUTIONING'],
    region: ['EUROPE', 'US'],
    languagesSpoken: ['ENGLISH'],
    hourlyRateUsd: 175,
    projectBudgetMinUsd: 12000,
    links: {
      website: 'https://northbeamstudio.co.uk',
      linkedin: 'https://linkedin.com/company/northbeam-studio',
      x: 'https://x.com/northbeamstudio',
      github: null,
    },
    profilePictureUrl: '',
    city: 'London',
    country: 'United Kingdom',
    skills: ['RevOps', 'Reporting', 'Forecasting'],
    services: [
      {
        title: 'RevOps advisory',
        description:
          'Pipeline design, stage definitions and forecasting models tuned to how your team actually sells.',
      },
    ],
    portfolio: [
      {
        client: 'Helio Analytics',
        title: 'Board-ready forecasting on Twenty',
        body: `Rebuilt pipeline stages and a weighted forecast model so leadership could trust weekly numbers again.

- Stage definitions aligned to rep behaviour
- Board dashboard wired to live Twenty data
- Forecast accuracy improved within one quarter`,
        imageUrl: 'https://picsum.photos/seed/northbeam-helio/900/360',
        link: 'https://example.com/case/helio',
      },
    ],
    clients: [
      { name: 'HubSpot', logoUrl: 'https://cdn.simpleicons.org/hubspot' },
      { name: 'Segment', logoUrl: 'https://cdn.simpleicons.org/segment' },
      { name: 'Amplitude', logoUrl: 'https://cdn.simpleicons.org/amplitude' },
    ],
  },
  {
    slug: '9-dots-ventures',
    name: '9 Dots Ventures',
    description:
      'Boutique CRM implementer for real-estate workflows and WhatsApp automation, with self-hosted Twenty deployments across APAC.',
    calendarLink: 'https://cal.com/9dots-ventures/intro',
    partnerScope: ['DEVELOPMENT', 'HOSTING'],
    region: ['APAC'],
    languagesSpoken: ['ENGLISH', 'CHINESE'],
    hourlyRateUsd: 95,
    projectBudgetMinUsd: 6000,
    links: {
      website: 'https://9dotsventures.sg',
      linkedin: 'https://linkedin.com/company/9-dots-ventures',
      x: null,
      github: 'https://github.com/9dots-ventures',
    },
    profilePictureUrl: '',
    city: 'Singapore',
    country: 'Singapore',
    skills: ['Self-hosted', 'WhatsApp automation', 'Real estate'],
    services: [
      {
        title: 'Self-hosted Twenty',
        description:
          'Private deployments on your infrastructure with backups, monitoring and upgrade runbooks.',
      },
      {
        title: 'WhatsApp workflow automation',
        description:
          'Lead capture and follow-up flows that connect WhatsApp conversations back into Twenty.',
      },
    ],
    portfolio: [
      {
        client: 'Harbour Estates',
        title: 'WhatsApp leads into Twenty for a property group',
        body: `Connected WhatsApp Business to Twenty so inbound property enquiries land as qualified leads automatically.

- WhatsApp conversations synced to contact records
- Agent assignment rules based on listing region
- Response-time SLAs tracked in Twenty`,
        imageUrl: 'https://picsum.photos/seed/9dots-harbour/900/360',
        link: 'https://example.com/case/harbour',
      },
    ],
    clients: [
      { name: 'Twilio', logoUrl: 'https://cdn.simpleicons.org/twilio' },
      { name: 'Docker', logoUrl: 'https://cdn.simpleicons.org/docker' },
      {
        name: 'DigitalOcean',
        logoUrl: 'https://cdn.simpleicons.org/digitalocean',
      },
    ],
  },
  {
    slug: 'halden-roe',
    name: 'Halden & Roe',
    description:
      'Migrations off legacy CRMs for mid-market teams. German and English, with EU data residency by default.',
    calendarLink: 'https://cal.com/halden-roe/intro',
    partnerScope: ['SOLUTIONING', 'SUPPORT'],
    region: ['EUROPE'],
    languagesSpoken: ['GERMAN', 'ENGLISH'],
    hourlyRateUsd: 120,
    projectBudgetMinUsd: 10000,
    links: {
      website: 'https://haldenroe.de',
      linkedin: 'https://linkedin.com/company/halden-roe',
      x: null,
      github: null,
    },
    profilePictureUrl: '',
    city: 'Berlin',
    country: 'Germany',
    skills: ['Migrations', 'EU compliance'],
    services: [
      {
        title: 'Legacy CRM migration',
        description:
          'Structured cutovers from Salesforce, Dynamics or Zoho with data cleanup and user training.',
      },
      {
        title: 'Post-go-live support',
        description:
          'Retained support for schema changes, automations and onboarding new team members.',
      },
    ],
    portfolio: [],
    clients: [],
  },
  {
    slug: 'verza-collective',
    name: 'Verza Collective',
    description:
      'No-code operations and automations for scaling startups. 150 projects shipped across Europe and LATAM, from first pipeline to full RevOps tooling.',
    calendarLink: 'https://cal.com/verza-collective/intro',
    partnerScope: [
      'ADVISORY',
      'SOLUTIONING',
      'DEVELOPMENT',
      'HOSTING',
      'SUPPORT',
    ],
    region: ['EUROPE', 'LATAM'],
    languagesSpoken: ['SPANISH', 'ENGLISH'],
    hourlyRateUsd: 110,
    projectBudgetMinUsd: 7500,
    links: {
      website: 'https://verzacollective.com',
      linkedin: 'https://linkedin.com/company/verza-collective',
      x: 'https://x.com/verzacollective',
      github: null,
    },
    profilePictureUrl: '',
    city: 'Madrid',
    country: 'Spain',
    skills: ['Automations', 'No-code ops', 'RevOps'],
    services: [
      {
        title: 'Operations automation',
        description:
          'Workflows and integrations that remove manual handoffs between sales, success and finance.',
      },
      {
        title: 'Twenty rollout',
        description:
          'End-to-end implementation from data model design through team training and documentation.',
      },
    ],
    portfolio: [],
    clients: [],
  },
  {
    slug: 'kioko-labs',
    name: 'Kioko Labs',
    description:
      'Self-hosted Twenty deployments and API work for teams across Africa and the Gulf.',
    calendarLink: 'https://cal.com/kioko-labs/intro',
    partnerScope: ['HOSTING', 'DEVELOPMENT'],
    region: ['AFRICA', 'MENA'],
    languagesSpoken: ['ENGLISH', 'SWAHILI'],
    hourlyRateUsd: 85,
    projectBudgetMinUsd: 5000,
    links: {
      website: 'https://kiokolabs.co.ke',
      linkedin: 'https://linkedin.com/company/kioko-labs',
      x: null,
      github: 'https://github.com/kioko-labs',
    },
    profilePictureUrl: '',
    city: 'Nairobi',
    country: 'Kenya',
    skills: ['Self-hosted', 'API integrations'],
    services: [
      {
        title: 'Managed Twenty hosting',
        description:
          'Secure self-hosted instances with monitoring, backups and regional data residency options.',
      },
    ],
    portfolio: [],
    clients: [],
  },
  {
    slug: 'tomas-brandt',
    name: 'Tomas Brandt',
    description:
      'Independent Twenty consultant, ex-Salesforce admin. Available for short solutioning engagements.',
    calendarLink: 'https://cal.com/tomas-brandt/intro',
    partnerScope: ['SOLUTIONING'],
    region: ['US'],
    languagesSpoken: ['ENGLISH'],
    hourlyRateUsd: null,
    projectBudgetMinUsd: null,
    links: {
      website: null,
      linkedin: 'https://linkedin.com/in/tomas-brandt',
      x: null,
      github: null,
    },
    profilePictureUrl: '',
    city: 'Oakland',
    country: 'United States',
    skills: ['Solutioning'],
    services: [],
    portfolio: [],
    clients: [],
  },
  {
    slug: 'benjamin-reynolds',
    name: 'Benjamin Reynolds',
    description: '',
    calendarLink: '',
    partnerScope: ['SOLUTIONING'],
    region: ['US'],
    languagesSpoken: ['ENGLISH'],
    hourlyRateUsd: null,
    projectBudgetMinUsd: null,
    links: {
      website: null,
      linkedin: null,
      x: null,
      github: null,
    },
    profilePictureUrl: '',
    city: 'Oakland',
    country: 'United States',
    skills: [],
    services: [],
    portfolio: [],
    clients: [],
  },
];
