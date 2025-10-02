import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { DataSource } from 'typeorm';

import { WorkspaceTrashCleanupService } from 'src/engine/workspace-manager/workspace-trash-cleanup/services/workspace-trash-cleanup.service';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

describe('WorkspaceTrashCleanupService', () => {
  let service: WorkspaceTrashCleanupService;
  let mockDataSource: any;
  let mockObjectMetadataRepository: any;

  beforeEach(async () => {
    mockDataSource = {
      query: jest.fn(),
    };

    mockObjectMetadataRepository = {
      createQueryBuilder: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkspaceTrashCleanupService,
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
        {
          provide: getRepositoryToken(ObjectMetadataEntity),
          useValue: mockObjectMetadataRepository,
        },
        {
          provide: TwentyConfigService,
          useValue: {
            get: jest.fn().mockReturnValue(100000),
          },
        },
      ],
    }).compile();

    service = module.get<WorkspaceTrashCleanupService>(
      WorkspaceTrashCleanupService,
    );

    // Suppress logger output in tests
    jest.spyOn(service['logger'], 'log').mockImplementation();
    jest.spyOn(service['logger'], 'error').mockImplementation();

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('cleanupWorkspaceTrash', () => {
    it('should return success with deleted count when cleanup succeeds', async () => {
      const mockQueryBuilder = {
        innerJoin: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([
          { nameSingular: 'company', isCustom: false },
          { nameSingular: 'person', isCustom: false },
        ]),
      };

      mockObjectMetadataRepository.createQueryBuilder.mockReturnValue(
        mockQueryBuilder,
      );

      mockDataSource.query.mockResolvedValueOnce([{ count: '30000' }]);
      mockDataSource.query.mockResolvedValueOnce([{ count: '20000' }]);

      const result = await service.cleanupWorkspaceTrash({
        workspaceId: 'workspace-id',
        schemaName: 'workspace_test',
        trashRetentionDays: 14,
      });

      expect(result).toEqual({
        success: true,
        deletedCount: 50000,
      });
    });

    it('should return success with zero count when no tables found', async () => {
      const mockQueryBuilder = {
        innerJoin: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([]),
      };

      mockObjectMetadataRepository.createQueryBuilder.mockReturnValue(
        mockQueryBuilder,
      );

      const result = await service.cleanupWorkspaceTrash({
        workspaceId: 'workspace-id',
        schemaName: 'workspace_test',
        trashRetentionDays: 14,
      });

      expect(result).toEqual({
        success: true,
        deletedCount: 0,
      });
    });

    it('should return error result when discovery fails', async () => {
      const mockQueryBuilder = {
        innerJoin: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockRejectedValue(new Error('Database error')),
      };

      mockObjectMetadataRepository.createQueryBuilder.mockReturnValue(
        mockQueryBuilder,
      );

      const result = await service.cleanupWorkspaceTrash({
        workspaceId: 'workspace-id',
        schemaName: 'workspace_test',
        trashRetentionDays: 14,
      });

      expect(result).toEqual({
        success: false,
        deletedCount: 0,
        error: 'Database error',
      });
    });

    it('should respect max records limit across multiple tables', async () => {
      const mockQueryBuilder = {
        innerJoin: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([
          { nameSingular: 'company', isCustom: false },
          { nameSingular: 'person', isCustom: false },
          { nameSingular: 'opportunity', isCustom: false },
        ]),
      };

      mockObjectMetadataRepository.createQueryBuilder.mockReturnValue(
        mockQueryBuilder,
      );

      // Mock deletion results: 60k + 40k = 100k (hits limit, third table not processed)
      mockDataSource.query
        .mockResolvedValueOnce([{ count: '60000' }])
        .mockResolvedValueOnce([{ count: '40000' }]);

      const result = await service.cleanupWorkspaceTrash({
        workspaceId: 'workspace-id',
        schemaName: 'workspace_test',
        trashRetentionDays: 14,
      });

      expect(result).toEqual({
        success: true,
        deletedCount: 100000,
      });
      // Should only process 2 tables (company, person) and stop before opportunity
      expect(mockDataSource.query).toHaveBeenCalledTimes(2);
    });

    it('should return error result when deletion fails', async () => {
      const mockQueryBuilder = {
        innerJoin: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getRawMany: jest
          .fn()
          .mockResolvedValue([{ nameSingular: 'company', isCustom: false }]),
      };

      mockObjectMetadataRepository.createQueryBuilder.mockReturnValue(
        mockQueryBuilder,
      );

      mockDataSource.query.mockRejectedValue(new Error('Deletion failed'));

      const result = await service.cleanupWorkspaceTrash({
        workspaceId: 'workspace-id',
        schemaName: 'workspace_test',
        trashRetentionDays: 14,
      });

      expect(result).toEqual({
        success: false,
        deletedCount: 0,
        error: 'Deletion failed',
      });
    });
  });
});
