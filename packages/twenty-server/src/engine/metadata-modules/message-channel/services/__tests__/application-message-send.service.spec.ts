import { type Repository } from 'typeorm';

import { type CacheLockService } from 'src/engine/core-modules/cache-lock/cache-lock.service';
import { type CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { type FileEmailAttachmentService } from 'src/engine/core-modules/file/file-email-attachment/services/file-email-attachment.service';
import { type ConnectedAccountMetadataService } from 'src/engine/metadata-modules/connected-account/connected-account-metadata.service';
import { type MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';
import {
  MessageChannelException,
  MessageChannelExceptionCode,
} from 'src/engine/metadata-modules/message-channel/message-channel.exception';
import { type ApplicationMessageIngestionService } from 'src/engine/metadata-modules/message-channel/services/application-message-ingestion.service';
import { type ApplicationMessageSendAttachmentsService } from 'src/engine/metadata-modules/message-channel/services/application-message-send-attachments.service';
import { ApplicationMessageSendService } from 'src/engine/metadata-modules/message-channel/services/application-message-send.service';
import { type ApplicationThreadLatestMessagesService } from 'src/engine/metadata-modules/message-channel/services/application-thread-latest-messages.service';
import { type MessagingProviderMessageSenderService } from 'src/engine/metadata-modules/messaging-provider/services/messaging-provider-message-sender.service';
import { type WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

jest.mock(
  'src/engine/core-modules/email/utils/compile-outbound-email-content.util',
  () => ({ compileOutboundEmailContent: jest.fn() }),
);

const ATTACHMENTS = [{ id: 'upload-1', name: 'deck.pdf' }];

const SEND_ARGS = {
  workspaceId: 'workspace-1',
  userWorkspaceId: 'user-workspace-1',
  messageChannelId: 'channel-1',
  messageThreadId: 'message-thread-1',
  text: 'Hello',
  idempotencyKey: 'idempotency-key-1',
  attachments: ATTACHMENTS,
};

describe('ApplicationMessageSendService', () => {
  const sendOrThrow = jest.fn();
  const ingest = jest.fn();
  const buildAttachmentsToSendOrThrow = jest.fn();
  const copyIntoAttachmentFileFieldOrThrow = jest.fn();
  const deleteUnclaimedCopies = jest.fn();
  const deleteFiles = jest.fn();
  let cache: Map<string, unknown>;

  const service = new ApplicationMessageSendService(
    {
      findOne: async () => ({
        id: 'channel-1',
        handle: 'me',
        isSyncEnabled: true,
        messagingProviderUniversalIdentifier: 'provider-1',
      }),
    } as unknown as Repository<MessageChannelEntity>,
    {
      verifyUsableByCaller: async () => ({
        id: 'connected-account-1',
        applicationId: 'application-1',
        connectionProviderId: 'connection-provider-1',
      }),
    } as unknown as ConnectedAccountMetadataService,
    {
      resolveSenderOrThrow: async () => ({
        messagingProvider: {
          id: 'provider-1',
          name: 'linkedin',
          conversationStyle: 'chat',
        },
      }),
      sendOrThrow,
    } as unknown as MessagingProviderMessageSenderService,
    { ingest } as unknown as ApplicationMessageIngestionService,
    {
      buildAttachmentsToSendOrThrow,
      copyIntoAttachmentFileFieldOrThrow,
      deleteUnclaimedCopies,
    } as unknown as ApplicationMessageSendAttachmentsService,
    { deleteFiles } as unknown as FileEmailAttachmentService,
    {
      executeInWorkspaceContext: async () => ({
        threadExternalId: 'thread-external-1',
        recipients: [{ handle: 'ada' }],
      }),
    } as unknown as WorkspaceOrmManager,
    {} as unknown as ApplicationThreadLatestMessagesService,
    {
      getOrRecompute: async () => ({
        flatWorkspaceMemberMaps: { idByUserWorkspaceId: {} },
      }),
    } as unknown as WorkspaceCacheService,
    {
      withLock: (callback: () => Promise<unknown>) => callback(),
    } as unknown as CacheLockService,
    {
      get: async (key: string) => cache.get(key),
      set: async (key: string, value: unknown) => {
        cache.set(key, value);
      },
      del: async (key: string) => {
        cache.delete(key);
      },
      setIfAbsent: async (key: string, value: unknown) => {
        if (cache.has(key)) {
          return false;
        }

        cache.set(key, value);

        return true;
      },
    } as unknown as CacheStorageService,
  );

  beforeEach(() => {
    jest.clearAllMocks();
    cache = new Map();
    buildAttachmentsToSendOrThrow.mockResolvedValue([
      { filename: 'deck.pdf', downloadUrl: 'https://twenty.example/deck' },
    ]);
    sendOrThrow.mockResolvedValue({
      externalId: 'message-external-1',
      sentAt: '2026-01-01T00:00:00.000Z',
    });
    copyIntoAttachmentFileFieldOrThrow.mockResolvedValue([
      { fileId: 'copy-1', label: 'deck.pdf' },
    ]);
    ingest.mockResolvedValue({
      messages: [
        { messageId: 'message-1', messageThreadId: 'message-thread-1' },
      ],
    });
  });

  it('should delete the source uploads once the reply is saved', async () => {
    await expect(service.send(SEND_ARGS)).resolves.toEqual({
      messageId: 'message-1',
      messageThreadId: 'message-thread-1',
    });

    expect(deleteFiles).toHaveBeenCalledWith({
      fileIds: ['upload-1'],
      workspaceId: 'workspace-1',
    });
  });

  it('should refuse an upload already sent by another message without delivering it', async () => {
    await service.send(SEND_ARGS);

    await expect(
      service.send({ ...SEND_ARGS, idempotencyKey: 'idempotency-key-2' }),
    ).rejects.toThrow(MessageChannelException);

    expect(sendOrThrow).toHaveBeenCalledTimes(1);
    expect(copyIntoAttachmentFileFieldOrThrow).toHaveBeenCalledTimes(1);
  });

  it('should free the uploads of a send the provider rejected for another message', async () => {
    sendOrThrow.mockRejectedValueOnce(
      new Error('Provider rejected the message'),
    );

    await expect(service.send(SEND_ARGS)).rejects.toThrow(
      'Provider rejected the message',
    );

    await expect(
      service.send({ ...SEND_ARGS, idempotencyKey: 'idempotency-key-2' }),
    ).resolves.toEqual({
      messageId: 'message-1',
      messageThreadId: 'message-thread-1',
    });
  });

  it('should release the uploads it claimed when another message holds one of its uploads', async () => {
    cache.set(
      'app-message-attachment-claim:workspace-1:upload-2',
      'another-delivery',
    );

    await expect(
      service.send({
        ...SEND_ARGS,
        attachments: [...ATTACHMENTS, { id: 'upload-2', name: 'photo.png' }],
      }),
    ).rejects.toThrow(MessageChannelException);

    expect(cache.has('app-message-attachment-claim:workspace-1:upload-1')).toBe(
      false,
    );
    expect(sendOrThrow).not.toHaveBeenCalled();
  });

  it('should return the saved reply on retry without needing the deleted uploads', async () => {
    await service.send(SEND_ARGS);

    await expect(service.send(SEND_ARGS)).resolves.toEqual({
      messageId: 'message-1',
      messageThreadId: 'message-thread-1',
    });

    expect(sendOrThrow).toHaveBeenCalledTimes(1);
    expect(buildAttachmentsToSendOrThrow).toHaveBeenCalledTimes(1);
    expect(copyIntoAttachmentFileFieldOrThrow).toHaveBeenCalledTimes(1);
    expect(ingest).toHaveBeenCalledTimes(1);
  });

  it('should copy the delivered attachments, not the ones a retry carries', async () => {
    copyIntoAttachmentFileFieldOrThrow.mockRejectedValueOnce(
      new MessageChannelException(
        'Failed to store sent app message attachment(s)',
        MessageChannelExceptionCode.MESSAGE_ATTACHMENT_STORAGE_FAILED,
      ),
    );

    await expect(service.send(SEND_ARGS)).rejects.toThrow(
      MessageChannelException,
    );

    await service.send({
      ...SEND_ARGS,
      attachments: [{ id: 'other-upload', name: 'other.pdf' }],
    });

    expect(copyIntoAttachmentFileFieldOrThrow).toHaveBeenLastCalledWith({
      attachments: SEND_ARGS.attachments,
      workspaceId: 'workspace-1',
    });
    expect(deleteFiles).toHaveBeenCalledWith({
      fileIds: ['upload-1'],
      workspaceId: 'workspace-1',
    });
  });

  it('should fail without saving when an attachment copy fails, and copy again on retry without resending', async () => {
    copyIntoAttachmentFileFieldOrThrow.mockRejectedValueOnce(
      new MessageChannelException(
        'Failed to store sent app message attachment(s)',
        MessageChannelExceptionCode.MESSAGE_ATTACHMENT_STORAGE_FAILED,
      ),
    );

    await expect(service.send(SEND_ARGS)).rejects.toThrow(
      MessageChannelException,
    );

    expect(ingest).not.toHaveBeenCalled();
    expect(deleteFiles).not.toHaveBeenCalled();

    await expect(service.send(SEND_ARGS)).resolves.toEqual({
      messageId: 'message-1',
      messageThreadId: 'message-thread-1',
    });

    expect(sendOrThrow).toHaveBeenCalledTimes(1);
    expect(copyIntoAttachmentFileFieldOrThrow).toHaveBeenCalledTimes(2);
    expect(ingest).toHaveBeenCalledWith(
      expect.objectContaining({
        messages: [
          expect.objectContaining({
            attachments: [{ fileId: 'copy-1', label: 'deck.pdf' }],
          }),
        ],
      }),
    );
  });
});
