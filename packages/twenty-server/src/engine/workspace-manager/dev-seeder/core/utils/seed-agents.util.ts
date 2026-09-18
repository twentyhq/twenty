import uniqBy from 'lodash.uniqby';
import { type QueryRunner } from 'typeorm';

import { AgentMessageRole } from 'src/engine/metadata-modules/ai/ai-agent-execution/entities/agent-message.entity';
import {
  AGENT_CHAT_THREAD_DATA_SEED_IDS,
  AGENT_WORKFLOW_DATA_SEED_IDS,
  AGENT_WORKFLOW_SEED_NAME,
  AGENT_WORKFLOW_SEED_PROMPT,
  AGENT_WORKFLOW_SEED_STEP_NAME,
  APPLE_AGENT_CHAT_CHANNEL_SEEDS,
  APPLE_AGENT_CHAT_CONVERSATION_SEEDS,
} from 'src/engine/workspace-manager/dev-seeder/core/constants/agent-chat-seeds.constant';
import {
  SEED_APPLE_WORKSPACE_ID,
  SEED_YCOMBINATOR_WORKSPACE_ID,
} from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { USER_WORKSPACE_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-user-workspaces.util';
import { COMPANY_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/company-data-seeds.constant';
import { AgentChatThreadStatus } from 'src/engine/metadata-modules/ai/ai-chat/enums/agent-chat-thread-status.enum';
import { AgentChatChannelMemberRole } from 'src/engine/metadata-modules/ai/ai-chat/enums/agent-chat-channel-member-role.enum';
import { AgentChatThreadParticipantRole } from 'src/engine/metadata-modules/ai/ai-chat/enums/agent-chat-thread-participant-role.enum';

const agentChatThreadTableName = 'agentChatThread';
const agentChatThreadParticipantTableName = 'agentChatThreadParticipant';
const agentChatChannelTableName = 'agentChatChannel';
const agentChatChannelMemberTableName = 'agentChatChannelMember';
const agentChatChannelRoleTableName = 'agentChatChannelRole';
const agentTurnTableName = 'agentTurn';
const agentMessageTableName = 'agentMessage';
const agentMessagePartTableName = 'agentMessagePart';

export const AGENT_DATA_SEED_IDS = {
  APPLE_DEFAULT_AGENT: '20202020-0000-4000-8000-000000000001',
  YCOMBINATOR_DEFAULT_AGENT: '20202020-0000-4000-8000-000000000002',
};

export const AGENT_CHAT_MESSAGE_DATA_SEED_IDS = {
  APPLE_MESSAGE_1: '20202020-0000-4000-8000-000000000021',
  APPLE_MESSAGE_2: '20202020-0000-4000-8000-000000000022',
  YCOMBINATOR_MESSAGE_1: '20202020-0000-4000-8000-000000000031',
  YCOMBINATOR_MESSAGE_2: '20202020-0000-4000-8000-000000000032',
  YCOMBINATOR_MESSAGE_3: '20202020-0000-4000-8000-000000000033',
  YCOMBINATOR_MESSAGE_4: '20202020-0000-4000-8000-000000000034',
};

export const AGENT_CHAT_MESSAGE_PART_DATA_SEED_IDS = {
  APPLE_MESSAGE_1_PART_1: '20202020-0000-4000-8000-000000000041',
  APPLE_MESSAGE_2_PART_1: '20202020-0000-4000-8000-000000000042',
  YCOMBINATOR_MESSAGE_1_PART_1: '20202020-0000-4000-8000-000000000051',
  YCOMBINATOR_MESSAGE_2_PART_1: '20202020-0000-4000-8000-000000000052',
  YCOMBINATOR_MESSAGE_3_PART_1: '20202020-0000-4000-8000-000000000053',
  YCOMBINATOR_MESSAGE_4_PART_1: '20202020-0000-4000-8000-000000000054',
};

type SeedChatThreadsArgs = {
  queryRunner: QueryRunner;
  schemaName: string;
  workspaceId: string;
  adminRoleId: string;
};

const seedChatThreads = async ({
  queryRunner,
  schemaName,
  workspaceId,
  adminRoleId,
}: SeedChatThreadsArgs) => {
  let threadId: string;
  let userWorkspaceId: string;

  if (workspaceId === SEED_APPLE_WORKSPACE_ID) {
    threadId = AGENT_CHAT_THREAD_DATA_SEED_IDS.APPLE_DEFAULT_THREAD;
    userWorkspaceId = USER_WORKSPACE_DATA_SEED_IDS.TIM;
  } else if (workspaceId === SEED_YCOMBINATOR_WORKSPACE_ID) {
    threadId = AGENT_CHAT_THREAD_DATA_SEED_IDS.YCOMBINATOR_DEFAULT_THREAD;
    userWorkspaceId = USER_WORKSPACE_DATA_SEED_IDS.TIM_ACME;
  } else {
    throw new Error(
      `Unsupported workspace ID for agent chat thread seeding: ${workspaceId}`,
    );
  }

  const now = new Date();
  const title =
    workspaceId === SEED_APPLE_WORKSPACE_ID
      ? 'Explore your workspace'
      : 'Portfolio performance';

  if (workspaceId === SEED_APPLE_WORKSPACE_ID) {
    await seedChatChannels({
      queryRunner,
      schemaName,
      workspaceId,
      adminRoleId,
      now,
    });
  }

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
        id: threadId,
        workspaceId,
        userWorkspaceId,
        title,
        createdAt: now,
        updatedAt: now,
      },
    ])
    .execute();

  await queryRunner.manager
    .createQueryBuilder()
    .update(`${schemaName}.${agentChatThreadTableName}`)
    .set({ title })
    .where('id = :threadId AND "workspaceId" = :workspaceId', {
      threadId,
      workspaceId,
    })
    .andWhere('title IS NULL')
    .execute();

  if (workspaceId === SEED_APPLE_WORKSPACE_ID) {
    await queryRunner.manager
      .createQueryBuilder()
      .insert()
      .into(`${schemaName}.${agentChatThreadTableName}`)
      .orIgnore()
      .values(
        // One thread per inbox state, so a fresh workspace shows what the
        // Open, Snoozed and Done lists are for without anyone having to
        // produce the states by hand — and one left open and unassigned in
        // the Sales channel, since that is the tab a channel opens on.
        [
          {
            id: AGENT_CHAT_THREAD_DATA_SEED_IDS.APPLE_PRICING_THREAD,
            title: 'Answer a pricing objection',
            status: AgentChatThreadStatus.OPEN,
            snoozedUntil: null,
            assigneeUserWorkspaceId: null,
          },
          {
            id: AGENT_CHAT_THREAD_DATA_SEED_IDS.APPLE_IMPORT_THREAD,
            title: 'Prepare a company import',
            status: AgentChatThreadStatus.SNOOZED,
            snoozedUntil: addDaysToDate(now, 1),
            assigneeUserWorkspaceId: null,
          },
          {
            id: AGENT_CHAT_THREAD_DATA_SEED_IDS.APPLE_FOLLOW_UP_THREAD,
            title: 'Plan customer follow-ups',
            status: AgentChatThreadStatus.DONE,
            snoozedUntil: null,
            assigneeUserWorkspaceId: userWorkspaceId,
          },
        ].map((thread) => ({
          ...thread,
          channelId:
            APPLE_AGENT_CHAT_CONVERSATION_SEEDS.find(
              (conversation) => conversation.threadId === thread.id,
            )?.channelId ?? null,
          workspaceId,
          userWorkspaceId,
          createdAt: now,
          updatedAt: now,
        })),
      )
      .execute();

    await seedRunThreads({ queryRunner, schemaName, workspaceId, now });
  }

  await seedChatThreadParticipants({
    queryRunner,
    schemaName,
    workspaceId,
    ownerUserWorkspaceId: userWorkspaceId,
    ownedThreadIds:
      workspaceId === SEED_APPLE_WORKSPACE_ID
        ? [
            threadId,
            AGENT_CHAT_THREAD_DATA_SEED_IDS.APPLE_PRICING_THREAD,
            AGENT_CHAT_THREAD_DATA_SEED_IDS.APPLE_IMPORT_THREAD,
            AGENT_CHAT_THREAD_DATA_SEED_IDS.APPLE_FOLLOW_UP_THREAD,
            AGENT_WORKFLOW_DATA_SEED_IDS.COMPLETED_RUN_THREAD,
            AGENT_WORKFLOW_DATA_SEED_IDS.WAITING_RUN_THREAD,
          ]
        : [threadId],
    now,
  });

  return { threadId, ownerUserWorkspaceId: userWorkspaceId };
};

