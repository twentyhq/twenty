import uniqBy from 'lodash.uniqby';
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
  APPLE_IMPORT_THREAD: '20202020-0000-4000-8000-000000000013',
  APPLE_FOLLOW_UP_THREAD: '20202020-0000-4000-8000-000000000014',
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
  const title =
    workspaceId === SEED_APPLE_WORKSPACE_ID
      ? 'Explore your workspace'
      : 'Portfolio performance';

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
        [
          {
            id: AGENT_CHAT_THREAD_DATA_SEED_IDS.APPLE_IMPORT_THREAD,
            title: 'Prepare a company import',
          },
          {
            id: AGENT_CHAT_THREAD_DATA_SEED_IDS.APPLE_FOLLOW_UP_THREAD,
            title: 'Plan customer follow-ups',
          },
        ].map((thread) => ({
          ...thread,
          workspaceId,
          userWorkspaceId,
          createdAt: now,
          updatedAt: now,
        })),
      )
      .execute();
  }

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
    const turnIds = ['20202020-0000-4000-8000-000000000061'];
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

  if (workspaceId === SEED_APPLE_WORKSPACE_ID) {
    const conversations = [
      {
        threadId: AGENT_CHAT_THREAD_DATA_SEED_IDS.APPLE_IMPORT_THREAD,
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
        threadId: AGENT_CHAT_THREAD_DATA_SEED_IDS.APPLE_FOLLOW_UP_THREAD,
        exchanges: [
          [
            'Help me plan customer follow-ups for this week.',
            'Start with customers waiting for a reply, then review upcoming renewals and recent meetings.\n\n- Monday: review open questions.\n- Wednesday: follow up after demos.\n- Friday: confirm next steps and owners.',
          ],
          [
            'Draft a short follow-up I can personalize.',
            'Hi [Name],\n\nThanks for our conversation. I’m following up on [topic] and would love to hear your thoughts. Would [day] work for a quick check-in?\n\nBest,\nTim\n\nThis is a draft for review; no message has been sent.',
          ],
        ],
      },
    ];

    let seedId = 100;

    for (const conversation of conversations) {
      for (const exchange of conversation.exchanges) {
        const turnId = `20202020-0000-4000-8000-${String(seedId++).padStart(12, '0')}`;

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
