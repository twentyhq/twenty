import { Test, type TestingModule } from '@nestjs/testing';

import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { TrashCleanupService } from 'src/engine/trash-cleanup/services/trash-cleanup.service';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';

describe('TrashCleanupService', () => {
  let service: TrashCleanupService;
  let mockFlatEntityMapsCacheService: any;
  let mockGlobalWorkspaceOrmManager: any;

  beforeEach(async () => {
    mockFlatEntityMapsCacheService = {
      getOrRecomputeManyOrAllFlatEntityMaps: jest.fn(),
    };

    mockGlobalWorkspaceOrmManager = {
      getRepository: jest.fn(),
      executeInWorkspaceContext: jest
        .fn()
        .mockImplementation((_authContext: any, fn: () => any) => fn()),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TrashCleanupService,
        {
          provide: WorkspaceManyOrAllFlatEntityMapsCacheService,
          useValue: mockFlatEntityMapsCacheService,
        },
        {
          provide: GlobalWorkspaceOrmManager,
          useValue: mockGlobalWorkspaceOrmManager,
        },
      ],
    }).compile();

    service = module.get<TrashCleanupService>(TrashCleanupService);

    // Suppress logger output in tests
    jest.spyOn(service['logger'], 'log').mockImplementation();
    jest.spyOn(service['logger'], 'error').mockImplementation();

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('cleanupWorkspaceTrash', () => {
    const createRepositoryMock = (name: string, initialCount: number) => {
      let remaining = initialCount;
      let counter = 0;

      return {
        find: jest.fn().mockImplementation(({ take }) => {
          const amount = Math.min(take ?? remaining, remaining);
          const records = Array.from({ length: amount }, () => ({
            id: `${name}-${counter++}`,
          }));

          remaining -= amount;

          return Promise.resolve(records);
        }),
        delete: jest.fn().mockResolvedValue(undefined),
      };
    };

    const setObjectMetadataCache = (
      entries: Array<{ id: string; nameSingular: string }>,
    ) => {
      const byId = entries.reduce<Record<string, any>>(
        (acc, { id, nameSingular }) => {
          acc[id] = {
            id,
            nameSingular,
          };

          return acc;
        },
        {},
      );

      mockFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps.mockResolvedValue(
        {
          flatObjectMetadataMaps: {
            byId,
            idByUniversalIdentifier: {},
          },
        },
      );
    };

    it('should return deleted count when cleanup succeeds', async () => {
      setObjectMetadataCache([
        { id: 'obj-company', nameSingular: 'company' },
        { id: 'obj-person', nameSingular: 'person' },
      ]);

      const companyRepository = createRepositoryMock('company', 2);
      const personRepository = createRepositoryMock('person', 1);

      mockGlobalWorkspaceOrmManager.getRepository
        .mockResolvedValueOnce(companyRepository)
        .mockResolvedValueOnce(personRepository);

      const result = await service.cleanupWorkspaceTrash({
        workspaceId: 'workspace-id',
        trashRetentionDays: 14,
      });

      expect(result).toEqual(3);
      expect(companyRepository.find).toHaveBeenCalled();
      expect(personRepository.find).toHaveBeenCalled();
      expect(companyRepository.delete).toHaveBeenCalledTimes(1);
      expect(personRepository.delete).toHaveBeenCalledTimes(1);

      const findArgs = companyRepository.find.mock.calls[0][0];

      expect(findArgs.withDeleted).toBe(true);
      expect(findArgs.order).toEqual({ deletedAt: 'ASC' });
    });

    it('should return zero when no objects are found', async () => {
      setObjectMetadataCache([]);

      const result = await service.cleanupWorkspaceTrash({
        workspaceId: 'workspace-id',
        trashRetentionDays: 14,
      });

      expect(result).toEqual(0);
      expect(
        mockGlobalWorkspaceOrmManager.getRepository,
      ).not.toHaveBeenCalled();
    });

    it('should respect max records limit across objects', async () => {
      (service as any).maxRecordsPerWorkspace = 3;
      (service as any).batchSize = 3;
      setObjectMetadataCache([
        { id: 'obj-company', nameSingular: 'company' },
        { id: 'obj-person', nameSingular: 'person' },
      ]);

      const companyRepository = createRepositoryMock('company', 2);
      const personRepository = createRepositoryMock('person', 5);

      mockGlobalWorkspaceOrmManager.getRepository
        .mockResolvedValueOnce(companyRepository)
        .mockResolvedValueOnce(personRepository);

      const result = await service.cleanupWorkspaceTrash({
        workspaceId: 'workspace-id',
        trashRetentionDays: 14,
      });

      expect(result).toEqual(3);
      expect(companyRepository.delete).toHaveBeenCalledTimes(1);
      expect(personRepository.delete).toHaveBeenCalledTimes(1);
      const personDeleteArgs = personRepository.delete.mock.calls[0][0];
      const deletedIds =
        personDeleteArgs.id._value ?? personDeleteArgs.id.value;

      expect(deletedIds).toHaveLength(1);
      expect(personRepository.find).toHaveBeenCalledTimes(1);
    });

    it('should ignore objects without soft deleted records', async () => {
      setObjectMetadataCache([{ id: 'obj-company', nameSingular: 'company' }]);

      const companyRepository = createRepositoryMock('company', 0);

      mockGlobalWorkspaceOrmManager.getRepository.mockResolvedValueOnce(
        companyRepository,
      );

      const result = await service.cleanupWorkspaceTrash({
        workspaceId: 'workspace-id',
        trashRetentionDays: 14,
      });

      expect(result).toEqual(0);
      expect(companyRepository.delete).not.toHaveBeenCalled();
    });

    it('should delete records across multiple batches', async () => {
      setObjectMetadataCache([{ id: 'obj-company', nameSingular: 'company' }]);

      const companyRepository = createRepositoryMock('company', 5);

      mockGlobalWorkspaceOrmManager.getRepository.mockResolvedValueOnce(
        companyRepository,
      );

      (service as any).batchSize = 2;
      (service as any).maxRecordsPerWorkspace = 10;

      const result = await service.cleanupWorkspaceTrash({
        workspaceId: 'workspace-id',
        trashRetentionDays: 14,
      });

      expect(result).toEqual(5);
      expect(companyRepository.find).toHaveBeenCalledTimes(4);
      expect(companyRepository.delete).toHaveBeenCalledTimes(3);
    });
  });
});
