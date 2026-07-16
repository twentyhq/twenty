import { Test, type TestingModule } from '@nestjs/testing';

import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { ExecutiveSearchDLQService } from 'src/modules/executive-search/sync/services/dlq.service';

const createMockRepository = () => ({
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  createQueryBuilder: jest.fn(),
});

const mockQueryBuilder = {
  select: jest.fn().mockReturnThis(),
  addSelect: jest.fn().mockReturnThis(),
  groupBy: jest.fn().mockReturnThis(),
  getRawMany: jest.fn(),
};

describe('ExecutiveSearchDLQService', () => {
  let service: ExecutiveSearchDLQService;
  let mockRepo: ReturnType<typeof createMockRepository>;

  beforeEach(async () => {
    mockRepo = createMockRepository();
    mockRepo.createQueryBuilder.mockReturnValue(mockQueryBuilder);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExecutiveSearchDLQService,
        {
          provide: GlobalWorkspaceOrmManager,
          useValue: {
            getRepository: jest.fn().mockResolvedValue(mockRepo),
            executeInWorkspaceContext: jest.fn(
              async (fn: () => unknown) => await fn(),
            ),
          },
        },
      ],
    }).compile();

    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-07-15T12:00:00Z'));

    service = module.get(ExecutiveSearchDLQService);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('enqueue', () => {
    it('should persist a DLQ entry with failedAt timestamp', async () => {
      mockRepo.create.mockReturnValue({ id: 'dlq-1' });
      mockRepo.save.mockResolvedValue({ id: 'dlq-1' });

      const result = await service.enqueue({
        workspaceId: 'ws-1',
        sourceType: 'OUTBOX',
        sourceRecordId: 'out-1',
        eventId: 'ev-1',
        eventType: 'executiveProfile.created',
        payload: { name: 'Test' },
        error: 'Network timeout',
        errorClass: 'NETWORK',
      });

      expect(mockRepo.save).toHaveBeenCalled();
      expect(result).toBeDefined();
    });
  });

  describe('list', () => {
    it('should return entries ordered by failedAt DESC', async () => {
      mockRepo.find.mockResolvedValue([{ id: 'dlq-1' }, { id: 'dlq-2' }]);

      const result = await service.list('ws-1', 10, 0);

      expect(mockRepo.find).toHaveBeenCalledWith({
        order: { failedAt: 'DESC' },
        take: 10,
        skip: 0,
      });
      expect(result).toHaveLength(2);
    });
  });

  describe('countByErrorClass', () => {
    it('should aggregate counts using database GROUP BY', async () => {
      mockQueryBuilder.getRawMany.mockResolvedValue([
        { errorClass: 'NETWORK', count: '5' },
        { errorClass: 'SCHEMA_DRIFT', count: '2' },
      ]);

      const result = await service.countByErrorClass('ws-1');

      expect(mockRepo.createQueryBuilder).toHaveBeenCalledWith('dlq');
      expect(mockQueryBuilder.select).toHaveBeenCalledWith(
        'dlq.errorClass',
        'errorClass',
      );
      expect(mockQueryBuilder.addSelect).toHaveBeenCalledWith(
        'COUNT(*)',
        'count',
      );
      expect(mockQueryBuilder.groupBy).toHaveBeenCalledWith('dlq.errorClass');
      expect(result).toEqual({ NETWORK: 5, SCHEMA_DRIFT: 2 });
    });

    it('should return empty object when no DLQ entries', async () => {
      mockQueryBuilder.getRawMany.mockResolvedValue([]);

      const result = await service.countByErrorClass('ws-1');

      expect(result).toEqual({});
    });
  });
});
