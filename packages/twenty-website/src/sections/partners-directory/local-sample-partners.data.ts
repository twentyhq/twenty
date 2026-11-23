import { type MarketplacePartner } from '@/partners-marketplace/marketplace-partner';

// Fictional partners for local runs, where the partners API is not configured.
export const LOCAL_SAMPLE_PARTNERS: readonly MarketplacePartner[] = [
  {
    slug: 'north-ledger',
    name: 'North Ledger',
    description:
      'North Ledger sets up Twenty for growing teams: data model, migration from spreadsheets or a legacy CRM, and training.\n\n### What we do\n\n- **Audit**: map the current process and tools\n- **Implementation**: objects, pipelines and permissions\n- **Support**: a monthly check-in after go-live',
    calendarLink: '',
    partnerScope: ['SOLUTIONING', 'DEVELOPMENT'],
    region: ['EUROPE'],
    languagesSpoken: ['FRENCH', 'ENGLISH'],
    hourlyRateUsd: 120,
    projectBudgetMinUsd: 8000,
    links: { website: null, linkedin: null, x: null, github: null },
    profilePictureUrl: '',
    city: 'Lyon',
    country: 'France',
    skills: [],
    superPartner: false,
    services: [
      {
        title: 'Implementation',
        description:
          'Data model, pipelines and permissions, set up with your team.',
      },
    ],
    portfolio: [],
    clients: [],
  },
  {
    slug: 'harbor-crm',
    name: 'Harbor CRM',
    description:
      'Harbor CRM sets up Twenty for growing teams: data model, migration from spreadsheets or a legacy CRM, and training.\n\n### What we do\n\n- **Audit**: map the current process and tools\n- **Implementation**: objects, pipelines and permissions\n- **Support**: a monthly check-in after go-live',
    calendarLink: '',
    partnerScope: ['ADVISORY', 'SOLUTIONING'],
    region: ['EUROPE', 'MENA'],
    languagesSpoken: ['GERMAN', 'ENGLISH'],
    hourlyRateUsd: 140,
    projectBudgetMinUsd: 10000,
    links: { website: null, linkedin: null, x: null, github: null },
    profilePictureUrl: '',
    city: 'Hamburg',
    country: 'Germany',
    skills: [],
    superPartner: false,
    services: [
      {
        title: 'Implementation',
        description:
          'Data model, pipelines and permissions, set up with your team.',
      },
    ],
    portfolio: [],
    clients: [],
  },
  {
    slug: 'pine-and-co',
    name: 'Pine & Co',
    description:
      'Pine & Co sets up Twenty for growing teams: data model, migration from spreadsheets or a legacy CRM, and training.\n\n### What we do\n\n- **Audit**: map the current process and tools\n- **Implementation**: objects, pipelines and permissions\n- **Support**: a monthly check-in after go-live',
    calendarLink: '',
    partnerScope: ['DEVELOPMENT', 'HOSTING'],
    region: ['US'],
    languagesSpoken: ['ENGLISH', 'SPANISH'],
    hourlyRateUsd: 150,
    projectBudgetMinUsd: 12000,
    links: { website: null, linkedin: null, x: null, github: null },
    profilePictureUrl: '',
    city: 'Chicago',
    country: 'United States',
    skills: [],
    superPartner: false,
    services: [
      {
        title: 'Implementation',
        description:
          'Data model, pipelines and permissions, set up with your team.',
      },
    ],
    portfolio: [],
    clients: [],
  },
  {
    slug: 'rio-stack',
    name: 'Rio Stack',
    description:
      'Rio Stack sets up Twenty for growing teams: data model, migration from spreadsheets or a legacy CRM, and training.\n\n### What we do\n\n- **Audit**: map the current process and tools\n- **Implementation**: objects, pipelines and permissions\n- **Support**: a monthly check-in after go-live',
    calendarLink: '',
    partnerScope: ['DEVELOPMENT', 'SUPPORT'],
    region: ['LATAM', 'US'],
    languagesSpoken: ['PORTUGUESE', 'ENGLISH', 'SPANISH'],
    hourlyRateUsd: 80,
    projectBudgetMinUsd: 5000,
    links: { website: null, linkedin: null, x: null, github: null },
    profilePictureUrl: '',
    city: 'São Paulo',
    country: 'Brazil',
    skills: [],
    superPartner: false,
    services: [
      {
        title: 'Implementation',
        description:
          'Data model, pipelines and permissions, set up with your team.',
      },
    ],
    portfolio: [],
    clients: [],
  },
  {
    slug: 'dune-works',
    name: 'Dune Works',
    description:
      'Dune Works sets up Twenty for growing teams: data model, migration from spreadsheets or a legacy CRM, and training.\n\n### What we do\n\n- **Audit**: map the current process and tools\n- **Implementation**: objects, pipelines and permissions\n- **Support**: a monthly check-in after go-live',
    calendarLink: '',
    partnerScope: ['SOLUTIONING', 'SUPPORT'],
    region: ['MENA', 'EUROPE'],
    languagesSpoken: ['ARABIC', 'ENGLISH'],
    hourlyRateUsd: 110,
    projectBudgetMinUsd: 7000,
    links: { website: null, linkedin: null, x: null, github: null },
    profilePictureUrl: '',
    city: 'Dubai',
    country: 'United Arab Emirates',
    skills: [],
    superPartner: false,
    services: [
      {
        title: 'Implementation',
        description:
          'Data model, pipelines and permissions, set up with your team.',
      },
    ],
    portfolio: [],
    clients: [],
  },
  {
    slug: 'kite-labs',
    name: 'Kite Labs',
    description:
      'Kite Labs sets up Twenty for growing teams: data model, migration from spreadsheets or a legacy CRM, and training.\n\n### What we do\n\n- **Audit**: map the current process and tools\n- **Implementation**: objects, pipelines and permissions\n- **Support**: a monthly check-in after go-live',
    calendarLink: '',
    partnerScope: ['DEVELOPMENT', 'HOSTING'],
    region: ['APAC'],
    languagesSpoken: ['ENGLISH', 'HINDI'],
    hourlyRateUsd: 60,
    projectBudgetMinUsd: 4000,
    links: { website: null, linkedin: null, x: null, github: null },
    profilePictureUrl: '',
    city: 'Bengaluru',
    country: 'India',
    skills: [],
    superPartner: false,
    services: [
      {
        title: 'Implementation',
        description:
          'Data model, pipelines and permissions, set up with your team.',
      },
    ],
    portfolio: [],
    clients: [],
  },
  {
    slug: 'tide-partners',
    name: 'Tide Partners',
    description:
      'Tide Partners sets up Twenty for growing teams: data model, migration from spreadsheets or a legacy CRM, and training.\n\n### What we do\n\n- **Audit**: map the current process and tools\n- **Implementation**: objects, pipelines and permissions\n- **Support**: a monthly check-in after go-live',
    calendarLink: '',
    partnerScope: ['ADVISORY', 'DEVELOPMENT'],
    region: ['APAC', 'US'],
    languagesSpoken: ['ENGLISH'],
    hourlyRateUsd: 160,
    projectBudgetMinUsd: 15000,
    links: { website: null, linkedin: null, x: null, github: null },
    profilePictureUrl: '',
    city: 'Sydney',
    country: 'Australia',
    skills: [],
    superPartner: false,
    services: [
      {
        title: 'Implementation',
        description:
          'Data model, pipelines and permissions, set up with your team.',
      },
    ],
    portfolio: [],
    clients: [],
  },
  {
    slug: 'savanna-digital',
    name: 'Savanna Digital',
    description:
      'Savanna Digital sets up Twenty for growing teams: data model, migration from spreadsheets or a legacy CRM, and training.\n\n### What we do\n\n- **Audit**: map the current process and tools\n- **Implementation**: objects, pipelines and permissions\n- **Support**: a monthly check-in after go-live',
    calendarLink: '',
    partnerScope: ['SOLUTIONING', 'SUPPORT'],
    region: ['AFRICA', 'EUROPE'],
    languagesSpoken: ['ENGLISH'],
    hourlyRateUsd: 70,
    projectBudgetMinUsd: 3000,
    links: { website: null, linkedin: null, x: null, github: null },
    profilePictureUrl: '',
    city: 'Nairobi',
    country: 'Kenya',
    skills: [],
    superPartner: false,
    services: [
      {
        title: 'Implementation',
        description:
          'Data model, pipelines and permissions, set up with your team.',
      },
    ],
    portfolio: [],
    clients: [],
  },
];
