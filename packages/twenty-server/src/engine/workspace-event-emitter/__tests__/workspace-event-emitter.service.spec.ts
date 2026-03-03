import { Test, type TestingModule } from '@nestjs/testing';

import {
  type ObjectsPermissionsByRoleId,
  type RecordGqlOperationFilter,
} from 'twenty-shared/types';

import { ProcessNestedRelationsHelper } from 'src/engine/api/common/common-nested-relations-processor/process-nested-relations.helper';
import { CommonSelectFieldsHelper } from 'src/engine/api/common/common-select-fields/common-select-fields-helper';
import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { COMPANY_FLAT_FIELDS_MOCK } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/company-flat-fields.mock';
import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { COMPANY_FLAT_OBJECT_MOCK } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/company-flat-object.mock';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { EventStreamService } from 'src/engine/subscriptions/event-stream.service';
import { SubscriptionService } from 'src/engine/subscriptions/subscription.service';
import { type EventStreamData } from 'src/engine/subscriptions/types/event-stream-data.type';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { type WorkspaceEventBatch } from 'src/engine/workspace-event-emitter/types/workspace-event-batch.type';
import { WorkspaceEventEmitterService } from 'src/engine/workspace-event-emitter/workspace-event-emitter.service';

jest.mock(
  'src/engine/twenty-orm/utils/build-row-level-permission-record-filter.util',
  () => ({
    buildRowLevelPermissionRecordFilter: jest.fn(),
  }),
);

jest.mock(
  'src/engine/twenty-orm/utils/is-record-matching-rls-row-level-permission-predicate.util',
  () => ({
    isRecordMatchingRLSRowLevelPermissionPredicate: jest.fn(),
  }),
);

const {
  buildRowLevelPermissionRecordFilter,
} = require('src/engine/twenty-orm/utils/build-row-level-permission-record-filter.util');
const {
  isRecordMatchingRLSRowLevelPermissionPredicate,
} = require('src/engine/twenty-orm/utils/is-record-matching-rls-row-level-permission-predicate.util');

type MockObjectRecordEvent = {
  recordId: string;
  userId?: string;
  workspaceMemberId?: string;
  properties: {
    before?: object;
    after?: object;
    updatedFields?: string[];
    diff?: object;
  };
};

const buildFlatFieldMetadataMaps = (
  fields: FlatFieldMetadata[],
): FlatEntityMaps<FlatFieldMetadata> =>
  fields.reduce(
    (maps, field) =>
      addFlatEntityToFlatEntityMapsOrThrow({
        flatEntity: field,
        flatEntityMaps: maps,
      }),
    createEmptyFlatEntityMaps() as FlatEntityMaps<FlatFieldMetadata>,
  );

