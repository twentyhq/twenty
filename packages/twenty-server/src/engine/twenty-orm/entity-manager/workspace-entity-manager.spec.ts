import { ObjectRecordsPermissions } from 'twenty-shared/types';
import { EntityManager } from 'typeorm';
import { EntityPersistExecutor } from 'typeorm/persistence/EntityPersistExecutor';
import { PlainObjectToDatabaseEntityTransformer } from 'typeorm/query-builder/transformer/PlainObjectToDatabaseEntityTransformer';

import { WorkspaceInternalContext } from 'src/engine/twenty-orm/interfaces/workspace-internal-context.interface';

import { ObjectMetadataItemWithFieldMaps } from 'src/engine/metadata-modules/types/object-metadata-item-with-field-maps';
import { WorkspaceDataSource } from 'src/engine/twenty-orm/datasource/workspace.datasource';
import { validateOperationIsPermittedOrThrow } from 'src/engine/twenty-orm/repository/permissions.utils';

import { WorkspaceEntityManager } from './workspace-entity-manager';

jest.mock('src/engine/twenty-orm/repository/permissions.utils', () => ({
  validateOperationIsPermittedOrThrow: jest.fn(),
}));

jest.mock(
  'src/engine/twenty-orm/utils/get-object-metadata-from-entity-target.util',
  () => ({
    getObjectMetadataFromEntityTarget: jest.fn().mockReturnValue({}),
  }),
);

jest.mock('src/engine/twenty-orm/utils/format-data.util', () => ({
  formatData: jest.fn().mockReturnValue([]),
}));

jest.mock('src/engine/twenty-orm/utils/format-result.util', () => ({
  formatResult: jest.fn().mockReturnValue([]),
}));

jest.mock(
  'src/engine/twenty-orm/entity-manager/workspace-entity-manager',
  () => ({
    ...jest.requireActual(
      'src/engine/twenty-orm/entity-manager/workspace-entity-manager',
    ),
  }),
);

