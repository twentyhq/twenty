import { randomUUID } from 'node:crypto';

import { configureChatParticipationModels } from 'test/integration/ai/utils/configure-chat-participation-models.util';
import { createChatParticipationTestContext } from 'test/integration/ai/utils/create-chat-participation-test-context.util';
import { sendChatParticipationMessage } from 'test/integration/graphql/utils/send-chat-participation-message.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { getCoreRepository } from 'test/integration/utils/get-core-repository.util';
import { FileFolder } from 'twenty-shared/types';
import { assertIsDefinedOrThrow, isDefined } from 'twenty-shared/utils';
import { In } from 'typeorm';

import { FileEntity } from 'src/engine/core-modules/file/entities/file.entity';
import {
  FILE_STATUS,
  type FileStatus,
} from 'src/engine/core-modules/file/types/file-status.type';
import { buildAskQuestionPendingOutput } from 'src/engine/metadata-modules/ai/ai-agent-execution/pausing-tools/ask-question.pausing-tool';
import { AgentMessageRole } from 'src/engine/metadata-modules/ai/ai-history/enums/agent-message-role.enum';
import { AgentTurnStatus } from 'src/engine/metadata-modules/ai/ai-history/enums/agent-turn-status.enum';
import { type AgentConversationWriterService } from 'src/engine/metadata-modules/ai/ai-history/services/agent-conversation-writer.service';

