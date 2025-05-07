import { ObjectRecordsPermissions } from 'twenty-shared/types';
import { EntityManager } from 'typeorm';

import { WorkspaceInternalContext } from 'src/engine/twenty-orm/interfaces/workspace-internal-context.interface';

import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { WorkspaceDataSource } from 'src/engine/twenty-orm/datasource/workspace.datasource';
import { validateOperationIsPermittedOrThrow } from 'src/engine/twenty-orm/repository/permissions.utils';

import { WorkspaceEntityManager } from './workspace-entity-manager';

jest.mock('src/engine/twenty-orm/repository/permissions.utils', () => ({
  validateOperationIsPermittedOrThrow: jest.fn(),
}));

jest.mock('../repository/workspace-select-query-builder', () => ({
  WorkspaceSelectQueryBuilder: jest.fn().mockImplementation(() => ({
    where: jest.fn().mockReturnThis(),
    getMany: jest.fn().mockResolvedValue([]),
    getOne: jest.fn().mockResolvedValue(null),
    getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
    execute: jest
      .fn()
      .mockResolvedValue({ affected: 1, raw: [], generatedMaps: [] }),
  })),
}));

describe('WorkspaceEntityManager', () => {
  let entityManager: WorkspaceEntityManager;
  let mockInternalContext: WorkspaceInternalContext;
  let mockDataSource: WorkspaceDataSource;
  let mockPermissionOptions: {
    shouldBypassPermissionChecks: boolean;
    objectRecordsPermissions?: ObjectRecordsPermissions;
  };

  beforeEach(() => {
    mockInternalContext = {
      workspaceId: 'test-workspace-id',
      objectMetadataMaps: {
        idByNameSingular: {},
      },
      featureFlagsMap: {
        [FeatureFlagKey.IsPermissionsV2Enabled]: true,
        [FeatureFlagKey.IsNewRelationEnabled]: true,
      },
    } as WorkspaceInternalContext;

    mockDataSource = {
      featureFlagMap: {
        [FeatureFlagKey.IsPermissionsV2Enabled]: true,
        [FeatureFlagKey.IsNewRelationEnabled]: true,
      },
      permissionsPerRoleId: {},
    } as WorkspaceDataSource;

    mockPermissionOptions = {
      shouldBypassPermissionChecks: false,
      objectRecordsPermissions: {
        'test-entity': {
          canRead: true,
          canUpdate: true,
          canSoftDelete: true,
          canDestroy: true,
        },
      },
    };

    // Mock TypeORM connection methods
    const mockConnection = {
      getMetadata: jest.fn().mockReturnValue({
        name: 'test-entity',
        columns: [],
        relations: [],
        findInheritanceMetadata: jest.fn(),
        findColumnWithPropertyPath: jest.fn(),
      }),
      createQueryBuilder: jest.fn().mockReturnValue({
        delete: jest.fn().mockReturnThis(),
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        execute: jest
          .fn()
          .mockResolvedValue({ affected: 1, raw: [], generatedMaps: [] }),
        setFindOptions: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
        getOne: jest.fn().mockResolvedValue(null),
        getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
        update: jest.fn().mockReturnThis(),
        softDelete: jest.fn().mockReturnThis(),
        restore: jest.fn().mockReturnThis(),
      }),
      createQueryRunner: jest.fn().mockReturnValue({
        connect: jest.fn(),
        startTransaction: jest.fn(),
        commitTransaction: jest.fn(),
        rollbackTransaction: jest.fn(),
        release: jest.fn(),
        clearTable: jest.fn(),
      }),
    };

    entityManager = new WorkspaceEntityManager(
      mockInternalContext,
      mockDataSource,
    );

    // Mock the connection property
    Object.defineProperty(entityManager, 'connection', {
      get: () => mockConnection,
    });

    // Mock validatePermissions
    jest
      .spyOn(entityManager as any, 'validatePermissions')
      .mockImplementation(
        (entityName: string, operationType: string, options: any) => {
          validateOperationIsPermittedOrThrow({
            entityName: entityName || 'test-entity',
            operationType: operationType as any,
            objectMetadataMaps: mockInternalContext.objectMetadataMaps,
            objectRecordsPermissions: options.objectRecordsPermissions,
          });
        },
      );

    // Mock getFeatureFlagMap
    jest.spyOn(entityManager as any, 'getFeatureFlagMap').mockReturnValue({
      [FeatureFlagKey.IsPermissionsV2Enabled]: true,
      [FeatureFlagKey.IsNewRelationEnabled]: true,
    });

    // Mock parent EntityManager methods
    jest
      .spyOn(EntityManager.prototype, 'find')
      .mockImplementation(() => Promise.resolve([]));
    jest
      .spyOn(EntityManager.prototype, 'findBy')
      .mockImplementation(() => Promise.resolve([]));
    jest
      .spyOn(EntityManager.prototype, 'findOne')
      .mockImplementation(() => Promise.resolve(null));
    jest
      .spyOn(EntityManager.prototype, 'findOneBy')
      .mockImplementation(() => Promise.resolve(null));
    jest
      .spyOn(EntityManager.prototype, 'findAndCount')
      .mockImplementation(() => Promise.resolve([[], 0]));
    jest
      .spyOn(EntityManager.prototype, 'findOneOrFail')
      .mockImplementation(() => Promise.resolve({}));
    jest
      .spyOn(EntityManager.prototype, 'findOneByOrFail')
      .mockImplementation(() => Promise.resolve({}));
    jest
      .spyOn(EntityManager.prototype, 'findAndCountBy')
      .mockImplementation(() => Promise.resolve([[], 0]));
    jest
      .spyOn(EntityManager.prototype, 'save')
      .mockImplementation(() => Promise.resolve({}));
    jest
      .spyOn(EntityManager.prototype, 'delete')
      .mockImplementation(() => Promise.resolve({ affected: 1, raw: [] }));
    jest
      .spyOn(EntityManager.prototype, 'softDelete')
      .mockImplementation(() =>
        Promise.resolve({ affected: 1, raw: [], generatedMaps: [] }),
      );
    jest
      .spyOn(EntityManager.prototype, 'update')
      .mockImplementation(() =>
        Promise.resolve({ affected: 1, raw: [], generatedMaps: [] }),
      );
    jest
      .spyOn(EntityManager.prototype, 'restore')
      .mockImplementation(() =>
        Promise.resolve({ affected: 1, raw: [], generatedMaps: [] }),
      );
    jest
      .spyOn(EntityManager.prototype, 'increment')
      .mockImplementation(() =>
        Promise.resolve({ affected: 1, raw: [], generatedMaps: [] }),
      );
    jest
      .spyOn(EntityManager.prototype, 'decrement')
      .mockImplementation(() =>
        Promise.resolve({ affected: 1, raw: [], generatedMaps: [] }),
      );
    jest
      .spyOn(EntityManager.prototype, 'clear')
      .mockImplementation(() => Promise.resolve());
    jest
      .spyOn(EntityManager.prototype, 'exists')
      .mockImplementation(() => Promise.resolve(true));
    jest
      .spyOn(EntityManager.prototype, 'existsBy')
      .mockImplementation(() => Promise.resolve(true));
    jest
      .spyOn(EntityManager.prototype, 'count')
      .mockImplementation(() => Promise.resolve(0));
    jest
      .spyOn(EntityManager.prototype, 'countBy')
      .mockImplementation(() => Promise.resolve(0));
    jest
      .spyOn(EntityManager.prototype, 'sum')
      .mockImplementation(() => Promise.resolve(0));
    jest
      .spyOn(EntityManager.prototype, 'average')
      .mockImplementation(() => Promise.resolve(0));
    jest
      .spyOn(EntityManager.prototype, 'minimum')
      .mockImplementation(() => Promise.resolve(0));
    jest
      .spyOn(EntityManager.prototype, 'maximum')
      .mockImplementation(() => Promise.resolve(0));
    jest
      .spyOn(EntityManager.prototype, 'preload')
      .mockImplementation(() => Promise.resolve({}));

    // Mock metadata methods
    const mockMetadata = {
      hasAllPrimaryKeys: jest.fn().mockReturnValue(true),
      columns: [],
      relations: [],
      findInheritanceMetadata: jest.fn(),
      findColumnWithPropertyPath: jest.fn(),
    };

    // Update mockConnection to include metadata
    mockConnection.getMetadata = jest.fn().mockReturnValue(mockMetadata);

    // Reset the mock before each test
    jest.clearAllMocks();
  });

  describe('Find Methods', () => {
    it('should call validatePermissions and validateOperationIsPermittedOrThrow for find', async () => {
      await entityManager.find('test-entity', {}, mockPermissionOptions);
      expect(entityManager['validatePermissions']).toHaveBeenCalledWith(
        'test-entity',
        'select',
        mockPermissionOptions,
      );
      expect(validateOperationIsPermittedOrThrow).toHaveBeenCalledWith({
        entityName: 'test-entity',
        operationType: 'select',
        objectMetadataMaps: mockInternalContext.objectMetadataMaps,
        objectRecordsPermissions:
          mockPermissionOptions.objectRecordsPermissions,
      });
    });

    it('should call validatePermissions and validateOperationIsPermittedOrThrow for findBy', async () => {
      await entityManager.findBy('test-entity', {}, mockPermissionOptions);
      expect(entityManager['validatePermissions']).toHaveBeenCalledWith(
        'test-entity',
        'select',
        mockPermissionOptions,
      );
      expect(validateOperationIsPermittedOrThrow).toHaveBeenCalledWith({
        entityName: 'test-entity',
        operationType: 'select',
        objectMetadataMaps: mockInternalContext.objectMetadataMaps,
        objectRecordsPermissions:
          mockPermissionOptions.objectRecordsPermissions,
      });
    });

    it('should call validatePermissions and validateOperationIsPermittedOrThrow for findOne', async () => {
      await entityManager.findOne('test-entity', {}, mockPermissionOptions);
      expect(entityManager['validatePermissions']).toHaveBeenCalledWith(
        'test-entity',
        'select',
        mockPermissionOptions,
      );
      expect(validateOperationIsPermittedOrThrow).toHaveBeenCalledWith({
        entityName: 'test-entity',
        operationType: 'select',
        objectMetadataMaps: mockInternalContext.objectMetadataMaps,
        objectRecordsPermissions:
          mockPermissionOptions.objectRecordsPermissions,
      });
    });

    it('should call validatePermissions and validateOperationIsPermittedOrThrow for findOneBy', async () => {
      await entityManager.findOneBy('test-entity', {}, mockPermissionOptions);
      expect(entityManager['validatePermissions']).toHaveBeenCalledWith(
        'test-entity',
        'select',
        mockPermissionOptions,
      );
      expect(validateOperationIsPermittedOrThrow).toHaveBeenCalledWith({
        entityName: 'test-entity',
        operationType: 'select',
        objectMetadataMaps: mockInternalContext.objectMetadataMaps,
        objectRecordsPermissions:
          mockPermissionOptions.objectRecordsPermissions,
      });
    });

    it('should call validatePermissions and validateOperationIsPermittedOrThrow for findAndCount', async () => {
      await entityManager.findAndCount(
        'test-entity',
        {},
        mockPermissionOptions,
      );
      expect(entityManager['validatePermissions']).toHaveBeenCalledWith(
        'test-entity',
        'select',
        mockPermissionOptions,
      );
      expect(validateOperationIsPermittedOrThrow).toHaveBeenCalledWith({
        entityName: 'test-entity',
        operationType: 'select',
        objectMetadataMaps: mockInternalContext.objectMetadataMaps,
        objectRecordsPermissions:
          mockPermissionOptions.objectRecordsPermissions,
      });
    });

    it('should call validatePermissions and validateOperationIsPermittedOrThrow for findOneOrFail', async () => {
      await entityManager.findOneOrFail(
        'test-entity',
        {},
        mockPermissionOptions,
      );
      expect(entityManager['validatePermissions']).toHaveBeenCalledWith(
        'test-entity',
        'select',
        mockPermissionOptions,
      );
      expect(validateOperationIsPermittedOrThrow).toHaveBeenCalledWith({
        entityName: 'test-entity',
        operationType: 'select',
        objectMetadataMaps: mockInternalContext.objectMetadataMaps,
        objectRecordsPermissions:
          mockPermissionOptions.objectRecordsPermissions,
      });
    });

    it('should call validatePermissions and validateOperationIsPermittedOrThrow for findOneByOrFail', async () => {
      await entityManager.findOneByOrFail(
        'test-entity',
        {},
        mockPermissionOptions,
      );
      expect(entityManager['validatePermissions']).toHaveBeenCalledWith(
        'test-entity',
        'select',
        mockPermissionOptions,
      );
      expect(validateOperationIsPermittedOrThrow).toHaveBeenCalledWith({
        entityName: 'test-entity',
        operationType: 'select',
        objectMetadataMaps: mockInternalContext.objectMetadataMaps,
        objectRecordsPermissions:
          mockPermissionOptions.objectRecordsPermissions,
      });
    });

    it('should call validatePermissions and validateOperationIsPermittedOrThrow for findAndCountBy', async () => {
      await entityManager.findAndCountBy(
        'test-entity',
        {},
        mockPermissionOptions,
      );
      expect(entityManager['validatePermissions']).toHaveBeenCalledWith(
        'test-entity',
        'select',
        mockPermissionOptions,
      );
      expect(validateOperationIsPermittedOrThrow).toHaveBeenCalledWith({
        entityName: 'test-entity',
        operationType: 'select',
        objectMetadataMaps: mockInternalContext.objectMetadataMaps,
        objectRecordsPermissions:
          mockPermissionOptions.objectRecordsPermissions,
      });
    });

    it('should throw error for query', async () => {
      expect(() => entityManager.query('SELECT * FROM test')).toThrow(
        'Method not allowed.',
      );
    });
  });

  describe('Save Methods', () => {
    it('should call validatePermissions and validateOperationIsPermittedOrThrow for save', async () => {
      await entityManager.save(
        'test-entity',
        {},
        { reload: false },
        mockPermissionOptions,
      );
      expect(entityManager['validatePermissions']).toHaveBeenCalledWith(
        'test-entity',
        'update',
        mockPermissionOptions,
      );
      expect(validateOperationIsPermittedOrThrow).toHaveBeenCalledWith({
        entityName: 'test-entity',
        operationType: 'update',
        objectMetadataMaps: mockInternalContext.objectMetadataMaps,
        objectRecordsPermissions:
          mockPermissionOptions.objectRecordsPermissions,
      });
    });
  });

  describe('Delete Methods', () => {
    it('should call validatePermissions and validateOperationIsPermittedOrThrow for delete', async () => {
      await entityManager.delete('test-entity', {}, mockPermissionOptions);
      expect(entityManager['validatePermissions']).toHaveBeenCalledWith(
        'test-entity',
        'delete',
        mockPermissionOptions,
      );
      expect(validateOperationIsPermittedOrThrow).toHaveBeenCalledWith({
        entityName: 'test-entity',
        operationType: 'delete',
        objectMetadataMaps: mockInternalContext.objectMetadataMaps,
        objectRecordsPermissions:
          mockPermissionOptions.objectRecordsPermissions,
      });
    });

    it('should call validatePermissions and validateOperationIsPermittedOrThrow for softDelete', async () => {
      await entityManager.softDelete('test-entity', {}, mockPermissionOptions);
      expect(entityManager['validatePermissions']).toHaveBeenCalledWith(
        'test-entity',
        'delete',
        mockPermissionOptions,
      );
      expect(validateOperationIsPermittedOrThrow).toHaveBeenCalledWith({
        entityName: 'test-entity',
        operationType: 'delete',
        objectMetadataMaps: mockInternalContext.objectMetadataMaps,
        objectRecordsPermissions:
          mockPermissionOptions.objectRecordsPermissions,
      });
    });
  });

  describe('Update Methods', () => {
    it('should call validatePermissions and validateOperationIsPermittedOrThrow for update', async () => {
      await entityManager.update('test-entity', {}, {}, mockPermissionOptions);
      expect(entityManager['validatePermissions']).toHaveBeenCalledWith(
        'test-entity',
        'update',
        mockPermissionOptions,
      );
      expect(validateOperationIsPermittedOrThrow).toHaveBeenCalledWith({
        entityName: 'test-entity',
        operationType: 'update',
        objectMetadataMaps: mockInternalContext.objectMetadataMaps,
        objectRecordsPermissions:
          mockPermissionOptions.objectRecordsPermissions,
      });
    });

    it('should call validatePermissions and validateOperationIsPermittedOrThrow for restore', async () => {
      await entityManager.restore('test-entity', {}, mockPermissionOptions);
      expect(entityManager['validatePermissions']).toHaveBeenCalledWith(
        'test-entity',
        'update',
        mockPermissionOptions,
      );
      expect(validateOperationIsPermittedOrThrow).toHaveBeenCalledWith({
        entityName: 'test-entity',
        operationType: 'update',
        objectMetadataMaps: mockInternalContext.objectMetadataMaps,
        objectRecordsPermissions:
          mockPermissionOptions.objectRecordsPermissions,
      });
    });
  });

  describe('Math Methods', () => {
    it('should call validatePermissions and validateOperationIsPermittedOrThrow for increment', async () => {
      await entityManager.increment(
        'test-entity',
        {},
        'testColumn',
        1,
        mockPermissionOptions,
      );
      expect(entityManager['validatePermissions']).toHaveBeenCalledWith(
        'test-entity',
        'update',
        mockPermissionOptions,
      );
      expect(validateOperationIsPermittedOrThrow).toHaveBeenCalledWith({
        entityName: 'test-entity',
        operationType: 'update',
        objectMetadataMaps: mockInternalContext.objectMetadataMaps,
        objectRecordsPermissions:
          mockPermissionOptions.objectRecordsPermissions,
      });
    });

    it('should call validatePermissions and validateOperationIsPermittedOrThrow for decrement', async () => {
      await entityManager.decrement(
        'test-entity',
        {},
        'testColumn',
        1,
        mockPermissionOptions,
      );
      expect(entityManager['validatePermissions']).toHaveBeenCalledWith(
        'test-entity',
        'update',
        mockPermissionOptions,
      );
      expect(validateOperationIsPermittedOrThrow).toHaveBeenCalledWith({
        entityName: 'test-entity',
        operationType: 'update',
        objectMetadataMaps: mockInternalContext.objectMetadataMaps,
        objectRecordsPermissions:
          mockPermissionOptions.objectRecordsPermissions,
      });
    });

    it('should call validatePermissions and validateOperationIsPermittedOrThrow for sum', async () => {
      await entityManager.sum(
        'test-entity',
        'testColumn',
        {},
        mockPermissionOptions,
      );
      expect(entityManager['validatePermissions']).toHaveBeenCalledWith(
        'test-entity',
        'select',
        mockPermissionOptions,
      );
      expect(validateOperationIsPermittedOrThrow).toHaveBeenCalledWith({
        entityName: 'test-entity',
        operationType: 'select',
        objectMetadataMaps: mockInternalContext.objectMetadataMaps,
        objectRecordsPermissions:
          mockPermissionOptions.objectRecordsPermissions,
      });
    });

    it('should call validatePermissions and validateOperationIsPermittedOrThrow for average', async () => {
      await entityManager.average(
        'test-entity',
        'testColumn',
        {},
        mockPermissionOptions,
      );
      expect(entityManager['validatePermissions']).toHaveBeenCalledWith(
        'test-entity',
        'select',
        mockPermissionOptions,
      );
      expect(validateOperationIsPermittedOrThrow).toHaveBeenCalledWith({
        entityName: 'test-entity',
        operationType: 'select',
        objectMetadataMaps: mockInternalContext.objectMetadataMaps,
        objectRecordsPermissions:
          mockPermissionOptions.objectRecordsPermissions,
      });
    });

    it('should call validatePermissions and validateOperationIsPermittedOrThrow for minimum', async () => {
      await entityManager.minimum(
        'test-entity',
        'testColumn',
        {},
        mockPermissionOptions,
      );
      expect(entityManager['validatePermissions']).toHaveBeenCalledWith(
        'test-entity',
        'select',
        mockPermissionOptions,
      );
      expect(validateOperationIsPermittedOrThrow).toHaveBeenCalledWith({
        entityName: 'test-entity',
        operationType: 'select',
        objectMetadataMaps: mockInternalContext.objectMetadataMaps,
        objectRecordsPermissions:
          mockPermissionOptions.objectRecordsPermissions,
      });
    });

    it('should call validatePermissions and validateOperationIsPermittedOrThrow for maximum', async () => {
      await entityManager.maximum(
        'test-entity',
        'testColumn',
        {},
        mockPermissionOptions,
      );
      expect(entityManager['validatePermissions']).toHaveBeenCalledWith(
        'test-entity',
        'select',
        mockPermissionOptions,
      );
      expect(validateOperationIsPermittedOrThrow).toHaveBeenCalledWith({
        entityName: 'test-entity',
        operationType: 'select',
        objectMetadataMaps: mockInternalContext.objectMetadataMaps,
        objectRecordsPermissions:
          mockPermissionOptions.objectRecordsPermissions,
      });
    });

    it('should call validatePermissions and validateOperationIsPermittedOrThrow for countBy', async () => {
      await entityManager.countBy('test-entity', {}, mockPermissionOptions);
      expect(entityManager['validatePermissions']).toHaveBeenCalledWith(
        'test-entity',
        'select',
        mockPermissionOptions,
      );
      expect(validateOperationIsPermittedOrThrow).toHaveBeenCalledWith({
        entityName: 'test-entity',
        operationType: 'select',
        objectMetadataMaps: mockInternalContext.objectMetadataMaps,
        objectRecordsPermissions:
          mockPermissionOptions.objectRecordsPermissions,
      });
    });
  });

  describe('Other Methods', () => {
    it('should call validatePermissions and validateOperationIsPermittedOrThrow for clear', async () => {
      await entityManager.clear('test-entity', mockPermissionOptions);
      expect(entityManager['validatePermissions']).toHaveBeenCalledWith(
        'test-entity',
        'delete',
        mockPermissionOptions,
      );
      expect(validateOperationIsPermittedOrThrow).toHaveBeenCalledWith({
        entityName: 'test-entity',
        operationType: 'delete',
        objectMetadataMaps: mockInternalContext.objectMetadataMaps,
        objectRecordsPermissions:
          mockPermissionOptions.objectRecordsPermissions,
      });
    });

    it('should call validatePermissions and validateOperationIsPermittedOrThrow for exists', async () => {
      await entityManager.exists('test-entity', {}, mockPermissionOptions);
      expect(entityManager['validatePermissions']).toHaveBeenCalledWith(
        'test-entity',
        'select',
        mockPermissionOptions,
      );
      expect(validateOperationIsPermittedOrThrow).toHaveBeenCalledWith({
        entityName: 'test-entity',
        operationType: 'select',
        objectMetadataMaps: mockInternalContext.objectMetadataMaps,
        objectRecordsPermissions:
          mockPermissionOptions.objectRecordsPermissions,
      });
    });

    it('should call validatePermissions and validateOperationIsPermittedOrThrow for existsBy', async () => {
      await entityManager.existsBy('test-entity', {}, mockPermissionOptions);
      expect(entityManager['validatePermissions']).toHaveBeenCalledWith(
        'test-entity',
        'select',
        mockPermissionOptions,
      );
      expect(validateOperationIsPermittedOrThrow).toHaveBeenCalledWith({
        entityName: 'test-entity',
        operationType: 'select',
        objectMetadataMaps: mockInternalContext.objectMetadataMaps,
        objectRecordsPermissions:
          mockPermissionOptions.objectRecordsPermissions,
      });
    });

    it('should call validatePermissions and validateOperationIsPermittedOrThrow for count', async () => {
      await entityManager.count('test-entity', {}, mockPermissionOptions);
      expect(entityManager['validatePermissions']).toHaveBeenCalledWith(
        'test-entity',
        'select',
        mockPermissionOptions,
      );
      expect(validateOperationIsPermittedOrThrow).toHaveBeenCalledWith({
        entityName: 'test-entity',
        operationType: 'select',
        objectMetadataMaps: mockInternalContext.objectMetadataMaps,
        objectRecordsPermissions:
          mockPermissionOptions.objectRecordsPermissions,
      });
    });

    it('should call validatePermissions and validateOperationIsPermittedOrThrow for preload', async () => {
      await entityManager.preload('test-entity', {}, mockPermissionOptions);
      expect(entityManager['validatePermissions']).toHaveBeenCalledWith(
        'test-entity',
        'select',
        mockPermissionOptions,
      );
      expect(validateOperationIsPermittedOrThrow).toHaveBeenCalledWith({
        entityName: 'test-entity',
        operationType: 'select',
        objectMetadataMaps: mockInternalContext.objectMetadataMaps,
        objectRecordsPermissions:
          mockPermissionOptions.objectRecordsPermissions,
      });
    });
  });
});
