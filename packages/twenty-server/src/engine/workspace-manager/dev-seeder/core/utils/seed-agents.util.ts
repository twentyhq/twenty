import { DataSource } from 'typeorm';

import { AgentChatMessageRole } from 'src/engine/metadata-modules/agent/agent-chat-message.entity';
import { USER_WORKSPACE_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-user-workspaces.util';
import {
  SEED_APPLE_WORKSPACE_ID,
  SEED_YCOMBINATOR_WORKSPACE_ID,
} from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-workspaces.util';

const agentTableName = 'agent';
const workspaceTableName = 'workspace';
const agentChatThreadTableName = 'agentChatThread';
const agentChatMessageTableName = 'agentChatMessage';

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

const seedAgentChatThreads = async (
  dataSource: DataSource,
  schemaName: string,
  workspaceId: string,
  agentId: string,
) => {
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

  await dataSource
    .createQueryBuilder()
    .insert()
    .into(`${schemaName}.${agentChatThreadTableName}`, [
      'id',
      'agentId',
      'userWorkspaceId',
      'createdAt',
      'updatedAt',
    ])
    .orIgnore()
    .values([
      {
        id: threadId,
        agentId,
        userWorkspaceId,
        createdAt: now,
        updatedAt: now,
      },
    ])
    .execute();

  return threadId;
};

const seedAgentChatMessages = async (
  dataSource: DataSource,
  schemaName: string,
  workspaceId: string,
  threadId: string,
) => {
  let messageIds: string[];
  let messages: Array<{
    id: string;
    threadId: string;
    role: AgentChatMessageRole;
    content: string;
    createdAt: Date;
  }>;

  const now = new Date();
  const baseTime = new Date(now.getTime() - 24 * 60 * 60 * 1000); // 24 hours ago

  if (workspaceId === SEED_APPLE_WORKSPACE_ID) {
    messageIds = [
      AGENT_CHAT_MESSAGE_DATA_SEED_IDS.APPLE_MESSAGE_1,
      AGENT_CHAT_MESSAGE_DATA_SEED_IDS.APPLE_MESSAGE_2,
      AGENT_CHAT_MESSAGE_DATA_SEED_IDS.APPLE_MESSAGE_3,
      AGENT_CHAT_MESSAGE_DATA_SEED_IDS.APPLE_MESSAGE_4,
    ];
    messages = [
      {
        id: messageIds[0],
        threadId,
        role: AgentChatMessageRole.USER,
        content:
          'Hello! Can you help me understand our current product roadmap and key metrics?',
        createdAt: new Date(baseTime.getTime()),
      },
      {
        id: messageIds[1],
        threadId,
        role: AgentChatMessageRole.ASSISTANT,
        content:
          "Hello! I'd be happy to help you understand Apple's product roadmap and metrics. Based on your workspace data, I can see you have various projects and initiatives tracked. What specific aspect would you like to explore - product development timelines, user engagement metrics, or revenue targets?",
        createdAt: new Date(baseTime.getTime() + 5 * 60 * 1000), // 5 minutes later
      },
      {
        id: messageIds[2],
        threadId,
        role: AgentChatMessageRole.USER,
        content:
          "I'd like to focus on our user engagement metrics and how they're trending over the last quarter.",
        createdAt: new Date(baseTime.getTime() + 10 * 60 * 1000), // 10 minutes later
      },
      {
        id: messageIds[3],
        threadId,
        role: AgentChatMessageRole.ASSISTANT,
        content:
          'Great! Looking at your user engagement data, I can see several key trends from the last quarter. Your active user base has grown by 15%, with particularly strong engagement in the mobile app. Daily active users are averaging 2.3 million, and session duration has increased by 8%. Would you like me to dive deeper into any specific engagement metrics or create a detailed report?',
        createdAt: new Date(baseTime.getTime() + 15 * 60 * 1000), // 15 minutes later
      },
    ];
  } else if (workspaceId === SEED_YCOMBINATOR_WORKSPACE_ID) {
    messageIds = [
      AGENT_CHAT_MESSAGE_DATA_SEED_IDS.YCOMBINATOR_MESSAGE_1,
      AGENT_CHAT_MESSAGE_DATA_SEED_IDS.YCOMBINATOR_MESSAGE_2,
      AGENT_CHAT_MESSAGE_DATA_SEED_IDS.YCOMBINATOR_MESSAGE_3,
      AGENT_CHAT_MESSAGE_DATA_SEED_IDS.YCOMBINATOR_MESSAGE_4,
    ];
    messages = [
      {
        id: messageIds[0],
        threadId,
        role: AgentChatMessageRole.USER,
        content:
          'What are the current startup trends and which companies in our portfolio are performing best?',
        createdAt: new Date(baseTime.getTime()),
      },
      {
        id: messageIds[1],
        threadId,
        role: AgentChatMessageRole.ASSISTANT,
        content:
          'Hello! I can help you analyze startup trends and portfolio performance. From your YCombinator workspace data, I can see strong performance in AI/ML startups, particularly in the B2B SaaS space. Several companies are showing 40%+ month-over-month growth. Would you like me to provide specific company performance metrics or focus on broader industry trends?',
        createdAt: new Date(baseTime.getTime() + 3 * 60 * 1000), // 3 minutes later
      },
      {
        id: messageIds[2],
        threadId,
        role: AgentChatMessageRole.USER,
        content:
          'Please focus on our top 5 performing companies and their key metrics.',
        createdAt: new Date(baseTime.getTime() + 8 * 60 * 1000), // 8 minutes later
      },
      {
        id: messageIds[3],
        threadId,
        role: AgentChatMessageRole.ASSISTANT,
        content:
          'Here are your top 5 performing portfolio companies: 1) TechFlow AI - 45% MoM growth, $2M ARR, 2) DataSync Pro - 38% MoM growth, $1.5M ARR, 3) CloudOps Solutions - 35% MoM growth, $3.2M ARR, 4) SecureNet - 32% MoM growth, $1.8M ARR, 5) HealthTech Plus - 28% MoM growth, $2.5M ARR. All are showing strong customer retention (>95%) and expanding market share. Would you like detailed breakdowns for any specific company?',
        createdAt: new Date(baseTime.getTime() + 12 * 60 * 1000), // 12 minutes later
      },
    ];
  } else {
    throw new Error(
      `Unsupported workspace ID for agent chat message seeding: ${workspaceId}`,
    );
  }

  await dataSource
    .createQueryBuilder()
    .insert()
    .into(`${schemaName}.${agentChatMessageTableName}`, [
      'id',
      'threadId',
      'role',
      'content',
      'createdAt',
    ])
    .orIgnore()
    .values(messages)
    .execute();
};

export const seedAgents = async (
  dataSource: DataSource,
  schemaName: string,
  workspaceId: string,
) => {
  let agentId: string;
  let agentName: string;
  let agentLabel: string;
  let agentDescription: string;

  if (workspaceId === SEED_APPLE_WORKSPACE_ID) {
    agentId = AGENT_DATA_SEED_IDS.APPLE_DEFAULT_AGENT;
    agentName = 'apple-ai-assistant';
    agentLabel = 'Apple AI Assistant';
    agentDescription =
      'AI assistant for Apple workspace to help with tasks, insights, and workflow guidance';
  } else if (workspaceId === SEED_YCOMBINATOR_WORKSPACE_ID) {
    agentId = AGENT_DATA_SEED_IDS.YCOMBINATOR_DEFAULT_AGENT;
    agentName = 'yc-ai-assistant';
    agentLabel = 'YC AI Assistant';
    agentDescription =
      'AI assistant for YCombinator workspace to help with tasks, insights, and workflow guidance';
  } else {
    throw new Error(
      `Unsupported workspace ID for agent seeding: ${workspaceId}`,
    );
  }

  await dataSource
    .createQueryBuilder()
    .insert()
    .into(`${schemaName}.${agentTableName}`, [
      'id',
      'name',
      'label',
      'description',
      'prompt',
      'modelId',
      'responseFormat',
      'workspaceId',
    ])
    .orIgnore()
    .values([
      {
        id: agentId,
        name: agentName,
        label: agentLabel,
        description: agentDescription,
        prompt:
          'You are a helpful AI assistant for this workspace. Help users with their tasks, provide insights about their data, and guide them through workflows. Be concise but thorough in your responses.',
        modelId: 'auto',
        responseFormat: null,
        workspaceId,
      },
    ])
    .execute();

  await dataSource
    .createQueryBuilder()
    .update(`${schemaName}.${workspaceTableName}`)
    .set({ defaultAgentId: agentId })
    .where('id = :workspaceId', { workspaceId })
    .execute();

  const threadId = await seedAgentChatThreads(
    dataSource,
    schemaName,
    workspaceId,
    agentId,
  );

  await seedAgentChatMessages(dataSource, schemaName, workspaceId, threadId);
};
