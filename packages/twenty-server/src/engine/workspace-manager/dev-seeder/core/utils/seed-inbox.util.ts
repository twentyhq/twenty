import { isDefined } from 'twenty-shared/utils';
import { type QueryRunner } from 'typeorm';

import { InboxItemPriority } from 'src/engine/core-modules/inbox/enums/inbox-item-priority.enum';
import { InboxItemToolCallStatus } from 'src/engine/core-modules/inbox/enums/inbox-item-tool-call-status.enum';
import {
  INBOX_ITEM_CONTEXT_VERSION,
  type InboxItemContextSource,
} from 'src/engine/core-modules/inbox/types/inbox-item-context.type';
import { type InboxItemFieldSchema } from 'src/engine/core-modules/inbox/types/inbox-item-field-schema.type';
import { DEFAULT_INBOX_QUEUE_NAME } from 'src/engine/core-modules/inbox/services/inbox-queue.service';
import {
  SEED_APPLE_WORKSPACE_ID,
  SEED_YCOMBINATOR_WORKSPACE_ID,
} from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { generateSeedId } from 'src/engine/workspace-manager/dev-seeder/core/utils/generate-seed-id.util';
import { AGENT_CHAT_THREAD_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/constants/agent-chat-seeds.constant';
import { USER_WORKSPACE_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-user-workspaces.util';
import { EMAIL_GROUP_CHANNEL_SEED_HANDLES } from 'src/engine/workspace-manager/dev-seeder/core/constants/message-channel-seed-ids.constant';
import { COMPANY_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/company-data-seeds.constant';
import { INBOX_MESSAGE_THREAD_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/inbox-message-thread-data-seeds.constant';
import { MESSAGE_THREAD_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/message-thread-data-seeds.constant';
import { InboxItemFieldType } from 'src/engine/core-modules/inbox/enums/inbox-item-field-type.enum';

const inboxQueueTableName = 'inboxQueue';
const inboxQueueRoleTableName = 'inboxQueueRole';
const inboxItemTableName = 'inboxItem';
const inboxItemToolCallTableName = 'inboxItemToolCall';
const inboxItemRecordTableName = 'inboxItemRecord';
const agentChatThreadTableName = 'agentChatThread';
const messageChannelTableName = 'messageChannel';

const HOUR_IN_MS = 60 * 60 * 1000;

export type InboxReferenceIds = {
  applicationId: string;
  adminRoleId: string;
  companyObjectMetadataId: string;
  messageThreadObjectMetadataId: string;
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
  icon: string;
  title: string;
  priority?: InboxItemPriority;
  hoursAgo: number;
  isRead?: boolean;
  queueName?: string;
  assignee?: 'me' | 'colleague';
  subject?:
    | { kind: 'thread'; which: 'default' | 'review' }
    | { kind: 'company'; companyId: string }
    | { kind: 'messageThread'; threadId: string };
  // How a seed author describes an item. The writer below turns it into what
  // the model actually stores: a summary column, provenance in context, and a
  // row per record.
  content: SeededInboxContent;
  toolCalls?: SeededToolCall[];
  cleared?: { hoursAgo: number; outcome?: string; resurfaceInHours?: number };
};

type SeededEntityKind =
  | 'person'
  | 'company'
  | 'opportunity'
  | 'messageThread'
  | 'other';

type SeededInboxContent = {
  summary?: string;
  source?: InboxItemContextSource;
  entities?: {
    key: string;
    label: string;
    subtitle?: string;
    kind: SeededEntityKind;
    recordId?: string;
  }[];
  edges?: { from: string; to: string; label: string }[];
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

// The real tool takes recipients as one nested object, so the seeds carry the
// shape it actually runs with rather than a flattened stand-in.
const EMAIL_INPUT_SCHEMA: InboxItemFieldSchema[] = [
  {
    key: 'recipients',
    label: 'Recipients',
    type: InboxItemFieldType.OBJECT,
    isRequired: true,
  },
  {
    key: 'subject',
    label: 'Subject',
    type: InboxItemFieldType.TEXT,
    isRequired: true,
  },
  {
    key: 'body',
    label: 'Body',
    type: InboxItemFieldType.LONG_TEXT,
    isRequired: true,
  },
];

// Plans an agent proposed from incoming mail, each carrying the context it was
// drawn from and the calls it wants to make. Running a plan dispatches for
// real: a send_email call goes out through the approver's connected account,
// which in a seeded workspace has no live credentials and so lands as a failed
// step. The record-writing names stay illustrative and report as unknown tools
// until each is mapped to its create_one_/update_one_ equivalent.
const SEEDED_PLAN_ITEMS: SeededInboxItem[] = [
  {
    seedName: 'plan-move-google-renewal-forward',
    icon: 'IconSparkles',
    title: "Move Google's renewal forward",
    hoursAgo: 1,
    assignee: 'me',
    subject: { kind: 'company', companyId: COMPANY_DATA_SEED_IDS.ID_1 },
    content: {
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
          recipients: {
            to: 'marie.dubois@google.com',
            cc: 'joe.gebbia@google.com',
          },
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
          {
            key: 'stage',
            label: 'Stage',
            type: InboxItemFieldType.TEXT,
            isRequired: true,
          },
          { key: 'amount', label: 'Amount', type: InboxItemFieldType.NUMBER },
          {
            key: 'closeDate',
            label: 'Close date',
            type: InboxItemFieldType.TEXT,
          },
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
            type: InboxItemFieldType.TEXT,
            isRequired: true,
          },
          {
            key: 'lastName',
            label: 'Last name',
            type: InboxItemFieldType.TEXT,
            isRequired: true,
          },
          { key: 'email', label: 'Email', type: InboxItemFieldType.TEXT },
          {
            key: 'jobTitle',
            label: 'Job title',
            type: InboxItemFieldType.TEXT,
          },
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
          {
            key: 'to',
            label: 'To',
            type: InboxItemFieldType.TEXT,
            isRequired: true,
          },
          {
            key: 'message',
            label: 'Message',
            type: InboxItemFieldType.LONG_TEXT,
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
    icon: 'IconSparkles',
    title: "Invoice Microsoft's annual renewal",
    hoursAgo: 1.5,
    assignee: 'me',
    subject: { kind: 'company', companyId: COMPANY_DATA_SEED_IDS.ID_2 },
    content: {
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
          {
            key: 'amount',
            label: 'Amount',
            type: InboxItemFieldType.NUMBER,
            isRequired: true,
          },
          { key: 'currency', label: 'Currency', type: InboxItemFieldType.TEXT },
          {
            key: 'dueInDays',
            label: 'Due in days',
            type: InboxItemFieldType.NUMBER,
          },
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
          recipients: {
            to: 'ap@microsoft.com',
            cc: 'anna.lee@microsoft.com',
          },
          subject: 'Invoice for the 2027 renewal',
          body: 'Hello,\n\nPlease find attached the invoice for the annual renewal, due in 30 days.\n\nThanks,\nTim',
        },
      },
    ],
  },
  {
    seedName: 'plan-create-meta-opportunity',
    icon: 'IconSparkles',
    title: 'Create an opportunity for Meta',
    hoursAgo: 2,
    assignee: 'me',
    subject: { kind: 'company', companyId: COMPANY_DATA_SEED_IDS.ID_3 },
    content: {
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
          {
            key: 'name',
            label: 'Name',
            type: InboxItemFieldType.TEXT,
            isRequired: true,
          },
          { key: 'amount', label: 'Amount', type: InboxItemFieldType.NUMBER },
          { key: 'stage', label: 'Stage', type: InboxItemFieldType.TEXT },
          {
            key: 'closeDate',
            label: 'Close date',
            type: InboxItemFieldType.TEXT,
          },
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
          {
            key: 'title',
            label: 'Title',
            type: InboxItemFieldType.TEXT,
            isRequired: true,
          },
          { key: 'dueDate', label: 'Due date', type: InboxItemFieldType.TEXT },
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
    icon: 'IconSparkles',
    title: 'Schedule a demo with SLB',
    hoursAgo: 3,
    assignee: 'me',
    subject: { kind: 'company', companyId: COMPANY_DATA_SEED_IDS.ID_4 },
    content: {
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
          {
            key: 'title',
            label: 'Title',
            type: InboxItemFieldType.TEXT,
            isRequired: true,
          },
          {
            key: 'startsAt',
            label: 'Starts at',
            type: InboxItemFieldType.TEXT,
            isRequired: true,
          },
          {
            key: 'durationMinutes',
            label: 'Duration (minutes)',
            type: InboxItemFieldType.NUMBER,
          },
          {
            key: 'attendees',
            label: 'Attendees',
            type: InboxItemFieldType.TEXT,
          },
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
          recipients: {
            to: 'omar.haddad@slb.com',
            cc: 'lea.martin@slb.com, k.osei@slb.com',
          },
          subject: 'Re: Demo next week?',
          body: 'Hi Omar,\n\nWednesday at 3pm works on our side, invite is on its way. We will cover pipeline, automations and the API in 45 minutes.\n\nTalk soon,\nTim',
        },
      },
    ],
  },
  {
    seedName: 'plan-update-cisco-profile',
    icon: 'IconSparkles',
    title: "Update Cisco's company profile",
    priority: InboxItemPriority.UPDATE,
    hoursAgo: 5,
    isRead: true,
    assignee: 'me',
    subject: { kind: 'company', companyId: COMPANY_DATA_SEED_IDS.ID_5 },
    content: {
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
          {
            key: 'employees',
            label: 'Employees',
            type: InboxItemFieldType.NUMBER,
          },
          { key: 'industry', label: 'Industry', type: InboxItemFieldType.TEXT },
          {
            key: 'domainName',
            label: 'Website',
            type: InboxItemFieldType.TEXT,
          },
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
    icon: 'IconSparkles',
    title: 'Log the call with Uber',
    priority: InboxItemPriority.UPDATE,
    hoursAgo: 28,
    isRead: true,
    assignee: 'me',
    subject: { kind: 'company', companyId: COMPANY_DATA_SEED_IDS.ID_6 },
    content: {
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
          {
            key: 'title',
            label: 'Title',
            type: InboxItemFieldType.TEXT,
            isRequired: true,
          },
          {
            key: 'body',
            label: 'Body',
            type: InboxItemFieldType.LONG_TEXT,
            isRequired: true,
          },
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
          {
            key: 'stage',
            label: 'Stage',
            type: InboxItemFieldType.TEXT,
            isRequired: true,
          },
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
    icon: 'IconCircleCheck',
    title: "Approve Google's renewal quote",
    content: {
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
          recipients: {
            to: 'marie.dubois@google.com',
            cc: '',
          },
          subject: 'Your renewal quote',
          body: 'Hi Marie,\n\nPlease find the renewal quote attached: $24,000 for 12 months at the tier-2 rate.\n\nBest,\nTim',
        },
      },
    ],
  },
  {
    seedName: 'question-microsoft-tier',
    icon: 'IconHelpCircle',
    title: 'Which pricing tier should I quote Microsoft?',
    content: {
      summary:
        'Two plans match. The expansion opportunity mentions 45 seats, which sits between them.',
    },
    hoursAgo: 2,
    assignee: 'me',
    subject: { kind: 'thread', which: 'default' },
  },
  {
    seedName: 'sync-invoices-run-failed',
    icon: 'IconAlertTriangle',
    title: 'Sync invoices to Stripe failed',
    content: {
      summary:
        "Step 'Create invoice' failed: the Stripe API key has expired. 3 invoices were not sent.",
    },
    hoursAgo: 3,
    assignee: 'me',
  },
  {
    seedName: 'meta-buying-committee',
    icon: 'IconMessageCircle',
    title: "Add Meta's buying committee",
    content: {
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
    icon: 'IconMessageCircle',
    title: 'Prepare the Q4 pipeline review',
    content: {
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
    icon: 'IconCircleCheck',
    title: "Review Cisco's onboarding fee",
    content: {
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
    icon: 'IconCircleCheck',
    title: "Approve Uber's onboarding invoice",
    content: { summary: 'Invoice #1042 for $5,000, due in 30 days.' },
    hoursAgo: 50,
    isRead: true,
    assignee: 'me',
    subject: { kind: 'company', companyId: COMPANY_DATA_SEED_IDS.ID_6 },
    cleared: { hoursAgo: 48, outcome: 'DONE' },
  },
  {
    seedName: 'salesforce-profile-update',
    icon: 'IconMessageCircle',
    title: "Update Salesforce's company profile",
    content: {
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
    icon: 'IconCircleCheck',
    title: "Move Google's renewal forward",
    content: {
      summary:
        'Reply to Marie in Gmail, update the opportunity and add Paul as the new operations lead.',
    },
    hoursAgo: 1,
    queueName: 'sales',
    subject: { kind: 'company', companyId: COMPANY_DATA_SEED_IDS.ID_1 },
  },
  {
    seedName: 'create-microsoft-opportunity',
    icon: 'IconMessageCircle',
    title: 'Create an opportunity for Microsoft',
    content: {
      summary:
        'A $45,000 expansion opportunity is drafted from the call notes.',
    },
    priority: InboxItemPriority.UPDATE,
    hoursAgo: 2,
    queueName: 'sales',
    subject: { kind: 'company', companyId: COMPANY_DATA_SEED_IDS.ID_2 },
  },
  {
    seedName: 'follow-up-slb-buyer',
    icon: 'IconCircleCheck',
    title: "Follow up with SLB's buyer",
    content: {
      summary:
        'Send the proposal and create a follow-up task for next Tuesday.',
    },
    hoursAgo: 3,
    queueName: 'sales',
    assignee: 'colleague',
    subject: { kind: 'company', companyId: COMPANY_DATA_SEED_IDS.ID_4 },
  },
  {
    seedName: 'log-call-with-sarah',
    icon: 'IconMessageCircle',
    title: 'Log the call with Sarah',
    content: {
      summary: 'Save the call notes and update the opportunity stage.',
    },
    priority: InboxItemPriority.UPDATE,
    hoursAgo: 5,
    queueName: 'support',
    subject: { kind: 'company', companyId: COMPANY_DATA_SEED_IDS.ID_3 },
  },
  {
    seedName: 'amdocs-ticket-closed',
    icon: 'IconMessageCircle',
    title: "Amdocs' import ticket was closed",
    content: {
      summary: 'The duplicate contacts were merged and the customer confirmed.',
    },
    priority: InboxItemPriority.UPDATE,
    hoursAgo: 30,
    isRead: true,
    queueName: 'support',
    subject: { kind: 'company', companyId: COMPANY_DATA_SEED_IDS.ID_8 },
    cleared: { hoursAgo: 28, outcome: 'DONE' },
  },
  {
    seedName: 'update-q4-pipeline',
    icon: 'IconMessageCircle',
    title: 'Update the Q4 pipeline',
    content: {
      summary:
        'Three opportunity close dates and two amounts changed since the last review.',
    },
    priority: InboxItemPriority.UPDATE,
    hoursAgo: 24,
    queueName: DEFAULT_INBOX_QUEUE_NAME,
    subject: { kind: 'company', companyId: COMPANY_DATA_SEED_IDS.ID_7 },
  },
];

// The seed points at two kinds of real record: a company and a message thread.
// Anything else is named without being clickable, which the model has to carry
// anyway for a producer that knows a label but not a row.
const resolveEntityObjectMetadataId = (
  kind: SeededEntityKind,
  inboxReferenceIds: InboxReferenceIds,
): string | null => {
  if (kind === 'company') {
    return inboxReferenceIds.companyObjectMetadataId;
  }

  if (kind === 'messageThread') {
    return inboxReferenceIds.messageThreadObjectMetadataId;
  }

  return null;
};

const resolveSubjectObjectMetadataId = (
  subject: SeededInboxItem['subject'],
  inboxReferenceIds: InboxReferenceIds,
): string | null => {
  if (subject?.kind === 'company') {
    return inboxReferenceIds.companyObjectMetadataId;
  }

  if (subject?.kind === 'messageThread') {
    return inboxReferenceIds.messageThreadObjectMetadataId;
  }

  return null;
};

const resolveSubjectRecordId = (
  subject: SeededInboxItem['subject'],
): string | null => {
  if (subject?.kind === 'company') {
    return subject.companyId;
  }

  if (subject?.kind === 'messageThread') {
    return subject.threadId;
  }

  return null;
};

const TASK_INPUT_SCHEMA: InboxItemFieldSchema[] = [
  {
    key: 'title',
    label: 'Title',
    type: InboxItemFieldType.TEXT,
    isRequired: true,
  },
  { key: 'dueDate', label: 'Due date', type: InboxItemFieldType.TEXT },
];

// The three cases the launch is judged on, each seeded in the state a person
// would actually find it in: work waiting in a shared inbox that nobody has
// taken, a notification about something the platform did, and a suggestion
// drawn from something the person said or received.
const SEEDED_LAUNCH_ITEMS: SeededInboxItem[] = [
  // 1. A shared inbox. Nobody owns these until somebody takes them.
  {
    seedName: 'hello-refund-request',
    icon: 'IconMail',
    title: 'Refund for a duplicate charge',
    hoursAgo: 1,
    queueName: 'support',
    subject: {
      kind: 'messageThread',
      threadId: INBOX_MESSAGE_THREAD_DATA_SEED_IDS.REFUND,
    },
    content: {
      summary:
        'Priya was charged twice for September and is asking for one charge back. The second charge is on the same invoice.',
      source: {
        kind: 'email',
        label: 'Duplicate charge on invoice 4482',
        detail: 'priya@northwind.com to hello@ · 40 minutes ago',
        excerpt:
          'Hi, we seem to have been billed twice for September on invoice 4482. Could you refund one of them?',
        messageCount: 1,
      },
      entities: [
        {
          key: 'priya',
          label: 'Priya Raman',
          subtitle: 'Northwind · billing contact',
          kind: 'person',
        },
        {
          key: 'thread',
          label: 'Duplicate charge on invoice 4482',
          subtitle: 'hello@ · 1 message',
          kind: 'messageThread',
          recordId: INBOX_MESSAGE_THREAD_DATA_SEED_IDS.REFUND,
        },
      ],
      edges: [{ from: 'priya', to: 'thread', label: 'wrote' }],
    },
    toolCalls: [
      {
        toolName: 'send_email',
        label: 'Reply to Priya',
        description: 'Confirm the refund and say when it will land.',
        icon: 'IconMail',
        inputSchema: EMAIL_INPUT_SCHEMA,
        proposedInput: {
          recipients: { to: 'priya@northwind.com', cc: '' },
          subject: 'Re: Duplicate charge on invoice 4482',
          body: 'Hi Priya,\n\nYou are right, invoice 4482 was charged twice. I have refunded the second charge; it should reach your account in three to five working days.\n\nSorry for the trouble.',
        },
      },
      {
        toolName: 'create_task',
        label: 'Create task',
        description: 'Have finance refund the second charge on invoice 4482.',
        icon: 'IconCheckbox',
        inputSchema: TASK_INPUT_SCHEMA,
        proposedInput: {
          title: 'Refund the duplicate charge on invoice 4482',
          dueDate: '2026-09-18',
        },
      },
    ],
  },
  {
    seedName: 'hello-sso-question',
    icon: 'IconMail',
    title: 'Does the plan include SAML?',
    hoursAgo: 4,
    isRead: true,
    queueName: 'support',
    assignee: 'colleague',
    subject: {
      kind: 'messageThread',
      threadId: MESSAGE_THREAD_DATA_SEED_IDS.ID_2,
    },
    content: {
      summary:
        'Asked whether SAML is on the current plan or an upgrade. Jane picked this up and is checking with sales.',
      source: {
        kind: 'email',
        label: 'SSO on our plan?',
        detail: 'ops@fieldstone.io to hello@ · 4 hours ago',
        excerpt:
          'We are rolling out SSO company-wide next month. Is SAML included on our plan or does it need an upgrade?',
        messageCount: 2,
      },
    },
  },
  {
    seedName: 'hello-shipping-delay',
    icon: 'IconMail',
    title: 'Chasing an order that has not shipped',
    hoursAgo: 1,
    queueName: 'support',
    subject: {
      kind: 'messageThread',
      threadId: INBOX_MESSAGE_THREAD_DATA_SEED_IDS.SHIPPING,
    },
    // Answered yesterday and back this morning, which is the case a shared
    // inbox has to get right: the reply reopens the item rather than starting
    // a second one beside it.
    cleared: { hoursAgo: 20, outcome: 'DONE' },
    content: {
      summary:
        'Answered yesterday with a shipping date. They have written back to say it still has not arrived.',
      source: {
        kind: 'email',
        label: 'Re: Order 10431 still not here',
        detail: 'sam@bellweather.co to hello@ · 1 hour ago',
        excerpt:
          'Thanks for the update yesterday, but tracking still shows nothing. Can you check with the carrier?',
        messageCount: 3,
      },
    },
  },

  // 2. Notifications about something the platform did or is asking for.
  {
    seedName: 'notify-inbox-access-request',
    icon: 'IconBell',
    title: 'Jane asked for access to the Sales inbox',
    hoursAgo: 2,
    assignee: 'me',
    content: {
      summary:
        'Jane is covering renewals this quarter and needs to see what lands in Sales.',
    },
    toolCalls: [
      {
        toolName: 'grant_inbox_access',
        label: 'Grant access',
        description:
          'Give the Account Executive role access to the Sales inbox.',
        icon: 'IconLock',
        inputSchema: [
          {
            key: 'queueName',
            label: 'Inbox',
            type: InboxItemFieldType.TEXT,
            isRequired: true,
          },
          {
            key: 'roleName',
            label: 'Role',
            type: InboxItemFieldType.TEXT,
            isRequired: true,
          },
        ],
        proposedInput: { queueName: 'sales', roleName: 'Account Executive' },
      },
    ],
  },
  {
    seedName: 'notify-mailbox-disconnected',
    icon: 'IconBell',
    title: 'Your mailbox stopped syncing',
    priority: InboxItemPriority.UPDATE,
    hoursAgo: 9,
    assignee: 'me',
    // No plan at all. Reading it is the whole interaction, which is the case
    // the primitive has to handle without inventing an action for it.
    content: {
      summary:
        'Google stopped accepting the connection on 12 September. Messages since then have not been imported.',
      source: {
        kind: 'record',
        label: 'Connected account · tim@apple.dev',
        detail: 'Last successful sync 3 days ago',
      },
    },
  },

  // 3. Something read on the person's behalf, turned into a suggestion.
  {
    seedName: 'suggest-tasks-from-call',
    icon: 'IconSparkles',
    title: 'Three follow-ups from your call with Sarah',
    hoursAgo: 3,
    assignee: 'me',
    subject: { kind: 'company', companyId: COMPANY_DATA_SEED_IDS.ID_3 },
    content: {
      summary:
        'The recording mentions a security review, a seat count to confirm and a follow-up call in two weeks.',
      source: {
        kind: 'call',
        label: 'Call with Sarah Chen',
        detail: 'Yesterday · 32 minutes',
        excerpt:
          'We will need to run this past our security team before we can expand, and I want to revisit the seat count once that is done.',
      },
      entities: [
        {
          key: 'sarah',
          label: 'Sarah Chen',
          subtitle: 'Meta · VP Operations',
          kind: 'person',
        },
        {
          key: 'meta',
          label: 'Meta',
          subtitle: 'Expansion · 45 seats',
          kind: 'company',
          recordId: COMPANY_DATA_SEED_IDS.ID_3,
        },
      ],
      edges: [{ from: 'sarah', to: 'meta', label: 'at' }],
    },
    toolCalls: [
      {
        toolName: 'create_task',
        label: 'Create task',
        description: 'Send the security questionnaire to Sarah.',
        icon: 'IconCheckbox',
        inputSchema: TASK_INPUT_SCHEMA,
        proposedInput: {
          title: 'Send Meta the security questionnaire',
          dueDate: '2026-09-18',
        },
      },
      {
        toolName: 'create_task',
        label: 'Create task',
        description: 'Confirm the seat count after the security review.',
        icon: 'IconCheckbox',
        inputSchema: TASK_INPUT_SCHEMA,
        proposedInput: {
          title: 'Confirm seat count with Sarah',
          dueDate: '2026-09-29',
        },
      },
    ],
  },
  {
    seedName: 'suggest-from-personal-email',
    icon: 'IconSparkles',
    title: 'Linnea is asking for the updated deck',
    hoursAgo: 6,
    assignee: 'me',
    subject: {
      kind: 'messageThread',
      threadId: MESSAGE_THREAD_DATA_SEED_IDS.ID_4,
    },
    content: {
      summary:
        'Came in on your own mailbox rather than a shared one. She needs the deck before Thursday.',
      source: {
        kind: 'email',
        label: 'Deck for Thursday?',
        detail: 'linnea@qonto.eu · 6 hours ago',
        excerpt:
          'Could you send over the updated deck before Thursday? I am presenting it internally on Friday morning.',
        messageCount: 1,
      },
      entities: [
        {
          key: 'linnea',
          label: 'Linnea Berg',
          subtitle: 'Qonto · Head of Partnerships',
          kind: 'person',
        },
        {
          key: 'thread',
          label: 'Deck for Thursday?',
          subtitle: 'tim@apple.dev · 1 message',
          kind: 'messageThread',
          recordId: MESSAGE_THREAD_DATA_SEED_IDS.ID_4,
        },
      ],
      edges: [{ from: 'linnea', to: 'thread', label: 'wrote' }],
    },
    toolCalls: [
      {
        toolName: 'create_task',
        label: 'Create task',
        description: 'Send Linnea the updated deck before Thursday.',
        icon: 'IconCheckbox',
        inputSchema: TASK_INPUT_SCHEMA,
        proposedInput: {
          title: 'Send Linnea the updated deck',
          dueDate: '2026-09-17',
        },
      },
    ],
  },
];

type SeededQueue = {
  name: string;
  label: string;
  icon: string;
  isDefault: boolean;
};

const SEEDED_QUEUES: SeededQueue[] = [
  {
    name: DEFAULT_INBOX_QUEUE_NAME,
    label: 'Triage',
    icon: 'IconInbox',
    isDefault: true,
  },
  {
    name: 'sales',
    label: 'Sales',
    icon: 'IconTargetArrow',
    isDefault: false,
  },
  {
    name: 'support',
    label: 'Support',
    icon: 'IconLifebuoy',
    isDefault: false,
  },
];

const SEEDED_GROUP_CHANNEL_QUEUES: { handle: string; queueName: string }[] = [
  {
    handle: EMAIL_GROUP_CHANNEL_SEED_HANDLES.SUPPORT_GROUP,
    queueName: 'support',
  },
  {
    handle: EMAIL_GROUP_CHANNEL_SEED_HANDLES.CONTACT_GROUP,
    queueName: 'sales',
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

  const queueIdByName = Object.fromEntries(
    SEEDED_QUEUES.map((queue) => [
      queue.name,
      generateSeedId(workspaceId, `inbox-queue-${queue.name}`),
    ]),
  );

  await queryRunner.manager
    .createQueryBuilder()
    .insert()
    .into(`${schemaName}.${inboxQueueTableName}`, [
      'id',
      'workspaceId',
      'name',
      'label',
      'icon',
      'isDefault',
    ])
    .orIgnore()
    .values(
      SEEDED_QUEUES.map((queue) => ({
        id: queueIdByName[queue.name],
        workspaceId,
        name: queue.name,
        label: queue.label,
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
            `inbox-queue-role-${queue.name}-${roleId}`,
          ),
          workspaceId,
          queueId: queueIdByName[queue.name],
          roleId,
        })),
      ),
    )
    .execute();

  // The launch case the shared inboxes exist for: mail forwarded to a shared
  // address lands in the team inbox that watches it, not in whichever account
  // happens to hold the forwarding.
  for (const { handle, queueName } of SEEDED_GROUP_CHANNEL_QUEUES) {
    await queryRunner.query(
      `UPDATE ${schemaName}."${messageChannelTableName}"
       SET "defaultInboxQueueId" = $1
       WHERE "workspaceId" = $2 AND "handle" = $3`,
      [queueIdByName[queueName], workspaceId, handle],
    );
  }

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
      'icon',
      'priority',
      'title',
      'summary',
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
      [...SEEDED_PLAN_ITEMS, ...SEEDED_INBOX_ITEMS, ...SEEDED_LAUNCH_ITEMS].map(
        (item) => {
          const lastEventAt = hoursAgo(now, item.hoursAgo);
          const clearedAt = item.cleared
            ? hoursAgo(now, item.cleared.hoursAgo)
            : null;
          const assigneeUserWorkspaceId = item.assignee
            ? people[item.assignee]
            : null;
          const isCleared = isDefined(clearedAt);

          return {
            id: generateSeedId(workspaceId, `inbox-item-${item.seedName}`),
            workspaceId,
            icon: item.icon,
            priority: item.priority ?? InboxItemPriority.NEEDS_ACTION,
            title: item.title,
            summary: item.content.summary ?? null,
            context: {
              version: INBOX_ITEM_CONTEXT_VERSION,
              producer: 'seed',
              ...(isDefined(item.content.source)
                ? { source: item.content.source }
                : {}),
            },
            lastEventAt,
            clearedAt,
            resurfaceAt:
              isCleared && isDefined(item.cleared?.resurfaceInHours)
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
            subjectObjectMetadataId: resolveSubjectObjectMetadataId(
              item.subject,
              inboxReferenceIds,
            ),
            subjectRecordId: resolveSubjectRecordId(item.subject),
            queueId: item.queueName ? queueIdByName[item.queueName] : null,
            assigneeUserWorkspaceId,
            slotKey: item.seedName,
            createdAt: hoursAgo(
              now,
              Math.max(item.hoursAgo, item.cleared?.hoursAgo ?? 0),
            ),
            updatedAt: lastEventAt,
          };
        },
      ),
    )
    .execute();

  // The authoring shape names entities and the edges between them; what is
  // stored is one row per record in the order the pane draws them, each
  // carrying how it relates to the row before it.
  await queryRunner.manager
    .createQueryBuilder()
    .insert()
    .into(`${schemaName}.${inboxItemRecordTableName}`, [
      'id',
      'workspaceId',
      'inboxItemId',
      'position',
      'label',
      'subtitle',
      'relationLabel',
      'objectMetadataId',
      'recordId',
    ])
    .orIgnore()
    .values(
      [
        ...SEEDED_PLAN_ITEMS,
        ...SEEDED_INBOX_ITEMS,
        ...SEEDED_LAUNCH_ITEMS,
      ].flatMap((item) => {
        const entities = item.content.entities ?? [];
        const edges = item.content.edges ?? [];

        return entities.map((entity, position) => {
          const previousEntity = entities[position - 1];
          const relationLabel = isDefined(previousEntity)
            ? edges.find(
                (edge) =>
                  (edge.from === previousEntity.key &&
                    edge.to === entity.key) ||
                  (edge.from === entity.key && edge.to === previousEntity.key),
              )?.label
            : undefined;

          return {
            id: generateSeedId(
              workspaceId,
              `inbox-item-record-${item.seedName}-${position}`,
            ),
            workspaceId,
            inboxItemId: generateSeedId(
              workspaceId,
              `inbox-item-${item.seedName}`,
            ),
            position,
            label: entity.label,
            subtitle: entity.subtitle ?? null,
            relationLabel: relationLabel ?? null,
            // Only companies and message threads have a resolvable object in
            // the seed, so the rest are named without being clickable, which
            // is a state the model has to carry anyway.
            objectMetadataId: resolveEntityObjectMetadataId(
              entity.kind,
              inboxReferenceIds,
            ),
            recordId: isDefined(
              resolveEntityObjectMetadataId(entity.kind, inboxReferenceIds),
            )
              ? (entity.recordId ?? null)
              : null,
          };
        });
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
      [
        ...SEEDED_PLAN_ITEMS,
        ...SEEDED_INBOX_ITEMS,
        ...SEEDED_LAUNCH_ITEMS,
      ].flatMap((item) =>
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
