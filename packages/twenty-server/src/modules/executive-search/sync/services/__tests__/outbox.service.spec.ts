import { Test, type TestingModule } from '@nestjs/testing';

import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import {
  ExecutiveSearchOutboxService,
  OUTBOX_STATUS,
} from 'src/modules/executive-search/sync/services/outbox.service';

const createMockRepository = () => ({
  findOneBy: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  find: jest.fn(),
});

const createMockOrmManager = (
  mockRepo: ReturnType<typeof createMockRepository>,
) => ({
  getRepository: jest.fn().mockResolvedValue(mockRepo),
  executeInWorkspaceContext: jest.fn(async (fn: () => unknown) => await fn()),
});

describe('ExecutiveSearchOutboxService', () => {
  let service: ExecutiveSearchOutboxService;
  let mockRepo: ReturnType<typeof createMockRepository>;
  let mockMessageQueue: { add: jest.Mock };

  beforeEach(async () => {
    mockRepo = createMockRepository();
    mockMessageQueue = { add: jest.fn().mockResolvedValue(undefined) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExecutiveSearchOutboxService,
        {
          provide: GlobalWorkspaceOrmManager,
          useValue: createMockOrmManager(mockRepo),
        },
        {
          provide: `BullQueue_${MessageQueue.executiveSyncQueue}`,
          useValue: mockMessageQueue,
        },
      ],
    }).compile();

    service = module.get(ExecutiveSearchOutboxService);
  });

  const baseInput = {
    workspaceId: 'ws-1',
    eventType: 'executiveProfile.created',
    entityName: 'executiveProfile',
    entityId: 'record-1',
    domainIdempotencyKey: 'key-1',
    payload: { name: 'Test' },
  };

  describe('enqueue', () => {
    it('should persist a new outbox entry and enqueue a job', async () => {
      mockRepo.findOneBy.mockResolvedValue(null);
      mockRepo.create.mockReturnValue({ id: 'out-1', ...baseInput });
      mockRepo.save.mockResolvedValue({ id: 'out-1', ...baseInput });

      const result = await service.enqueue(baseInput);

      expect(mockRepo.findOneBy).toHaveBeenCalledWith({
        domainIdempotencyKey: 'key-1',
      });
      expect(mockRepo.save).toHaveBeenCalled();
      expect(mockMessageQueue.add).toHaveBeenCalledWith(
        'ExecutiveSyncProcessOutboxJob',
        { workspaceId: 'ws-1', outboxId: 'out-1' },
        { retryLimit: 3 },
      );
      expect(result).toBeDefined();
    });

    it('should skip duplicate idempotency keys and return existing entry', async () => {
      const existing = { id: 'out-1', status: OUTBOX_STATUS.SENT };
      mockRepo.findOneBy.mockResolvedValue(existing);

      const result = await service.enqueue(baseInput);

      expect(mockRepo.save).not.toHaveBeenCalled();
      expect(mockMessageQueue.add).not.toHaveBeenCalled();
      expect(result).toBe(existing);
    });
  });

  describe('markSent', () => {
    it('should update status to SENT', async () => {
      await service.markSent('ws-1', 'out-1');
      expect(mockRepo.update).toHaveBeenCalledWith('out-1', {
        status: OUTBOX_STATUS.SENT,
      });
    });
  });

  describe('markFailed', () => {
    it('should mark FAILED when retries exhausted', async () => {
      await service.markFailed('ws-1', 'out-1', 'Network error', 2, 3);
      expect(mockRepo.update).toHaveBeenCalledWith('out-1', {
        lastError: 'Network error',
        retryCount: 3,
        status: OUTBOX_STATUS.FAILED,
        nextRetryAt: null,
      });
    });

    it('should schedule retry with exponential backoff when retries remain', async () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2026-07-15T12:00:00Z'));

      await service.markFailed('ws-1', 'out-1', 'Network error', 0, 3);

      const updateCall = mockRepo.update.mock.calls[0][1];
      expect(updateCall.status).toBe(OUTBOX_STATUS.PENDING);
      expect(updateCall.retryCount).toBe(1);
      expect(updateCall.lastError).toBe('Network error');
      // Exponential backoff: 2^1 = 2 seconds
      expect(updateCall.nextRetryAt).toBe(
        new Date('2026-07-15T12:00:02Z').toISOString(),
      );

      jest.useRealTimers();
    });
  });

  describe('findReadyForRetry', () => {
    it('should use LessThan and IsNull operators for nextRetryAt filtering', async () => {
      mockRepo.find.mockResolvedValue([]);

      await service.findReadyForRetry('ws-1', 50);

      const whereClause = mockRepo.find.mock.calls[0][0].where;
      expect(whereClause.status).toBe(OUTBOX_STATUS.PENDING);
      // nextRetryAt filter uses TypeORM Or(IsNull(), LessThan(now))
      expect(whereClause.nextRetryAt).toBeDefined();
      expect(mockRepo.find).toHaveBeenCalledWith(
        expect.objectContaining({
          order: { createdAt: 'ASC' },
          take: 50,
        }),
      );
    });
  });
});
