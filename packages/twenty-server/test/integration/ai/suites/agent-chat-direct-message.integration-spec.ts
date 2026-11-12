import { type GraphQLFormattedError } from 'graphql';
import { ErrorCode } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { randomUUID } from 'node:crypto';

import gql from 'graphql-tag';
import { createChatParticipationTestContext } from 'test/integration/ai/utils/create-chat-participation-test-context.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { sendChatParticipationMessage } from 'test/integration/graphql/utils/send-chat-participation-message.util';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';

import { AiExceptionCode } from 'src/engine/metadata-modules/ai/ai.exception';
import { type AgentConversationWriterService } from 'src/engine/metadata-modules/ai/ai-history/services/agent-conversation-writer.service';
import { type RecordShareSystemWriteService } from 'src/engine/permissions/record-share/services/record-share-system-write.service';
import { AgentMessageRole } from 'src/engine/metadata-modules/ai/ai-history/enums/agent-message-role.enum';
import { AgentTurnStatus } from 'src/engine/metadata-modules/ai/ai-history/enums/agent-turn-status.enum';
import { WORKSPACE_MEMBER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/workspace-member-data-seeds.constant';

const OPEN_DIRECT_MESSAGE = gql`
  mutation OpenDirectMessage($workspaceMemberId: UUID!) {
    openDirectMessage(workspaceMemberId: $workspaceMemberId)
  }
`;

const READ_DIRECT_MESSAGE = gql`
  query ReadDirectMessage($threadId: UUID!) {
    chatMessages(threadId: $threadId) {
      parts {
        textContent
      }
    }
  }
`;

describe('Private text direct messages', () => {
  let context: Awaited<ReturnType<typeof createChatParticipationTestContext>>;
  let conversationWriter: AgentConversationWriterService;

  beforeEach(async () => {
    context = await createChatParticipationTestContext();
    conversationWriter =
      getAppProviderByClassName<AgentConversationWriterService>(
        'AgentConversationWriterService',
      );
  });

  const readContentRecords = (
    threadId: string,
  ): Promise<{ id: string; isPrivate: boolean }[]> =>
    global.testDataSource.query(
      `SELECT id, "_isPrivate" AS "isPrivate" FROM "${context.schema}"."agentChatThread" WHERE id = $1
       UNION ALL SELECT id, "_isPrivate" FROM "${context.schema}"."agentTurn" WHERE "threadId" = $1
       UNION ALL SELECT id, "_isPrivate" FROM "${context.schema}"."agentMessage" WHERE "threadId" = $1
       UNION ALL SELECT part.id, part."_isPrivate" FROM "${context.schema}"."agentMessagePart" part
         JOIN "${context.schema}"."agentMessage" message ON message.id = part."messageId" WHERE message."threadId" = $1`,
      [threadId],
    );

  const softDeleteThread = (threadId: string) =>
    global.testDataSource.query(
      `UPDATE "${context.schema}"."agentChatThread" SET "deletedAt" = CURRENT_TIMESTAMP WHERE id = $1`,
      [threadId],
    );

  const readShares = (recordIds: string[]) =>
    global.testDataSource
      .createQueryBuilder()
      .select('"recordId"')
      .addSelect('"principalId"')
      .from(`${context.schema}.recordShare`, 'share')
      .where('"recordId" IN (:...recordIds)', { recordIds })
      .orderBy('"principalId"')
      .getRawMany<{ recordId: string; principalId: string }>();

  const readParts = (messageId: string) =>
    global.testDataSource
      .createQueryBuilder()
      .select(['id', '"messageId"', '"textContent"'])
      .addSelect('"_isPrivate"', 'isPrivate')
      .from(`${context.schema}.agentMessagePart`, 'part')
      .where('"messageId" = :messageId', { messageId })
      .getRawMany<{
        id: string;
        messageId: string;
        textContent: string;
        isPrivate: boolean;
      }>();

  afterEach(async () => {
    await context.cleanup();
  });

  const openDirectMessage = async ({
    workspaceMemberId = WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
    token = APPLE_JANE_ADMIN_ACCESS_TOKEN,
  }: {
    workspaceMemberId?: string;
    token?: string;
  } = {}) => {
    const response: {
      body: {
        data: { openDirectMessage: string };
        errors?: readonly GraphQLFormattedError[];
      };
    } = await makeMetadataApiRequest(
      { query: OPEN_DIRECT_MESSAGE, variables: { workspaceMemberId } },
      token,
    );

    expect(response.body.errors).toBeUndefined();

    const threadId = response.body.data.openDirectMessage;

    context.registerThread(threadId);

    return threadId;
  };

  it('reuses one private pair and restores it on reply or reopen without running Ada', async () => {
    const threadId = await openDirectMessage();

    expect(
      await openDirectMessage({
        workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JANE,
        token: APPLE_JONY_MEMBER_ACCESS_TOKEN,
      }),
    ).toBe(threadId);

    const sent = await sendChatParticipationMessage({
      threadId: threadId.toUpperCase(),
      text: 'Hello Jony',
      recipientWorkspaceMemberIds: [
        WORKSPACE_MEMBER_DATA_SEED_IDS.JONY.toUpperCase(),
      ],
    });

    await softDeleteThread(threadId);

    const reply = await sendChatParticipationMessage({
      threadId,
      text: 'Hello Jane',
      token: APPLE_JONY_MEMBER_ACCESS_TOKEN,
    });

    for (const response of [sent, reply]) {
      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.sendChatMessage).toMatchObject({
        queued: false,
        streamId: null,
      });
    }

    const history = await makeMetadataApiRequest(
      { query: READ_DIRECT_MESSAGE, variables: { threadId } },
      APPLE_JONY_MEMBER_ACCESS_TOKEN,
    );

    expect(history.body.errors).toBeUndefined();
    expect(history.body.data.chatMessages).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          parts: [expect.objectContaining({ textContent: 'Hello Jony' })],
        }),
        expect.objectContaining({
          parts: [expect.objectContaining({ textContent: 'Hello Jane' })],
        }),
      ]),
    );
    expect(await context.readThread(threadId)).toMatchObject({
      deletedAt: null,
      isAssistantParticipant: false,
      activeStreamId: null,
    });

    const contentRecords = await readContentRecords(threadId);

    expect(contentRecords).toHaveLength(7);

    for (const { id, isPrivate } of contentRecords) {
      expect(isPrivate).toBe(true);

      const shares = await readShares([id]);

      expect(shares.map(({ principalId }) => principalId)).toEqual(
        [
          WORKSPACE_MEMBER_DATA_SEED_IDS.JANE,
          WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
        ].sort(),
      );
    }

    await softDeleteThread(threadId);

    expect(await openDirectMessage()).toBe(threadId);
    expect(await context.readThread(threadId)).toMatchObject({
      deletedAt: null,
    });
  });

  it('replaces streamed parts and removes their grants when the assistant message is deleted', async () => {
    const threadId = await openDirectMessage();
    const turnId = await conversationWriter.insertTurn({
      workspaceId: context.workspaceId,
      threadId,
      agentId: null,
      status: AgentTurnStatus.COMPLETED,
    });
    const snapshot = {
      workspaceId: context.workspaceId,
      threadId: threadId.toUpperCase(),
      turnId,
      agentId: null,
      id: randomUUID().toUpperCase(),
    };

    await conversationWriter.upsertAssistantMessage({
      ...snapshot,
      parts: [{ type: 'text', text: 'Partial reply' }],
    });
    const originalParts = await readParts(snapshot.id);

    expect(originalParts).toHaveLength(1);
    const originalPartIds = originalParts.map(({ id }) => id);
    expect(await readShares(originalPartIds)).toHaveLength(2);

    await conversationWriter.upsertAssistantMessage({
      ...snapshot,
      parts: [{ type: 'text', text: 'Complete reply' }],
    });
    const replacedParts = await readParts(snapshot.id);

    expect(replacedParts).toEqual([
      expect.objectContaining({
        messageId: snapshot.id.toLowerCase(),
        textContent: 'Complete reply',
        isPrivate: true,
      }),
    ]);
    expect(await readShares(originalPartIds)).toEqual([]);
    const currentRecordIds = [
      snapshot.id,
      ...replacedParts.map(({ id }) => id),
    ];
    expect(await readShares(currentRecordIds)).toHaveLength(4);
    for (const { isPrivate } of await readContentRecords(threadId)) {
      expect(isPrivate).toBe(true);
    }

    await context.chatService.deleteAssistantMessagesForTurn({
      workspaceId: context.workspaceId,
      threadId,
      turnId,
    });

    expect(await readParts(snapshot.id)).toEqual([]);
    expect(await readShares(currentRecordIds)).toEqual([]);
    expect(
      (await readContentRecords(threadId)).map(({ id }) => id).sort(),
    ).toEqual([threadId, turnId].sort());
  });

  it('rolls back a message, its parts and grants when sharing the parts fails', async () => {
    const threadId = await openDirectMessage();
    const turnId = await conversationWriter.insertTurn({
      workspaceId: context.workspaceId,
      threadId,
      agentId: null,
      status: AgentTurnStatus.COMPLETED,
    });
    const recordsBefore = await readContentRecords(threadId);
    const recordShareSystemWriteService =
      getAppProviderByClassName<RecordShareSystemWriteService>(
        'RecordShareSystemWriteService',
      );
    const sharingFailure = new Error('Part sharing failed');
    const insertRecordShares =
      recordShareSystemWriteService.insertRecordShares.bind(
        recordShareSystemWriteService,
      );
    const insertShares = jest
      .spyOn(recordShareSystemWriteService, 'insertRecordShares')
      .mockImplementationOnce(insertRecordShares)
      .mockRejectedValueOnce(sharingFailure);
    const messageId = randomUUID();

    try {
      await expect(
        conversationWriter.insertMessage({
          workspaceId: context.workspaceId,
          threadId,
          turnId,
          id: messageId,
          role: AgentMessageRole.ASSISTANT,
          agentId: null,
          senderUserWorkspaceId: null,
          parts: [{ type: 'text', text: 'Uncommitted reply' }],
        }),
      ).rejects.toThrow(sharingFailure.message);

      expect(insertShares).toHaveBeenCalledTimes(2);
      expect(await readContentRecords(threadId)).toEqual(recordsBefore);
      expect(await readParts(messageId)).toEqual([]);
      const attemptedRecordIds = insertShares.mock.calls.flatMap(
        ([{ recordShares }]) => recordShares.map(({ recordId }) => recordId),
      );
      expect(await readShares(attemptedRecordIds)).toEqual([]);
    } finally {
      insertShares.mockRestore();
    }
  });

  it('denies an outside administrator access to another pair', async () => {
    const threadId = await openDirectMessage({
      workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.TIM,
      token: APPLE_JONY_MEMBER_ACCESS_TOKEN,
    });
    const sent = await sendChatParticipationMessage({
      threadId,
      text: 'Private pair message',
      token: APPLE_JONY_MEMBER_ACCESS_TOKEN,
    });

    expect(sent.body.errors).toBeUndefined();

    const response = await makeMetadataApiRequest({
      query: READ_DIRECT_MESSAGE,
      variables: { threadId },
    });

    expect(response.body.errors?.[0]?.extensions?.code).toBe(
      ErrorCode.NOT_FOUND,
    );
    expect(response.body.data?.chatMessages).toBeFalsy();
  });

  it('rejects unsupported file payloads before creating a message', async () => {
    const threadId = await openDirectMessage();
    const response = await sendChatParticipationMessage({
      threadId,
      attachments: [{ id: randomUUID(), filename: 'private.txt' }],
    });

    expect(response.body.errors?.[0]?.extensions).toMatchObject({
      code: ErrorCode.BAD_USER_INPUT,
      subCode: AiExceptionCode.INVALID_AGENT_INPUT,
    });
    expect(await readContentRecords(threadId)).toHaveLength(1);
  });
});
