import { type QueryRunner } from 'typeorm';

import { AgentMessageRole } from 'src/engine/metadata-modules/ai/ai-agent-execution/entities/agent-message.entity';
import {
  SEED_APPLE_WORKSPACE_ID,
  SEED_YCOMBINATOR_WORKSPACE_ID,
} from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { USER_WORKSPACE_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-user-workspaces.util';

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
  APPLE_MESSAGE_3: '20202020-0000-4000-8000-000000000023',
  APPLE_MESSAGE_4: '20202020-0000-4000-8000-000000000024',
  YCOMBINATOR_MESSAGE_1: '20202020-0000-4000-8000-000000000031',
  YCOMBINATOR_MESSAGE_2: '20202020-0000-4000-8000-000000000032',
  YCOMBINATOR_MESSAGE_3: '20202020-0000-4000-8000-000000000033',
  YCOMBINATOR_MESSAGE_4: '20202020-0000-4000-8000-000000000034',
};

export const AGENT_CHAT_MESSAGE_PART_DATA_SEED_IDS = {
  APPLE_MESSAGE_1_PART_1: '20202020-0000-4000-8000-000000000041',
  APPLE_MESSAGE_2_PART_1: '20202020-0000-4000-8000-000000000042',
  APPLE_MESSAGE_3_PART_1: '20202020-0000-4000-8000-000000000043',
  APPLE_MESSAGE_4_PART_1: '20202020-0000-4000-8000-000000000044',
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
      'userWorkspaceId',
      'createdAt',
      'updatedAt',
    ])
    .orIgnore()
    .values([
      {
        id: threadId,
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
};

const seedChatMessages = async ({
  queryRunner,
  schemaName,
  workspaceId,
  threadId,
}: SeedChatMessagesArgs) => {
  let messageIds: string[];
  let partIds: string[];
  let turnIds: string[];
  let messages: Array<{
    id: string;
    threadId: string;
    turnId: string;
    role: AgentMessageRole;
    createdAt: Date;
  }>;
  let messageParts: Array<{
    id: string;
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
      AGENT_CHAT_MESSAGE_DATA_SEED_IDS.APPLE_MESSAGE_3,
      AGENT_CHAT_MESSAGE_DATA_SEED_IDS.APPLE_MESSAGE_4,
    ];
    partIds = [
      AGENT_CHAT_MESSAGE_PART_DATA_SEED_IDS.APPLE_MESSAGE_1_PART_1,
      AGENT_CHAT_MESSAGE_PART_DATA_SEED_IDS.APPLE_MESSAGE_2_PART_1,
      AGENT_CHAT_MESSAGE_PART_DATA_SEED_IDS.APPLE_MESSAGE_3_PART_1,
      AGENT_CHAT_MESSAGE_PART_DATA_SEED_IDS.APPLE_MESSAGE_4_PART_1,
    ];
    turnIds = [
      '20202020-0000-4000-8000-000000000061',
      '20202020-0000-4000-8000-000000000062',
    ];
    messages = [
      {
        id: messageIds[0],
        threadId,
        turnId: turnIds[0],
        role: AgentMessageRole.USER,
        createdAt: new Date(baseTime.getTime()),
      },
      {
        id: messageIds[1],
        threadId,
        turnId: turnIds[0],
        role: AgentMessageRole.ASSISTANT,
        createdAt: new Date(baseTime.getTime() + 5 * 60 * 1000),
      },
      {
        id: messageIds[2],
        threadId,
        turnId: turnIds[1],
        role: AgentMessageRole.USER,
        createdAt: new Date(baseTime.getTime() + 10 * 60 * 1000),
      },
      {
        id: messageIds[3],
        threadId,
        turnId: turnIds[1],
        role: AgentMessageRole.ASSISTANT,
        createdAt: new Date(baseTime.getTime() + 15 * 60 * 1000),
      },
    ];
    messageParts = [
      {
        id: partIds[0],
        messageId: messageIds[0],
        orderIndex: 0,
        type: 'text',
        textContent:
          'Hello! Can you help me understand our current product roadmap and key metrics?',
        createdAt: new Date(baseTime.getTime()),
      },
      {
        id: partIds[1],
        messageId: messageIds[1],
        orderIndex: 0,
        type: 'text',
        textContent:
          "Hello! I'd be happy to help you understand Apple's product roadmap and metrics. Based on your workspace data, I can see you have various projects and initiatives tracked. What specific aspect would you like to explore - product development timelines, user engagement metrics, or revenue targets?",
        createdAt: new Date(baseTime.getTime() + 5 * 60 * 1000),
      },
      {
        id: partIds[2],
        messageId: messageIds[2],
        orderIndex: 0,
        type: 'text',
        textContent:
          "I'd like to focus on our user engagement metrics and how they're trending over the last quarter.",
        createdAt: new Date(baseTime.getTime() + 10 * 60 * 1000),
      },
      {
        id: partIds[3],
        messageId: messageIds[3],
        orderIndex: 0,
        type: 'text',
        textContent:
          'Great! Looking at your user engagement data, I can see several key trends from the last quarter. Your active user base has grown by 15%, with particularly strong engagement in the mobile app. Daily active users are averaging 2.3 million, and session duration has increased by 8%. Would you like me to dive deeper into any specific engagement metrics or create a detailed report?',
        createdAt: new Date(baseTime.getTime() + 15 * 60 * 1000),
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
        threadId,
        turnId: turnIds[0],
        role: AgentMessageRole.USER,
        createdAt: new Date(baseTime.getTime()),
      },
      {
        id: messageIds[1],
        threadId,
        turnId: turnIds[0],
        role: AgentMessageRole.ASSISTANT,
        createdAt: new Date(baseTime.getTime() + 3 * 60 * 1000),
      },
      {
        id: messageIds[2],
        threadId,
        turnId: turnIds[1],
        role: AgentMessageRole.USER,
        createdAt: new Date(baseTime.getTime() + 8 * 60 * 1000),
      },
      {
        id: messageIds[3],
        threadId,
        turnId: turnIds[1],
        role: AgentMessageRole.ASSISTANT,
        createdAt: new Date(baseTime.getTime() + 12 * 60 * 1000),
      },
    ];
    messageParts = [
      {
        id: partIds[0],
        messageId: messageIds[0],
        orderIndex: 0,
        type: 'text',
        textContent:
          'What are the current startup trends and which companies in our portfolio are performing best?',
        createdAt: new Date(baseTime.getTime()),
      },
      {
        id: partIds[1],
        messageId: messageIds[1],
        orderIndex: 0,
        type: 'text',
        textContent:
          'Hello! I can help you analyze startup trends and portfolio performance. From your YCombinator workspace data, I can see strong performance in AI/ML startups, particularly in the B2B SaaS space. Several companies are showing 40%+ month-over-month growth. Would you like me to provide specific company performance metrics or focus on broader industry trends?',
        createdAt: new Date(baseTime.getTime() + 3 * 60 * 1000),
      },
      {
        id: partIds[2],
        messageId: messageIds[2],
        orderIndex: 0,
        type: 'text',
        textContent:
          'Please focus on our top 5 performing companies and their key metrics.',
        createdAt: new Date(baseTime.getTime() + 8 * 60 * 1000),
      },
      {
        id: partIds[3],
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

  // Create turns first
  const turns = turnIds.map((id, index) => ({
    id,
    threadId,
    createdAt: messages[index * 2].createdAt,
  }));

  await queryRunner.manager
    .createQueryBuilder()
    .insert()
    .into(`${schemaName}.${agentTurnTableName}`, [
      'id',
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
};

export const seedAgents = async ({
  queryRunner,
  schemaName,
  workspaceId,
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
  });
};
