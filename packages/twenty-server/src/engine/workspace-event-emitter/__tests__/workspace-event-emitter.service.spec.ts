import { Test, type TestingModule } from '@nestjs/testing';

import {
  FieldMetadataType,
  type ObjectsPermissionsByRoleId,
  type RecordGqlOperationFilter,
} from 'twenty-shared/types';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { EventStreamService } from 'src/engine/subscriptions/event-stream.service';
import { SubscriptionService } from 'src/engine/subscriptions/subscription.service';
import { type EventStreamData } from 'src/engine/subscriptions/types/event-stream-data.type';
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

  const workspaceId = 'test-workspace-id';
  const streamChannelId = 'test-stream-channel-id';
  const userWorkspaceId = 'test-user-workspace-id';
  const roleId = 'test-role-id';
  const objectMetadataId = 'test-object-metadata-id';
  const fieldMetadataId = 'test-field-metadata-id';

  const createMockObjectMetadata = (): FlatObjectMetadata =>
    ({
      id: objectMetadataId,
      nameSingular: 'company',
      namePlural: 'companies',
      labelSingular: 'Company',
      labelPlural: 'Companies',
      fieldMetadataIds: [fieldMetadataId],
      workspaceId,
    }) as FlatObjectMetadata;

  const createMockFlatFieldMetadata = (
    id: string,
    name: string,
  ): FlatFieldMetadata =>
    ({
      id,
      name,
      type: FieldMetadataType.TEXT,
      objectMetadataId,
    }) as FlatFieldMetadata;

  const createMockFlatFieldMetadataMaps = (
    fields: FlatFieldMetadata[],
  ): FlatEntityMaps<FlatFieldMetadata> => ({
    byId: Object.fromEntries(fields.map((field) => [field.id, field])),
    idByUniversalIdentifier: {},
    universalIdentifiersByApplicationId: {},
  });

  const mockFlatFieldMetadataMaps = createMockFlatFieldMetadataMaps([
    createMockFlatFieldMetadata(fieldMetadataId, 'name'),
  ]);

  const mockUserWorkspaceRoleMap: Record<string, string> = {
    [userWorkspaceId]: roleId,
  };

  const mockRolesPermissions: ObjectsPermissionsByRoleId = {
    [roleId]: {
      [objectMetadataId]: {
        canReadObjectRecords: true,
        canUpdateObjectRecords: true,
        canSoftDeleteObjectRecords: true,
        canDestroyObjectRecords: true,
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
      getOrRecompute: jest.fn().mockResolvedValue(createPermissionsContext()),
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
        objectMetadata: createMockObjectMetadata(),
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
        objectMetadata: createMockObjectMetadata(),
        events: [createMockEvent()],
      };

      await service.publish(eventBatch as WorkspaceEventBatch<never>);

      expect(mockSubscriptionService.publishToEventStream).toHaveBeenCalled();
      const publishCall = (
        mockSubscriptionService.publishToEventStream as jest.Mock
      ).mock.calls[0][0];

      expect(publishCall.workspaceId).toBe(workspaceId);
      expect(publishCall.eventStreamChannelId).toBe(streamChannelId);
      expect(publishCall.payload).toHaveLength(1);
      expect(publishCall.payload[0].queryIds).toContain('query-1');
    });

    it('should not publish events when object-level read permission is denied', async () => {
      const permissionsWithoutRead: ObjectsPermissionsByRoleId = {
        [roleId]: {
          [objectMetadataId]: {
            canReadObjectRecords: false,
            canUpdateObjectRecords: true,
            canSoftDeleteObjectRecords: true,
            canDestroyObjectRecords: true,
            restrictedFields: {},
            rowLevelPermissionPredicates: [],
            rowLevelPermissionPredicateGroups: [],
          },
        },
      };

      mockWorkspaceCacheService.getOrRecompute.mockResolvedValue(
        createPermissionsContext({ rolesPermissions: permissionsWithoutRead }),
      );

      const eventBatch: WorkspaceEventBatch<MockObjectRecordEvent> = {
        name: 'company.created',
        workspaceId,
        objectMetadata: createMockObjectMetadata(),
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
        objectMetadata: createMockObjectMetadata(),
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
        objectMetadata: createMockObjectMetadata(),
        events: [createMockEvent()],
      };

      await service.publish(eventBatch as WorkspaceEventBatch<never>);

      expect(
        mockSubscriptionService.publishToEventStream,
      ).not.toHaveBeenCalled();
    });

    it('should filter restricted fields from events', async () => {
      const restrictedFieldMetadataId = 'restricted-field-id';

      const permissionsWithRestrictedFields: ObjectsPermissionsByRoleId = {
        [roleId]: {
          [objectMetadataId]: {
            canReadObjectRecords: true,
            canUpdateObjectRecords: true,
            canSoftDeleteObjectRecords: true,
            canDestroyObjectRecords: true,
            restrictedFields: {
              [restrictedFieldMetadataId]: { canRead: false, canUpdate: false },
            },
            rowLevelPermissionPredicates: [],
            rowLevelPermissionPredicateGroups: [],
          },
        },
      };

      const fieldMetadataMapsWithRestricted = createMockFlatFieldMetadataMaps([
        createMockFlatFieldMetadata(restrictedFieldMetadataId, 'secretField'),
      ]);

      mockWorkspaceCacheService.getOrRecompute.mockResolvedValue(
        createPermissionsContext({
          flatFieldMetadataMaps: fieldMetadataMapsWithRestricted,
          rolesPermissions: permissionsWithRestrictedFields,
        }),
      );

      const eventBatch: WorkspaceEventBatch<MockObjectRecordEvent> = {
        name: 'company.created',
        workspaceId,
        objectMetadata: createMockObjectMetadata(),
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

      expect(publishCall.payload[0].event.properties.after).not.toHaveProperty(
        'secretField',
      );
      expect(publishCall.payload[0].event.properties.after).toHaveProperty(
        'name',
      );
    });

    it('should skip update events when all updated fields are restricted', async () => {
      const restrictedFieldMetadataId = 'restricted-field-id';

      const permissionsWithRestrictedFields: ObjectsPermissionsByRoleId = {
        [roleId]: {
          [objectMetadataId]: {
            canReadObjectRecords: true,
            canUpdateObjectRecords: true,
            canSoftDeleteObjectRecords: true,
            canDestroyObjectRecords: true,
            restrictedFields: {
              [restrictedFieldMetadataId]: { canRead: false, canUpdate: false },
            },
            rowLevelPermissionPredicates: [],
            rowLevelPermissionPredicateGroups: [],
          },
        },
      };

      const fieldMetadataMapsWithRestricted = createMockFlatFieldMetadataMaps([
        createMockFlatFieldMetadata(restrictedFieldMetadataId, 'secretField'),
      ]);

      mockWorkspaceCacheService.getOrRecompute.mockResolvedValue(
        createPermissionsContext({
          flatFieldMetadataMaps: fieldMetadataMapsWithRestricted,
          rolesPermissions: permissionsWithRestrictedFields,
        }),
      );

      const eventBatch: WorkspaceEventBatch<MockObjectRecordEvent> = {
        name: 'company.updated',
        workspaceId,
        objectMetadata: createMockObjectMetadata(),
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
      const restrictedFieldMetadataId = 'restricted-field-id';

      const permissionsWithRestrictedFields: ObjectsPermissionsByRoleId = {
        [roleId]: {
          [objectMetadataId]: {
            canReadObjectRecords: true,
            canUpdateObjectRecords: true,
            canSoftDeleteObjectRecords: true,
            canDestroyObjectRecords: true,
            restrictedFields: {
              [restrictedFieldMetadataId]: { canRead: false, canUpdate: false },
            },
            rowLevelPermissionPredicates: [],
            rowLevelPermissionPredicateGroups: [],
          },
        },
      };

      const fieldMetadataMapsWithRestricted = createMockFlatFieldMetadataMaps([
        createMockFlatFieldMetadata(restrictedFieldMetadataId, 'secretField'),
      ]);

      mockWorkspaceCacheService.getOrRecompute.mockResolvedValue(
        createPermissionsContext({
          flatFieldMetadataMaps: fieldMetadataMapsWithRestricted,
          rolesPermissions: permissionsWithRestrictedFields,
        }),
      );

      const eventBatch: WorkspaceEventBatch<MockObjectRecordEvent> = {
        name: 'company.updated',
        workspaceId,
        objectMetadata: createMockObjectMetadata(),
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

      const eventPayload = publishCall.payload[0].event;

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
        objectMetadata: createMockObjectMetadata(),
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
        objectMetadata: createMockObjectMetadata(),
        events: [createMockEvent()],
      };

      await service.publish(eventBatch as WorkspaceEventBatch<never>);

      expect(
        mockSubscriptionService.publishToEventStream,
      ).not.toHaveBeenCalled();
    });

    it('should not publish when user has no role assigned', async () => {
      mockWorkspaceCacheService.getOrRecompute.mockResolvedValue(
        createPermissionsContext({ userWorkspaceRoleMap: {} }),
      );

      const eventBatch: WorkspaceEventBatch<MockObjectRecordEvent> = {
        name: 'company.created',
        workspaceId,
        objectMetadata: createMockObjectMetadata(),
        events: [createMockEvent()],
      };

      await service.publish(eventBatch as WorkspaceEventBatch<never>);

      expect(
        mockSubscriptionService.publishToEventStream,
      ).not.toHaveBeenCalled();
    });

    it('should combine query filter with RLS filter', async () => {
      const rlsFilter: RecordGqlOperationFilter = { status: { eq: 'active' } };

      (buildRowLevelPermissionRecordFilter as jest.Mock).mockReturnValue(
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
        objectMetadata: createMockObjectMetadata(),
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
        objectMetadata: createMockObjectMetadata(),
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

      expect(publishCall.payload).toHaveLength(2);
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
        objectMetadata: createMockObjectMetadata(),
        events: [createMockEvent()],
      };

      await service.publish(eventBatch as WorkspaceEventBatch<never>);

      expect(mockSubscriptionService.publishToEventStream).toHaveBeenCalled();
      const publishCall = (
        mockSubscriptionService.publishToEventStream as jest.Mock
      ).mock.calls[0][0];

      expect(publishCall.payload[0].queryIds).toContain('query-1');
      expect(publishCall.payload[0].queryIds).toContain('query-2');
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
        objectMetadata: createMockObjectMetadata(),
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

        mockWorkspaceCacheService.getOrRecompute.mockResolvedValue(
          createPermissionsContext(),
        );

        const eventBatch: WorkspaceEventBatch<MockObjectRecordEvent> = {
          name: 'company.created',
          workspaceId,
          objectMetadata: createMockObjectMetadata(),
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

        mockWorkspaceCacheService.getOrRecompute.mockResolvedValue(
          createPermissionsContext({ userWorkspaceRoleMap: {} }),
        );

        const eventBatch: WorkspaceEventBatch<MockObjectRecordEvent> = {
          name: 'company.created',
          workspaceId,
          objectMetadata: createMockObjectMetadata(),
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

        (buildRowLevelPermissionRecordFilter as jest.Mock).mockReturnValue(
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

        mockWorkspaceCacheService.getOrRecompute.mockResolvedValue(
          createPermissionsContext(),
        );

        const eventBatch: WorkspaceEventBatch<MockObjectRecordEvent> = {
          name: 'company.created',
          workspaceId,
          objectMetadata: createMockObjectMetadata(),
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
    });
  });
});
