import { randomUUID } from 'node:crypto';

import { parse } from 'graphql';

import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { destroyAgentChatThread } from 'test/integration/utils/destroy-agent-chat-thread.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';

import { type AgentChatService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat.service';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { WORKSPACE_MEMBER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/workspace-member-data-seeds.constant';

const SCHEMA = getWorkspaceSchemaName(SEED_APPLE_WORKSPACE_ID);

const PREVIEWS = parse(
  `query Previews($threadIds: [UUID!]!) {
     agentChatThreadPreviews(threadIds: $threadIds) {
       threadId lastMessageRole lastMessageText lastMessageSenderWorkspaceMemberId memberIds
     }
   }`,
);

const insertMessage = async ({
  threadId,
  role,
  text,
  createdAt,
  senderWorkspaceMemberId = null,
  isHidden = false,
}: {
  threadId: string;
  role: 'user' | 'assistant';
  text: string;
  createdAt: Date;
  senderWorkspaceMemberId?: string | null;
  isHidden?: boolean;
}) => {
  const messageId = randomUUID();

  await global.testDataSource.query(
    `INSERT INTO ${SCHEMA}."agentMessage" (id, "threadId", role, status, "isHidden", "createdAt", "senderWorkspaceMemberId")
     VALUES ($1, $2, $3, 'sent', $4, $5, $6)`,
    [messageId, threadId, role, isHidden, createdAt, senderWorkspaceMemberId],
  );
  await global.testDataSource.query(
    `INSERT INTO ${SCHEMA}."agentMessagePart" ("messageId", "orderIndex", type, "textContent")
     VALUES ($1, 0, 'text', $2)`,
    [messageId, text],
  );
};

const queryPreviews = (threadIds: string[], token: string) =>
  makeMetadataApiRequest({ query: PREVIEWS, variables: { threadIds } }, token);

describe('Chat thread previews through the authenticated API', () => {
  const threadId = randomUUID();

  beforeAll(async () => {
    await getAppProviderByClassName<AgentChatService>(
      'AgentChatService',
    ).createThread({
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JANE,
      id: threadId,
      title: 'Thread preview',
    });

    await insertMessage({
      threadId,
      role: 'user',
      text: 'An older message without a sender',
      createdAt: new Date('2026-01-01T10:00:00.000Z'),
    });
    await insertMessage({
      threadId,
      role: 'user',
      text: 'Can you check the Stripe renewal?',
      createdAt: new Date('2026-01-01T10:01:00.000Z'),
      senderWorkspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.TIM,
    });
    await insertMessage({
      threadId,
      role: 'assistant',
      text: 'The renewal is due next week.',
      createdAt: new Date('2026-01-01T10:02:00.000Z'),
    });
    await insertMessage({
      threadId,
      role: 'user',
      text: 'A hidden message',
      createdAt: new Date('2026-01-01T10:03:00.000Z'),
      senderWorkspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
      isHidden: true,
    });
  });

  afterAll(async () => {
    await destroyAgentChatThread({ threadId });
  });

  it('returns the last visible message and everyone who wrote in the thread', async () => {
    const response = await queryPreviews(
      [threadId],
      APPLE_JANE_ADMIN_ACCESS_TOKEN,
    );

    expect(response.body.errors).toBeUndefined();

    const [preview] = response.body.data.agentChatThreadPreviews;

    expect(preview).toMatchObject({
      threadId,
      lastMessageRole: 'assistant',
      lastMessageText: 'The renewal is due next week.',
      lastMessageSenderWorkspaceMemberId: null,
    });
    expect([...preview.memberIds].sort()).toEqual(
      [
        WORKSPACE_MEMBER_DATA_SEED_IDS.JANE,
        WORKSPACE_MEMBER_DATA_SEED_IDS.TIM,
      ].sort(),
    );
  });

  it('leaves out threads the member cannot read', async () => {
    const response = await queryPreviews(
      [threadId],
      APPLE_JONY_MEMBER_ACCESS_TOKEN,
    );

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.agentChatThreadPreviews).toEqual([]);
  });
});
