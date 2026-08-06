import { randomUUID } from 'crypto';

import { gql } from 'graphql-tag';
import { type DataSource } from 'typeorm';
import { v5 } from 'uuid';

import { makeAdminPanelAPIRequestWithGuestRole } from 'test/integration/graphql/suites/admin-panel/utils/make-admin-panel-api-request-with-guest-role.util';
import { makeAdminPanelAPIRequest } from 'test/integration/twenty-config/utils/make-admin-panel-api-request.util';

import { WORKSPACE_SETUP_CHAT_THREAD_ID_NAMESPACE } from 'src/engine/metadata-modules/ai/ai-chat/constants/workspace-setup-chat-thread-id-namespace.constant';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const GET_ADMIN_CHAT_THREADS = gql`
  query GetAdminChatThreads(
    $scope: AdminChatThreadScope
    $hasErrorOnly: Boolean
    $userNeverEngagedOnly: Boolean
    $searchTerm: String
    $sortBy: AdminChatThreadSortField
    $sortDirection: AdminChatThreadSortDirection
    $limit: Int
    $offset: Int
  ) {
    getAdminChatThreads(
      scope: $scope
      hasErrorOnly: $hasErrorOnly
      userNeverEngagedOnly: $userNeverEngagedOnly
      searchTerm: $searchTerm
      sortBy: $sortBy
      sortDirection: $sortDirection
      limit: $limit
      offset: $offset
    ) {
      totalCount
      hasMore
      threads {
        id
        title
        workspaceId
        workspaceDisplayName
        userWorkspaceId
        userEmail
        messageCount
        userReplyCount
        hasError
        isOnboardingThread
        deletedAt
        createdAt
        updatedAt
      }
    }
  }
`;

