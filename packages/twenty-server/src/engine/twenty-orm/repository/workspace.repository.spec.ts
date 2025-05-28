import { ObjectRecordsPermissions } from 'twenty-shared/types';
import {
  DeepPartial,
  FindManyOptions,
  FindOneOptions,
  FindOptionsWhere,
  ObjectLiteral,
  QueryRunner,
} from 'typeorm';

import { FeatureFlagMap } from 'src/engine/core-modules/feature-flag/interfaces/feature-flag-map.interface';
import { WorkspaceInternalContext } from 'src/engine/twenty-orm/interfaces/workspace-internal-context.interface';

import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { WorkspaceEntityManager } from 'src/engine/twenty-orm/entity-manager/workspace-entity-manager';
import { WorkspaceRepository } from 'src/engine/twenty-orm/repository/workspace.repository';

describe('WorkspaceRepository', () => {
  let repository: WorkspaceRepository<ObjectLiteral>;
  let mockEntityManager: jest.Mocked<WorkspaceEntityManager>;
  let mockInternalContext: WorkspaceInternalContext;
  let mockFeatureFlagMap: FeatureFlagMap;
  let mockObjectRecordsPermissions: ObjectRecordsPermissions;
  let mockQueryRunner: QueryRunner;

  beforeEach(() => {
    mockEntityManager = {
      find: jest.fn(),
      findBy: jest.fn(),
      findAndCount: jest.fn(),
      findAndCountBy: jest.fn(),
      findOne: jest.fn(),
      findOneBy: jest.fn(),
      findOneOrFail: jest.fn(),
      findOneByOrFail: jest.fn(),
      save: jest.fn(),
      remove: jest.fn(),
      delete: jest.fn(),
      softRemove: jest.fn(),
      softDelete: jest.fn(),
      recover: jest.fn(),
      restore: jest.fn(),
      insert: jest.fn(),
      update: jest.fn(),
      upsert: jest.fn(),
      exists: jest.fn(),
      existsBy: jest.fn(),
      count: jest.fn(),
      countBy: jest.fn(),
      sum: jest.fn(),
      average: jest.fn(),
      minimum: jest.fn(),
      maximum: jest.fn(),
      increment: jest.fn(),
      decrement: jest.fn(),
      preload: jest.fn(),
      clear: jest.fn(),
    } as unknown as jest.Mocked<WorkspaceEntityManager>;

    mockInternalContext = {
      workspaceId: 'test-workspace-id',
      objectMetadataMaps: {
        idByNameSingular: {},
      },
      featureFlagsMap: {},
    } as WorkspaceInternalContext;

    mockFeatureFlagMap = Object.values(FeatureFlagKey).reduce(
      (acc, key) => ({ ...acc, [key]: false }),
      {} as FeatureFlagMap,
    );
    mockObjectRecordsPermissions = {
      'test-entity': {
        canRead: true,
        canUpdate: false,
        canSoftDelete: false,
        canDestroy: false,
      },
    };
    mockQueryRunner = {} as QueryRunner;

    repository = new WorkspaceRepository(
      mockInternalContext,
      'test-entity',
      mockEntityManager,
      mockFeatureFlagMap,
      mockQueryRunner,
      mockObjectRecordsPermissions,
      false,
    );

    // Mock the private methods
    jest
      .spyOn(repository as any, 'getObjectMetadataFromTarget')
      .mockResolvedValue({
        id: 'test-metadata-id',
        nameSingular: 'test-entity',
        namePlural: 'test-entities',
        fields: [],
      });

    jest.spyOn(repository as any, 'formatData').mockImplementation((data) => {
      if (Array.isArray(data)) {
        return data.map((item) => Object.assign({}, item));
      }

      return Object.assign({}, data);
    });

    jest.spyOn(repository as any, 'formatResult').mockImplementation((data) => {
      if (Array.isArray(data)) {
        return data.map((item) => Object.assign({}, item));
      }

      return Object.assign({}, data);
    });
  });

  describe('Find Methods', () => {
    it('should delegate to workspaceEntityManager find', async () => {
      const options: FindManyOptions<ObjectLiteral> = {
        where: { id: 'test-id' },
      };

      mockEntityManager.find.mockResolvedValue([{ id: 'test-id' }]);

      await repository.find(options);

      expect(mockEntityManager.find).toHaveBeenCalledWith(
        'test-entity',
        { where: { id: 'test-id' } },
        {
          shouldBypassPermissionChecks: false,
          objectRecordsPermissions: mockObjectRecordsPermissions,
        },
      );
    });

    it('should delegate to workspaceEntityManager findBy', async () => {
      const where: FindOptionsWhere<ObjectLiteral> = { id: 'test-id' };

      mockEntityManager.findBy.mockResolvedValue([{ id: 'test-id' }]);

      await repository.findBy(where);

      expect(mockEntityManager.findBy).toHaveBeenCalledWith(
        'test-entity',
        { id: 'test-id' },
        {
          shouldBypassPermissionChecks: false,
          objectRecordsPermissions: mockObjectRecordsPermissions,
        },
      );
    });

    it('should delegate to workspaceEntityManager findAndCount', async () => {
      const options: FindManyOptions<ObjectLiteral> = {
        where: { id: 'test-id' },
      };

      mockEntityManager.findAndCount.mockResolvedValue([
        [{ id: 'test-id' }],
        1,
      ]);

      await repository.findAndCount(options);

      expect(mockEntityManager.findAndCount).toHaveBeenCalledWith(
        'test-entity',
        { where: { id: 'test-id' } },
        {
          shouldBypassPermissionChecks: false,
          objectRecordsPermissions: mockObjectRecordsPermissions,
        },
      );
    });

    it('should delegate to workspaceEntityManager findOne', async () => {
      const options: FindOneOptions<ObjectLiteral> = {
        where: { id: 'test-id' },
      };

      mockEntityManager.findOne.mockResolvedValue({ id: 'test-id' });

      await repository.findOne(options);

      expect(mockEntityManager.findOne).toHaveBeenCalledWith(
        'test-entity',
        { where: { id: 'test-id' } },
        {
          shouldBypassPermissionChecks: false,
          objectRecordsPermissions: mockObjectRecordsPermissions,
        },
      );
    });
  });

  describe('Save Methods', () => {
    it('should delegate to workspaceEntityManager save', async () => {
      const entity: DeepPartial<ObjectLiteral> = { id: 'test-id' };

      mockEntityManager.save.mockResolvedValue({ id: 'test-id' });

      await repository.save(entity);

      expect(mockEntityManager.save).toHaveBeenCalledWith(
        'test-entity',
        { id: 'test-id' },
        undefined,
        {
          shouldBypassPermissionChecks: false,
          objectRecordsPermissions: mockObjectRecordsPermissions,
        },
      );
    });
  });

  describe('Remove Methods', () => {
    it('should delegate to workspaceEntityManager remove', async () => {
      const entity: ObjectLiteral = { id: 'test-id' };
      const expectedResult = [{ id: 'test-id' }];

      mockEntityManager.remove.mockResolvedValue(expectedResult);

      const result = await repository.remove(entity);

      expect(mockEntityManager.remove).toHaveBeenCalledWith(
        'test-entity',
        { id: 'test-id' },
        undefined,
        {
          shouldBypassPermissionChecks: false,
          objectRecordsPermissions: mockObjectRecordsPermissions,
        },
      );
      expect(result).toEqual(expectedResult);
    });

    it('should delegate to workspaceEntityManager delete', async () => {
      const criteria: FindOptionsWhere<ObjectLiteral> = { id: 'test-id' };
      const expectedResult = { affected: 1, raw: [] };

      mockEntityManager.delete.mockResolvedValue(expectedResult);

      const result = await repository.delete(criteria);

      expect(mockEntityManager.delete).toHaveBeenCalledWith(
        'test-entity',
        { id: 'test-id' },
        {
          shouldBypassPermissionChecks: false,
          objectRecordsPermissions: mockObjectRecordsPermissions,
        },
      );
      expect(result).toEqual(expectedResult);
    });
  });

  describe('Insert Methods', () => {
    it('should delegate to workspaceEntityManager insert', async () => {
      const entity: DeepPartial<ObjectLiteral> = { id: 'test-id' };

      mockEntityManager.insert.mockResolvedValue({
        identifiers: [{ id: 'test-id' }],
        generatedMaps: [{ id: 'test-id' }],
        raw: [],
      });

      await repository.insert(entity);

      expect(mockEntityManager.insert).toHaveBeenCalledWith(
        'test-entity',
        { id: 'test-id' },
        {
          shouldBypassPermissionChecks: false,
          objectRecordsPermissions: mockObjectRecordsPermissions,
        },
      );
    });

    it('should delegate to workspaceEntityManager upsert', async () => {
      const entity: DeepPartial<ObjectLiteral> = { id: 'test-id' };

      mockEntityManager.upsert.mockResolvedValue({
        identifiers: [{ id: 'test-id' }],
        generatedMaps: [{ id: 'test-id' }],
        raw: [],
      });

      await repository.upsert(entity, ['id']);

      expect(mockEntityManager.upsert).toHaveBeenCalledWith(
        'test-entity',
        { id: 'test-id' },
        ['id'],
        {
          shouldBypassPermissionChecks: false,
          objectRecordsPermissions: mockObjectRecordsPermissions,
        },
      );
    });
  });

  describe('Update Methods', () => {
    it('should delegate to workspaceEntityManager update', async () => {
      const criteria: FindOptionsWhere<ObjectLiteral> = { id: 'test-id' };
      const partialEntity: DeepPartial<ObjectLiteral> = { name: 'test' };

      mockEntityManager.update.mockResolvedValue({
        affected: 1,
        raw: [],
        generatedMaps: [],
      });

      await repository.update(criteria, partialEntity);

      expect(mockEntityManager.update).toHaveBeenCalledWith(
        'test-entity',
        { id: 'test-id' },
        { name: 'test' },
        {
          shouldBypassPermissionChecks: false,
          objectRecordsPermissions: mockObjectRecordsPermissions,
        },
      );
    });
  });

  describe('Math Methods', () => {
    it('should delegate to workspaceEntityManager sum', async () => {
      const where: FindOptionsWhere<ObjectLiteral> = { id: 'test-id' };

      mockEntityManager.sum.mockResolvedValue(100);

      await repository.sum('testColumn', where);

      expect(mockEntityManager.sum).toHaveBeenCalledWith(
        'test-entity',
        'testColumn',
        { id: 'test-id' },
        {
          shouldBypassPermissionChecks: false,
          objectRecordsPermissions: mockObjectRecordsPermissions,
        },
      );
    });

    it('should delegate to workspaceEntityManager increment', async () => {
      const conditions: FindOptionsWhere<ObjectLiteral> = { id: 'test-id' };

      mockEntityManager.increment.mockResolvedValue({
        affected: 1,
        raw: [],
        generatedMaps: [],
      });

      await repository.increment(conditions, 'testColumn', 1);

      expect(mockEntityManager.increment).toHaveBeenCalledWith(
        'test-entity',
        { id: 'test-id' },
        'testColumn',
        1,
        {
          shouldBypassPermissionChecks: false,
          objectRecordsPermissions: mockObjectRecordsPermissions,
        },
      );
    });
  });

  describe('Preload and Clear Methods', () => {
    it('should delegate to workspaceEntityManager preload', async () => {
      const entityLike: DeepPartial<ObjectLiteral> = { id: 'test-id' };

      mockEntityManager.preload.mockResolvedValue({ id: 'test-id' });

      await repository.preload(entityLike);

      expect(mockEntityManager.preload).toHaveBeenCalledWith(
        'test-entity',
        { id: 'test-id' },
        {
          shouldBypassPermissionChecks: false,
          objectRecordsPermissions: mockObjectRecordsPermissions,
        },
      );
    });

    it('should delegate to workspaceEntityManager clear', async () => {
      mockEntityManager.clear.mockResolvedValue(undefined);

      await repository.clear();

      expect(mockEntityManager.clear).toHaveBeenCalledWith('test-entity', {
        shouldBypassPermissionChecks: false,
        objectRecordsPermissions: mockObjectRecordsPermissions,
      });
    });
  });

  describe('Restricted Methods', () => {
    it('should throw error for query', async () => {
      await expect(repository.query()).rejects.toThrow('Method not allowed.');
    });

    it('should throw error for findByIds', async () => {
      await expect(repository.findByIds()).rejects.toThrow(
        'findByIds is deprecated. Please use findBy with In operator instead.',
      );
    });

    it('should throw error for findOneById', async () => {
      await expect(repository.findOneById()).rejects.toThrow(
        'findOneById is deprecated. Please use findOneBy with id condition instead.',
      );
    });

    it('should throw error for exist', async () => {
      await expect(repository.exist()).rejects.toThrow(
        'exist is deprecated. Please use exists method instead.',
      );
    });
  });
});
