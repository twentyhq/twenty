import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { randomUUID } from 'crypto';

import { gql } from 'graphql-tag';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { type AgentHistoryUpgradeStorageService } from 'src/database/commands/agent-history/agent-history-upgrade-storage.service';
import { type AgentHistoryObjectName } from 'src/engine/metadata-modules/ai/ai-history/types/agent-history-object-name.type';
import { escapeIdentifier } from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';

import { makeAdminPanelApiRequest } from 'test/integration/twenty-config/utils/make-admin-panel-api-request.util';

import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const GET_ADMIN_CHAT_THREAD_MESSAGES = gql`
  query GetAdminChatThreadMessages($workspaceId: UUID!, $threadId: UUID!) {
    getAdminChatThreadMessages(workspaceId: $workspaceId, threadId: $threadId) {
      thread {
        id
        messageCount
        conversationSize
      }
      messages {
        id
        role
        parts {
          type
          orderIndex
          textContent
          reasoningContent
          toolName
          toolCallId
          toolInput
          toolOutput
          state
          errorMessage
        }
      }
    }
  }
`;

describe('Admin panel chat thread messages (integration)', () => {
  let storage: AgentHistoryUpgradeStorageService;
  let workspaceMemberId: string;
  let kickoffThreadId: string;
  const seededThreadIds: string[] = [];
  const seededMessageIds: string[] = [];
  const seededPartIds: string[] = [];

  const insertHistory = async (
    name: AgentHistoryObjectName,
    columns: string[],
    values: unknown[],
    onConflict = '',
  ): Promise<void> => {
    await storage.run(SEED_APPLE_WORKSPACE_ID, async (context) => {
      await context.manager.query(
        `INSERT INTO ${context.table(name)} (${columns.map(escapeIdentifier).join(', ')}) VALUES (${values.map((_, index) => `$${index + 1}`).join(', ')}) ${onConflict}`,
        values,
      );
    });
  };

  const insertThread = async ({
    id,
    title,
  }: {
    id: string;
    title: string;
  }): Promise<string> => {
    await insertHistory(
      'agentChatThread',
      ['id', 'workspaceMemberId', 'title'],
      [id, workspaceMemberId, title],
      'ON CONFLICT (id) DO NOTHING',
    );

    seededThreadIds.push(id);

    return id;
  };

  const insertMessage = async ({
    threadId,
    role,
    createdAt,
  }: {
    threadId: string;
    role: 'system' | 'user' | 'assistant';
    createdAt: string;
  }): Promise<string> => {
    const id = randomUUID();

    await insertHistory(
      'agentMessage',
      ['id', 'threadId', 'role', 'createdAt'],
      [id, threadId, role, createdAt],
    );

    seededMessageIds.push(id);

    return id;
  };

  const insertPart = async ({
    messageId,
    orderIndex,
    type,
    textContent,
    reasoningContent,
    toolName,
    toolCallId,
    toolInput,
    toolOutput,
    state,
  }: {
    messageId: string;
    orderIndex: number;
    type: string;
    textContent?: string;
    reasoningContent?: string;
    toolName?: string;
    toolCallId?: string;
    toolInput?: object;
    toolOutput?: object;
    state?: string;
  }): Promise<string> => {
    const id = randomUUID();

    await insertHistory(
      'agentMessagePart',
      [
        'id',
        'messageId',
        'orderIndex',
        'type',
        'textContent',
        'reasoningContent',
        'toolName',
        'toolCallId',
        'toolInput',
        'toolOutput',
        'state',
      ],
      [
        id,
        messageId,
        orderIndex,
        type,
        textContent ?? null,
        reasoningContent ?? null,
        toolName ?? null,
        toolCallId ?? null,
        toolInput ? JSON.stringify(toolInput) : null,
        toolOutput ? JSON.stringify(toolOutput) : null,
        state ?? null,
      ],
    );

    seededPartIds.push(id);

    return id;
  };

  beforeAll(async () => {
    storage = getAppProviderByClassName<AgentHistoryUpgradeStorageService>(
      'AgentHistoryUpgradeStorageService',
    );

    const [firstUserWorkspace] = await global.testDataSource.query(
      `SELECT "workspaceMember".id AS "workspaceMemberId"
       FROM core."userWorkspace" "userWorkspace"
       JOIN core."user" "user" ON "user".id = "userWorkspace"."userId"
       JOIN "${getWorkspaceSchemaName(SEED_APPLE_WORKSPACE_ID)}"."workspaceMember" "workspaceMember" ON "workspaceMember"."userId" = "user".id AND "workspaceMember"."deletedAt" IS NULL
       WHERE "userWorkspace"."workspaceId" = $1
         AND "userWorkspace"."deletedAt" IS NULL
       ORDER BY "userWorkspace"."createdAt" ASC
       LIMIT 1`,
      [SEED_APPLE_WORKSPACE_ID],
    );

    workspaceMemberId = firstUserWorkspace.workspaceMemberId;

    kickoffThreadId = await insertThread({
      id: randomUUID(),
      title: 'integration-onboarding-kickoff-thread',
    });
    const kickoffContextMessageId = await insertMessage({
      threadId: kickoffThreadId,
      role: 'system',
      createdAt: '2026-01-01T00:00:00Z',
    });

    await insertPart({
      messageId: kickoffContextMessageId,
      orderIndex: 0,
      type: 'text',
      textContent: 'kickoff prompt with company context',
    });

    await insertMessage({
      threadId: kickoffThreadId,
      role: 'user',
      createdAt: '2026-01-01T00:01:00Z',
    });
    const assistantMessageId = await insertMessage({
      threadId: kickoffThreadId,
      role: 'assistant',
      createdAt: '2026-01-01T00:02:00Z',
    });

    await insertPart({
      messageId: assistantMessageId,
      orderIndex: 1,
      type: 'tool-call',
      toolName: 'create_many_object_metadata',
      toolCallId: 'call-1',
      toolInput: { objects: [{ nameSingular: 'listing' }] },
      toolOutput: { success: true },
      state: 'output-available',
    });
    await insertPart({
      messageId: assistantMessageId,
      orderIndex: 0,
      type: 'reasoning',
      reasoningContent: 'planning the data model',
    });
  });

  afterAll(async () => {
    await storage.run(SEED_APPLE_WORKSPACE_ID, async (context) => {
      for (const { name, ids } of [
        { name: 'agentMessagePart' as const, ids: seededPartIds },
        { name: 'agentMessage' as const, ids: seededMessageIds },
        { name: 'agentChatThread' as const, ids: seededThreadIds },
      ]) {
        if (ids.length > 0) {
          await context.manager.query(
            `DELETE FROM ${context.table(name)} WHERE id = ANY($1)`,
            [ids],
          );
        }
      }
    });
  });

  describe('getAdminChatThreadMessages', () => {
    it('returns the kickoff context first with enriched ordered parts', async () => {
      const response = await makeAdminPanelApiRequest({
        query: GET_ADMIN_CHAT_THREAD_MESSAGES,
        variables: {
          workspaceId: SEED_APPLE_WORKSPACE_ID,
          threadId: kickoffThreadId,
        },
      });

      expect(response.body.errors).toBeUndefined();

      const result = response.body.data?.getAdminChatThreadMessages;

      expect(result.thread.messageCount).toBe(2);
      expect(result.messages).toHaveLength(3);
      expect(result.messages[0]).toMatchObject({ role: 'SYSTEM' });
      expect(result.messages[0].parts[0].textContent).toBe(
        'kickoff prompt with company context',
      );

      const assistantMessage = result.messages.find(
        (message: { role: string }) => message.role === 'ASSISTANT',
      );

      expect(
        assistantMessage.parts.map(
          (part: { orderIndex: number }) => part.orderIndex,
        ),
      ).toEqual([0, 1]);
      expect(assistantMessage.parts[1]).toMatchObject({
        type: 'tool-call',
        toolName: 'create_many_object_metadata',
        toolCallId: 'call-1',
        toolInput: { objects: [{ nameSingular: 'listing' }] },
        toolOutput: { success: true },
        state: 'output-available',
      });
      expect(assistantMessage.parts[0]).toMatchObject({
        type: 'reasoning',
        reasoningContent: 'planning the data model',
      });
    });
  });
});
