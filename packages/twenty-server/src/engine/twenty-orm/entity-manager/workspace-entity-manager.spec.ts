import { ObjectRecordsPermissions } from 'twenty-shared/types';
import { EntityManager } from 'typeorm';
import { EntityPersistExecutor } from 'typeorm/persistence/EntityPersistExecutor';
import { PlainObjectToDatabaseEntityTransformer } from 'typeorm/query-builder/transformer/PlainObjectToDatabaseEntityTransformer';

import { WorkspaceInternalContext } from 'src/engine/twenty-orm/interfaces/workspace-internal-context.interface';

import { WorkspaceDataSource } from 'src/engine/twenty-orm/datasource/workspace.datasource';
import { validateOperationIsPermittedOrThrow } from 'src/engine/twenty-orm/repository/permissions.utils';

import { WorkspaceEntityManager } from './workspace-entity-manager';

jest.mock('src/engine/twenty-orm/repository/permissions.utils', () => ({
  validateOperationIsPermittedOrThrow: jest.fn(),
}));

const mockedWorkspaceUpdateQueryBuilder = {
  set: jest.fn().mockImplementation(() => ({
    where: jest.fn().mockReturnThis(),
    whereInIds: jest.fn().mockReturnThis(),
    execute: jest
      .fn()
      .mockResolvedValue({ affected: 1, raw: [], generatedMaps: [] }),
  })),
  execute: jest
    .fn()
    .mockResolvedValue({ affected: 1, raw: [], generatedMaps: [] }),
};

jest.mock('../repository/workspace-select-query-builder', () => ({
  WorkspaceSelectQueryBuilder: jest.fn().mockImplementation(() => ({
    where: jest.fn().mockReturnThis(),
    getMany: jest.fn().mockResolvedValue([]),
    getOne: jest.fn().mockResolvedValue(null),
    getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
    execute: jest
      .fn()
      .mockResolvedValue({ affected: 1, raw: [], generatedMaps: [] }),
    setFindOptions: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnValue(mockedWorkspaceUpdateQueryBuilder),
    insert: jest.fn().mockReturnThis(),
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
    } as WorkspaceInternalContext;

    mockDataSource = {
      featureFlagMap: {},
      permissionsPerRoleId: {},
    } as WorkspaceDataSource;

    mockPermissionOptions = {
      shouldBypassPermissionChecks: false,
      objectRecordsPermissions: {
        'test-entity': {
          canRead: true,
          canUpdate: false,
          canSoftDelete: false,
          canDestroy: false,
          restrictedFields: {},
        },
      },
    };

    // Mock TypeORM connection methods
    const mockWorkspaceDataSource = {
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
      createQueryRunnerForEntityPersistExecutor: jest.fn().mockReturnValue({
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

    Object.defineProperty(entityManager, 'connection', {
      get: () => mockWorkspaceDataSource,
    });

    jest.spyOn(entityManager as any, 'validatePermissions');
    jest.spyOn(entityManager as any, 'createQueryBuilder');

    jest
      .spyOn(entityManager as any, 'extractTargetNameSingularFromEntityTarget')
      .mockImplementation((entityName: string) => {
        return entityName;
      });

    // Mock typeORM's EntityManager methods
    jest
      .spyOn(EntityManager.prototype, 'save')
      .mockImplementation(() => Promise.resolve({}));
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
      .spyOn(EntityManager.prototype, 'clear')
      .mockImplementation(() => Promise.resolve());
    jest
      .spyOn(EntityManager.prototype, 'preload')
      .mockImplementation(() => Promise.resolve({}));

    jest
      .spyOn(EntityPersistExecutor.prototype, 'execute')
      .mockImplementation(() => Promise.resolve());

    jest
      .spyOn(PlainObjectToDatabaseEntityTransformer.prototype, 'transform')
      .mockImplementation(() => Promise.resolve({}));

    // Mock metadata methods
    const mockMetadata = {
      hasAllPrimaryKeys: jest.fn().mockReturnValue(true),
      columns: [],
      relations: [],
      findInheritanceMetadata: jest.fn(),
      findColumnWithPropertyPath: jest.fn(),
    };

    // Update mockWorkspaceDataSource to include metadata
    mockWorkspaceDataSource.getMetadata = jest
      .fn()
      .mockReturnValue(mockMetadata);

    // Reset the mock before each test
    jest.clearAllMocks();
  });

  describe('Query Method', () => {
    it('should call validatePermissions and validateOperationIsPermittedOrThrow for find', async () => {
      await entityManager.find('test-entity', {}, mockPermissionOptions);

      expect(entityManager.createQueryBuilder).toHaveBeenCalledWith(
        'test-entity',
        undefined,
        undefined,
        mockPermissionOptions,
      );
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

  describe('Update Methods', () => {
    it('should call createQueryBuilder with permissionOptions for update', async () => {
      await entityManager.update('test-entity', {}, {}, mockPermissionOptions);
      expect(entityManager['createQueryBuilder']).toHaveBeenCalledWith(
        undefined,
        undefined,
        undefined,
        mockPermissionOptions,
      );
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
  });
});
