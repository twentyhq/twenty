// Fixed CRM records behind the chat-first demo flow (dormant deals, Acme
// follow-up, three-account research). Addresses use reserved example domains
// so no fixture can ever reach a real inbox.

export type SetuChatFirstCompanyFixture = {
  id: string;
  name: string;
  domainName: string;
};

export type SetuChatFirstPersonFixture = {
  id: string;
  companyId: string;
  firstName: string;
  lastName: string;
  email: string;
};

export type SetuChatFirstOpportunityFixture = {
  id: string;
  companyId: string;
  pointOfContactId: string;
  name: string;
  stage: string;
  amountMicros: number;
  currencyCode: string;
  lastActivityAt: string;
};

export type SetuChatFirstNoteFixture = {
  id: string;
  companyId: string;
  title: string;
  body: string;
  createdAt: string;
};

export const SETU_CHAT_FIRST_SENDER_EMAIL = 'riya@sales.example.com';

export const SETU_CHAT_FIRST_COMPANIES = {
  acme: {
    id: '1a000000-0000-4000-8000-000000000001',
    name: 'Acme',
    domainName: 'acme.example.com',
  },
  northstar: {
    id: '1a000000-0000-4000-8000-000000000002',
    name: 'Northstar',
    domainName: 'northstar.example.com',
  },
  orbit: {
    id: '1a000000-0000-4000-8000-000000000003',
    name: 'Orbit',
    domainName: 'orbit.example.com',
  },
  // A second company with the same name drives the "two companies match"
  // clarification in the research flow.
  orbitSystems: {
    id: '1a000000-0000-4000-8000-000000000004',
    name: 'Orbit',
    domainName: 'orbit-systems.example.org',
  },
} as const satisfies Record<string, SetuChatFirstCompanyFixture>;

export const SETU_CHAT_FIRST_PEOPLE = {
  priya: {
    id: '1b000000-0000-4000-8000-000000000001',
    companyId: SETU_CHAT_FIRST_COMPANIES.acme.id,
    firstName: 'Priya',
    lastName: 'Shah',
    email: 'priya@acme.example.com',
  },
  daniel: {
    id: '1b000000-0000-4000-8000-000000000002',
    companyId: SETU_CHAT_FIRST_COMPANIES.northstar.id,
    firstName: 'Daniel',
    lastName: 'Okafor',
    email: 'daniel@northstar.example.com',
  },
  mei: {
    id: '1b000000-0000-4000-8000-000000000003',
    companyId: SETU_CHAT_FIRST_COMPANIES.orbit.id,
    firstName: 'Mei',
    lastName: 'Tanaka',
    email: 'mei@orbit.example.com',
  },
} as const satisfies Record<string, SetuChatFirstPersonFixture>;

export const SETU_CHAT_FIRST_OPPORTUNITIES = {
  acmeExpansion: {
    id: '1c000000-0000-4000-8000-000000000001',
    companyId: SETU_CHAT_FIRST_COMPANIES.acme.id,
    pointOfContactId: SETU_CHAT_FIRST_PEOPLE.priya.id,
    name: 'Acme expansion',
    stage: 'PROPOSAL',
    amountMicros: 1_200_000_000_000,
    currencyCode: 'INR',
    lastActivityAt: '2026-09-15T10:00:00.000Z',
  },
  northstarRollout: {
    id: '1c000000-0000-4000-8000-000000000002',
    companyId: SETU_CHAT_FIRST_COMPANIES.northstar.id,
    pointOfContactId: SETU_CHAT_FIRST_PEOPLE.daniel.id,
    name: 'Northstar rollout',
    stage: 'MEETING',
    amountMicros: 800_000_000_000,
    currencyCode: 'INR',
    lastActivityAt: '2026-09-22T10:00:00.000Z',
  },
  orbitRenewal: {
    id: '1c000000-0000-4000-8000-000000000003',
    companyId: SETU_CHAT_FIRST_COMPANIES.orbit.id,
    pointOfContactId: SETU_CHAT_FIRST_PEOPLE.mei.id,
    name: 'Orbit renewal',
    stage: 'CUSTOMER',
    amountMicros: 600_000_000_000,
    currencyCode: 'INR',
    lastActivityAt: '2026-09-19T10:00:00.000Z',
  },
} as const satisfies Record<string, SetuChatFirstOpportunityFixture>;

export const SETU_CHAT_FIRST_NOTES = {
  acmeRevisit: {
    id: '1d000000-0000-4000-8000-000000000001',
    companyId: SETU_CHAT_FIRST_COMPANIES.acme.id,
    title: 'Acme meeting note',
    body: 'Priya asked to revisit the expansion project in November, once budgets are confirmed.',
    createdAt: '2026-09-15T10:30:00.000Z',
  },
  northstarSso: {
    id: '1d000000-0000-4000-8000-000000000002',
    companyId: SETU_CHAT_FIRST_COMPANIES.northstar.id,
    title: 'Northstar requirements',
    body: 'Rollout is blocked on SSO support for their identity provider.',
    createdAt: '2026-09-22T11:00:00.000Z',
  },
  orbitCheckIn: {
    id: '1d000000-0000-4000-8000-000000000003',
    companyId: SETU_CHAT_FIRST_COMPANIES.orbit.id,
    title: 'Orbit buyer email',
    body: 'Mei requested a check-in before the renewal date.',
    createdAt: '2026-09-19T09:15:00.000Z',
  },
} as const satisfies Record<string, SetuChatFirstNoteFixture>;
