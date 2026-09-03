import { type QueryRunner } from 'typeorm';

import {
  INBOX_ITEM_TYPE_KEY,
  STANDARD_INBOX_ITEM_TYPES,
  type StandardInboxItemTypeKey,
} from 'src/engine/core-modules/inbox/constants/standard-inbox-item-types.constant';
import { InboxItemPriority } from 'src/engine/core-modules/inbox/enums/inbox-item-priority.enum';
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
  preview: string;
  priority?: InboxItemPriority;
  hoursAgo: number;
  isRead?: boolean;
  queueSeedName?: string;
  assignee?: 'me' | 'colleague';
  subject?:
    | { kind: 'thread'; which: 'default' | 'review' }
    | { kind: 'company'; companyId: string };
  payload?: Record<string, unknown>;
  cleared?: { hoursAgo: number; outcome?: string; resurfaceInHours?: number };
};

// One of everything the inbox can show: unread and read, needs action and
// update, personal and shared, snoozed, done, and an item a new event revived
// after it was cleared.
const SEEDED_INBOX_ITEMS: SeededInboxItem[] = [
  {
    seedName: 'approve-google-renewal',
    typeKey: INBOX_ITEM_TYPE_KEY.approval,
    title: "Approve Google's renewal quote",
    preview:
      'Send Marie the $24,000 invoice and confirm the tier-2 volume at the same rate.',
    hoursAgo: 1,
    assignee: 'me',
    subject: { kind: 'company', companyId: COMPANY_DATA_SEED_IDS.ID_1 },
    payload: { amount: 24000, currency: 'USD', term: '12 months' },
  },
  {
    seedName: 'question-microsoft-tier',
    typeKey: INBOX_ITEM_TYPE_KEY.agentQuestion,
    title: 'Which pricing tier should I quote Microsoft?',
    preview:
      'Two plans match. The expansion opportunity mentions 45 seats, which sits between them.',
    hoursAgo: 2,
    assignee: 'me',
    subject: { kind: 'thread', which: 'default' },
  },
  {
    seedName: 'sync-invoices-run-failed',
    typeKey: INBOX_ITEM_TYPE_KEY.workflowRunFailed,
    title: 'Sync invoices to Stripe failed',
    preview:
      "Step 'Create invoice' failed: the Stripe API key has expired. 3 invoices were not sent.",
    hoursAgo: 3,
    assignee: 'me',
    payload: {
      workflowName: 'Sync invoices to Stripe',
      failedStep: 'Create invoice',
    },
  },
  {
    seedName: 'meta-buying-committee',
    typeKey: INBOX_ITEM_TYPE_KEY.conversation,
    title: "Add Meta's buying committee",
    preview: 'New reply: Sarah added two more stakeholders to the thread.',
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
    preview:
      'Draft ready: three opportunities moved, two close dates pushed to November.',
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
    preview:
      'A $5,000 onboarding invoice is ready to send once the fee is confirmed.',
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
    preview: 'Invoice #1042 for $5,000, due in 30 days.',
    hoursAgo: 50,
    isRead: true,
    assignee: 'me',
    subject: { kind: 'company', companyId: COMPANY_DATA_SEED_IDS.ID_6 },
    payload: { amount: 5000, currency: 'USD' },
    cleared: { hoursAgo: 48, outcome: 'APPROVED' },
  },
  {
    seedName: 'salesforce-profile-update',
    typeKey: INBOX_ITEM_TYPE_KEY.conversation,
    title: "Update Salesforce's company profile",
    preview:
      'Industry, headcount and website were refreshed from the latest filing.',
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
    preview:
      'Reply to Marie in Gmail, update the opportunity and add Paul as the new operations lead.',
    hoursAgo: 1,
    queueSeedName: 'sales',
    subject: { kind: 'company', companyId: COMPANY_DATA_SEED_IDS.ID_1 },
    payload: { steps: ['Send email', 'Update opportunity', 'Create person'] },
  },
  {
    seedName: 'create-microsoft-opportunity',
    typeKey: INBOX_ITEM_TYPE_KEY.conversation,
    title: 'Create an opportunity for Microsoft',
    preview: 'A $45,000 expansion opportunity is drafted from the call notes.',
    priority: InboxItemPriority.UPDATE,
    hoursAgo: 2,
    queueSeedName: 'sales',
    subject: { kind: 'company', companyId: COMPANY_DATA_SEED_IDS.ID_2 },
  },
  {
    seedName: 'follow-up-slb-buyer',
    typeKey: INBOX_ITEM_TYPE_KEY.approval,
    title: "Follow up with SLB's buyer",
    preview: 'Send the proposal and create a follow-up task for next Tuesday.',
    hoursAgo: 3,
    queueSeedName: 'sales',
    assignee: 'colleague',
    subject: { kind: 'company', companyId: COMPANY_DATA_SEED_IDS.ID_4 },
  },
  {
    seedName: 'log-call-with-sarah',
    typeKey: INBOX_ITEM_TYPE_KEY.conversation,
    title: 'Log the call with Sarah',
    preview: 'Save the call notes and update the opportunity stage.',
    priority: InboxItemPriority.UPDATE,
    hoursAgo: 5,
    queueSeedName: 'support',
    subject: { kind: 'company', companyId: COMPANY_DATA_SEED_IDS.ID_3 },
  },
  {
    seedName: 'amdocs-ticket-closed',
    typeKey: INBOX_ITEM_TYPE_KEY.conversation,
    title: "Amdocs' import ticket was closed",
    preview: 'The duplicate contacts were merged and the customer confirmed.',
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
    preview:
      'Three opportunity close dates and two amounts changed since the last review.',
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

  const typeIdByKey = Object.fromEntries(
    STANDARD_INBOX_ITEM_TYPES.map((standardType) => [
      standardType.key,
      generateSeedId(workspaceId, `inbox-item-type-${standardType.key}`),
    ]),
  ) as Record<StandardInboxItemTypeKey, string>;

  // The same rows the service seeds on first use, so a later upsert finds them
  // by universal identifier and only refreshes their declarations.
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
      'actions',
      'resolution',
    ])
    .orIgnore()
    .values(
      STANDARD_INBOX_ITEM_TYPES.map((standardType) => ({
        id: typeIdByKey[standardType.key],
        workspaceId,
        universalIdentifier: standardType.universalIdentifier,
        applicationId: inboxReferenceIds.applicationId,
        key: standardType.key,
        label: standardType.label,
        icon: standardType.icon,
        defaultPriority: standardType.defaultPriority,
        actions: standardType.actions,
        resolution: standardType.resolution ?? null,
      })),
    )
    .execute();

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
      'preview',
      'payload',
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
      SEEDED_INBOX_ITEMS.map((item) => {
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
          preview: item.preview,
          payload: item.payload ?? null,
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
          // Read means seen since the last event; a cleared item was seen too
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
};