describe('WorkspaceEventEmitterService', () => {
  let service: WorkspaceEventEmitterService;
  let mockSubscriptionService: jest.Mocked<
    Pick<SubscriptionService, 'publish' | 'publishToEventStream'>
  >;
  let mockEventStreamService: jest.Mocked<
    Pick<
      EventStreamService,
      'getActiveStreamIds' | 'getStreamsData' | 'removeFromActiveStreams'
    >
  >;
  let mockWorkspaceCacheService: {
    getOrRecompute: jest.Mock;
  };
  let mockProcessNestedRelationsHelper: jest.Mocked<
    Pick<ProcessNestedRelationsHelper, 'processNestedRelations'>
  >;
  let mockWorkspaceManyOrAllFlatEntityMapsCacheService: jest.Mocked<
    Pick<
      WorkspaceManyOrAllFlatEntityMapsCacheService,
      'getOrRecomputeManyOrAllFlatEntityMaps'
    >
  >;

  let mockGlobalWorkspaceOrmManager: jest.Mocked<
    Pick<GlobalWorkspaceOrmManager, 'getGlobalWorkspaceDataSourceReplica'>
  >;

  const workspaceId = COMPANY_FLAT_OBJECT_MOCK.workspaceId;
  const streamChannelId = 'test-stream-channel-id';
  const userWorkspaceId = 'test-user-workspace-id';
  const roleId = 'test-role-id';

  const companyObjectMetadata: FlatObjectMetadata = COMPANY_FLAT_OBJECT_MOCK;

  const companyNameField = COMPANY_FLAT_FIELDS_MOCK.name;

  const mockFlatFieldMetadataMaps = buildFlatFieldMetadataMaps([
    companyNameField,
  ]);

  const mockUserWorkspaceRoleMap: Record<string, string> = {
    [userWorkspaceId]: roleId,
  };

  const mockRolesPermissions: ObjectsPermissionsByRoleId = {
    [roleId]: {
      [companyObjectMetadata.id]: {
        canReadObjectRecords: true,
        canUpdateObjectRecords: true,
        canSoftDeleteObjectRecords: true,
        canDestroyObjectRecords: true,
        showInSidebar: true,
        restrictedFields: {},
        rowLevelPermissionPredicates: [],
        rowLevelPermissionPredicateGroups: [],
      },
    },
  };

  const mockStreamData: EventStreamData = {
    authContext: {
      userWorkspaceId,
      userId: 'test-user-id',
      workspaceMemberId: 'test-workspace-member-id',
    },
    workspaceId,
    queries: {
      'query-1': {
        objectNameSingular: 'company',
        variables: {},
      },
    },
    createdAt: Date.now(),
  };

  const createMockEvent = (
    overrides: Partial<MockObjectRecordEvent> = {},
  ): MockObjectRecordEvent => ({
    recordId: 'record-1',
    userId: 'test-user-id',
    workspaceMemberId: 'test-workspace-member-id',
    properties: {
      after: { id: 'record-1', name: 'Test Company' },
    },
    ...overrides,
  });

  const mockFlatWorkspaceMemberMaps = {
    byId: {
      'test-workspace-member-id': {
        id: 'test-workspace-member-id',
        userId: 'test-user-id',
        name: { firstName: 'Test', lastName: 'User' },
        locale: 'en',
      },
    },
    idByUserId: {
      'test-user-id': 'test-workspace-member-id',
    },
  };

  const createPermissionsContext = (
    overrides: {
      flatFieldMetadataMaps?: FlatEntityMaps<FlatFieldMetadata>;
      userWorkspaceRoleMap?: Record<string, string>;
      rolesPermissions?: ObjectsPermissionsByRoleId;
    } = {},
  ) => ({
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
    flatFieldMetadataMaps:
      overrides.flatFieldMetadataMaps ?? mockFlatFieldMetadataMaps,
    userWorkspaceRoleMap:
      overrides.userWorkspaceRoleMap ?? mockUserWorkspaceRoleMap,
    rolesPermissions: overrides.rolesPermissions ?? mockRolesPermissions,
  });

  const createCacheMock = (
    permissionsOverrides: {
      flatFieldMetadataMaps?: FlatEntityMaps<FlatFieldMetadata>;
      userWorkspaceRoleMap?: Record<string, string>;
      rolesPermissions?: ObjectsPermissionsByRoleId;
    } = {},
    workspaceMemberMapsOverride?: {
      byId: Record<string, unknown>;
      idByUserId: Record<string, string>;
    },
  ) => {
    return (_workspaceId: string, keys: string[]) => {
      if (keys.includes('flatWorkspaceMemberMaps')) {
        return Promise.resolve({
          flatWorkspaceMemberMaps:
            workspaceMemberMapsOverride ?? mockFlatWorkspaceMemberMaps,
        });
      }

      return Promise.resolve(createPermissionsContext(permissionsOverrides));
    };
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    mockSubscriptionService = {
      publish: jest.fn().mockResolvedValue(undefined),
      publishToEventStream: jest.fn().mockResolvedValue(undefined),
    };

    mockEventStreamService = {
      getActiveStreamIds: jest.fn().mockResolvedValue([streamChannelId]),
      getStreamsData: jest
        .fn()
        .mockResolvedValue(
          new Map([[streamChannelId, mockStreamData]]) as Map<
            string,
            EventStreamData | undefined
          >,
        ),
      removeFromActiveStreams: jest.fn().mockResolvedValue(undefined),
    };

    mockWorkspaceCacheService = {
      getOrRecompute: jest.fn().mockImplementation(createCacheMock()),
    };

    mockProcessNestedRelationsHelper = {
      processNestedRelations: jest.fn(),
    };

    mockWorkspaceManyOrAllFlatEntityMapsCacheService = {
      getOrRecomputeManyOrAllFlatEntityMaps: jest.fn().mockResolvedValue({
        flatFieldMetadataMaps: mockFlatFieldMetadataMaps,
        flatObjectMetadataMaps: {
          byId: {
            [companyObjectMetadata.id]: companyObjectMetadata,
          },
          idByUniversalIdentifier: {},
          universalIdentifiersByApplicationId: {},
        },
      } as never),
    };

    mockGlobalWorkspaceOrmManager = {
      getGlobalWorkspaceDataSourceReplica: jest.fn().mockResolvedValue({
        getRepository: jest.fn(),
      }),
    };

    (buildRowLevelPermissionRecordFilter as jest.Mock).mockReturnValue({});
    (
      isRecordMatchingRLSRowLevelPermissionPredicate as jest.Mock
    ).mockReturnValue(true);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkspaceEventEmitterService,
        {
          provide: SubscriptionService,
          useValue: mockSubscriptionService,
        },
        {
          provide: EventStreamService,
          useValue: mockEventStreamService,
        },
        {
          provide: WorkspaceCacheService,
          useValue: mockWorkspaceCacheService,
        },
        {
          provide: ProcessNestedRelationsHelper,
          useValue: mockProcessNestedRelationsHelper,
        },
        {
          provide: WorkspaceManyOrAllFlatEntityMapsCacheService,
          useValue: mockWorkspaceManyOrAllFlatEntityMapsCacheService,
        },
        {
          provide: GlobalWorkspaceOrmManager,
          useValue: mockGlobalWorkspaceOrmManager,
        },
        {
          provide: CommonSelectFieldsHelper,
          useValue: new CommonSelectFieldsHelper(),
        },
      ],
    }).compile();

    service = module.get<WorkspaceEventEmitterService>(
      WorkspaceEventEmitterService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('publish', () => {
    it('should skip publishing to event streams when no active streams exist', async () => {
      mockEventStreamService.getActiveStreamIds.mockResolvedValue([]);

      const eventBatch: WorkspaceEventBatch<MockObjectRecordEvent> = {
        name: 'company.created',
        workspaceId,
        objectMetadata: companyObjectMetadata,
        events: [createMockEvent()],
      };

      await service.publish(eventBatch as WorkspaceEventBatch<never>);

      expect(mockEventStreamService.getActiveStreamIds).toHaveBeenCalledWith(
        workspaceId,
      );
      expect(mockEventStreamService.getStreamsData).not.toHaveBeenCalled();
      expect(
        mockSubscriptionService.publishToEventStream,
      ).not.toHaveBeenCalled();
    });

    it('should publish events when record matches query and permissions', async () => {
      const eventBatch: WorkspaceEventBatch<MockObjectRecordEvent> = {
        name: 'company.created',
        workspaceId,
        objectMetadata: companyObjectMetadata,
        events: [createMockEvent()],
      };

      await service.publish(eventBatch as WorkspaceEventBatch<never>);

      expect(mockSubscriptionService.publishToEventStream).toHaveBeenCalled();
      const publishCall = (
        mockSubscriptionService.publishToEventStream as jest.Mock
      ).mock.calls[0][0];

      expect(publishCall.workspaceId).toBe(workspaceId);
      expect(publishCall.eventStreamChannelId).toBe(streamChannelId);
      expect(publishCall.payload.objectRecordEventsWithQueryIds).toHaveLength(
        1,
      );
      expect(
        publishCall.payload.objectRecordEventsWithQueryIds[0].queryIds,
      ).toContain('query-1');
    });

    it('should not publish events when object-level read permission is denied', async () => {
      const permissionsWithoutRead: ObjectsPermissionsByRoleId = {
        [roleId]: {
          [companyObjectMetadata.id]: {
            canReadObjectRecords: false,
            canUpdateObjectRecords: true,
            canSoftDeleteObjectRecords: true,
            canDestroyObjectRecords: true,
            showInSidebar: true,
            restrictedFields: {},
            rowLevelPermissionPredicates: [],
            rowLevelPermissionPredicateGroups: [],
          },
        },
      };

      mockWorkspaceCacheService.getOrRecompute.mockImplementation(
        createCacheMock({ rolesPermissions: permissionsWithoutRead }),
      );

      const eventBatch: WorkspaceEventBatch<MockObjectRecordEvent> = {
        name: 'company.created',
        workspaceId,
        objectMetadata: companyObjectMetadata,
        events: [createMockEvent()],
      };

      await service.publish(eventBatch as WorkspaceEventBatch<never>);

      expect(
        mockSubscriptionService.publishToEventStream,
      ).not.toHaveBeenCalled();
    });

    it('should not publish events when query object name does not match event', async () => {
      const streamDataWithDifferentObject: EventStreamData = {
        ...mockStreamData,
        queries: {
          'query-1': {
            objectNameSingular: 'person',
            variables: {},
          },
        },
      };

      mockEventStreamService.getStreamsData.mockResolvedValue(
        new Map([[streamChannelId, streamDataWithDifferentObject]]) as Map<
          string,
          EventStreamData | undefined
        >,
      );

      const eventBatch: WorkspaceEventBatch<MockObjectRecordEvent> = {
        name: 'company.created',
        workspaceId,
        objectMetadata: companyObjectMetadata,
        events: [createMockEvent()],
      };

      await service.publish(eventBatch as WorkspaceEventBatch<never>);

      expect(
        mockSubscriptionService.publishToEventStream,
      ).not.toHaveBeenCalled();
    });

    it('should not publish events when record does not match RLS filter', async () => {
      (
        isRecordMatchingRLSRowLevelPermissionPredicate as jest.Mock
      ).mockReturnValue(false);

      const streamDataWithFilter: EventStreamData = {
        ...mockStreamData,
        queries: {
          'query-1': {
            objectNameSingular: 'company',
            variables: {
              filter: { name: { eq: 'Other Company' } },
            },
          },
        },
      };

      mockEventStreamService.getStreamsData.mockResolvedValue(
        new Map([[streamChannelId, streamDataWithFilter]]) as Map<
          string,
          EventStreamData | undefined
        >,
      );

      const eventBatch: WorkspaceEventBatch<MockObjectRecordEvent> = {
        name: 'company.created',
        workspaceId,
        objectMetadata: companyObjectMetadata,
        events: [createMockEvent()],
      };

      await service.publish(eventBatch as WorkspaceEventBatch<never>);

      expect(
        mockSubscriptionService.publishToEventStream,
      ).not.toHaveBeenCalled();
    });

    it('should filter restricted fields from events', async () => {
      const restrictedField = getFlatFieldMetadataMock({
        objectMetadataId: companyObjectMetadata.id,
        type: COMPANY_FLAT_FIELDS_MOCK.name.type,
        name: 'secretField',
        universalIdentifier: 'restricted-field-universal-id',
        workspaceId,
      });

      const permissionsWithRestrictedFields: ObjectsPermissionsByRoleId = {
        [roleId]: {
          [companyObjectMetadata.id]: {
            canReadObjectRecords: true,
            canUpdateObjectRecords: true,
            canSoftDeleteObjectRecords: true,
            canDestroyObjectRecords: true,
            showInSidebar: true,
            restrictedFields: {
              [restrictedField.id]: { canRead: false, canUpdate: false },
            },
            rowLevelPermissionPredicates: [],
            rowLevelPermissionPredicateGroups: [],
          },
        },
      };

      const fieldMetadataMapsWithRestricted = buildFlatFieldMetadataMaps([
        restrictedField,
      ]);

      mockWorkspaceCacheService.getOrRecompute.mockImplementation(
        createCacheMock({
          flatFieldMetadataMaps: fieldMetadataMapsWithRestricted,
          rolesPermissions: permissionsWithRestrictedFields,
        }),
      );

      const eventBatch: WorkspaceEventBatch<MockObjectRecordEvent> = {
        name: 'company.created',
        workspaceId,
        objectMetadata: companyObjectMetadata,
        events: [
          createMockEvent({
            properties: {
              after: {
                id: 'record-1',
                name: 'Test Company',
                secretField: 'secret-value',
              },
            },
          }),
        ],
      };

      await service.publish(eventBatch as WorkspaceEventBatch<never>);

      expect(mockSubscriptionService.publishToEventStream).toHaveBeenCalled();
      const publishCall = (
        mockSubscriptionService.publishToEventStream as jest.Mock
      ).mock.calls[0][0];

      expect(
        publishCall.payload.objectRecordEventsWithQueryIds[0].objectRecordEvent
          .properties.after,
      ).not.toHaveProperty('secretField');
      expect(
        publishCall.payload.objectRecordEventsWithQueryIds[0].objectRecordEvent
          .properties.after,
      ).toHaveProperty('name');
    });

    it('should skip update events when all updated fields are restricted', async () => {
      const restrictedField = getFlatFieldMetadataMock({
        objectMetadataId: companyObjectMetadata.id,
        type: COMPANY_FLAT_FIELDS_MOCK.name.type,
        name: 'secretField',
        universalIdentifier: 'restricted-field-universal-id',
        workspaceId,
      });

      const permissionsWithRestrictedFields: ObjectsPermissionsByRoleId = {
        [roleId]: {
          [companyObjectMetadata.id]: {
            canReadObjectRecords: true,
            canUpdateObjectRecords: true,
            canSoftDeleteObjectRecords: true,
            canDestroyObjectRecords: true,
            showInSidebar: true,
            restrictedFields: {
              [restrictedField.id]: { canRead: false, canUpdate: false },
            },
            rowLevelPermissionPredicates: [],
            rowLevelPermissionPredicateGroups: [],
          },
        },
      };

      const fieldMetadataMapsWithRestricted = buildFlatFieldMetadataMaps([
        restrictedField,
      ]);

      mockWorkspaceCacheService.getOrRecompute.mockImplementation(
        createCacheMock({
          flatFieldMetadataMaps: fieldMetadataMapsWithRestricted,
          rolesPermissions: permissionsWithRestrictedFields,
        }),
      );

      const eventBatch: WorkspaceEventBatch<MockObjectRecordEvent> = {
        name: 'company.updated',
        workspaceId,
        objectMetadata: companyObjectMetadata,
        events: [
          createMockEvent({
            properties: {
              before: { id: 'record-1', secretField: 'old-secret' },
              after: { id: 'record-1', secretField: 'new-secret' },
              updatedFields: ['secretField'],
              diff: {
                secretField: { before: 'old-secret', after: 'new-secret' },
              },
            },
          }),
        ],
      };

      await service.publish(eventBatch as WorkspaceEventBatch<never>);

      expect(
        mockSubscriptionService.publishToEventStream,
      ).not.toHaveBeenCalled();
    });

    it('should filter diff when restricted fields are updated', async () => {
      const restrictedField = getFlatFieldMetadataMock({
        objectMetadataId: companyObjectMetadata.id,
        type: COMPANY_FLAT_FIELDS_MOCK.name.type,
        name: 'secretField',
        universalIdentifier: 'restricted-field-universal-id',
        workspaceId,
      });

      const permissionsWithRestrictedFields: ObjectsPermissionsByRoleId = {
        [roleId]: {
          [companyObjectMetadata.id]: {
            canReadObjectRecords: true,
            canUpdateObjectRecords: true,
            canSoftDeleteObjectRecords: true,
            canDestroyObjectRecords: true,
            showInSidebar: true,
            restrictedFields: {
              [restrictedField.id]: { canRead: false, canUpdate: false },
            },
            rowLevelPermissionPredicates: [],
            rowLevelPermissionPredicateGroups: [],
          },
        },
      };

      const fieldMetadataMapsWithRestricted = buildFlatFieldMetadataMaps([
        restrictedField,
      ]);

      mockWorkspaceCacheService.getOrRecompute.mockImplementation(
        createCacheMock({
          flatFieldMetadataMaps: fieldMetadataMapsWithRestricted,
          rolesPermissions: permissionsWithRestrictedFields,
        }),
      );

      const eventBatch: WorkspaceEventBatch<MockObjectRecordEvent> = {
        name: 'company.updated',
        workspaceId,
        objectMetadata: companyObjectMetadata,
        events: [
          createMockEvent({
            properties: {
              before: {
                id: 'record-1',
                name: 'Old Name',
                secretField: 'old-secret',
              },
              after: {
                id: 'record-1',
                name: 'New Name',
                secretField: 'new-secret',
              },
              updatedFields: ['name', 'secretField'],
              diff: {
                name: { before: 'Old Name', after: 'New Name' },
                secretField: { before: 'old-secret', after: 'new-secret' },
              },
            },
          }),
        ],
      };

      await service.publish(eventBatch as WorkspaceEventBatch<never>);

      expect(mockSubscriptionService.publishToEventStream).toHaveBeenCalled();
      const publishCall = (
        mockSubscriptionService.publishToEventStream as jest.Mock
      ).mock.calls[0][0];

      const eventPayload =
        publishCall.payload.objectRecordEventsWithQueryIds[0].objectRecordEvent;

      expect(eventPayload.properties.updatedFields).toEqual(['name']);
      expect(eventPayload.properties.diff).not.toHaveProperty('secretField');
      expect(eventPayload.properties.diff).toHaveProperty('name');
      expect(eventPayload.properties.before).not.toHaveProperty('secretField');
      expect(eventPayload.properties.after).not.toHaveProperty('secretField');
    });

    it('should remove stale streams from active streams', async () => {
      const staleStreamId = 'stale-stream-id';

      mockEventStreamService.getActiveStreamIds.mockResolvedValue([
        streamChannelId,
        staleStreamId,
      ]);

      mockEventStreamService.getStreamsData.mockResolvedValue(
        new Map([
          [streamChannelId, mockStreamData],
          [staleStreamId, undefined],
        ]) as Map<string, EventStreamData | undefined>,
      );

      const eventBatch: WorkspaceEventBatch<MockObjectRecordEvent> = {
        name: 'company.created',
        workspaceId,
        objectMetadata: companyObjectMetadata,
        events: [createMockEvent()],
      };

      await service.publish(eventBatch as WorkspaceEventBatch<never>);

      expect(
        mockEventStreamService.removeFromActiveStreams,
      ).toHaveBeenCalledWith(workspaceId, [staleStreamId]);
    });

    it('should skip streams with no registered queries', async () => {
      const streamDataWithNoQueries: EventStreamData = {
        ...mockStreamData,
        queries: {},
      };

      mockEventStreamService.getStreamsData.mockResolvedValue(
        new Map([[streamChannelId, streamDataWithNoQueries]]) as Map<
          string,
          EventStreamData | undefined
        >,
      );

      const eventBatch: WorkspaceEventBatch<MockObjectRecordEvent> = {
        name: 'company.created',
        workspaceId,
        objectMetadata: companyObjectMetadata,
        events: [createMockEvent()],
      };

      await service.publish(eventBatch as WorkspaceEventBatch<never>);

      expect(
        mockSubscriptionService.publishToEventStream,
      ).not.toHaveBeenCalled();
    });

    it('should not publish when user has no role assigned', async () => {
      mockWorkspaceCacheService.getOrRecompute.mockImplementation(
        createCacheMock({ userWorkspaceRoleMap: {} }),
      );

      const eventBatch: WorkspaceEventBatch<MockObjectRecordEvent> = {
        name: 'company.created',
        workspaceId,
        objectMetadata: companyObjectMetadata,
        events: [createMockEvent()],
      };

      await service.publish(eventBatch as WorkspaceEventBatch<never>);

      expect(
        mockSubscriptionService.publishToEventStream,
      ).not.toHaveBeenCalled();
    });

    it('should combine query filter with RLS filter', async () => {
      const rlsFilter: RecordGqlOperationFilter = { status: { eq: 'active' } };

      (buildRowLevelPermissionRecordFilter as jest.Mock).mockResolvedValue(
        rlsFilter,
      );

      const streamDataWithFilter: EventStreamData = {
        ...mockStreamData,
        queries: {
          'query-1': {
            objectNameSingular: 'company',
            variables: {
              filter: { name: { eq: 'Test Company' } },
            },
          },
        },
      };

      mockEventStreamService.getStreamsData.mockResolvedValue(
        new Map([[streamChannelId, streamDataWithFilter]]) as Map<
          string,
          EventStreamData | undefined
        >,
      );

      const eventBatch: WorkspaceEventBatch<MockObjectRecordEvent> = {
        name: 'company.created',
        workspaceId,
        objectMetadata: companyObjectMetadata,
        events: [
          createMockEvent({
            properties: {
              after: {
                id: 'record-1',
                name: 'Test Company',
                status: 'active',
              },
            },
          }),
        ],
      };

      await service.publish(eventBatch as WorkspaceEventBatch<never>);

      expect(
        isRecordMatchingRLSRowLevelPermissionPredicate,
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          record: expect.objectContaining({
            name: 'Test Company',
            status: 'active',
          }),
          filter: expect.objectContaining({
            and: expect.arrayContaining([
              { name: { eq: 'Test Company' } },
              { status: { eq: 'active' } },
            ]),
          }),
        }),
      );
    });

    it('should handle multiple events in a batch', async () => {
      const eventBatch: WorkspaceEventBatch<MockObjectRecordEvent> = {
        name: 'company.created',
        workspaceId,
        objectMetadata: companyObjectMetadata,
        events: [
          createMockEvent({
            recordId: 'record-1',
            properties: { after: { id: 'record-1', name: 'Company 1' } },
          }),
          createMockEvent({
            recordId: 'record-2',
            properties: { after: { id: 'record-2', name: 'Company 2' } },
          }),
        ],
      };

      await service.publish(eventBatch as WorkspaceEventBatch<never>);

      expect(mockSubscriptionService.publishToEventStream).toHaveBeenCalled();
      const publishCall = (
        mockSubscriptionService.publishToEventStream as jest.Mock
      ).mock.calls[0][0];

      expect(publishCall.payload.objectRecordEventsWithQueryIds).toHaveLength(
        2,
      );
    });

    it('should handle multiple matching queries', async () => {
      const streamDataWithMultipleQueries: EventStreamData = {
        ...mockStreamData,
        queries: {
          'query-1': {
            objectNameSingular: 'company',
            variables: {},
          },
          'query-2': {
            objectNameSingular: 'company',
            variables: {},
          },
        },
      };

      mockEventStreamService.getStreamsData.mockResolvedValue(
        new Map([[streamChannelId, streamDataWithMultipleQueries]]) as Map<
          string,
          EventStreamData | undefined
        >,
      );

      const eventBatch: WorkspaceEventBatch<MockObjectRecordEvent> = {
        name: 'company.created',
        workspaceId,
        objectMetadata: companyObjectMetadata,
        events: [createMockEvent()],
      };

      await service.publish(eventBatch as WorkspaceEventBatch<never>);

      expect(mockSubscriptionService.publishToEventStream).toHaveBeenCalled();
      const publishCall = (
        mockSubscriptionService.publishToEventStream as jest.Mock
      ).mock.calls[0][0];

      expect(
        publishCall.payload.objectRecordEventsWithQueryIds[0].queryIds,
      ).toContain('query-1');
      expect(
        publishCall.payload.objectRecordEventsWithQueryIds[0].queryIds,
      ).toContain('query-2');
    });

    it('should use before record for delete events', async () => {
      const streamDataWithFilter: EventStreamData = {
        ...mockStreamData,
        queries: {
          'query-1': {
            objectNameSingular: 'company',
            variables: {
              filter: { name: { eq: 'Deleted Company' } },
            },
          },
        },
      };

      mockEventStreamService.getStreamsData.mockResolvedValue(
        new Map([[streamChannelId, streamDataWithFilter]]) as Map<
          string,
          EventStreamData | undefined
        >,
      );

      const eventBatch: WorkspaceEventBatch<MockObjectRecordEvent> = {
        name: 'company.deleted',
        workspaceId,
        objectMetadata: companyObjectMetadata,
        events: [
          createMockEvent({
            properties: {
              before: { id: 'record-1', name: 'Deleted Company' },
            },
          }),
        ],
      };

      await service.publish(eventBatch as WorkspaceEventBatch<never>);

      expect(
        isRecordMatchingRLSRowLevelPermissionPredicate,
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          record: expect.objectContaining({
            id: 'record-1',
            name: 'Deleted Company',
          }),
        }),
      );
    });

    describe('subscribers without valid authentication', () => {
      it('should not publish events and log warning when subscriber has no userWorkspaceId', async () => {
        const anonymousStreamData: EventStreamData = {
          authContext: {},
          workspaceId,
          queries: {
            'query-1': {
              objectNameSingular: 'company',
              variables: {},
            },
          },
          createdAt: Date.now(),
        };

        mockEventStreamService.getStreamsData.mockResolvedValue(
          new Map([[streamChannelId, anonymousStreamData]]) as Map<
            string,
            EventStreamData | undefined
          >,
        );

        mockWorkspaceCacheService.getOrRecompute.mockImplementation(
          createCacheMock(),
        );

        const eventBatch: WorkspaceEventBatch<MockObjectRecordEvent> = {
          name: 'company.created',
          workspaceId,
          objectMetadata: companyObjectMetadata,
          events: [createMockEvent()],
        };

        await service.publish(eventBatch as WorkspaceEventBatch<never>);

        expect(
          mockSubscriptionService.publishToEventStream,
        ).not.toHaveBeenCalled();
      });

      it('should not publish events and log warning when user role cannot be found', async () => {
        const unknownUserStreamData: EventStreamData = {
          authContext: {
            userWorkspaceId: 'unknown-user-workspace-id',
            userId: 'unknown-user-id',
          },
          workspaceId,
          queries: {
            'query-1': {
              objectNameSingular: 'company',
              variables: {},
            },
          },
          createdAt: Date.now(),
        };

        mockEventStreamService.getStreamsData.mockResolvedValue(
          new Map([[streamChannelId, unknownUserStreamData]]) as Map<
            string,
            EventStreamData | undefined
          >,
        );

        mockWorkspaceCacheService.getOrRecompute.mockImplementation(
          createCacheMock({ userWorkspaceRoleMap: {} }),
        );

        const eventBatch: WorkspaceEventBatch<MockObjectRecordEvent> = {
          name: 'company.created',
          workspaceId,
          objectMetadata: companyObjectMetadata,
          events: [createMockEvent()],
        };

        await service.publish(eventBatch as WorkspaceEventBatch<never>);

        expect(
          mockSubscriptionService.publishToEventStream,
        ).not.toHaveBeenCalled();
      });
    });

    describe('dynamic RLS predicates', () => {
      it('should pass workspaceMemberId to buildRowLevelPermissionRecordFilter for dynamic predicates', async () => {
        const workspaceMemberId = 'test-workspace-member-id';
        const rlsFilter: RecordGqlOperationFilter = {
          assigneeId: { eq: workspaceMemberId },
        };

        (buildRowLevelPermissionRecordFilter as jest.Mock).mockResolvedValue(
          rlsFilter,
        );

        const streamDataWithWorkspaceMember: EventStreamData = {
          authContext: {
            userWorkspaceId,
            userId: 'test-user-id',
            workspaceMemberId,
          },
          workspaceId,
          queries: {
            'query-1': {
              objectNameSingular: 'company',
              variables: {
                filter: { name: { eq: 'Test Company' } },
              },
            },
          },
          createdAt: Date.now(),
        };

        mockEventStreamService.getStreamsData.mockResolvedValue(
          new Map([[streamChannelId, streamDataWithWorkspaceMember]]) as Map<
            string,
            EventStreamData | undefined
          >,
        );

        mockWorkspaceCacheService.getOrRecompute.mockImplementation(
          createCacheMock(),
        );

        const eventBatch: WorkspaceEventBatch<MockObjectRecordEvent> = {
          name: 'company.created',
          workspaceId,
          objectMetadata: companyObjectMetadata,
          events: [
            createMockEvent({
              properties: {
                after: {
                  id: 'record-1',
                  name: 'Test Company',
                  assigneeId: workspaceMemberId,
                },
              },
            }),
          ],
        };

        await service.publish(eventBatch as WorkspaceEventBatch<never>);

        expect(buildRowLevelPermissionRecordFilter).toHaveBeenCalledWith(
          expect.objectContaining({
            authContext: expect.objectContaining({
              userWorkspaceId,
              workspaceMemberId,
            }),
          }),
        );
      });

      it('should pass full workspaceMember data from cache for dynamic predicates', async () => {
        const workspaceMemberId = 'test-workspace-member-id';
        const customWorkspaceMember = {
          id: workspaceMemberId,
          userId: 'test-user-id',
          name: { firstName: 'John', lastName: 'Doe' },
          locale: 'en',
          colorScheme: 'light',
        };

        const customFlatWorkspaceMemberMaps = {
          byId: {
            [workspaceMemberId]: customWorkspaceMember,
          },
          idByUserId: {
            'test-user-id': workspaceMemberId,
          },
        };

        const rlsFilter: RecordGqlOperationFilter = {
          locale: { eq: 'en' },
        };

        (buildRowLevelPermissionRecordFilter as jest.Mock).mockResolvedValue(
          rlsFilter,
        );

        const streamDataWithWorkspaceMember: EventStreamData = {
          authContext: {
            userWorkspaceId,
            userId: 'test-user-id',
            workspaceMemberId,
          },
          workspaceId,
          queries: {
            'query-1': {
              objectNameSingular: 'company',
              variables: {},
            },
          },
          createdAt: Date.now(),
        };

        mockEventStreamService.getStreamsData.mockResolvedValue(
          new Map([[streamChannelId, streamDataWithWorkspaceMember]]) as Map<
            string,
            EventStreamData | undefined
          >,
        );

        mockWorkspaceCacheService.getOrRecompute.mockImplementation(
          createCacheMock({}, customFlatWorkspaceMemberMaps),
        );

        const eventBatch: WorkspaceEventBatch<MockObjectRecordEvent> = {
          name: 'company.created',
          workspaceId,
          objectMetadata: companyObjectMetadata,
          events: [
            createMockEvent({
              properties: {
                after: {
                  id: 'record-1',
                  name: 'Test Company',
                  locale: 'en',
                },
              },
            }),
          ],
        };

        await service.publish(eventBatch as WorkspaceEventBatch<never>);

        expect(buildRowLevelPermissionRecordFilter).toHaveBeenCalledWith(
          expect.objectContaining({
            authContext: expect.objectContaining({
              userWorkspaceId,
              workspaceMemberId,
              workspaceMember: customWorkspaceMember,
            }),
          }),
        );
      });

      it('should pass undefined workspaceMember when workspaceMemberId is not in cache', async () => {
        const workspaceMemberId = 'non-existent-workspace-member-id';

        const emptyFlatWorkspaceMemberMaps = {
          byId: {},
          idByUserId: {},
        };

        (buildRowLevelPermissionRecordFilter as jest.Mock).mockResolvedValue(
          {},
        );

        const streamDataWithWorkspaceMember: EventStreamData = {
          authContext: {
            userWorkspaceId,
            userId: 'test-user-id',
            workspaceMemberId,
          },
          workspaceId,
          queries: {
            'query-1': {
              objectNameSingular: 'company',
              variables: {},
            },
          },
          createdAt: Date.now(),
        };

        mockEventStreamService.getStreamsData.mockResolvedValue(
          new Map([[streamChannelId, streamDataWithWorkspaceMember]]) as Map<
            string,
            EventStreamData | undefined
          >,
        );

        mockWorkspaceCacheService.getOrRecompute.mockImplementation(
          createCacheMock({}, emptyFlatWorkspaceMemberMaps),
        );

        const eventBatch: WorkspaceEventBatch<MockObjectRecordEvent> = {
          name: 'company.created',
          workspaceId,
          objectMetadata: companyObjectMetadata,
          events: [createMockEvent()],
        };

        await service.publish(eventBatch as WorkspaceEventBatch<never>);

        expect(buildRowLevelPermissionRecordFilter).toHaveBeenCalledWith(
          expect.objectContaining({
            authContext: expect.objectContaining({
              userWorkspaceId,
              workspaceMemberId,
              workspaceMember: undefined,
            }),
          }),
        );
      });
    });

    describe('nested relations enrichment', () => {
      it('should enrich events with nested relations when publishing', async () => {
        const recordAfter = { id: 'record-1', name: 'Test Company' };

        const eventBatch: WorkspaceEventBatch<MockObjectRecordEvent> = {
          name: 'company.created',
          workspaceId,
          objectMetadata: companyObjectMetadata,
          events: [
            createMockEvent({
              properties: {
                after: recordAfter,
              },
            }),
          ],
        };

        await service.publish(eventBatch as WorkspaceEventBatch<never>);

        expect(
          mockWorkspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps,
        ).toHaveBeenCalledWith({
          workspaceId,
          flatMapsKeys: ['flatObjectMetadataMaps', 'flatFieldMetadataMaps'],
        });

        expect(
          mockGlobalWorkspaceOrmManager.getGlobalWorkspaceDataSourceReplica,
        ).toHaveBeenCalled();

        expect(
          mockProcessNestedRelationsHelper.processNestedRelations,
        ).toHaveBeenCalledWith(
          expect.objectContaining({
            parentObjectMetadataItem: companyObjectMetadata,
            parentObjectRecords: expect.arrayContaining([recordAfter]),
            authContext: expect.objectContaining({
              userWorkspaceId,
              userId: 'test-user-id',
            }),
            workspaceDataSource: expect.objectContaining({
              getRepository: expect.any(Function),
            }),
            rolePermissionConfig: expect.objectContaining({
              intersectionOf: [roleId],
            }),
          }),
        );
      });

      it('should include both before and after records when enriching update events', async () => {
        const recordBefore = { id: 'record-1', name: 'Old Name' };
        const recordAfter = { id: 'record-1', name: 'New Name' };

        const eventBatch: WorkspaceEventBatch<MockObjectRecordEvent> = {
          name: 'company.updated',
          workspaceId,
          objectMetadata: companyObjectMetadata,
          events: [
            createMockEvent({
              properties: {
                before: recordBefore,
                after: recordAfter,
                updatedFields: ['name'],
                diff: { name: { before: 'Old Name', after: 'New Name' } },
              },
            }),
          ],
        };

        await service.publish(eventBatch as WorkspaceEventBatch<never>);

        expect(
          mockProcessNestedRelationsHelper.processNestedRelations,
        ).toHaveBeenCalledWith(
          expect.objectContaining({
            parentObjectRecords: expect.arrayContaining([
              recordBefore,
              recordAfter,
            ]),
          }),
        );
      });

      it('should include only before records when enriching delete events', async () => {
        const recordBefore = { id: 'record-1', name: 'Deleted Company' };

        const streamDataWithFilter: EventStreamData = {
          ...mockStreamData,
          queries: {
            'query-1': {
              objectNameSingular: 'company',
              variables: {},
            },
          },
        };

        mockEventStreamService.getStreamsData.mockResolvedValue(
          new Map([[streamChannelId, streamDataWithFilter]]) as Map<
            string,
            EventStreamData | undefined
          >,
        );

        const eventBatch: WorkspaceEventBatch<MockObjectRecordEvent> = {
          name: 'company.deleted',
          workspaceId,
          objectMetadata: companyObjectMetadata,
          events: [
            createMockEvent({
              properties: {
                before: recordBefore,
              },
            }),
          ],
        };

        await service.publish(eventBatch as WorkspaceEventBatch<never>);

        expect(
          mockProcessNestedRelationsHelper.processNestedRelations,
        ).toHaveBeenCalledWith(
          expect.objectContaining({
            parentObjectRecords: expect.arrayContaining([recordBefore]),
          }),
        );
      });

      it('should enrich multiple records from batch events', async () => {
        const record1 = { id: 'record-1', name: 'Company 1' };
        const record2 = { id: 'record-2', name: 'Company 2' };
        const record3 = { id: 'record-3', name: 'Company 3' };

        const eventBatch: WorkspaceEventBatch<MockObjectRecordEvent> = {
          name: 'company.created',
          workspaceId,
          objectMetadata: companyObjectMetadata,
          events: [
            createMockEvent({
              recordId: 'record-1',
              properties: { after: record1 },
            }),
            createMockEvent({
              recordId: 'record-2',
              properties: { after: record2 },
            }),
            createMockEvent({
              recordId: 'record-3',
              properties: { after: record3 },
            }),
          ],
        };

        await service.publish(eventBatch as WorkspaceEventBatch<never>);

        expect(
          mockProcessNestedRelationsHelper.processNestedRelations,
        ).toHaveBeenCalledWith(
          expect.objectContaining({
            parentObjectRecords: expect.arrayContaining([
              record1,
              record2,
              record3,
            ]),
          }),
        );
      });

      it('should not call processNestedRelations when no events match', async () => {
        const permissionsWithoutRead: ObjectsPermissionsByRoleId = {
          [roleId]: {
            [companyObjectMetadata.id]: {
              canReadObjectRecords: false,
              canUpdateObjectRecords: true,
              canSoftDeleteObjectRecords: true,
              canDestroyObjectRecords: true,
              showInSidebar: true,
              restrictedFields: {},
              rowLevelPermissionPredicates: [],
              rowLevelPermissionPredicateGroups: [],
            },
          },
        };

        mockWorkspaceCacheService.getOrRecompute.mockImplementation(
          createCacheMock({ rolesPermissions: permissionsWithoutRead }),
        );

        const eventBatch: WorkspaceEventBatch<MockObjectRecordEvent> = {
          name: 'company.created',
          workspaceId,
          objectMetadata: companyObjectMetadata,
          events: [createMockEvent()],
        };

        await service.publish(eventBatch as WorkspaceEventBatch<never>);

        expect(
          mockProcessNestedRelationsHelper.processNestedRelations,
        ).not.toHaveBeenCalled();
      });

      it('should pass correct role permission config when enriching events', async () => {
        const customRoleId = 'custom-role-id';
        const customUserWorkspaceRoleMap = {
          [userWorkspaceId]: customRoleId,
        };

        const customRolesPermissions: ObjectsPermissionsByRoleId = {
          [customRoleId]: {
            [companyObjectMetadata.id]: {
              canReadObjectRecords: true,
              canUpdateObjectRecords: true,
              canSoftDeleteObjectRecords: true,
              canDestroyObjectRecords: true,
              showInSidebar: true,
              restrictedFields: {},
              rowLevelPermissionPredicates: [],
              rowLevelPermissionPredicateGroups: [],
            },
          },
        };

        mockWorkspaceCacheService.getOrRecompute.mockImplementation(
          createCacheMock({
            userWorkspaceRoleMap: customUserWorkspaceRoleMap,
            rolesPermissions: customRolesPermissions,
          }),
        );

        const recordAfter = { id: 'record-1', name: 'Test Company' };

        const eventBatch: WorkspaceEventBatch<MockObjectRecordEvent> = {
          name: 'company.created',
          workspaceId,
          objectMetadata: companyObjectMetadata,
          events: [
            createMockEvent({
              properties: {
                after: recordAfter,
              },
            }),
          ],
        };

        await service.publish(eventBatch as WorkspaceEventBatch<never>);

        expect(
          mockProcessNestedRelationsHelper.processNestedRelations,
        ).toHaveBeenCalledWith(
          expect.objectContaining({
            rolePermissionConfig: {
              intersectionOf: [customRoleId],
            },
          }),
        );
      });
    });
  });
});
