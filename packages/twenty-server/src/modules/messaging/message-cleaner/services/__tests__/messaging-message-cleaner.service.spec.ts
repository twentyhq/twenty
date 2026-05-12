import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { In } from 'typeorm';

import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { MessagingMessageCleanerService } from 'src/modules/messaging/message-cleaner/services/messaging-message-cleaner.service';

describe('MessagingMessageCleanerService', () => {
  const workspaceId = 'workspace-123';
  const messageObjectMetadataId = 'message-metadata-id';
  const messageThreadObjectMetadataId = 'message-thread-metadata-id';

  const orphanMessages = [{ id: 'message-1' }, { id: 'message-2' }];
  const orphanThreads = [{ id: 'thread-1' }];

  let service: MessagingMessageCleanerService;
  let mockMessageRepository: { find: jest.Mock; delete: jest.Mock };
  let mockMessageThreadRepository: { find: jest.Mock; delete: jest.Mock };
  let mockTimelineActivityRepository: { delete: jest.Mock };
  let mockObjectMetadataRepository: { findOne: jest.Mock };
  let callLog: string[];

  beforeEach(async () => {
    callLog = [];

    mockMessageRepository = {
      find: jest
        .fn()
        .mockResolvedValueOnce(orphanMessages)
        .mockResolvedValueOnce([]),
      delete: jest.fn().mockImplementation(async () => {
        callLog.push('message.delete');
      }),
    };

    mockMessageThreadRepository = {
      find: jest
        .fn()
        .mockResolvedValueOnce(orphanThreads)
        .mockResolvedValueOnce([]),
      delete: jest.fn().mockImplementation(async () => {
        callLog.push('thread.delete');
      }),
    };

    mockTimelineActivityRepository = {
      delete: jest.fn().mockImplementation(async (where) => {
        if (where.linkedObjectMetadataId === messageObjectMetadataId) {
          callLog.push('timelineActivity.delete.message');
        } else if (
          where.linkedObjectMetadataId === messageThreadObjectMetadataId
        ) {
          callLog.push('timelineActivity.delete.thread');
        }
      }),
    };

    mockObjectMetadataRepository = {
      findOne: jest.fn().mockImplementation(({ where }) => {
        if (where.nameSingular === 'message') {
          return Promise.resolve({ id: messageObjectMetadataId });
        }
        if (where.nameSingular === 'messageThread') {
          return Promise.resolve({ id: messageThreadObjectMetadataId });
        }

        return Promise.resolve(null);
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MessagingMessageCleanerService,
        {
          provide: GlobalWorkspaceOrmManager,
          useValue: {
            getRepository: jest
              .fn()
              .mockImplementation((_workspaceId, entityName) => {
                if (entityName === 'message') return mockMessageRepository;
                if (entityName === 'messageThread')
                  return mockMessageThreadRepository;
                if (entityName === 'timelineActivity')
                  return mockTimelineActivityRepository;

                return {};
              }),
            getGlobalWorkspaceDataSource: jest.fn().mockResolvedValue({
              transaction: jest
                .fn()
                .mockImplementation(
                  async (cb: (manager: unknown) => Promise<void>) =>
                    cb({ id: 'transaction-manager' }),
                ),
            }),
            executeInWorkspaceContext: jest
              .fn()
              .mockImplementation((fn: () => Promise<unknown>) => fn()),
          },
        },
        {
          provide: getRepositoryToken(ObjectMetadataEntity),
          useValue: mockObjectMetadataRepository,
        },
      ],
    }).compile();

    service = module.get<MessagingMessageCleanerService>(
      MessagingMessageCleanerService,
    );
  });

  describe('cleanOrphanMessagesAndThreads', () => {
    it('should delete timelineActivity rows referencing orphan messages with the correct linkedObjectMetadataId and ids', async () => {
      await service.cleanOrphanMessagesAndThreads(workspaceId);

      expect(mockTimelineActivityRepository.delete).toHaveBeenCalledWith(
        {
          linkedObjectMetadataId: messageObjectMetadataId,
          linkedRecordId: In(['message-1', 'message-2']),
        },
        expect.anything(),
      );

      expect(mockMessageRepository.delete).toHaveBeenCalledWith(
        ['message-1', 'message-2'],
        expect.anything(),
      );
    });

    it('should delete timelineActivity rows referencing orphan threads with the correct linkedObjectMetadataId and ids', async () => {
      await service.cleanOrphanMessagesAndThreads(workspaceId);

      expect(mockTimelineActivityRepository.delete).toHaveBeenCalledWith(
        {
          linkedObjectMetadataId: messageThreadObjectMetadataId,
          linkedRecordId: In(['thread-1']),
        },
        expect.anything(),
      );

      expect(mockMessageThreadRepository.delete).toHaveBeenCalledWith(
        ['thread-1'],
        expect.anything(),
      );
    });

    it('should delete timelineActivity rows before the matching message/thread rows', async () => {
      await service.cleanOrphanMessagesAndThreads(workspaceId);

      const messageTimelineIdx = callLog.indexOf(
        'timelineActivity.delete.message',
      );
      const messageDeleteIdx = callLog.indexOf('message.delete');
      const threadTimelineIdx = callLog.indexOf(
        'timelineActivity.delete.thread',
      );
      const threadDeleteIdx = callLog.indexOf('thread.delete');

      expect(messageTimelineIdx).toBeGreaterThanOrEqual(0);
      expect(messageDeleteIdx).toBeGreaterThan(messageTimelineIdx);
      expect(threadTimelineIdx).toBeGreaterThanOrEqual(0);
      expect(threadDeleteIdx).toBeGreaterThan(threadTimelineIdx);
    });

    it('should skip the timelineActivity delete when the object metadata cannot be resolved but still delete messages and threads', async () => {
      mockObjectMetadataRepository.findOne.mockResolvedValue(null);

      await service.cleanOrphanMessagesAndThreads(workspaceId);

      expect(mockTimelineActivityRepository.delete).not.toHaveBeenCalled();
      expect(mockMessageRepository.delete).toHaveBeenCalledWith(
        ['message-1', 'message-2'],
        expect.anything(),
      );
      expect(mockMessageThreadRepository.delete).toHaveBeenCalledWith(
        ['thread-1'],
        expect.anything(),
      );
    });

    it('should not call any delete when there are no orphan messages or threads', async () => {
      mockMessageRepository.find = jest.fn().mockResolvedValue([]);
      mockMessageThreadRepository.find = jest.fn().mockResolvedValue([]);

      await service.cleanOrphanMessagesAndThreads(workspaceId);

      expect(mockTimelineActivityRepository.delete).not.toHaveBeenCalled();
      expect(mockMessageRepository.delete).not.toHaveBeenCalled();
      expect(mockMessageThreadRepository.delete).not.toHaveBeenCalled();
    });
  });
});