const addDaysToDate = (date: Date, days: number): Date => {
  const result = new Date(date);

  result.setDate(result.getDate() + days);

  return result;
};

type SeedRunThreadsArgs = {
  queryRunner: QueryRunner;
  schemaName: string;
  workspaceId: string;
  now: Date;
};

const RUN_THREAD_TURN_IDS = {
  COMPLETED_RUN: '20202020-0000-4000-8000-000000000331',
  WAITING_RUN: '20202020-0000-4000-8000-000000000332',
};

const RUN_THREAD_MESSAGE_IDS = {
  COMPLETED_RUN_PROMPT: '20202020-0000-4000-8000-000000000341',
  COMPLETED_RUN_ANSWER: '20202020-0000-4000-8000-000000000342',
  WAITING_RUN_PROMPT: '20202020-0000-4000-8000-000000000343',
  WAITING_RUN_QUESTION:
    AGENT_WORKFLOW_DATA_SEED_IDS.WAITING_RUN_QUESTION_MESSAGE,
};

const WAITING_RUN_QUESTIONS = [
  {
    header: 'Send outreach',
    question:
      'The lead fits the profile and the email below is ready. Send it now?',
    options: [
      {
        label: 'Send it',
        description: 'Send the drafted email from your mailbox.',
        isRecommended: true,
      },
      {
        label: 'Hold for review',
        description: 'Keep the draft in the conversation for you to edit.',
      },
      { label: 'Do not contact', description: 'Close the lead as not a fit.' },
    ],
  },
];

