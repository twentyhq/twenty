import { randomUUID } from 'node:crypto';

import { createChatParticipationTestContext } from 'test/integration/ai/utils/create-chat-participation-test-context.util';
import { sendChatParticipationMessage } from 'test/integration/graphql/utils/send-chat-participation-message.util';
import { getCoreRepository } from 'test/integration/utils/get-core-repository.util';
import { FileFolder } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { In } from 'typeorm';

import { FileEntity } from 'src/engine/core-modules/file/entities/file.entity';
import {
  FILE_STATUS,
  type FileStatus,
} from 'src/engine/core-modules/file/types/file-status.type';

describe('Chat message attachments with real storage', () => {
  let context: Awaited<ReturnType<typeof createChatParticipationTestContext>>;
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
  });

  afterEach(async () => {
    if (isDefined(context)) {
      await context.cleanup();
    }

    await getCoreRepository<FileEntity>(FileEntity).delete({
      id: In(fileIds.splice(0)),
    });
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
});
