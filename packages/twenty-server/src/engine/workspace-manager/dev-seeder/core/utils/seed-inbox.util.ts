import { type QueryRunner } from 'typeorm';

import {
  INBOX_ITEM_TYPE_KEY,
  STANDARD_INBOX_ITEM_TYPES,
  type StandardInboxItemTypeKey,
} from 'src/engine/core-modules/inbox/constants/standard-inbox-item-types.constant';
import { InboxItemPriority } from 'src/engine/core-modules/inbox/enums/inbox-item-priority.enum';
import { InboxItemToolCallStatus } from 'src/engine/core-modules/inbox/enums/inbox-item-tool-call-status.enum';
import { type InboxItemContext } from 'src/engine/core-modules/inbox/types/inbox-item-context.type';
import { type InboxItemFieldSchema } from 'src/engine/core-modules/inbox/types/inbox-item-field-schema.type';
import { DEFAULT_INBOX_QUEUE_SLUG } from 'src/engine/core-modules/inbox/services/inbox-queue.service';
import {
  SEED_APPLE_WORKSPACE_ID,
  SEED_YCOMBINATOR_WORKSPACE_ID,
} from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { generateSeedId } from 'src/engine/workspace-manager/dev-seeder/core/utils/generate-seed-id.util';
import { AGENT_CHAT_THREAD_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-agents.util';
import { USER_WORKSPACE_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-user-workspaces.util';
import { COMPANY_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/company-data-seeds.constant';

const inboxItemTypeTableName = 'inboxItemType';
const inboxQueueTableName = 'inboxQueue';
const inboxQueueRoleTableName = 'inboxQueueRole';
const inboxItemTableName = 'inboxItem';
const inboxItemToolCallTableName = 'inboxItemToolCall';
const agentChatThreadTableName = 'agentChatThread';

const HOUR_IN_MS = 60 * 60 * 1000;

export type InboxReferenceIds = {
  applicationId: string;
  adminRoleId: string;
  companyObjectMetadataId: string;
};

type SeedInboxArgs = {
  queryRunner: QueryRunner;
  schemaName: string;
  workspaceId: string;
  inboxReferenceIds: InboxReferenceIds;
};

type SeededPeople = {
  me: string;
  colleague: string;
  threadId: string;
};

// Tim is the account the dev login lands on, so the personal inbox is his.
const getSeededPeople = (workspaceId: string): SeededPeople => {
  if (workspaceId === SEED_APPLE_WORKSPACE_ID) {
    return {
      me: USER_WORKSPACE_DATA_SEED_IDS.TIM,
      colleague: USER_WORKSPACE_DATA_SEED_IDS.JANE,
      threadId: AGENT_CHAT_THREAD_DATA_SEED_IDS.APPLE_DEFAULT_THREAD,
    };
  }

  if (workspaceId === SEED_YCOMBINATOR_WORKSPACE_ID) {
    return {
      me: USER_WORKSPACE_DATA_SEED_IDS.TIM_ACME,
      colleague: USER_WORKSPACE_DATA_SEED_IDS.JANE_ACME,
      threadId: AGENT_CHAT_THREAD_DATA_SEED_IDS.YCOMBINATOR_DEFAULT_THREAD,
    };
  }

  throw new Error(`Unsupported workspace ID for inbox seeding: ${workspaceId}`);
};

type SeededInboxItem = {
  seedName: string;
  typeKey: StandardInboxItemTypeKey;
  title: string;
  priority?: InboxItemPriority;
  hoursAgo: number;
  isRead?: boolean;
  queueSeedName?: string;
  assignee?: 'me' | 'colleague';
  subject?:
    | { kind: 'thread'; which: 'default' | 'review' }
    | { kind: 'company'; companyId: string };
  context: InboxItemContext;
  toolCalls?: SeededToolCall[];
  cleared?: { hoursAgo: number; outcome?: string; resurfaceInHours?: number };
};

type SeededToolCall = {
  toolName: string;
  label: string;
  description: string;
  icon: string;
  inputSchema: InboxItemFieldSchema[];
  proposedInput: Record<string, unknown>;
  status?: InboxItemToolCallStatus;
};

const EMAIL_INPUT_SCHEMA: InboxItemFieldSchema[] = [
  { key: 'to', label: 'To', type: 'TEXT', isRequired: true },
  { key: 'cc', label: 'Cc', type: 'TEXT' },
  { key: 'subject', label: 'Subject', type: 'TEXT', isRequired: true },
  { key: 'body', label: 'Body', type: 'LONG_TEXT', isRequired: true },
];

// Plans an agent proposed from incoming mail, each carrying the context it was
// drawn from and the calls it wants to make.
const SEEDED_PLAN_ITEMS: SeededInboxItem[] = [
  {
    seedName: 'plan-move-google-renewal-forward',
    typeKey: INBOX_ITEM_TYPE_KEY.agentPlan,
    title: "Move Google's renewal forward",
    hoursAgo: 1,
    assignee: 'me',
    subject: { kind: 'company', companyId: COMPANY_DATA_SEED_IDS.ID_1 },
    context: {
      summary:
        "Marie asked to confirm Google's renewal terms and introduced Paul as the new operations lead. The proposed steps keep the renewal moving and bring the new stakeholder into the CRM.",
      source: {
        kind: 'email',
        label: 'Renewal terms + intro to Paul',
        detail: 'Marie Dubois · 3 days ago',
        excerpt:
          'Hi, thanks for the call yesterday. Could you confirm the renewal terms for next year? Also adding Paul Berger who is taking over operations on our side.',
        messageCount: 4,
      },
      entities: [
        {
          key: 'marie',
          label: 'Marie Dubois',
          subtitle: 'Existing Google contact',
          kind: 'person',
        },
        {
          key: 'paul',
          label: 'Paul Berger',
          subtitle: 'New operations lead',
          kind: 'person',
        },
        {
          key: 'google',
          label: 'Google',
          subtitle: 'Annual renewal · tier-2',
          kind: 'company',
          recordId: COMPANY_DATA_SEED_IDS.ID_1,
        },
      ],
      edges: [
        { from: 'marie', to: 'paul', label: 'intro' },
        { from: 'paul', to: 'google', label: 'from' },
      ],
    },
    toolCalls: [
      {
        toolName: 'send_email',
        label: 'Send email',
        description: 'Send Marie a reply confirming the renewal pricing.',
        icon: 'IconMail',
        inputSchema: EMAIL_INPUT_SCHEMA,
        proposedInput: {
          to: 'marie.dubois@google.com',
          cc: 'joe.gebbia@google.com',
          subject: 'Re: Renewal terms + intro to Paul',
          body: 'Hi Marie,\n\nThanks for the quick follow-up. The renewal keeps your current terms for another 12 months, with the tier-2 volume you asked about billed at the same rate.\n\nGreat to have Paul in the loop, I have added him here.\n\nBest,\nTim',
        },
      },
      {
        toolName: 'update_opportunity',
        label: 'Update opportunity',
        description:
          "Google's opportunity should reflect Marie's willingness to renew at tier-2.",
        icon: 'IconTargetArrow',
        inputSchema: [
          { key: 'stage', label: 'Stage', type: 'TEXT', isRequired: true },
          { key: 'amount', label: 'Amount', type: 'NUMBER' },
          { key: 'closeDate', label: 'Close date', type: 'TEXT' },
        ],
        proposedInput: {
          stage: 'PROPOSAL',
          amount: 24000,
          closeDate: '2026-10-15',
        },
      },
      {
        toolName: 'create_person',
        label: 'Create record',
        description:
          'Paul should be created in People as Marie said he is the new head of Ops.',
        icon: 'IconUserPlus',
        inputSchema: [
          {
            key: 'firstName',
            label: 'First name',
            type: 'TEXT',
            isRequired: true,
          },
          {
            key: 'lastName',
            label: 'Last name',
            type: 'TEXT',
            isRequired: true,
          },
          { key: 'email', label: 'Email', type: 'TEXT' },
          { key: 'jobTitle', label: 'Job title', type: 'TEXT' },
        ],
        proposedInput: {
          firstName: 'Paul',
          lastName: 'Berger',
          email: 'paul.berger@google.com',
          jobTitle: 'Head of Operations',
        },
      },
      {
        toolName: 'send_slack_message',
        label: 'Send Slack DM',
        description:
          'Julien is in charge of pricing, he is the one making the final decision.',
        icon: 'IconMessageCircle',
        inputSchema: [
          { key: 'to', label: 'To', type: 'TEXT', isRequired: true },
          {
            key: 'message',
            label: 'Message',
            type: 'LONG_TEXT',
            isRequired: true,
          },
        ],
        proposedInput: {
          to: '@julien',
          message:
            'Google confirmed the tier-2 renewal at the current rate. Can you sign off on the pricing before I send the invoice?',
        },
      },
    ],
  },
  {
    seedName: 'plan-invoice-microsoft-renewal',
    typeKey: INBOX_ITEM_TYPE_KEY.agentPlan,
    title: "Invoice Microsoft's annual renewal",
    hoursAgo: 1.5,
    assignee: 'me',
    subject: { kind: 'company', companyId: COMPANY_DATA_SEED_IDS.ID_2 },
    context: {
      summary:
        "Microsoft's renewal was signed last week. Billing asked for the invoice before the end of the month so it lands in this quarter.",
      source: {
        kind: 'email',
        label: 'Renewal signed, invoice please',
        detail: 'Anna Lee · yesterday',
        excerpt:
          'Signed copy attached. Could you send the invoice to ap@microsoft.com before the 30th?',
        messageCount: 2,
      },
      entities: [
        {
          key: 'anna',
          label: 'Anna Lee',
          subtitle: 'Procurement',
          kind: 'person',
        },
        {
          key: 'microsoft',
          label: 'Microsoft',
          subtitle: 'Annual renewal',
          kind: 'company',
          recordId: COMPANY_DATA_SEED_IDS.ID_2,
        },
      ],
      edges: [{ from: 'anna', to: 'microsoft', label: 'from' }],
    },
    toolCalls: [
      {
        toolName: 'create_invoice',
        label: 'Create invoice',
        description: 'A $24,000 invoice for the 12-month renewal.',
        icon: 'IconCurrencyDollar',
        inputSchema: [
          { key: 'amount', label: 'Amount', type: 'NUMBER', isRequired: true },
          { key: 'currency', label: 'Currency', type: 'TEXT' },
          { key: 'dueInDays', label: 'Due in days', type: 'NUMBER' },
        ],
        proposedInput: { amount: 24000, currency: 'USD', dueInDays: 30 },
      },
      {
        toolName: 'send_email',
        label: 'Send email',
        description: 'Send the invoice to accounts payable with Anna in copy.',
        icon: 'IconMail',
        inputSchema: EMAIL_INPUT_SCHEMA,
        proposedInput: {
          to: 'ap@microsoft.com',
          cc: 'anna.lee@microsoft.com',
          subject: 'Invoice for the 2027 renewal',
          body: 'Hello,\n\nPlease find attached the invoice for the annual renewal, due in 30 days.\n\nThanks,\nTim',
        },
      },
    ],
  },
  {
    seedName: 'plan-create-meta-opportunity',
    typeKey: INBOX_ITEM_TYPE_KEY.agentPlan,
    title: 'Create an opportunity for Meta',
    hoursAgo: 2,
    assignee: 'me',
    subject: { kind: 'company', companyId: COMPANY_DATA_SEED_IDS.ID_3 },
    context: {
      summary:
        'On the call, Sarah said the ads team wants 45 more seats next quarter. Nothing tracks it yet.',
      source: {
        kind: 'call',
        label: 'Call with Sarah Kim',
        detail: '25 min · this morning',
        excerpt:
          'We are looking at another 45 seats for the ads team, probably Q1.',
      },
      entities: [
        {
          key: 'sarah',
          label: 'Sarah Kim',
          subtitle: 'Ads team lead',
          kind: 'person',
        },
        {
          key: 'meta',
          label: 'Meta',
          subtitle: 'Customer since 2024',
          kind: 'company',
          recordId: COMPANY_DATA_SEED_IDS.ID_3,
        },
      ],
      edges: [{ from: 'sarah', to: 'meta', label: 'at' }],
    },
    toolCalls: [
      {
        toolName: 'create_opportunity',
        label: 'Create opportunity',
        description: 'A $45,000 expansion for 45 seats, closing next quarter.',
        icon: 'IconTargetArrow',
        inputSchema: [
          { key: 'name', label: 'Name', type: 'TEXT', isRequired: true },
          { key: 'amount', label: 'Amount', type: 'NUMBER' },
          { key: 'stage', label: 'Stage', type: 'TEXT' },
          { key: 'closeDate', label: 'Close date', type: 'TEXT' },
        ],
        proposedInput: {
          name: 'Meta ads team expansion',
          amount: 45000,
          stage: 'NEW',
          closeDate: '2027-01-31',
        },
      },
      {
        toolName: 'create_task',
        label: 'Create task',
        description: 'Follow up with Sarah once the seat count is confirmed.',
        icon: 'IconCheckbox',
        inputSchema: [
          { key: 'title', label: 'Title', type: 'TEXT', isRequired: true },
          { key: 'dueDate', label: 'Due date', type: 'TEXT' },
        ],
        proposedInput: {
          title: 'Confirm seat count with Sarah',
          dueDate: '2026-09-10',
        },
      },
    ],
  },
  {
    seedName: 'plan-schedule-demo-with-slb',
    typeKey: INBOX_ITEM_TYPE_KEY.agentPlan,
    title: 'Schedule a demo with SLB',
    hoursAgo: 3,
    assignee: 'me',
    subject: { kind: 'company', companyId: COMPANY_DATA_SEED_IDS.ID_4 },
    context: {
      summary:
        'Three people from SLB asked for a demo next week. The agent found a slot that works for everyone in the thread.',
      source: {
        kind: 'email',
        label: 'Demo next week?',
        detail: 'Omar Haddad · 2 days ago',
        excerpt:
          'Could we get a demo next Tuesday or Wednesday afternoon? Copying the two colleagues who will join.',
        messageCount: 3,
      },
      entities: [
        {
          key: 'omar',
          label: 'Omar Haddad',
          subtitle: 'Champion',
          kind: 'person',
        },
        {
          key: 'slb',
          label: 'SLB',
          subtitle: 'Evaluation',
          kind: 'company',
          recordId: COMPANY_DATA_SEED_IDS.ID_4,
        },
      ],
      edges: [{ from: 'omar', to: 'slb', label: 'at' }],
    },
    toolCalls: [
      {
        toolName: 'create_calendar_event',
        label: 'Create event',
        description: 'Wednesday 3pm, 45 minutes, with the three SLB attendees.',
        icon: 'IconCalendarEvent',
        inputSchema: [
          { key: 'title', label: 'Title', type: 'TEXT', isRequired: true },
          {
            key: 'startsAt',
            label: 'Starts at',
            type: 'TEXT',
            isRequired: true,
          },
          {
            key: 'durationMinutes',
            label: 'Duration (minutes)',
            type: 'NUMBER',
          },
          { key: 'attendees', label: 'Attendees', type: 'TEXT' },
        ],
        proposedInput: {
          title: 'Twenty demo for SLB',
          startsAt: '2026-09-09T15:00:00+02:00',
          durationMinutes: 45,
          attendees: 'omar.haddad@slb.com, lea.martin@slb.com, k.osei@slb.com',
        },
      },
      {
        toolName: 'send_email',
        label: 'Send email',
        description: 'Confirm the slot and share the agenda.',
        icon: 'IconMail',
        inputSchema: EMAIL_INPUT_SCHEMA,
        proposedInput: {
          to: 'omar.haddad@slb.com',
          cc: 'lea.martin@slb.com, k.osei@slb.com',
          subject: 'Re: Demo next week?',
          body: 'Hi Omar,\n\nWednesday at 3pm works on our side, invite is on its way. We will cover pipeline, automations and the API in 45 minutes.\n\nTalk soon,\nTim',
        },
      },
    ],
  },
  {
    seedName: 'plan-update-cisco-profile',
    typeKey: INBOX_ITEM_TYPE_KEY.agentPlan,
    title: "Update Cisco's company profile",
    priority: InboxItemPriority.UPDATE,
    hoursAgo: 5,
    isRead: true,
    assignee: 'me',
    subject: { kind: 'company', companyId: COMPANY_DATA_SEED_IDS.ID_5 },
    context: {
      summary:
        "Cisco's annual report was published this week. Three fields on the company record are out of date.",
      source: {
        kind: 'record',
        label: 'Cisco',
        detail: 'Company record · last edited 4 months ago',
      },
      entities: [
        {
          key: 'cisco',
          label: 'Cisco',
          subtitle: 'Customer',
          kind: 'company',
          recordId: COMPANY_DATA_SEED_IDS.ID_5,
        },
      ],
    },
    toolCalls: [
      {
        toolName: 'update_company',
        label: 'Update record',
        description:
          'Headcount 84,900, industry Networking, website cisco.com.',
        icon: 'IconBuildingSkyscraper',
        inputSchema: [
          { key: 'employees', label: 'Employees', type: 'NUMBER' },
          { key: 'industry', label: 'Industry', type: 'TEXT' },
          { key: 'domainName', label: 'Website', type: 'TEXT' },
        ],
        proposedInput: {
          employees: 84900,
          industry: 'Networking',
          domainName: 'cisco.com',
        },
      },
    ],
  },
  {
    seedName: 'plan-log-call-with-uber',
    typeKey: INBOX_ITEM_TYPE_KEY.agentPlan,
    title: 'Log the call with Uber',
    priority: InboxItemPriority.UPDATE,
    hoursAgo: 28,
    isRead: true,
    assignee: 'me',
    subject: { kind: 'company', companyId: COMPANY_DATA_SEED_IDS.ID_6 },
    context: {
      summary:
        'A 30 minute call with Uber covered pricing and the security questionnaire. Both are recorded in the notes below.',
      source: {
        kind: 'call',
        label: 'Call with Dana Ruiz',
        detail: '30 min · yesterday',
        excerpt:
          'Pricing is fine if we can get the SOC 2 report by the end of the month.',
      },
      entities: [
        {
          key: 'dana',
          label: 'Dana Ruiz',
          subtitle: 'Security lead',
          kind: 'person',
        },
        {
          key: 'uber',
          label: 'Uber',
          subtitle: 'Negotiation',
          kind: 'company',
          recordId: COMPANY_DATA_SEED_IDS.ID_6,
        },
      ],
      edges: [{ from: 'dana', to: 'uber', label: 'at' }],
    },
    toolCalls: [
      {
        toolName: 'create_note',
        label: 'Create note',
        description:
          'Call notes with the pricing agreement and the SOC 2 request.',
        icon: 'IconNotes',
        inputSchema: [
          { key: 'title', label: 'Title', type: 'TEXT', isRequired: true },
          { key: 'body', label: 'Body', type: 'LONG_TEXT', isRequired: true },
        ],
        proposedInput: {
          title: 'Call with Dana Ruiz',
          body: 'Pricing accepted at the proposed tier. Dana needs the SOC 2 report before the end of the month to close.',
        },
        status: InboxItemToolCallStatus.EXECUTED,
      },
      {
        toolName: 'update_opportunity',
        label: 'Update opportunity',
        description: 'Move the Uber opportunity to negotiation.',
        icon: 'IconTargetArrow',
        inputSchema: [
          { key: 'stage', label: 'Stage', type: 'TEXT', isRequired: true },
        ],
        proposedInput: { stage: 'NEGOTIATION' },
        status: InboxItemToolCallStatus.EXECUTED,
      },
    ],
    cleared: { hoursAgo: 27, outcome: 'DONE' },
  },
];

// One of everything the inbox can show: unread and read, needs action and
// update, personal and shared, snoozed, done, and an item a new event revived
// after it was cleared.
const SEEDED_INBOX_ITEMS: SeededInboxItem[] = [
  {
    seedName: 'approve-google-renewal',
    typeKey: INBOX_ITEM_TYPE_KEY.approval,
    title: "Approve Google's renewal quote",
    context: {
      summary:
        'Send Marie the $24,000 invoice and confirm the tier-2 volume at the same rate.',
    },
    hoursAgo: 1,
    assignee: 'me',
    subject: { kind: 'company', companyId: COMPANY_DATA_SEED_IDS.ID_1 },
    toolCalls: [
      {
        toolName: 'send_email',
        label: 'Send the renewal quote',
        description: 'Email Marie the quote with the invoice attached.',
        icon: 'IconMail',
        inputSchema: EMAIL_INPUT_SCHEMA,
        proposedInput: {
          to: 'marie.dubois@google.com',
          cc: '',
          subject: 'Your renewal quote',
          body: 'Hi Marie,\n\nPlease find the renewal quote attached: $24,000 for 12 months at the tier-2 rate.\n\nBest,\nTim',
        },
      },
    ],
  },
  {
    seedName: 'question-microsoft-tier',
    typeKey: INBOX_ITEM_TYPE_KEY.agentQuestion,
    title: 'Which pricing tier should I quote Microsoft?',
    context: {
      summary:
        'Two plans match. The expansion opportunity mentions 45 seats, which sits between them.',
    },
    hoursAgo: 2,
    assignee: 'me',
    subject: { kind: 'thread', which: 'default' },
  },
  {
    seedName: 'sync-invoices-run-failed',
    typeKey: INBOX_ITEM_TYPE_KEY.workflowRunFailed,
    title: 'Sync invoices to Stripe failed',
    context: {
      summary:
        "Step 'Create invoice' failed: the Stripe API key has expired. 3 invoices were not sent.",
    },
    hoursAgo: 3,
    assignee: 'me',
  },
  {
    seedName: 'meta-buying-committee',
    typeKey: INBOX_ITEM_TYPE_KEY.conversation,
    title: "Add Meta's buying committee",
    context: {
      summary: 'New reply: Sarah added two more stakeholders to the thread.',
    },
    priority: InboxItemPriority.UPDATE,
    hoursAgo: 4,
    assignee: 'me',
    subject: { kind: 'thread', which: 'review' },
    cleared: { hoursAgo: 20, outcome: 'DONE' },
  },
  {
    seedName: 'q4-pipeline-review',
    typeKey: INBOX_ITEM_TYPE_KEY.conversation,
    title: 'Prepare the Q4 pipeline review',
    context: {
      summary:
        'Draft ready: three opportunities moved, two close dates pushed to November.',
    },
    priority: InboxItemPriority.UPDATE,
    hoursAgo: 26,
    isRead: true,
    assignee: 'me',
    subject: { kind: 'thread', which: 'review' },
  },
  {
    seedName: 'review-cisco-onboarding-fee',
    typeKey: INBOX_ITEM_TYPE_KEY.approval,
    title: "Review Cisco's onboarding fee",
    context: {
      summary:
        'A $5,000 onboarding invoice is ready to send once the fee is confirmed.',
    },
    hoursAgo: 8,
    isRead: true,
    assignee: 'me',
    subject: { kind: 'company', companyId: COMPANY_DATA_SEED_IDS.ID_5 },
    cleared: { hoursAgo: 1, resurfaceInHours: 3 },
  },
  {
    seedName: 'approve-uber-invoice',
    typeKey: INBOX_ITEM_TYPE_KEY.approval,
    title: "Approve Uber's onboarding invoice",
    context: { summary: 'Invoice #1042 for $5,000, due in 30 days.' },
    hoursAgo: 50,
    isRead: true,
    assignee: 'me',
    subject: { kind: 'company', companyId: COMPANY_DATA_SEED_IDS.ID_6 },
    cleared: { hoursAgo: 48, outcome: 'DONE' },
  },
  {
    seedName: 'salesforce-profile-update',
    typeKey: INBOX_ITEM_TYPE_KEY.conversation,
    title: "Update Salesforce's company profile",
    context: {
      summary:
        'Industry, headcount and website were refreshed from the latest filing.',
    },
    priority: InboxItemPriority.UPDATE,
    hoursAgo: 72,
    isRead: true,
    assignee: 'me',
    subject: { kind: 'thread', which: 'review' },
    cleared: { hoursAgo: 70, outcome: 'DONE' },
  },
  {
    seedName: 'move-google-renewal-forward',
    typeKey: INBOX_ITEM_TYPE_KEY.approval,
    title: "Move Google's renewal forward",
    context: {
      summary:
        'Reply to Marie in Gmail, update the opportunity and add Paul as the new operations lead.',
    },
    hoursAgo: 1,
    queueSeedName: 'sales',
    subject: { kind: 'company', companyId: COMPANY_DATA_SEED_IDS.ID_1 },
  },
  {
    seedName: 'create-microsoft-opportunity',
    typeKey: INBOX_ITEM_TYPE_KEY.conversation,
    title: 'Create an opportunity for Microsoft',
    context: {
      summary:
        'A $45,000 expansion opportunity is drafted from the call notes.',
    },
    priority: InboxItemPriority.UPDATE,
    hoursAgo: 2,
    queueSeedName: 'sales',
    subject: { kind: 'company', companyId: COMPANY_DATA_SEED_IDS.ID_2 },
  },
  {
    seedName: 'follow-up-slb-buyer',
    typeKey: INBOX_ITEM_TYPE_KEY.approval,
    title: "Follow up with SLB's buyer",
    context: {
      summary:
        'Send the proposal and create a follow-up task for next Tuesday.',
    },
    hoursAgo: 3,
    queueSeedName: 'sales',
    assignee: 'colleague',
    subject: { kind: 'company', companyId: COMPANY_DATA_SEED_IDS.ID_4 },
  },
  {
    seedName: 'log-call-with-sarah',
    typeKey: INBOX_ITEM_TYPE_KEY.conversation,
    title: 'Log the call with Sarah',
    context: {
      summary: 'Save the call notes and update the opportunity stage.',
    },
    priority: InboxItemPriority.UPDATE,
    hoursAgo: 5,
    queueSeedName: 'support',
    subject: { kind: 'company', companyId: COMPANY_DATA_SEED_IDS.ID_3 },
  },
  {
    seedName: 'amdocs-ticket-closed',
    typeKey: INBOX_ITEM_TYPE_KEY.conversation,
    title: "Amdocs' import ticket was closed",
    context: {
      summary: 'The duplicate contacts were merged and the customer confirmed.',
    },
    priority: InboxItemPriority.UPDATE,
    hoursAgo: 30,
    isRead: true,
    queueSeedName: 'support',
    subject: { kind: 'company', companyId: COMPANY_DATA_SEED_IDS.ID_8 },
    cleared: { hoursAgo: 28, outcome: 'DONE' },
  },
  {
    seedName: 'update-q4-pipeline',
    typeKey: INBOX_ITEM_TYPE_KEY.conversation,
    title: 'Update the Q4 pipeline',
    context: {
      summary:
        'Three opportunity close dates and two amounts changed since the last review.',
    },
    priority: InboxItemPriority.UPDATE,
    hoursAgo: 24,
    queueSeedName: DEFAULT_INBOX_QUEUE_SLUG,
    subject: { kind: 'company', companyId: COMPANY_DATA_SEED_IDS.ID_7 },
  },
];

type SeededQueue = {
  seedName: string;
  name: string;
  slug: string;
  icon: string;
  isDefault: boolean;
};

const SEEDED_QUEUES: SeededQueue[] = [
  {
    seedName: DEFAULT_INBOX_QUEUE_SLUG,
    name: 'Triage',
    slug: DEFAULT_INBOX_QUEUE_SLUG,
    icon: 'IconInbox',
    isDefault: true,
  },
  {
    seedName: 'sales',
    name: 'Sales',
    slug: 'sales',
    icon: 'IconTargetArrow',
    isDefault: false,
  },
  {
    seedName: 'support',
    name: 'Support',
    slug: 'support',
    icon: 'IconLifebuoy',
    isDefault: false,
  },
];

const hoursAgo = (now: Date, hours: number): Date =>
  new Date(now.getTime() - hours * HOUR_IN_MS);

export const seedInbox = async ({
  queryRunner,
  schemaName,
  workspaceId,
  inboxReferenceIds,
}: SeedInboxArgs) => {
  const people = getSeededPeople(workspaceId);
  const now = new Date();

  // The same rows the service seeds on first use, so a later upsert finds them
  // by universal identifier and only refreshes their declarations. The ids are
  // read back rather than assumed, in case the service got there first.
  await queryRunner.manager
    .createQueryBuilder()
    .insert()
    .into(`${schemaName}.${inboxItemTypeTableName}`, [
      'id',
      'workspaceId',
      'universalIdentifier',
      'applicationId',
      'key',
      'label',
      'icon',
      'defaultPriority',
    ])
    .orIgnore()
    .values(
      STANDARD_INBOX_ITEM_TYPES.map((standardType) => ({
        id: generateSeedId(workspaceId, `inbox-item-type-${standardType.key}`),
        workspaceId,
        universalIdentifier: standardType.universalIdentifier,
        applicationId: inboxReferenceIds.applicationId,
        key: standardType.key,
        label: standardType.label,
        icon: standardType.icon,
        defaultPriority: standardType.defaultPriority,
      })),
    )
    .execute();

  const typeRows: { id: string; key: StandardInboxItemTypeKey }[] =
    await queryRunner.query(
      `SELECT "id", "key" FROM ${schemaName}."${inboxItemTypeTableName}"
       WHERE "workspaceId" = $1 AND "deletedAt" IS NULL`,
      [workspaceId],
    );
  const typeIdByKey = Object.fromEntries(
    typeRows.map((row) => [row.key, row.id]),
  ) as Record<StandardInboxItemTypeKey, string>;

  const queueIdBySeedName = Object.fromEntries(
    SEEDED_QUEUES.map((queue) => [
      queue.seedName,
      generateSeedId(workspaceId, `inbox-queue-${queue.seedName}`),
    ]),
  );

  await queryRunner.manager
    .createQueryBuilder()
    .insert()
    .into(`${schemaName}.${inboxQueueTableName}`, [
      'id',
      'workspaceId',
      'name',
      'slug',
      'icon',
      'isDefault',
    ])
    .orIgnore()
    .values(
      SEEDED_QUEUES.map((queue) => ({
        id: queueIdBySeedName[queue.seedName],
        workspaceId,
        name: queue.name,
        slug: queue.slug,
        icon: queue.icon,
        isDefault: queue.isDefault,
      })),
    )
    .execute();

  // Triage is reachable by everyone once it exists. The shared inboxes are
  // granted to the admin role and to whatever role the dev login holds, which
  // is admin in the light seed and a restricted role in the full one.
  const roleRows: { roleId: string }[] = await queryRunner.query(
    `SELECT DISTINCT "roleId" FROM ${schemaName}."roleTarget"
     WHERE "workspaceId" = $1 AND "userWorkspaceId" = $2`,
    [workspaceId, people.me],
  );
  const grantedRoleIds = [
    ...new Set([
      inboxReferenceIds.adminRoleId,
      ...roleRows.map((row) => row.roleId),
    ]),
  ];

  await queryRunner.manager
    .createQueryBuilder()
    .insert()
    .into(`${schemaName}.${inboxQueueRoleTableName}`, [
      'id',
      'workspaceId',
      'queueId',
      'roleId',
    ])
    .orIgnore()
    .values(
      SEEDED_QUEUES.filter((queue) => !queue.isDefault).flatMap((queue) =>
        grantedRoleIds.map((roleId) => ({
          id: generateSeedId(
            workspaceId,
            `inbox-queue-role-${queue.seedName}-${roleId}`,
          ),
          workspaceId,
          queueId: queueIdBySeedName[queue.seedName],
          roleId,
        })),
      ),
    )
    .execute();

  // A second thread, so the conversations are not all the same chat.
  const reviewThreadId = generateSeedId(workspaceId, 'inbox-review-thread');

  await queryRunner.manager
    .createQueryBuilder()
    .insert()
    .into(`${schemaName}.${agentChatThreadTableName}`, [
      'id',
      'workspaceId',
      'userWorkspaceId',
      'title',
      'createdAt',
      'updatedAt',
    ])
    .orIgnore()
    .values([
      {
        id: reviewThreadId,
        workspaceId,
        userWorkspaceId: people.me,
        title: 'Q4 pipeline review',
        createdAt: hoursAgo(now, 30),
        updatedAt: hoursAgo(now, 26),
      },
    ])
    .execute();

  const threadIdByWhich = {
    default: people.threadId,
    review: reviewThreadId,
  };

  await queryRunner.manager
    .createQueryBuilder()
    .insert()
    .into(`${schemaName}.${inboxItemTableName}`, [
      'id',
      'workspaceId',
      'inboxItemTypeId',
      'priority',
      'title',
      'context',
      'lastEventAt',
      'clearedAt',
      'resurfaceAt',
      'clearedByUserWorkspaceId',
      'outcome',
      'readAt',
      'threadId',
      'subjectObjectMetadataId',
      'subjectRecordId',
      'queueId',
      'assigneeUserWorkspaceId',
      'slotKey',
      'createdAt',
      'updatedAt',
    ])
    .orIgnore()
    .values(
      [...SEEDED_PLAN_ITEMS, ...SEEDED_INBOX_ITEMS].map((item) => {
        const lastEventAt = hoursAgo(now, item.hoursAgo);
        const clearedAt = item.cleared
          ? hoursAgo(now, item.cleared.hoursAgo)
          : null;
        const assigneeUserWorkspaceId = item.assignee
          ? people[item.assignee]
          : null;
        const isCleared = clearedAt !== null;

        return {
          id: generateSeedId(workspaceId, `inbox-item-${item.seedName}`),
          workspaceId,
          inboxItemTypeId: typeIdByKey[item.typeKey],
          priority: item.priority ?? InboxItemPriority.NEEDS_ACTION,
          title: item.title,
          context: item.context,
          lastEventAt,
          clearedAt,
          resurfaceAt:
            isCleared && item.cleared?.resurfaceInHours !== undefined
              ? new Date(
                  now.getTime() + item.cleared.resurfaceInHours * HOUR_IN_MS,
                )
              : null,
          clearedByUserWorkspaceId: isCleared ? people.me : null,
          outcome: item.cleared?.outcome ?? null,
          // Read means seen since the last event; a cleared item was seen too.
          readAt: item.isRead || isCleared ? lastEventAt : null,
          threadId:
            item.subject?.kind === 'thread'
              ? threadIdByWhich[item.subject.which]
              : null,
          subjectObjectMetadataId:
            item.subject?.kind === 'company'
              ? inboxReferenceIds.companyObjectMetadataId
              : null,
          subjectRecordId:
            item.subject?.kind === 'company' ? item.subject.companyId : null,
          queueId: item.queueSeedName
            ? queueIdBySeedName[item.queueSeedName]
            : null,
          assigneeUserWorkspaceId,
          slotKey: `${item.typeKey}:${item.seedName}`,
          createdAt: hoursAgo(
            now,
            Math.max(item.hoursAgo, item.cleared?.hoursAgo ?? 0),
          ),
          updatedAt: lastEventAt,
        };
      }),
    )
    .execute();

  await queryRunner.manager
    .createQueryBuilder()
    .insert()
    .into(`${schemaName}.${inboxItemToolCallTableName}`, [
      'id',
      'workspaceId',
      'inboxItemId',
      'position',
      'toolName',
      'label',
      'description',
      'icon',
      'inputSchema',
      'proposedInput',
      'status',
      'output',
      'resolvedByUserWorkspaceId',
      'resolvedAt',
    ])
    .orIgnore()
    .values(
      [...SEEDED_PLAN_ITEMS, ...SEEDED_INBOX_ITEMS].flatMap((item) =>
        (item.toolCalls ?? []).map((toolCall, position) => {
          const isExecuted =
            toolCall.status === InboxItemToolCallStatus.EXECUTED;

          return {
            id: generateSeedId(
              workspaceId,
              `inbox-item-tool-call-${item.seedName}-${position}`,
            ),
            workspaceId,
            inboxItemId: generateSeedId(
              workspaceId,
              `inbox-item-${item.seedName}`,
            ),
            position,
            toolName: toolCall.toolName,
            label: toolCall.label,
            description: toolCall.description,
            icon: toolCall.icon,
            inputSchema: toolCall.inputSchema,
            proposedInput: toolCall.proposedInput,
            status: toolCall.status ?? InboxItemToolCallStatus.PROPOSED,
            output: isExecuted ? toolCall.proposedInput : null,
            resolvedByUserWorkspaceId: isExecuted ? people.me : null,
            resolvedAt: isExecuted
              ? hoursAgo(now, item.cleared?.hoursAgo ?? item.hoursAgo)
              : null,
          };
        }),
      ),
    )
    .execute();
};
