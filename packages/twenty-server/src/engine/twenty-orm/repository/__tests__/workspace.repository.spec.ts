import {
  FieldMetadataType,
  type ObjectsPermissions,
} from 'twenty-shared/types';
import {
  type DeepPartial,
  type FindManyOptions,
  type FindOneOptions,
  type FindOptionsWhere,
  type ObjectLiteral,
  type QueryRunner,
} from 'typeorm';

import { type FeatureFlagMap } from 'src/engine/core-modules/feature-flag/interfaces/feature-flag-map.interface';
import { type WorkspaceInternalContext } from 'src/engine/twenty-orm/interfaces/workspace-internal-context.interface';

import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type WorkspaceEntityManager } from 'src/engine/twenty-orm/entity-manager/workspace-entity-manager';
import { WorkspaceRepository } from 'src/engine/twenty-orm/repository/workspace.repository';

describe('WorkspaceRepository', () => {
  let repository: WorkspaceRepository<ObjectLiteral>;
  let mockEntityManager: jest.Mocked<WorkspaceEntityManager>;
  let mockInternalContext: WorkspaceInternalContext;
  let mockFeatureFlagMap: FeatureFlagMap;
  let mockObjectRecordsPermissions: ObjectsPermissions;
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
      get internalContext() {
        return mockInternalContext;
      },
    } as unknown as jest.Mocked<WorkspaceEntityManager>;

    const mockFieldMetadata: FlatFieldMetadata = {
      id: 'test-field-id',
      name: 'id',
      type: FieldMetadataType.UUID,
      objectMetadataId: 'test-metadata-id',
      isActive: true,
      isNullable: false,
      isUnique: true,
      isSystem: true,
      isCustom: false,
      isUIReadOnly: false,
      isLabelSyncedWithName: false,
      label: 'ID',
      description: 'Record ID',
      icon: 'IconKey',
      workspaceId: 'test-workspace-id',
      universalIdentifier: 'id-field-universal-id',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      defaultValue: null,
      options: null,
      settings: null,
      morphId: null,
      standardId: null,
      standardOverrides: null,
      applicationId: null,
      relationTargetFieldMetadataId: null,
      relationTargetObjectMetadataId: null,
      calendarViewIds: [],
      viewFilterIds: [],
      kanbanAggregateOperationViewIds: [],
      viewFieldIds: [],
      mainGroupByFieldMetadataViewIds: [],
    };

    mockInternalContext = {
      workspaceId: 'test-workspace-id',
      flatObjectMetadataMaps: {
        byId: {},
        idByUniversalIdentifier: {},
        universalIdentifiersByApplicationId: {},
      },
      flatFieldMetadataMaps: {
        byId: {
          'test-field-id': mockFieldMetadata,
        },
        idByUniversalIdentifier: {},
        universalIdentifiersByApplicationId: {},
      },
      flatIndexMaps: {
        byId: {},
        idByUniversalIdentifier: {},
        universalIdentifiersByApplicationId: {},
      },
      flatRowLevelPermissionPredicateMaps: {
        byId: {},
        idByUniversalIdentifier: {},
        universalIdentifiersByApplicationId: {},
      },
      flatRowLevelPermissionPredicateGroupMaps: {
        byId: {},
        idByUniversalIdentifier: {},
        universalIdentifiersByApplicationId: {},
      },
      objectIdByNameSingular: {},
      featureFlagsMap: {} as FeatureFlagMap,
      userWorkspaceRoleMap: {},
      eventEmitterService: {} as unknown,
    } as unknown as WorkspaceInternalContext;

    mockFeatureFlagMap = Object.values(FeatureFlagKey).reduce(
      (acc, key) => ({ ...acc, [key]: false }),
      {} as FeatureFlagMap,
    );
    mockObjectRecordsPermissions = {
      'test-entity': {
        canReadObjectRecords: true,
        canUpdateObjectRecords: false,
        canSoftDeleteObjectRecords: false,
        canDestroyObjectRecords: false,
        restrictedFields: {},
      },
    };
    mockQueryRunner = {} as QueryRunner;

    repository = new WorkspaceRepository(
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
        fieldMetadataIds: ['test-field-id'],
        fieldIdByName: {
          id: 'test-field-id',
        },
        fieldIdByJoinColumnName: {},
        fieldsById: {
          'test-field-id': {
            id: 'test-field-id',
            name: 'id',
            type: 'string',
            isNullable: false,
            isUnique: true,
          },
        },
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
      const expectedResult = { affected: 1, raw: [], generatedMaps: [] };

      mockEntityManager.delete.mockResolvedValue(expectedResult);

      const result = await repository.delete(criteria);

      expect(mockEntityManager.delete).toHaveBeenCalledWith(
        'test-entity',
        { id: 'test-id' },
        {
          shouldBypassPermissionChecks: false,
          objectRecordsPermissions: mockObjectRecordsPermissions,
        },
        undefined,
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
        undefined,
        {
          shouldBypassPermissionChecks: false,
          objectRecordsPermissions: mockObjectRecordsPermissions,
        },
        undefined,
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
        [],
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
        undefined,
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
        undefined,
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