const GET_ADMIN_CHAT_THREAD_MESSAGES = gql`
  query GetAdminChatThreadMessages($threadId: UUID!) {
    getAdminChatThreadMessages(threadId: $threadId) {
      thread {
        id
        messageCount
        conversationSize
      }
      messages {
        id
        role
        isHidden
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

type ThreadsResult = {
  totalCount: number;
  hasMore: boolean;
  threads: {
    id: string;
    messageCount: number;
    userReplyCount: number;
    hasError: boolean;
    isOnboardingThread: boolean;
    userEmail: string | null;
  }[];
};

describe('Admin panel global chat threads (integration)', () => {
  let dataSource: DataSource;
  let userWorkspaceId: string;
  let userEmail: string;
  let kickoffThreadId: string;
  let deterministicThreadId: string;
  let regularThreadId: string;
  let answeredQuestionThreadId: string;
  let pendingQuestionThreadId: string;
  const seededThreadIds: string[] = [];
  const seededMessageIds: string[] = [];
  const seededPartIds: string[] = [];

  const insertThread = async ({
    id,
    title,
    lastStreamError,
  }: {
    id: string;
    title: string;
    lastStreamError?: object;
  }): Promise<string> => {
    await dataSource.query(
      `INSERT INTO core."agentChatThread"
        (id, "workspaceId", "userWorkspaceId", title, "lastStreamError")
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (id) DO UPDATE SET "lastStreamError" = EXCLUDED."lastStreamError"`,
      [
        id,
        SEED_APPLE_WORKSPACE_ID,
        userWorkspaceId,
        title,
        lastStreamError ? JSON.stringify(lastStreamError) : null,
      ],
    );

    seededThreadIds.push(id);

    return id;
  };

  const insertMessage = async ({
    threadId,
    role,
    isHidden = false,
    createdAt,
  }: {
    threadId: string;
    role: 'user' | 'assistant';
    isHidden?: boolean;
    createdAt: string;
  }): Promise<string> => {
    const id = randomUUID();

    await dataSource.query(
      `INSERT INTO core."agentMessage"
        (id, "workspaceId", "threadId", role, "isHidden", "createdAt")
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [id, SEED_APPLE_WORKSPACE_ID, threadId, role, isHidden, createdAt],
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

    await dataSource.query(
      `INSERT INTO core."agentMessagePart"
        (id, "workspaceId", "messageId", "orderIndex", type, "textContent",
         "reasoningContent", "toolName", "toolCallId", "toolInput",
         "toolOutput", state)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
      [
        id,
        SEED_APPLE_WORKSPACE_ID,
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

  const fetchThreads = async (
    variables: Record<string, unknown>,
  ): Promise<ThreadsResult> => {
    const response = await makeAdminPanelAPIRequest({
      query: GET_ADMIN_CHAT_THREADS,
      variables,
    });

    expect(response.body.errors).toBeUndefined();

    return response.body.data?.getAdminChatThreads;
  };

  beforeAll(async () => {
    dataSource = global.testDataSource;

    const [firstUserWorkspace] = await dataSource.query(
      `SELECT "userWorkspace".id, "user".email
       FROM core."userWorkspace" "userWorkspace"
       JOIN core."user" "user" ON "user".id = "userWorkspace"."userId"
       WHERE "userWorkspace"."workspaceId" = $1
         AND "userWorkspace"."deletedAt" IS NULL
       ORDER BY "userWorkspace"."createdAt" ASC
       LIMIT 1`,
      [SEED_APPLE_WORKSPACE_ID],
    );

    userWorkspaceId = firstUserWorkspace.id;
    userEmail = firstUserWorkspace.email;

    kickoffThreadId = await insertThread({
      id: randomUUID(),
      title: 'integration-onboarding-kickoff-thread',
    });
    const hiddenKickoffMessageId = await insertMessage({
      threadId: kickoffThreadId,
      role: 'user',
      isHidden: true,
      createdAt: '2026-01-01T00:00:00Z',
    });

    await insertPart({
      messageId: hiddenKickoffMessageId,
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

    deterministicThreadId = await insertThread({
      id: v5(
        `${SEED_APPLE_WORKSPACE_ID}:${userWorkspaceId}`,
        WORKSPACE_SETUP_CHAT_THREAD_ID_NAMESPACE,
      ),
      title: 'integration-onboarding-deterministic-thread',
    });

    regularThreadId = await insertThread({
      id: randomUUID(),
      title: 'integration-regular-thread',
      lastStreamError: { message: 'stream failed' },
    });
    const regularAssistantMessageId = await insertMessage({
      threadId: regularThreadId,
      role: 'assistant',
      createdAt: '2026-01-01T00:03:00Z',
    });

    await insertPart({
      messageId: regularAssistantMessageId,
      orderIndex: 0,
      type: 'text',
      textContent: 'assistant reply',
    });

    const questionItems = [
      {
        header: 'Email type',
        question: 'Which mailbox should we sync?',
        options: [{ label: 'Work' }, { label: 'Personal' }],
      },
    ];

    answeredQuestionThreadId = await insertThread({
      id: randomUUID(),
      title: 'integration-answered-question-thread',
    });
    await insertMessage({
      threadId: answeredQuestionThreadId,
      role: 'user',
      isHidden: true,
      createdAt: '2026-01-01T00:04:00Z',
    });

    const answeredQuestionMessageId = await insertMessage({
      threadId: answeredQuestionThreadId,
      role: 'assistant',
      createdAt: '2026-01-01T00:05:00Z',
    });

    await insertPart({
      messageId: answeredQuestionMessageId,
      orderIndex: 0,
      type: 'tool-ask_questions',
      toolName: 'ask_questions',
      toolCallId: 'call-answered-questions',
      toolInput: { questions: questionItems },
      toolOutput: {
        success: true,
        message: 'User answered the questions.',
        result: {
          questions: questionItems,
          status: 'answered',
          answers: [{ questionIndex: 0, selectedOptionIndices: [0] }],
        },
      },
      state: 'output-available',
    });

    pendingQuestionThreadId = await insertThread({
      id: randomUUID(),
      title: 'integration-pending-question-thread',
    });
    await insertMessage({
      threadId: pendingQuestionThreadId,
      role: 'user',
      isHidden: true,
      createdAt: '2026-01-01T00:06:00Z',
    });

    const pendingQuestionMessageId = await insertMessage({
      threadId: pendingQuestionThreadId,
      role: 'assistant',
      createdAt: '2026-01-01T00:07:00Z',
    });

    await insertPart({
      messageId: pendingQuestionMessageId,
      orderIndex: 0,
      type: 'tool-ask_questions',
      toolName: 'ask_questions',
      toolCallId: 'call-pending-questions',
      toolInput: { questions: questionItems },
      toolOutput: {
        success: true,
        message: 'Questions presented to the user; awaiting their answer.',
        result: { questions: questionItems, status: 'pending' },
      },
      state: 'output-available',
    });
  });

  afterAll(async () => {
    if (seededPartIds.length > 0) {
      await dataSource.query(
        `DELETE FROM core."agentMessagePart" WHERE id = ANY($1)`,
        [seededPartIds],
      );
    }

    if (seededMessageIds.length > 0) {
      await dataSource.query(
        `DELETE FROM core."agentMessage" WHERE id = ANY($1)`,
        [seededMessageIds],
      );
    }

    if (seededThreadIds.length > 0) {
      await dataSource.query(
        `DELETE FROM core."agentChatThread" WHERE id = ANY($1)`,
        [seededThreadIds],
      );
    }

    await dataSource.query(
      `UPDATE core."workspace" SET "allowImpersonation" = true WHERE id = $1`,
      [SEED_APPLE_WORKSPACE_ID],
    );
  });

  describe('getAdminChatThreads', () => {
    it('returns only onboarding threads for the ONBOARDING scope', async () => {
      const result = await fetchThreads({ scope: 'ONBOARDING', limit: 100 });

      const threadIds = result.threads.map((thread) => thread.id);

      expect(threadIds).toContain(kickoffThreadId);
      expect(threadIds).toContain(deterministicThreadId);
      expect(threadIds).not.toContain(regularThreadId);

      for (const thread of result.threads) {
        expect(thread.isOnboardingThread).toBe(true);
      }
    });

    it('defaults to every scope when none is given', async () => {
      const result = await fetchThreads({ limit: 100 });

      const threadIds = result.threads.map((thread) => thread.id);

      expect(threadIds).toContain(regularThreadId);
      expect(threadIds).toContain(kickoffThreadId);
    });

    it('returns all threads with the onboarding flag for the ALL scope', async () => {
      const result = await fetchThreads({
        scope: 'ALL',
        searchTerm: regularThreadId,
      });

      expect(result.totalCount).toBe(1);
      expect(result.threads).toHaveLength(1);
      expect(result.threads[0]).toMatchObject({
        id: regularThreadId,
        isOnboardingThread: false,
        hasError: true,
        messageCount: 1,
        userReplyCount: 0,
        userEmail,
      });
    });

    it('counts only visible messages and user replies', async () => {
      const result = await fetchThreads({
        scope: 'ALL',
        searchTerm: kickoffThreadId,
      });

      expect(result.threads[0]).toMatchObject({
        id: kickoffThreadId,
        isOnboardingThread: true,
        messageCount: 2,
        userReplyCount: 1,
        hasError: false,
      });
    });

    it('filters threads with errors via hasErrorOnly', async () => {
      const result = await fetchThreads({
        scope: 'ALL',
        hasErrorOnly: true,
        limit: 100,
      });

      const threadIds = result.threads.map((thread) => thread.id);

      expect(threadIds).toContain(regularThreadId);
      expect(threadIds).not.toContain(kickoffThreadId);
    });

    it('filters threads without user replies via userNeverEngagedOnly', async () => {
      const result = await fetchThreads({
        scope: 'ONBOARDING',
        userNeverEngagedOnly: true,
        limit: 100,
      });

      const threadIds = result.threads.map((thread) => thread.id);

      expect(threadIds).toContain(deterministicThreadId);
      expect(threadIds).toContain(pendingQuestionThreadId);
      expect(threadIds).not.toContain(kickoffThreadId);
      expect(threadIds).not.toContain(answeredQuestionThreadId);
    });

    it('counts an answered question card as a user reply', async () => {
      const result = await fetchThreads({
        scope: 'ALL',
        searchTerm: answeredQuestionThreadId,
      });

      expect(result.threads[0]).toMatchObject({
        id: answeredQuestionThreadId,
        messageCount: 1,
        userReplyCount: 1,
      });
    });

    it('does not count a pending question card as a user reply', async () => {
      const result = await fetchThreads({
        scope: 'ALL',
        searchTerm: pendingQuestionThreadId,
      });

      expect(result.threads[0]).toMatchObject({
        id: pendingQuestionThreadId,
        messageCount: 1,
        userReplyCount: 0,
      });
    });

    it('sorts by message count', async () => {
      const result = await fetchThreads({
        scope: 'ONBOARDING',
        sortBy: 'MESSAGE_COUNT',
        sortDirection: 'ASC',
        limit: 100,
      });

      const threadIds = result.threads.map((thread) => thread.id);

      expect(threadIds.indexOf(deterministicThreadId)).toBeLessThan(
        threadIds.indexOf(kickoffThreadId),
      );
    });

    it('sorts by reply count, counting answered question cards', async () => {
      const result = await fetchThreads({
        scope: 'ALL',
        sortBy: 'REPLY_COUNT',
        sortDirection: 'DESC',
        limit: 100,
      });

      const threadIds = result.threads.map((thread) => thread.id);

      expect(threadIds.indexOf(answeredQuestionThreadId)).toBeLessThan(
        threadIds.indexOf(pendingQuestionThreadId),
      );
      expect(threadIds.indexOf(kickoffThreadId)).toBeLessThan(
        threadIds.indexOf(pendingQuestionThreadId),
      );
    });

    it('paginates with totalCount and hasMore', async () => {
      const result = await fetchThreads({ scope: 'ONBOARDING', limit: 1 });

      expect(result.threads).toHaveLength(1);
      expect(result.totalCount).toBeGreaterThanOrEqual(2);
      expect(result.hasMore).toBe(true);
    });

    it('finds threads by user email via searchTerm', async () => {
      const result = await fetchThreads({
        scope: 'ALL',
        searchTerm: userEmail,
        limit: 100,
      });

      const threadIds = result.threads.map((thread) => thread.id);

      expect(threadIds).toContain(kickoffThreadId);
      expect(threadIds).toContain(regularThreadId);
    });

    it('excludes workspaces that disabled support access', async () => {
      await dataSource.query(
        `UPDATE core."workspace" SET "allowImpersonation" = false WHERE id = $1`,
        [SEED_APPLE_WORKSPACE_ID],
      );

      try {
        const result = await fetchThreads({
          scope: 'ALL',
          searchTerm: kickoffThreadId,
        });

        expect(result.totalCount).toBe(0);
        expect(result.threads).toHaveLength(0);
      } finally {
        await dataSource.query(
          `UPDATE core."workspace" SET "allowImpersonation" = true WHERE id = $1`,
          [SEED_APPLE_WORKSPACE_ID],
        );
      }
    });

    it('rejects a caller without the SECURITY permission flag', async () => {
      const response = await makeAdminPanelAPIRequestWithGuestRole({
        query: GET_ADMIN_CHAT_THREADS,
        variables: {},
      });

      expect(response.body.errors).toBeDefined();
      expect(response.body.data?.getAdminChatThreads).toBeFalsy();
    });
  });

  describe('getAdminChatThreadMessages', () => {
    it('returns the hidden kickoff first with enriched ordered parts', async () => {
      const response = await makeAdminPanelAPIRequest({
        query: GET_ADMIN_CHAT_THREAD_MESSAGES,
        variables: { threadId: kickoffThreadId },
      });

      expect(response.body.errors).toBeUndefined();

      const result = response.body.data?.getAdminChatThreadMessages;

      expect(result.thread.messageCount).toBe(2);
      expect(result.messages).toHaveLength(3);
      expect(result.messages[0]).toMatchObject({
        role: 'USER',
        isHidden: true,
      });
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
