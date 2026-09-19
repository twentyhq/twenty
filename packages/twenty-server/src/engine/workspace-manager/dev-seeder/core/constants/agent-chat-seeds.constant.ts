import { USER_WORKSPACE_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-user-workspaces.util';

export const AGENT_CHAT_CHANNEL_DATA_SEED_IDS = {
  APPLE_SALES_CHANNEL: '20202020-0000-4000-8000-000000000201',
  APPLE_LEADERSHIP_CHANNEL: '20202020-0000-4000-8000-000000000202',
};

// A seeded workflow whose only step is an AI agent, with one run that
// finished and one paused on a question the agent asked; each run keeps
// its conversation in a chat thread.
export const AGENT_WORKFLOW_DATA_SEED_IDS = {
  LEAD_QUALIFICATION_WORKFLOW: '20202020-0000-4000-8000-000000000301',
  LEAD_QUALIFICATION_WORKFLOW_VERSION: '20202020-0000-4000-8000-000000000302',
  LEAD_QUALIFICATION_CORE_WORKFLOW: '20202020-0000-4000-8000-000000000303',
  LEAD_QUALIFICATION_CORE_WORKFLOW_VERSION:
    '20202020-0000-4000-8000-000000000304',
  LEAD_QUALIFICATION_WORKFLOW_UNIVERSAL_IDENTIFIER:
    '20202020-0000-4000-8000-000000000305',
  LEAD_QUALIFICATION_WORKFLOW_VERSION_UNIVERSAL_IDENTIFIER:
    '20202020-0000-4000-8000-000000000306',
  QUALIFY_LEAD_STEP: '20202020-0000-4000-8000-000000000307',
  COMPLETED_RUN: '20202020-0000-4000-8000-000000000311',
  WAITING_RUN: '20202020-0000-4000-8000-000000000312',
  COMPLETED_RUN_THREAD: '20202020-0000-4000-8000-000000000321',
  WAITING_RUN_THREAD: '20202020-0000-4000-8000-000000000322',
  WAITING_RUN_QUESTION_MESSAGE: '20202020-0000-4000-8000-000000000323',
};

export const AGENT_WORKFLOW_SEED_NAME = 'Lead qualification';
export const AGENT_WORKFLOW_SEED_STEP_NAME = 'Qualify the lead';
export const AGENT_WORKFLOW_SEED_PROMPT =
  'A new lead just came in from the website form. Look at what we know about the ' +
  'person and their company, decide whether they fit our ideal customer profile, ' +
  'and draft a first outreach email. Ask before anything is sent.';

export const AGENT_CHAT_THREAD_DATA_SEED_IDS = {
  APPLE_DEFAULT_THREAD: '20202020-0000-4000-8000-000000000011',
  APPLE_IMPORT_THREAD: '20202020-0000-4000-8000-000000000013',
  APPLE_FOLLOW_UP_THREAD: '20202020-0000-4000-8000-000000000014',
  APPLE_PRICING_THREAD: '20202020-0000-4000-8000-000000000015',
  YCOMBINATOR_DEFAULT_THREAD: '20202020-0000-4000-8000-000000000012',
};

type AgentChatChannelSeed = {
  id: string;
  name: string;
  description: string;
  visibility: 'public' | 'private';
  adminUserWorkspaceId: string;
  memberUserWorkspaceIds: string[];
  // Whether holders of the workspace admin role read the channel as well.
  isReadableByWorkspaceAdmins: boolean;
};

// A public channel the whole workspace can browse and a private one with an
// invited membership plus a role, so the dev workspace shows every access
// model.
export const APPLE_AGENT_CHAT_CHANNEL_SEEDS: AgentChatChannelSeed[] = [
  {
    id: AGENT_CHAT_CHANNEL_DATA_SEED_IDS.APPLE_SALES_CHANNEL,
    name: 'Sales',
    description: 'Pipeline questions, deal research and outreach drafts.',
    visibility: 'public',
    adminUserWorkspaceId: USER_WORKSPACE_DATA_SEED_IDS.TIM,
    memberUserWorkspaceIds: [
      USER_WORKSPACE_DATA_SEED_IDS.JANE,
      USER_WORKSPACE_DATA_SEED_IDS.JONY,
    ],
    isReadableByWorkspaceAdmins: false,
  },
  {
    id: AGENT_CHAT_CHANNEL_DATA_SEED_IDS.APPLE_LEADERSHIP_CHANNEL,
    name: 'Leadership',
    description:
      'Board prep, forecasts and anything not ready to share widely.',
    visibility: 'private',
    adminUserWorkspaceId: USER_WORKSPACE_DATA_SEED_IDS.TIM,
    memberUserWorkspaceIds: [USER_WORKSPACE_DATA_SEED_IDS.JANE],
    isReadableByWorkspaceAdmins: true,
  },
];

type AgentChatConversationSeed = {
  threadId: string;
  exchanges: [string, string][];
  // Channel the thread lives in; every channel member can read it.
  channelId?: string;
  // Members invited by the thread owner; the owner is always a participant.
  memberUserWorkspaceIds?: string[];
  // Author of the user message of an exchange, by exchange index. Defaults to the owner.
  exchangeAuthorUserWorkspaceIds?: Record<number, string>;
  // How far each reader has got, as the index of the last exchange they read.
  // A cursor short of the final exchange leaves the thread unread for that
  // reader, which is what the drawer badge and the new-message divider are
  // drawn from; a reader with no cursor here has never opened the thread.
  lastReadExchangeIndexByUserWorkspaceId?: Record<string, number>;
};

export const APPLE_AGENT_CHAT_CONVERSATION_SEEDS: AgentChatConversationSeed[] =
  [
    {
      threadId: AGENT_CHAT_THREAD_DATA_SEED_IDS.APPLE_IMPORT_THREAD,
      channelId: AGENT_CHAT_CHANNEL_DATA_SEED_IDS.APPLE_SALES_CHANNEL,
      lastReadExchangeIndexByUserWorkspaceId: {
        [USER_WORKSPACE_DATA_SEED_IDS.TIM]: 1,
        [USER_WORKSPACE_DATA_SEED_IDS.JANE]: 7,
      },
      exchanges: [
        [
          'Help me prepare a company import.',
          'Let’s review the file before importing. We’ll check the columns, clean up duplicates, and confirm the field mapping. No records have been changed.',
        ],
        [
          'Which columns should I include?',
          '## Recommended columns\n\n| Source column | Twenty field | Example |\n| --- | --- | --- |\n| Company | Name | Acme Studio |\n| Website | Domain name | acme.example |\n| City | Address city | Paris |\n| Country | Address country | France |\n| Employees | Employees | 50 |\n| Annual revenue | Annual revenue | 1200000 |\n\nKeep one company per row and put contact details in a separate sheet.',
        ],
        [
          'How should I clean the domains?',
          '## Normalize company websites\n\n1. Remove leading and trailing spaces.\n2. Use the same format for every website.\n3. Check for spelling mistakes.\n4. Separate multiple websites into distinct columns.\n5. Leave unknown websites empty.\n\nFor example, `https://acme.example/about` and `acme.example` refer to the same company domain. Review duplicates before choosing which record to keep.',
        ],
        [
          'What about duplicate companies?',
          '## Review duplicates\n\nGroup rows by domain first, then review matching company names.\n\n- Keep the most complete address.\n- Prefer the most recently verified employee count.\n- Preserve useful notes from both rows.\n- Check subsidiaries before merging similar names.\n- Ask the record owner when details conflict.\n\nDo not merge companies based only on a similar name. Two separate businesses can share a name.',
        ],
        [
          'Can you give me a mapping checklist?',
          '## Confirm the mapping\n\n| Check | Expected result |\n| --- | --- |\n| Company name | Required on every row |\n| Domain | One normalized domain |\n| Employee count | Whole number |\n| Revenue | Number without currency symbols |\n| Currency | A consistent currency code |\n| Country | Consistent country names |\n| Owner | An existing workspace member |\n| Notes | Plain text or supported formatting |\n\nReview a small sample before importing the entire file.',
        ],
        [
          'How do we handle missing values?',
          '## Missing information\n\nLeave unknown values blank instead of entering placeholders such as “N/A” or “unknown”.\n\n1. Require a company name.\n2. Flag rows without a domain for manual review.\n3. Keep missing revenue empty rather than entering zero.\n4. Assign an owner only when the match is clear.\n5. Keep a separate list of rows that need follow-up.\n\nA zero is a real value; it should not mean that information is missing.',
        ],
        [
          'What should I review after a small test import?',
          '## Validate the sample\n\n- Open several imported company records.\n- Check that names and websites are in the right fields.\n- Confirm currencies and numeric formatting.\n- Check that owners resolved correctly.\n- Look for unintended duplicates.\n- Compare the imported row count with the source file.\n\nIf anything looks wrong, correct the mapping before continuing. Keep the original file so you can compare the results.',
        ],
        [
          'Summarize the next steps.',
          '## Ready for review\n\n1. Clean and normalize the source file.\n2. Review potential duplicates.\n3. Confirm field mapping and required values.\n4. Import a small sample.\n5. Review the resulting records.\n6. Import the remaining rows once the sample is correct.\n\nThis conversation is a preparation checklist. No import has been performed.',
        ],
      ],
    },
    {
      // Left open and unassigned on purpose: a channel opens on what nobody
      // has picked up, so the tab a team lands on has something in it.
      threadId: AGENT_CHAT_THREAD_DATA_SEED_IDS.APPLE_PRICING_THREAD,
      channelId: AGENT_CHAT_CHANNEL_DATA_SEED_IDS.APPLE_SALES_CHANNEL,
      exchanges: [
        [
          'A prospect is asking for a discount on the annual plan. What do we usually do?',
          'Annual plans are already billed at a lower effective rate than monthly, so the usual answer is to hold the price and add value elsewhere: a longer pilot, onboarding help, or a later start date. Discounting the list price sets an expectation for the renewal.',
        ],
        [
          'They are comparing us with a cheaper tool. How should I answer?',
          '## Answering a price comparison\n\n1. Ask what they are actually comparing — seats, storage, or the features they use.\n2. Name the two or three things the cheaper tool does not do for them.\n3. Put the difference in their terms: hours saved, handoffs avoided, data they stop re-entering.\n4. Offer a short pilot rather than a lower price.\n\nIf the gap is real and the budget is fixed, say so early rather than late.',
        ],
      ],
    },
    {
      threadId: AGENT_CHAT_THREAD_DATA_SEED_IDS.APPLE_FOLLOW_UP_THREAD,
      memberUserWorkspaceIds: [
        USER_WORKSPACE_DATA_SEED_IDS.JONY,
        USER_WORKSPACE_DATA_SEED_IDS.JANE,
      ],
      exchangeAuthorUserWorkspaceIds: {
        1: USER_WORKSPACE_DATA_SEED_IDS.JONY,
        2: USER_WORKSPACE_DATA_SEED_IDS.JANE,
      },
      lastReadExchangeIndexByUserWorkspaceId: {
        [USER_WORKSPACE_DATA_SEED_IDS.JANE]: 2,
        [USER_WORKSPACE_DATA_SEED_IDS.JONY]: 0,
      },
      exchanges: [
        [
          'Help me plan customer follow-ups for this week.',
          'Start with customers waiting for a reply, then review upcoming renewals and recent meetings.\n\n- Monday: review open questions.\n- Wednesday: follow up after demos.\n- Friday: confirm next steps and owners.',
        ],
        [
          'Draft a short follow-up I can personalize.',
          'Hi [Name],\n\nThanks for our conversation. I’m following up on [topic] and would love to hear your thoughts. Would [day] work for a quick check-in?\n\nBest,\nTim\n\nThis is a draft for review; no message has been sent.',
        ],
        [
          'Can you add a short note on which accounts Tim and Jony each own so we split the follow-ups?',
          'Sure. Tim owns the renewals due this month, Jony owns the open product questions, and Jane covers the accounts without a recent meeting. Each person can take the follow-ups in their column and tick them off here.',
        ],
      ],
    },
  ];
