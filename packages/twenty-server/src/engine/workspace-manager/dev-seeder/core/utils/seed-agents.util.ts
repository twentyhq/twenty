import { type QueryRunner } from 'typeorm';

import { AgentMessageRole } from 'src/engine/metadata-modules/ai/ai-agent-execution/entities/agent-message.entity';
import {
  SEED_APPLE_WORKSPACE_ID,
  SEED_YCOMBINATOR_WORKSPACE_ID,
} from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { USER_WORKSPACE_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-user-workspaces.util';
import { COMPANY_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/company-data-seeds.constant';

const agentChatThreadTableName = 'agentChatThread';
const agentTurnTableName = 'agentTurn';
const agentMessageTableName = 'agentMessage';
const agentMessagePartTableName = 'agentMessagePart';

export const AGENT_DATA_SEED_IDS = {
  APPLE_DEFAULT_AGENT: '20202020-0000-4000-8000-000000000001',
  YCOMBINATOR_DEFAULT_AGENT: '20202020-0000-4000-8000-000000000002',
};

export const AGENT_CHAT_THREAD_DATA_SEED_IDS = {
  APPLE_DEFAULT_THREAD: '20202020-0000-4000-8000-000000000011',
  YCOMBINATOR_DEFAULT_THREAD: '20202020-0000-4000-8000-000000000012',
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
};

const seedChatThreads = async ({
  queryRunner,
  schemaName,
  workspaceId,
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

  await queryRunner.manager
    .createQueryBuilder()
    .insert()
    .into(`${schemaName}.${agentChatThreadTableName}`, [
      'id',
      'workspaceId',
      'userWorkspaceId',
      'createdAt',
      'updatedAt',
    ])
    .orIgnore()
    .values([
      {
        id: threadId,
        workspaceId,
        userWorkspaceId,
        createdAt: now,
        updatedAt: now,
      },
    ])
    .execute();

  return threadId;
};

type SeedChatMessagesArgs = {
  queryRunner: QueryRunner;
  schemaName: string;
  workspaceId: string;
  threadId: string;
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
  chatReferenceIds,
}: SeedChatMessagesArgs) => {
  let messageIds: string[];
  let partIds: string[];
  let turnIds: string[];
  let messages: Array<{
    id: string;
    workspaceId: string;
    threadId: string;
    turnId: string;
    role: AgentMessageRole;
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
    turnIds = ['20202020-0000-4000-8000-000000000061'];
    messages = [
      {
        id: messageIds[0],
        workspaceId,
        threadId,
        turnId: turnIds[0],
        role: AgentMessageRole.USER,
        createdAt: new Date(baseTime.getTime()),
      },
      {
        id: messageIds[1],
        workspaceId,
        threadId,
        turnId: turnIds[0],
        role: AgentMessageRole.ASSISTANT,
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
    turnIds = [
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
        createdAt: new Date(baseTime.getTime()),
      },
      {
        id: messageIds[1],
        workspaceId,
        threadId,
        turnId: turnIds[0],
        role: AgentMessageRole.ASSISTANT,
        createdAt: new Date(baseTime.getTime() + 3 * 60 * 1000),
      },
      {
        id: messageIds[2],
        workspaceId,
        threadId,
        turnId: turnIds[1],
        role: AgentMessageRole.USER,
        createdAt: new Date(baseTime.getTime() + 8 * 60 * 1000),
      },
      {
        id: messageIds[3],
        workspaceId,
        threadId,
        turnId: turnIds[1],
        role: AgentMessageRole.ASSISTANT,
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

  const turns = turnIds.map((id, index) => ({
    id,
    workspaceId,
    threadId,
    createdAt: messages[index * 2].createdAt,
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
  const threadId = await seedChatThreads({
    queryRunner,
    schemaName,
    workspaceId,
  });

  await seedChatMessages({
    queryRunner,
    schemaName,
    workspaceId,
    threadId,
    chatReferenceIds,
  });
};
