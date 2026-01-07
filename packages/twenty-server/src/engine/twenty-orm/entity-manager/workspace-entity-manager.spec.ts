import {
  type FieldMetadataType,
  type ObjectsPermissions,
} from 'twenty-shared/types';
import { EntityManager } from 'typeorm';
import { EntityPersistExecutor } from 'typeorm/persistence/EntityPersistExecutor';
import { PlainObjectToDatabaseEntityTransformer } from 'typeorm/query-builder/transformer/PlainObjectToDatabaseEntityTransformer';

import { type WorkspaceAuthContext } from 'src/engine/api/common/interfaces/workspace-auth-context.interface';
import { type WorkspaceInternalContext } from 'src/engine/twenty-orm/interfaces/workspace-internal-context.interface';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type GlobalWorkspaceDataSource } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-datasource';
import { validateOperationIsPermittedOrThrow } from 'src/engine/twenty-orm/repository/permissions.utils';
import {
  setWorkspaceContext,
  withWorkspaceContext,
  type ORMWorkspaceContext,
} from 'src/engine/twenty-orm/storage/orm-workspace-context.storage';
import { getObjectMetadataFromEntityTarget } from 'src/engine/twenty-orm/utils/get-object-metadata-from-entity-target.util';

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
  let mockDataSource: GlobalWorkspaceDataSource;
  let mockPermissionOptions: {
    shouldBypassPermissionChecks: boolean;
    objectRecordsPermissions?: ObjectsPermissions;
  };
  let mockInternalContext: WorkspaceInternalContext;
  let mockWorkspaceContext: ORMWorkspaceContext;

  beforeEach(() => {
    const mockFlatObjectMetadata: FlatObjectMetadata = {
      id: 'test-entity-id',
      nameSingular: 'test-entity',
      namePlural: 'test-entities',
      labelSingular: 'Test Entity',
      labelPlural: 'Test Entities',
      workspaceId: 'test-workspace-id',
      icon: 'test-icon',
      isCustom: false,
      isRemote: false,
      isAuditLogged: false,
      isSearchable: false,
      isSystem: false,
      isActive: true,
      targetTableName: 'test_entity',
      fieldMetadataIds: ['field-id'],
      indexMetadataIds: [],
      viewIds: [],
      universalIdentifier: 'test-entity-id',
      description: null,
      imageIdentifierFieldMetadataId: null,
      labelIdentifierFieldMetadataId: null,
      shortcut: null,
      standardId: null,
      standardOverrides: null,
      applicationId: null,
      isLabelSyncedWithName: false,
      isUIReadOnly: false,
      duplicateCriteria: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    (getObjectMetadataFromEntityTarget as jest.Mock).mockReturnValue(
      mockFlatObjectMetadata,
    );

    const mockFlatFieldMetadata: FlatFieldMetadata = {
      id: 'field-id',
      type: 'TEXT' as FieldMetadataType,
      name: 'fieldName',
      label: 'Field Name',
      objectMetadataId: 'test-entity-id',
      isNullable: true,
      isLabelSyncedWithName: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      universalIdentifier: 'field-id',
      defaultValue: null,
      description: null,
      icon: null,
      isActive: true,
      isCustom: false,
      isSystem: false,
      isUIReadOnly: false,
      isUnique: false,
      options: null,
      settings: null,
      standardId: null,
      standardOverrides: null,
      workspaceId: 'test-workspace-id',
      viewFieldIds: [],
      viewFilterIds: [],
      kanbanAggregateOperationViewIds: [],
      calendarViewIds: [],
      mainGroupByFieldMetadataViewIds: [],
      relationTargetFieldMetadataId: null,
      relationTargetObjectMetadataId: null,
      morphId: null,
      applicationId: null,
    };

    const flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata> = {
      byId: {
        'test-entity-id': mockFlatObjectMetadata,
      },
      idByUniversalIdentifier: {
        'test-entity-id': 'test-entity-id',
      },
      universalIdentifiersByApplicationId: {},
    };

    const flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata> = {
      byId: {
        'field-id': mockFlatFieldMetadata,
      },
      idByUniversalIdentifier: {
        'field-id': 'field-id',
      },
      universalIdentifiersByApplicationId: {},
    };

    mockInternalContext = {
      workspaceId: 'test-workspace-id',
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
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
      objectIdByNameSingular: {
        'test-entity': 'test-entity-id',
      },
      featureFlagsMap: {
        IS_AIRTABLE_INTEGRATION_ENABLED: false,
        IS_POSTGRESQL_INTEGRATION_ENABLED: false,
        IS_STRIPE_INTEGRATION_ENABLED: false,
        IS_UNIQUE_INDEXES_ENABLED: false,
        IS_JSON_FILTER_ENABLED: false,
        IS_AI_ENABLED: false,
        IS_APPLICATION_ENABLED: false,
        IS_IMAP_SMTP_CALDAV_ENABLED: false,
        IS_PAGE_LAYOUT_ENABLED: false,
        IS_RECORD_PAGE_LAYOUT_ENABLED: false,
        IS_PUBLIC_DOMAIN_ENABLED: false,
        IS_EMAILING_DOMAIN_ENABLED: false,
        IS_DASHBOARD_V2_ENABLED: false,
        IS_TIMELINE_ACTIVITY_MIGRATED: false,
        IS_GLOBAL_WORKSPACE_DATASOURCE_ENABLED: false,
        IS_ROW_LEVEL_PERMISSION_PREDICATES_ENABLED: false,
        IS_WORKSPACE_CREATION_V2_ENABLED: false,
        IS_IF_ELSE_ENABLED: false,
      },
      userWorkspaceRoleMap: {},
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
        IS_APPLICATION_ENABLED: false,
        IS_PAGE_LAYOUT_ENABLED: false,
        IS_RECORD_PAGE_LAYOUT_ENABLED: false,
        IS_PUBLIC_DOMAIN_ENABLED: false,
        IS_EMAILING_DOMAIN_ENABLED: false,
        IS_DASHBOARD_V2_ENABLED: false,
        IS_ROW_LEVEL_PERMISSION_PREDICATES_ENABLED: false,
      },
      permissionsPerRoleId: {},
      eventEmitterService: mockInternalContext.eventEmitterService,
    } as GlobalWorkspaceDataSource;

    mockPermissionOptions = {
      shouldBypassPermissionChecks: false,
      objectRecordsPermissions: {
        'test-entity': {
          canReadObjectRecords: true,
          canUpdateObjectRecords: false,
          canSoftDeleteObjectRecords: false,
          canDestroyObjectRecords: false,
          restrictedFields: {},
        },
      },
    };

    const mockAuthContext = {
      user: { id: 'user-id' },
      workspace: { id: 'test-workspace-id' },
      workspaceMemberId: 'workspace-member-id',
      userWorkspaceId: 'user-workspace-id',
      apiKey: null,
    } as unknown as WorkspaceAuthContext;

    mockWorkspaceContext = {
      authContext: mockAuthContext,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
      flatIndexMaps: mockInternalContext.flatIndexMaps,
      flatRowLevelPermissionPredicateMaps:
        mockInternalContext.flatRowLevelPermissionPredicateMaps,
      flatRowLevelPermissionPredicateGroupMaps:
        mockInternalContext.flatRowLevelPermissionPredicateGroupMaps,
      objectIdByNameSingular: mockInternalContext.objectIdByNameSingular,
      featureFlagsMap: mockInternalContext.featureFlagsMap,
      permissionsPerRoleId: mockDataSource.permissionsPerRoleId,
      entityMetadatas: [],
      userWorkspaceRoleMap: {
        'user-workspace-id': 'role-id',
      },
    };

    setWorkspaceContext(mockWorkspaceContext);

    // Mock TypeORM connection methods
    const mockWorkspaceDataSource = {
      getMetadata: jest.fn().mockReturnValue({
        name: 'test-entity',
        columns: [],
        relations: [],
        findInheritanceMetadata: jest.fn(),
        findColumnWithPropertyPath: jest.fn(),
      }),
      eventEmitterService: mockInternalContext.eventEmitterService,
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

    entityManager = new WorkspaceEntityManager(mockDataSource);

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
      await withWorkspaceContext(mockWorkspaceContext, () =>
        entityManager.find('test-entity', {}, mockPermissionOptions),
      );

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
      await withWorkspaceContext(mockWorkspaceContext, () =>
        entityManager.save(
          'test-entity',
          {},
          { reload: false },
          mockPermissionOptions,
        ),
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
        operationType: 'update',
        flatObjectMetadataMaps: mockInternalContext.flatObjectMetadataMaps,
        flatFieldMetadataMaps: mockInternalContext.flatFieldMetadataMaps,
        objectIdByNameSingular: mockInternalContext.objectIdByNameSingular,
        objectsPermissions: mockPermissionOptions.objectRecordsPermissions,
        selectedColumns: [],
        allFieldsSelected: false,
        updatedColumns: [],
      });
    });
  });

  describe('Update Methods', () => {
    it('should call createQueryBuilder with permissionOptions for update', async () => {
      await withWorkspaceContext(mockWorkspaceContext, () =>
        entityManager.update('test-entity', {}, {}, mockPermissionOptions),
      );
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
      await withWorkspaceContext(mockWorkspaceContext, () =>
        entityManager.clear('test-entity', mockPermissionOptions),
      );
      expect(entityManager['validatePermissions']).toHaveBeenCalledWith({
        target: 'test-entity',
        operationType: 'delete',
        permissionOptions: mockPermissionOptions,
        selectedColumns: [],
      });
      expect(validateOperationIsPermittedOrThrow).toHaveBeenCalledWith({
        entityName: 'test-entity',
        operationType: 'delete',
        flatObjectMetadataMaps: mockInternalContext.flatObjectMetadataMaps,
        flatFieldMetadataMaps: mockInternalContext.flatFieldMetadataMaps,
        objectIdByNameSingular: mockInternalContext.objectIdByNameSingular,
        objectsPermissions: mockPermissionOptions.objectRecordsPermissions,
        selectedColumns: [],
        allFieldsSelected: false,
        updatedColumns: [],
      });
    });
  });
});