const mockedWorkspaceUpdateQueryBuilder = {
  set: jest.fn().mockImplementation(() => ({
    where: jest.fn().mockReturnThis(),
    whereInIds: jest.fn().mockReturnThis(),
    execute: jest
      .fn()
      .mockResolvedValue({ affected: 1, raw: [], generatedMaps: [] }),
    returning: jest.fn().mockReturnThis(),
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
    returning: jest.fn().mockReturnThis(),
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
        byId: {
          'test-entity-id': {
            id: 'test-entity-id',
            nameSingular: 'test-entity',
            namePlural: 'test-entities',
            labelSingular: 'Test Entity',
            labelPlural: 'Test Entities',
            workspaceId: 'test-workspace-id',
            icon: 'test-icon',
            color: 'test-color',
            isCustom: false,
            isRemote: false,
            isAuditLogged: false,
            isSearchable: false,
            isSystem: false,
            isActive: true,
            targetTableName: 'test_entity',
            indexMetadatas: [],
            fieldsById: {
              'field-id': {
                id: 'field-id',
                type: 'TEXT',
                name: 'fieldName',
                label: 'Field Name',
                objectMetadataId: 'test-entity-id',
                isNullable: true,
                isLabelSyncedWithName: false,
                createdAt: new Date(),
                updatedAt: new Date(),
              },
            },
            fieldIdByName: { fieldName: 'field-id' },
            fieldIdByJoinColumnName: {},
          } as unknown as ObjectMetadataItemWithFieldMaps,
        },
        idByNameSingular: {
          'test-entity': 'test-entity-id',
        },
      },
      featureFlagsMap: {
        IS_AIRTABLE_INTEGRATION_ENABLED: false,
        IS_POSTGRESQL_INTEGRATION_ENABLED: false,
        IS_STRIPE_INTEGRATION_ENABLED: false,
        IS_UNIQUE_INDEXES_ENABLED: false,
        IS_JSON_FILTER_ENABLED: false,
        IS_AI_ENABLED: false,
        IS_IMAP_SMTP_CALDAV_ENABLED: false,
        IS_MORPH_RELATION_ENABLED: false,
        IS_WORKFLOW_FILTERING_ENABLED: false,
        IS_WORKFLOW_BRANCH_ENABLED: false,
        IS_RELATION_CONNECT_ENABLED: false,
        IS_FIELDS_PERMISSIONS_ENABLED: false,
        IS_CORE_VIEW_SYNCING_ENABLED: false,
        IS_TWO_FACTOR_AUTHENTICATION_ENABLED: false,
        IS_WORKSPACE_MIGRATION_V2_ENABLED: false,
        IS_API_KEY_ROLES_ENABLED: false,
      },
      eventEmitterService: {
        emitMutationEvent: jest.fn(),
        emitDatabaseBatchEvent: jest.fn(),
        emitCustomBatchEvent: jest.fn(),
      } as any,
    } as WorkspaceInternalContext;

    mockDataSource = {
      featureFlagMap: {
        IS_AIRTABLE_INTEGRATION_ENABLED: false,
        IS_POSTGRESQL_INTEGRATION_ENABLED: false,
        IS_STRIPE_INTEGRATION_ENABLED: false,
        IS_UNIQUE_INDEXES_ENABLED: false,
        IS_JSON_FILTER_ENABLED: false,
        IS_AI_ENABLED: false,
        IS_IMAP_SMTP_CALDAV_ENABLED: false,
        IS_MORPH_RELATION_ENABLED: false,
        IS_WORKFLOW_FILTERING_ENABLED: false,
        IS_RELATION_CONNECT_ENABLED: false,
        IS_FIELDS_PERMISSIONS_ENABLED: true,
        IS_CORE_VIEW_SYNCING_ENABLED: false,
        IS_TWO_FACTOR_AUTHENTICATION_ENABLED: false,
      },
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
      .spyOn(entityManager as any, 'getFormattedResultWithoutNonReadableFields')
      .mockImplementation(
        ({ formattedResult }: { formattedResult: string[] }) => formattedResult,
      );

    jest.spyOn(entityManager as any, 'getFeatureFlagMap').mockReturnValue({
      IS_FIELDS_PERMISSIONS_ENABLED: true,
    });

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
      expect(entityManager['validatePermissions']).toHaveBeenCalledWith({
        target: 'test-entity',
        operationType: 'update',
        permissionOptions: mockPermissionOptions,
        selectedColumns: [],
        updatedColumns: [],
      });
      expect(validateOperationIsPermittedOrThrow).toHaveBeenCalledWith({
        entityName: 'test-entity',
        isFieldPermissionsEnabled: true,
        operationType: 'update',
        objectMetadataMaps: mockInternalContext.objectMetadataMaps,
        objectRecordsPermissions:
          mockPermissionOptions.objectRecordsPermissions,
        selectedColumns: [],
        allFieldsSelected: false,
        updatedColumns: [],
      });
    });
  });

  describe('Update Methods', () => {
    it('should call createQueryBuilder with permissionOptions for update', async () => {
      await entityManager.update('test-entity', {}, {}, mockPermissionOptions);
      expect(entityManager['createQueryBuilder']).toHaveBeenCalledWith(
        'test-entity',
        undefined,
        undefined,
        mockPermissionOptions,
      );
    });
  });

  describe('Other Methods', () => {
    it('should call validatePermissions and validateOperationIsPermittedOrThrow for clear', async () => {
      await entityManager.clear('test-entity', mockPermissionOptions);
      expect(entityManager['validatePermissions']).toHaveBeenCalledWith({
        target: 'test-entity',
        operationType: 'delete',
        permissionOptions: mockPermissionOptions,
        selectedColumns: [],
      });
      expect(validateOperationIsPermittedOrThrow).toHaveBeenCalledWith({
        entityName: 'test-entity',
        operationType: 'delete',
        isFieldPermissionsEnabled: true,
        objectMetadataMaps: mockInternalContext.objectMetadataMaps,
        objectRecordsPermissions:
          mockPermissionOptions.objectRecordsPermissions,
        selectedColumns: [],
        allFieldsSelected: false,
        updatedColumns: [],
      });
    });
  });
});