// The conversations of the seeded workflow runs: the completed run reads
// like a finished chat, the waiting run ends on the question the agent
// asked, exactly as the agent step would have left it.
const seedRunThreads = async ({
  queryRunner,
  schemaName,
  workspaceId,
  now,
}: SeedRunThreadsArgs) => {
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const ownerUserWorkspaceId = USER_WORKSPACE_DATA_SEED_IDS.TIM;

  await queryRunner.manager
    .createQueryBuilder()
    .insert()
    .into(`${schemaName}.${agentChatThreadTableName}`, [
      'id',
      'workspaceId',
      'userWorkspaceId',
      'title',
      'workflowRunId',
      'workflowStepId',
      'pendingQuestionMessageId',
      'createdAt',
      'updatedAt',
    ])
    .orIgnore()
    .values([
      {
        id: AGENT_WORKFLOW_DATA_SEED_IDS.COMPLETED_RUN_THREAD,
        workspaceId,
        userWorkspaceId: ownerUserWorkspaceId,
        title: `#1 - ${AGENT_WORKFLOW_SEED_NAME} · ${AGENT_WORKFLOW_SEED_STEP_NAME}`,
        workflowRunId: AGENT_WORKFLOW_DATA_SEED_IDS.COMPLETED_RUN,
        workflowStepId: AGENT_WORKFLOW_DATA_SEED_IDS.QUALIFY_LEAD_STEP,
        pendingQuestionMessageId: null,
        createdAt: yesterday,
        updatedAt: yesterday,
      },
      {
        id: AGENT_WORKFLOW_DATA_SEED_IDS.WAITING_RUN_THREAD,
        workspaceId,
        userWorkspaceId: ownerUserWorkspaceId,
        title: `#2 - ${AGENT_WORKFLOW_SEED_NAME} · ${AGENT_WORKFLOW_SEED_STEP_NAME}`,
        workflowRunId: AGENT_WORKFLOW_DATA_SEED_IDS.WAITING_RUN,
        workflowStepId: AGENT_WORKFLOW_DATA_SEED_IDS.QUALIFY_LEAD_STEP,
        pendingQuestionMessageId: RUN_THREAD_MESSAGE_IDS.WAITING_RUN_QUESTION,
        createdAt: oneHourAgo,
        updatedAt: oneHourAgo,
      },
    ])
    .execute();

  await queryRunner.manager
    .createQueryBuilder()
    .insert()
    .into(`${schemaName}.${agentTurnTableName}`, [
      'id',
      'workspaceId',
      'threadId',
      'createdAt',
    ])
    .orIgnore()
    .values([
      {
        id: RUN_THREAD_TURN_IDS.COMPLETED_RUN,
        workspaceId,
        threadId: AGENT_WORKFLOW_DATA_SEED_IDS.COMPLETED_RUN_THREAD,
        createdAt: yesterday,
      },
      {
        id: RUN_THREAD_TURN_IDS.WAITING_RUN,
        workspaceId,
        threadId: AGENT_WORKFLOW_DATA_SEED_IDS.WAITING_RUN_THREAD,
        createdAt: oneHourAgo,
      },
    ])
    .execute();

  const messages = [
    {
      id: RUN_THREAD_MESSAGE_IDS.COMPLETED_RUN_PROMPT,
      threadId: AGENT_WORKFLOW_DATA_SEED_IDS.COMPLETED_RUN_THREAD,
      turnId: RUN_THREAD_TURN_IDS.COMPLETED_RUN,
      role: AgentMessageRole.USER,
      createdAt: yesterday,
    },
    {
      id: RUN_THREAD_MESSAGE_IDS.COMPLETED_RUN_ANSWER,
      threadId: AGENT_WORKFLOW_DATA_SEED_IDS.COMPLETED_RUN_THREAD,
      turnId: RUN_THREAD_TURN_IDS.COMPLETED_RUN,
      role: AgentMessageRole.ASSISTANT,
      createdAt: new Date(yesterday.getTime() + 1000),
    },
    {
      id: RUN_THREAD_MESSAGE_IDS.WAITING_RUN_PROMPT,
      threadId: AGENT_WORKFLOW_DATA_SEED_IDS.WAITING_RUN_THREAD,
      turnId: RUN_THREAD_TURN_IDS.WAITING_RUN,
      role: AgentMessageRole.USER,
      createdAt: oneHourAgo,
    },
    {
      id: RUN_THREAD_MESSAGE_IDS.WAITING_RUN_QUESTION,
      threadId: AGENT_WORKFLOW_DATA_SEED_IDS.WAITING_RUN_THREAD,
      turnId: RUN_THREAD_TURN_IDS.WAITING_RUN,
      role: AgentMessageRole.ASSISTANT,
      createdAt: new Date(oneHourAgo.getTime() + 1000),
    },
  ];

  await queryRunner.manager
    .createQueryBuilder()
    .insert()
    .into(`${schemaName}.${agentMessageTableName}`, [
      'id',
      'workspaceId',
      'threadId',
      'turnId',
      'role',
      'authorUserWorkspaceId',
      'processedAt',
      'createdAt',
    ])
    .orIgnore()
    .values(
      messages.map((message) => ({
        ...message,
        workspaceId,
        authorUserWorkspaceId: null,
        processedAt: message.createdAt,
      })),
    )
    .execute();

  const textPart = (
    id: string,
    messageId: string,
    textContent: string,
    createdAt: Date,
  ) => ({
    id,
    workspaceId,
    messageId,
    orderIndex: 0,
    type: 'text',
    textContent,
    toolName: null,
    toolCallId: null,
    toolInput: null,
    toolOutput: null,
    state: null,
    createdAt,
  });

  await queryRunner.manager
    .createQueryBuilder()
    .insert()
    .into(`${schemaName}.${agentMessagePartTableName}`, [
      'id',
      'workspaceId',
      'messageId',
      'orderIndex',
      'type',
      'textContent',
      'toolName',
      'toolCallId',
      'toolInput',
      'toolOutput',
      'state',
      'createdAt',
    ])
    .orIgnore()
    .values([
      textPart(
        '20202020-0000-4000-8000-000000000351',
        RUN_THREAD_MESSAGE_IDS.COMPLETED_RUN_PROMPT,
        AGENT_WORKFLOW_SEED_PROMPT,
        yesterday,
      ),
      textPart(
        '20202020-0000-4000-8000-000000000352',
        RUN_THREAD_MESSAGE_IDS.COMPLETED_RUN_ANSWER,
        'Warm lead. Sarah Chen is VP Sales at Northwind (about 200 people, B2B SaaS), ' +
          'which sits in our target segment, and she asked for pricing on the form. ' +
          'You approved the outreach email and it went out from your mailbox.',
        new Date(yesterday.getTime() + 1000),
      ),
      textPart(
        '20202020-0000-4000-8000-000000000353',
        RUN_THREAD_MESSAGE_IDS.WAITING_RUN_PROMPT,
        AGENT_WORKFLOW_SEED_PROMPT,
        oneHourAgo,
      ),
      textPart(
        '20202020-0000-4000-8000-000000000354',
        RUN_THREAD_MESSAGE_IDS.WAITING_RUN_QUESTION,
        'Marcus Lee, Head of Operations at Contoso Logistics (about 80 people), fits the ' +
          'profile: mid-market, hiring in sales ops, and he asked for a demo. Draft ready:\n\n' +
          'Hi Marcus, thanks for reaching out. Twenty gives ops teams one place for pipeline, ' +
          'people and automations. Would a 20-minute walkthrough on Thursday work?',
        new Date(oneHourAgo.getTime() + 1000),
      ),
      {
        id: '20202020-0000-4000-8000-000000000355',
        workspaceId,
        messageId: RUN_THREAD_MESSAGE_IDS.WAITING_RUN_QUESTION,
        orderIndex: 1,
        type: 'tool-ask_questions',
        textContent: null,
        toolName: 'ask_questions',
        toolCallId: 'seed-ask-questions-1',
        toolInput: { questions: WAITING_RUN_QUESTIONS },
        toolOutput: {
          success: true,
          message: 'Questions presented to the user; awaiting their answer.',
          result: { questions: WAITING_RUN_QUESTIONS, status: 'pending' },
        },
        state: 'output-available',
        createdAt: new Date(oneHourAgo.getTime() + 1000),
      },
    ])
    .execute();
};