describe('Chat message attachments with real storage', () => {
  let context: Awaited<ReturnType<typeof createChatParticipationTestContext>>;
  let models: ReturnType<typeof configureChatParticipationModels>;
  const fileIds: string[] = [];
  const filename = 'attachment.txt';

  const createFile = async (status: FileStatus) => {
    const id = randomUUID();

    await getCoreRepository<FileEntity>(FileEntity).insert({
      id,
      workspaceId: context.workspaceId,
      path: `${FileFolder.AgentChat}/${id}/${filename}`,
      size: 0,
      mimeType: 'application/octet-stream',
      status,
    });
    fileIds.push(id);

    return id;
  };

  beforeEach(async () => {
    context = await createChatParticipationTestContext();
    models = configureChatParticipationModels();
  });

  afterEach(async () => {
    try {
      if (isDefined(context)) {
        await context.cleanup();
      }

      await getCoreRepository<FileEntity>(FileEntity).delete({
        id: In(fileIds.splice(0)),
      });
    } finally {
      if (isDefined(models)) {
        models.restore();
      }
    }
  });

  it('stores an uploaded attachment with the accepted message', async () => {
    const threadId = await context.createThread(false);
    const fileId = await createFile(FILE_STATUS.UPLOADED);
    const messageId = randomUUID();
    const response = await sendChatParticipationMessage({
      threadId,
      messageId,
      isAssistantParticipant: false,
      shouldAssistantReply: false,
      attachments: [{ id: fileId, filename }],
    });

    expect(response.body.errors).toBeUndefined();
    expect(
      await global.testDataSource.query(
        `SELECT "fileId", "fileFilename"
         FROM "${context.schema}"."agentMessagePart"
         WHERE "messageId" = $1 AND type = 'file'`,
        [messageId],
      ),
    ).toEqual([{ fileId, fileFilename: filename }]);
  });

  it.each(['unknown', 'pending'])(
    'rejects %s attachments without saving the message or Ada selection',
    async (attachmentState) => {
      const threadId = await context.createThread(false);
      const fileId =
        attachmentState === 'pending'
          ? await createFile(FILE_STATUS.PENDING)
          : randomUUID();
      const response = await sendChatParticipationMessage({
        threadId,
        isAssistantMentioned: true,
        shouldAssistantReply: false,
        attachments: [{ id: fileId, filename }],
      });

      expect(response.body.errors?.[0]?.extensions?.code).toBe(
        'BAD_USER_INPUT',
      );
      expect((await context.readThread(threadId)).isAssistantParticipant).toBe(
        false,
      );
      expect(
        await global.testDataSource.query(
          `SELECT id FROM "${context.schema}"."agentMessage" WHERE "threadId" = $1`,
          [threadId],
        ),
      ).toEqual([]);
      expect(
        await global.testDataSource.query(
          `SELECT id FROM "${context.schema}"."agentTurn" WHERE "threadId" = $1`,
          [threadId],
        ),
      ).toEqual([]);
    },
  );

  it('rejects an invalid attachment before creating a new thread', async () => {
    const threadId = context.registerThread();
    const response = await sendChatParticipationMessage({
      threadId,
      shouldAssistantReply: false,
      attachments: [{ id: randomUUID(), filename }],
    });

    expect(response.body.errors?.[0]?.extensions?.code).toBe('BAD_USER_INPUT');
    expect(
      await global.testDataSource.query(
        `SELECT id FROM "${context.schema}"."agentChatThread" WHERE id = $1`,
        [threadId],
      ),
    ).toEqual([]);
  });

  it('rejects an invalid attachment before restoring a deleted thread', async () => {
    const threadId = await context.createThread(false);
    const deletedAt = new Date('2026-01-01T00:00:00.000Z');

    await global.testDataSource.query(
      `UPDATE "${context.schema}"."agentChatThread" SET "deletedAt" = $2 WHERE id = $1`,
      [threadId, deletedAt],
    );

    const response = await sendChatParticipationMessage({
      threadId,
      shouldAssistantReply: false,
      attachments: [{ id: randomUUID(), filename }],
    });

    expect(response.body.errors?.[0]?.extensions?.code).toBe('BAD_USER_INPUT');
    expect((await context.readThread(threadId)).deletedAt).toEqual(deletedAt);
  });

  it('keeps a pending question and waiting turn unchanged when an attachment is invalid', async () => {
    const threadId = await context.createThread();
    const userMessage = await context.chatService.addMessage({
      workspaceId: context.workspaceId,
      userWorkspaceId: context.userWorkspaceId,
      threadId,
      turnStatus: AgentTurnStatus.WAITING_FOR_INPUT,
      uiMessage: {
        role: AgentMessageRole.USER,
        parts: [{ type: 'text', text: 'Help me choose a plan.' }],
      },
    });

    assertIsDefinedOrThrow(userMessage.turnId);

    const question = {
      header: 'Plan',
      question: 'Which plan should I quote?',
      options: [{ label: 'Pro' }, { label: 'Team' }],
    };
    const pendingOutput = buildAskQuestionPendingOutput(question);
    const assistantMessageId = randomUUID();

    await getAppProviderByClassName<AgentConversationWriterService>(
      'AgentConversationWriterService',
    ).upsertAssistantMessage({
      id: assistantMessageId,
      threadId,
      turnId: userMessage.turnId,
      workspaceId: context.workspaceId,
      parts: [
        {
          type: 'tool-ask_question',
          toolCallId: randomUUID(),
          state: 'output-available',
          input: question,
          output: pendingOutput,
        },
      ] as never,
    });
    await global.testDataSource.query(
      `UPDATE "${context.schema}"."agentChatThread" SET "pendingQuestionMessageId" = $2 WHERE id = $1`,
      [threadId, assistantMessageId],
    );

    const response = await sendChatParticipationMessage({
      threadId,
      shouldAssistantReply: true,
      attachments: [{ id: randomUUID(), filename }],
    });

    expect(response.body.errors?.[0]?.extensions?.code).toBe('BAD_USER_INPUT');
    expect(
      await global.testDataSource.query(
        `SELECT thread."pendingQuestionMessageId", turn.status, part."toolOutput"
         FROM "${context.schema}"."agentChatThread" thread
         JOIN "${context.schema}"."agentTurn" turn ON turn.id = $2
         JOIN "${context.schema}"."agentMessagePart" part ON part."messageId" = $3
         WHERE thread.id = $1`,
        [threadId, userMessage.turnId, assistantMessageId],
      ),
    ).toEqual([
      {
        pendingQuestionMessageId: assistantMessageId,
        status: AgentTurnStatus.WAITING_FOR_INPUT,
        toolOutput: pendingOutput,
      },
    ]);
  });
});
