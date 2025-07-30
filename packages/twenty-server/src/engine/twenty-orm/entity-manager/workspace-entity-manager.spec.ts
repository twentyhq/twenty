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
    getObjectMetadataFromEntityTarget: jest.fn(),
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
        IS_RELATION_CONNECT_ENABLED: false,
        IS_WORKSPACE_API_KEY_WEBHOOK_GRAPHQL_ENABLED: false,
        IS_FIELDS_PERMISSIONS_ENABLED: false,
        IS_CORE_VIEW_SYNCING_ENABLED: false,
        IS_TWO_FACTOR_AUTHENTICATION_ENABLED: false,
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
        IS_WORKSPACE_API_KEY_WEBHOOK_GRAPHQL_ENABLED: false,
        IS_FIELDS_PERMISSIONS_ENABLED: false,
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

    // it('should filter out restricted fields from save response when field permissions are enabled', async () => {
    //   // Mock the feature flag to enable field permissions
    //   jest.spyOn(entityManager, 'getFeatureFlagMap').mockReturnValue({
    //     IS_AIRTABLE_INTEGRATION_ENABLED: false,
    //     IS_POSTGRESQL_INTEGRATION_ENABLED: false,
    //     IS_STRIPE_INTEGRATION_ENABLED: false,
    //     IS_UNIQUE_INDEXES_ENABLED: false,
    //     IS_JSON_FILTER_ENABLED: false,
    //     IS_AI_ENABLED: false,
    //     IS_IMAP_SMTP_CALDAV_ENABLED: false,
    //     IS_MORPH_RELATION_ENABLED: false,
    //     IS_WORKFLOW_FILTERING_ENABLED: false,
    //     IS_RELATION_CONNECT_ENABLED: false,
    //     IS_WORKSPACE_API_KEY_WEBHOOK_GRAPHQL_ENABLED: false,
    //     IS_FIELDS_PERMISSIONS_ENABLED: true,
    //     IS_CORE_VIEW_SYNCING_ENABLED: false,
    //     IS_TWO_FACTOR_AUTHENTICATION_ENABLED: false,
    //   });

    //   // Mock getObjectMetadataFromEntityTarget to return our test metadata
    //   (getObjectMetadataFromEntityTarget as jest.Mock).mockReturnValue({
    //     id: 'test-entity-id',
    //     nameSingular: 'test-entity',
    //     fieldsById: {
    //       'field-id-0': {
    //         id: 'field-id-0',
    //         name: 'id',
    //         type: 'UUID',
    //         label: 'ID',
    //         objectMetadataId: 'test-entity-id',
    //         isNullable: false,
    //         isLabelSyncedWithName: false,
    //         createdAt: new Date(),
    //         updatedAt: new Date(),
    //       },
    //       'field-id-1': {
    //         id: 'field-id-1',
    //         name: 'name',
    //         type: 'TEXT',
    //         label: 'Name',
    //         objectMetadataId: 'test-entity-id',
    //         isNullable: true,
    //         isLabelSyncedWithName: false,
    //         createdAt: new Date(),
    //         updatedAt: new Date(),
    //       },
    //       'field-id-2': {
    //         id: 'field-id-2',
    //         name: 'city',
    //         type: 'TEXT',
    //         label: 'City',
    //         objectMetadataId: 'test-entity-id',
    //         isNullable: true,
    //         isLabelSyncedWithName: false,
    //         createdAt: new Date(),
    //         updatedAt: new Date(),
    //       },
    //     },
    //     fieldIdByName: {
    //       id: 'field-id-0',
    //       name: 'field-id-1',
    //       city: 'field-id-2',
    //     },
    //     fieldIdByJoinColumnName: {},
    //   });

    //   // Mock the save method to return a result with both fields
    //   const mockSaveResult = {
    //     id: 'test-id',
    //     name: 'John Doe',
    //     city: 'New York',
    //   };

    //   jest
    //     .spyOn(EntityManager.prototype, 'save')
    //     .mockResolvedValue(mockSaveResult);

    //   // Mock the find method to return empty array (no existing entities)
    //   jest.spyOn(entityManager, 'find').mockResolvedValue([]);

    //   // Mock the createQueryBuilder to return a mock query builder
    //   const mockQueryBuilder = {
    //     insert: jest.fn().mockReturnThis(),
    //     into: jest.fn().mockReturnThis(),
    //     values: jest.fn().mockReturnThis(),
    //     returning: jest.fn().mockReturnThis(),
    //     execute: jest.fn().mockResolvedValue({
    //       raw: [mockSaveResult],
    //       generatedMaps: [mockSaveResult],
    //       identifiers: [{ id: 'test-id' }],
    //     }),
    //   };

    //   jest
    //     .spyOn(entityManager, 'createQueryBuilder')
    //     .mockReturnValue(mockQueryBuilder as any);

    //   // Mock the EntityPersistExecutor
    //   jest
    //     .spyOn(EntityPersistExecutor.prototype, 'execute')
    //     .mockResolvedValue();

    //   // Mock the formatData and formatResult functions
    //   const {
    //     formatData,
    //   } = require('src/engine/twenty-orm/utils/format-data.util');
    //   const {
    //     formatResult,
    //   } = require('src/engine/twenty-orm/utils/format-result.util');

    //   (formatData as jest.Mock).mockReturnValue([mockSaveResult]);
    //   (formatResult as jest.Mock).mockReturnValue([mockSaveResult]);

    //   // Create permission options with restricted fields
    //   const permissionOptionsWithRestrictedFields = {
    //     shouldBypassPermissionChecks: false,
    //     objectRecordsPermissions: {
    //       'test-entity-id': {
    //         canRead: true,
    //         canUpdate: true,
    //         canSoftDelete: false,
    //         canDestroy: false,
    //         restrictedFields: {
    //           'field-id-1': { canRead: false, canUpdate: null },
    //           'field-id-2': { canRead: true, canUpdate: true },
    //         },
    //       },
    //     },
    //   };

    //   // Call the save method
    //   const result = await entityManager.save(
    //     'test-entity',
    //     {
    //       id: 'test-id',
    //       name: 'John Doe',
    //       city: 'New York',
    //     },
    //     { reload: false },
    //     permissionOptionsWithRestrictedFields,
    //   );

    //   // Verify that the restricted field is filtered out from the result
    //   expect(result).toEqual({
    //     id: 'test-id',
    //     city: 'New York',
    //   });

    //   // Verify that the restricted field is not present in the result
    //   expect(result).not.toHaveProperty('name');
    // });
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