type SeedChatChannelsArgs = {
  queryRunner: QueryRunner;
  schemaName: string;
  workspaceId: string;
  adminRoleId: string;
  now: Date;
};

const seedChatChannels = async ({
  queryRunner,
  schemaName,
  workspaceId,
  adminRoleId,
  now,
}: SeedChatChannelsArgs) => {
  await queryRunner.manager
    .createQueryBuilder()
    .insert()
    .into(`${schemaName}.${agentChatChannelTableName}`, [
      'id',
      'workspaceId',
      'name',
      'description',
      'visibility',
      'createdByUserWorkspaceId',
      'createdAt',
      'updatedAt',
    ])
    .orIgnore()
    .values(
      APPLE_AGENT_CHAT_CHANNEL_SEEDS.map((channel) => ({
        id: channel.id,
        workspaceId,
        name: channel.name,
        description: channel.description,
        visibility: channel.visibility,
        createdByUserWorkspaceId: channel.adminUserWorkspaceId,
        createdAt: now,
        updatedAt: now,
      })),
    )
    .execute();

  await queryRunner.manager
    .createQueryBuilder()
    .insert()
    .into(`${schemaName}.${agentChatChannelMemberTableName}`, [
      'workspaceId',
      'channelId',
      'userWorkspaceId',
      'role',
      'createdAt',
    ])
    .orIgnore()
    .values(
      APPLE_AGENT_CHAT_CHANNEL_SEEDS.flatMap((channel) => [
        {
          workspaceId,
          channelId: channel.id,
          userWorkspaceId: channel.adminUserWorkspaceId,
          role: AgentChatChannelMemberRole.ADMIN,
          createdAt: now,
        },
        ...channel.memberUserWorkspaceIds.map((memberUserWorkspaceId) => ({
          workspaceId,
          channelId: channel.id,
          userWorkspaceId: memberUserWorkspaceId,
          role: AgentChatChannelMemberRole.MEMBER,
          createdAt: now,
        })),
      ]),
    )
    .execute();

  const channelRoles = APPLE_AGENT_CHAT_CHANNEL_SEEDS.filter(
    (channel) => channel.isReadableByWorkspaceAdmins,
  ).map((channel) => ({
    workspaceId,
    channelId: channel.id,
    roleId: adminRoleId,
    createdAt: now,
  }));

  if (channelRoles.length === 0) {
    return;
  }

  await queryRunner.manager
    .createQueryBuilder()
    .insert()
    .into(`${schemaName}.${agentChatChannelRoleTableName}`, [
      'workspaceId',
      'channelId',
      'roleId',
      'createdAt',
    ])
    .orIgnore()
    .values(channelRoles)
    .execute();
};

