import { MessageParticipantRole } from 'twenty-shared/types';
import { type Repository } from 'typeorm';

import { type CacheLockService } from 'src/engine/core-modules/cache-lock/cache-lock.service';
import { type CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { type ConnectedAccountMetadataService } from 'src/engine/metadata-modules/connected-account/connected-account-metadata.service';
import { type MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';
import { type ApplicationMessageIngestionService } from 'src/engine/metadata-modules/message-channel/services/application-message-ingestion.service';
import { ApplicationMessageSendService } from 'src/engine/metadata-modules/message-channel/services/application-message-send.service';
import { type MessagingProviderMessageSenderService } from 'src/engine/metadata-modules/messaging-provider/services/messaging-provider-message-sender.service';
import { type WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

const SEND_ARGS = {
  workspaceId: 'workspace-id',
  userWorkspaceId: 'user-workspace-id',
  messageChannelId: 'message-channel-id',
  messageThreadId: 'message-thread-id',
  text: 'Tuesday works',
  idempotencyKey: 'idempotency-key',
};

describe('ApplicationMessageSendService', () => {
  const sendOrThrow = jest.fn();
  const ingest = jest.fn();
  let service: ApplicationMessageSendService;

  beforeEach(() => {
    jest.clearAllMocks();

    const cache = new Map<string, unknown>();

    const rowsByObjectName: Record<string, object[]> = {
      message: [{ id: 'message-1' }],
      messageChannelMessageAssociation: [
        { messageId: 'message-1', messageThreadExternalId: 'thread-1' },
      ],
      messageParticipant: [
        {
          messageId: 'message-1',
          handle: 'urn:li:person:ada',
          displayName: 'Ada Lovelace',
          personId: null,
          workspaceMemberId: null,
          role: MessageParticipantRole.FROM,
        },
      ],
    };

    sendOrThrow.mockResolvedValue({
      externalId: 'sent-1',
      sentAt: '2026-10-21T10:00:00.000Z',
    });

    service = new ApplicationMessageSendService(
      {
        findOne: jest.fn().mockResolvedValue({
          id: SEND_ARGS.messageChannelId,
          isSyncEnabled: true,
          connectedAccountId: 'connected-account-id',
          handle: 'urn:li:person:jane',
          displayName: 'Jane Doe',
          messagingProviderUniversalIdentifier: 'messaging-provider',
        }),
      } as unknown as Repository<MessageChannelEntity>,
      {
        verifyUsableByCaller: jest.fn().mockResolvedValue({
          id: 'connected-account-id',
          applicationId: 'application-id',
          connectionProviderId: 'connection-provider-id',
        }),
      } as unknown as ConnectedAccountMetadataService,
      {
        resolveSenderOrThrow: jest.fn().mockResolvedValue({}),
        sendOrThrow,
      } as unknown as MessagingProviderMessageSenderService,
      { ingest } as unknown as ApplicationMessageIngestionService,
      {
        executeInWorkspaceContext: jest.fn((callback) => callback()),
        getRepository: jest.fn((objectName: string) => ({
          find: jest.fn().mockResolvedValue(rowsByObjectName[objectName] ?? []),
        })),
      } as unknown as WorkspaceOrmManager,
      {
        getOrRecompute: jest.fn().mockResolvedValue({
          flatWorkspaceMemberMaps: { idByUserWorkspaceId: {} },
        }),
      } as unknown as WorkspaceCacheService,
      {
        withLock: jest.fn((callback) => callback()),
      } as unknown as CacheLockService,
      {
        get: jest.fn(async (key: string) => cache.get(key)),
        set: jest.fn(async (key: string, value: unknown) => {
          cache.set(key, value);
        }),
      } as unknown as CacheStorageService,
    );
  });

  it('records a delivered reply on retry without sending it again', async () => {
    ingest
      .mockRejectedValueOnce(new Error('recording failed'))
      .mockResolvedValueOnce({
        messages: [{ messageId: 'message-2', messageThreadId: 'thread-id' }],
      });

    await expect(service.send(SEND_ARGS)).rejects.toThrow('recording failed');

    await expect(service.send(SEND_ARGS)).resolves.toEqual({
      messageId: 'message-2',
      messageThreadId: 'thread-id',
    });

    expect(sendOrThrow).toHaveBeenCalledTimes(1);
    expect(sendOrThrow).toHaveBeenCalledWith(
      expect.objectContaining({
        payload: expect.objectContaining({ idempotencyKey: 'idempotency-key' }),
      }),
    );
    expect(ingest).toHaveBeenLastCalledWith(
      expect.objectContaining({
        messages: [
          expect.objectContaining({
            externalId: 'sent-1',
            threadExternalId: 'thread-1',
            receivedAt: new Date('2026-10-21T10:00:00.000Z'),
          }),
        ],
      }),
    );
  });

  it('sends again under a new idempotency key', async () => {
    ingest.mockResolvedValue({
      messages: [{ messageId: 'message-2', messageThreadId: 'thread-id' }],
    });

    await service.send(SEND_ARGS);
    await service.send({ ...SEND_ARGS, idempotencyKey: 'another-key' });

    expect(sendOrThrow).toHaveBeenCalledTimes(2);
  });
});