type SeedChatThreadParticipantsArgs = {
  queryRunner: QueryRunner;
  schemaName: string;
  workspaceId: string;
  ownerUserWorkspaceId: string;
  ownedThreadIds: string[];
  now: Date;
};

// Every thread has its creator as owner; the Apple follow-up thread is also
// shared with two members so the dev workspace shows a collaborative thread.
const seedChatThreadParticipants = async ({
  queryRunner,
  schemaName,
  workspaceId,
  ownerUserWorkspaceId,
  ownedThreadIds,
  now,
}: SeedChatThreadParticipantsArgs) => {
  const ownerParticipants = ownedThreadIds.map((ownedThreadId) => ({
    threadId: ownedThreadId,
    userWorkspaceId: ownerUserWorkspaceId,
    role: AgentChatThreadParticipantRole.OWNER,
  }));

  const memberParticipants =
    workspaceId === SEED_APPLE_WORKSPACE_ID
      ? APPLE_AGENT_CHAT_CONVERSATION_SEEDS.flatMap((conversation) =>
          (conversation.memberUserWorkspaceIds ?? []).map(
            (memberUserWorkspaceId) => ({
              threadId: conversation.threadId,
              userWorkspaceId: memberUserWorkspaceId,
              role: AgentChatThreadParticipantRole.MEMBER,
            }),
          ),
        )
      : [];

  await queryRunner.manager
    .createQueryBuilder()
    .insert()
    .into(`${schemaName}.${agentChatThreadParticipantTableName}`, [
      'workspaceId',
      'threadId',
      'userWorkspaceId',
      'role',
      'createdAt',
      'lastMentionedAt',
    ])
    .orIgnore()
    .values(
      [...ownerParticipants, ...memberParticipants].map((participant) => ({
        ...participant,
        workspaceId,
        createdAt: now,
        // The first member of a shared thread is seeded as having been named
        // in it, so the Inbox shows a thread that reached someone by mention
        // next to the ones they own.
        lastMentionedAt:
          participant.role === AgentChatThreadParticipantRole.MEMBER
            ? now
            : null,
      })),
    )
    .execute();
};

type SeedChatMessagesArgs = {
  queryRunner: QueryRunner;
  schemaName: string;
  workspaceId: string;
  threadId: string;
  ownerUserWorkspaceId: string;
  chatReferenceIds: ChatReferenceIds;
};

export type ChatReferenceIds = {
  applicationId: string;
  objectMetadataId: string;
  roleId: string;
  viewId: string;
};

const seedChatMessages = async ({
  queryRunner,
  schemaName,
  workspaceId,
  threadId,
  ownerUserWorkspaceId,
  chatReferenceIds,
}: SeedChatMessagesArgs) => {
  let messageIds: string[];
  let partIds: string[];
  let messages: Array<{
    id: string;
    workspaceId: string;
    threadId: string;
    turnId: string;
    role: AgentMessageRole;
    authorUserWorkspaceId: string | null;
    createdAt: Date;
  }>;
  let messageParts: Array<{
    id: string;
    workspaceId: string;
    messageId: string;
    orderIndex: number;
    type: string;
    textContent: string;
    createdAt: Date;
  }>;

  const now = new Date();
  const baseTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  if (workspaceId === SEED_APPLE_WORKSPACE_ID) {
    messageIds = [
      AGENT_CHAT_MESSAGE_DATA_SEED_IDS.APPLE_MESSAGE_1,
      AGENT_CHAT_MESSAGE_DATA_SEED_IDS.APPLE_MESSAGE_2,
    ];
    partIds = [
      AGENT_CHAT_MESSAGE_PART_DATA_SEED_IDS.APPLE_MESSAGE_1_PART_1,
      AGENT_CHAT_MESSAGE_PART_DATA_SEED_IDS.APPLE_MESSAGE_2_PART_1,
    ];
    const turnIds = ['20202020-0000-4000-8000-000000000061'];
    messages = [
      {
        id: messageIds[0],
        workspaceId,
        threadId,
        turnId: turnIds[0],
        role: AgentMessageRole.USER,
        authorUserWorkspaceId: ownerUserWorkspaceId,
        createdAt: new Date(baseTime.getTime()),
      },
      {
        id: messageIds[1],
        workspaceId,
        threadId,
        turnId: turnIds[0],
        role: AgentMessageRole.ASSISTANT,
        authorUserWorkspaceId: null,
        createdAt: new Date(baseTime.getTime() + 5 * 60 * 1000),
      },
    ];
    messageParts = [
      {
        id: partIds[0],
        workspaceId,
        messageId: messageIds[0],
        orderIndex: 0,
        type: 'text',
        textContent:
          'Can you show me examples of everything I can open from AI chat?',
        createdAt: new Date(baseTime.getTime()),
      },
      {
        id: partIds[1],
        workspaceId,
        messageId: messageIds[1],
        orderIndex: 0,
        type: 'text',
        textContent: `Here are linked examples: [[record:company:${COMPANY_DATA_SEED_IDS.ID_1}:Google]] is one record. Browse [[records:${chatReferenceIds.objectMetadataId}:Company records]], open the specific [[view:${chatReferenceIds.viewId}:All Companies]] view, configure the [[object:company:Companies]] data model, inspect [[field:company:domainName:Domain name]], review [[role:${chatReferenceIds.roleId}:Admin]], or manage [[app:${chatReferenceIds.applicationId}:Twenty]].`,
        createdAt: new Date(baseTime.getTime() + 5 * 60 * 1000),
      },
    ];
  } else if (workspaceId === SEED_YCOMBINATOR_WORKSPACE_ID) {
    messageIds = [
      AGENT_CHAT_MESSAGE_DATA_SEED_IDS.YCOMBINATOR_MESSAGE_1,
      AGENT_CHAT_MESSAGE_DATA_SEED_IDS.YCOMBINATOR_MESSAGE_2,
      AGENT_CHAT_MESSAGE_DATA_SEED_IDS.YCOMBINATOR_MESSAGE_3,
      AGENT_CHAT_MESSAGE_DATA_SEED_IDS.YCOMBINATOR_MESSAGE_4,
    ];
    partIds = [
      AGENT_CHAT_MESSAGE_PART_DATA_SEED_IDS.YCOMBINATOR_MESSAGE_1_PART_1,
      AGENT_CHAT_MESSAGE_PART_DATA_SEED_IDS.YCOMBINATOR_MESSAGE_2_PART_1,
      AGENT_CHAT_MESSAGE_PART_DATA_SEED_IDS.YCOMBINATOR_MESSAGE_3_PART_1,
      AGENT_CHAT_MESSAGE_PART_DATA_SEED_IDS.YCOMBINATOR_MESSAGE_4_PART_1,
    ];
    const turnIds = [
      '20202020-0000-4000-8000-000000000071',
      '20202020-0000-4000-8000-000000000072',
    ];
    messages = [
      {
        id: messageIds[0],
        workspaceId,
        threadId,
        turnId: turnIds[0],
        role: AgentMessageRole.USER,
        authorUserWorkspaceId: ownerUserWorkspaceId,
        createdAt: new Date(baseTime.getTime()),
      },
      {
        id: messageIds[1],
        workspaceId,
        threadId,
        turnId: turnIds[0],
        role: AgentMessageRole.ASSISTANT,
        authorUserWorkspaceId: null,
        createdAt: new Date(baseTime.getTime() + 3 * 60 * 1000),
      },
      {
        id: messageIds[2],
        workspaceId,
        threadId,
        turnId: turnIds[1],
        role: AgentMessageRole.USER,
        authorUserWorkspaceId: ownerUserWorkspaceId,
        createdAt: new Date(baseTime.getTime() + 8 * 60 * 1000),
      },
      {
        id: messageIds[3],
        workspaceId,
        threadId,
        turnId: turnIds[1],
        role: AgentMessageRole.ASSISTANT,
        authorUserWorkspaceId: null,
        createdAt: new Date(baseTime.getTime() + 12 * 60 * 1000),
      },
    ];
    messageParts = [
      {
        id: partIds[0],
        workspaceId,
        messageId: messageIds[0],
        orderIndex: 0,
        type: 'text',
        textContent:
          'What are the current startup trends and which companies in our portfolio are performing best?',
        createdAt: new Date(baseTime.getTime()),
      },
      {
        id: partIds[1],
        workspaceId,
        messageId: messageIds[1],
        orderIndex: 0,
        type: 'text',
        textContent:
          'Hello! I can help you analyze startup trends and portfolio performance. From your YCombinator workspace data, I can see strong performance in AI/ML startups, particularly in the B2B SaaS space. Several companies are showing 40%+ month-over-month growth. Would you like me to provide specific company performance metrics or focus on broader industry trends?',
        createdAt: new Date(baseTime.getTime() + 3 * 60 * 1000),
      },
      {
        id: partIds[2],
        workspaceId,
        messageId: messageIds[2],
        orderIndex: 0,
        type: 'text',
        textContent:
          'Please focus on our top 5 performing companies and their key metrics.',
        createdAt: new Date(baseTime.getTime() + 8 * 60 * 1000),
      },
      {
        id: partIds[3],
        workspaceId,
        messageId: messageIds[3],
        orderIndex: 0,
        type: 'text',
        textContent:
          'Here are your top 5 performing portfolio companies: 1) TechFlow AI - 45% MoM growth, $2M ARR, 2) DataSync Pro - 38% MoM growth, $1.5M ARR, 3) CloudOps Solutions - 35% MoM growth, $3.2M ARR, 4) SecureNet - 32% MoM growth, $1.8M ARR, 5) HealthTech Plus - 28% MoM growth, $2.5M ARR. All are showing strong customer retention (>95%) and expanding market share. Would you like detailed breakdowns for any specific company?',
        createdAt: new Date(baseTime.getTime() + 12 * 60 * 1000),
      },
    ];
  } else {
    throw new Error(
      `Unsupported workspace ID for agent chat message seeding: ${workspaceId}`,
    );
  }

  if (workspaceId === SEED_APPLE_WORKSPACE_ID) {
    let seedId = 100;

    for (const conversation of APPLE_AGENT_CHAT_CONVERSATION_SEEDS) {
      for (const [
        exchangeIndex,
        exchange,
      ] of conversation.exchanges.entries()) {
        const turnId = `20202020-0000-4000-8000-${String(seedId++).padStart(12, '0')}`;
        const exchangeAuthorUserWorkspaceId =
          conversation.exchangeAuthorUserWorkspaceIds?.[exchangeIndex] ??
          ownerUserWorkspaceId;

        for (const [index, textContent] of exchange.entries()) {
          const messageId = `20202020-0000-4000-8000-${String(seedId++).padStart(12, '0')}`;
          const partId = `20202020-0000-4000-8000-${String(seedId++).padStart(12, '0')}`;
          const createdAt = new Date(baseTime.getTime() + seedId * 60 * 1000);

          messages.push({
            id: messageId,
            workspaceId,
            threadId: conversation.threadId,
            turnId,
            role:
              index === 0 ? AgentMessageRole.USER : AgentMessageRole.ASSISTANT,
            authorUserWorkspaceId:
              index === 0 ? exchangeAuthorUserWorkspaceId : null,
            createdAt,
          });
          messageParts.push({
            id: partId,
            workspaceId,
            messageId,
            orderIndex: 0,
            type: 'text',
            textContent,
            createdAt,
          });
        }
      }
    }
  }

  const turns = uniqBy(messages, 'turnId').map((message) => ({
    id: message.turnId,
    workspaceId,
    threadId: message.threadId,
    createdAt: message.createdAt,
  }));

  await queryRunner.manager
    .createQueryBuilder()
    .insert()
    .into(`${schemaName}.${agentTurnTableName}`, [
      'id',
      'workspaceId',
      'threadId',
      'createdAt',
    ])
    .orIgnore()
    .values(turns)
    .execute();

  await queryRunner.manager
    .createQueryBuilder()
    .insert()
    .into(`${schemaName}.${agentMessageTableName}`, [
      'id',
      'workspaceId',
      'threadId',
      'turnId',
      'role',
      'authorUserWorkspaceId',
      'createdAt',
    ])
    .orIgnore()
    .values(messages)
    .execute();

  await queryRunner.manager
    .createQueryBuilder()
    .insert()
    .into(`${schemaName}.${agentMessagePartTableName}`, [
      'id',
      'workspaceId',
      'messageId',
      'orderIndex',
      'type',
      'textContent',
      'createdAt',
    ])
    .orIgnore()
    .values(messageParts)
    .execute();
};

type SeedAgentsArgs = {
  queryRunner: QueryRunner;
  schemaName: string;
  workspaceId: string;
  chatReferenceIds: ChatReferenceIds;
};

export const seedAgents = async ({
  queryRunner,
  schemaName,
  workspaceId,
  chatReferenceIds,
}: SeedAgentsArgs) => {
  const { threadId, ownerUserWorkspaceId } = await seedChatThreads({
    queryRunner,
    schemaName,
    workspaceId,
    adminRoleId: chatReferenceIds.roleId,
  });

  await seedChatMessages({
    queryRunner,
    schemaName,
    workspaceId,
    threadId,
    ownerUserWorkspaceId,
    chatReferenceIds,
  });
};
