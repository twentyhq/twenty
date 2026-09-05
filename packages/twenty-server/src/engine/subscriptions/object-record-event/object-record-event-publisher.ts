import { Injectable, Logger } from '@nestjs/common';

import { isNonEmptyString } from '@sniptt/guards';
import {
  EVERYONE_PRINCIPAL_ID,
  QUERY_MAX_RECORDS_FROM_RELATION,
} from 'twenty-shared/constants';
import { type ObjectRecordEvent } from 'twenty-shared/database-events';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import {
  FeatureFlagKey,
  Nullable,
  ObjectRecord,
  type ObjectsPermissions,
  type ObjectsPermissionsByRoleId,
  type RecordGqlOperationFilter,
  type RecordGqlOperationSignature,
  type RestrictedFieldsPermissions,
} from 'twenty-shared/types';
import {
  assertUnreachable,
  isDefined,
  isNonEmptyArray,
  isRecordGqlOperationSignature,
} from 'twenty-shared/utils';
import { FindOptionsRelations, ObjectLiteral } from 'typeorm';

import { ProcessNestedRelationsHelper } from 'src/engine/api/common/common-nested-relations-processor/process-nested-relations.helper';
import { CommonSelectFieldsHelper } from 'src/engine/api/common/common-select-fields/common-select-fields-helper';
import { DatabaseEventAction } from 'src/engine/api/graphql/graphql-query-runner/enums/database-event-action';
import { GraphqlQueryParser } from 'src/engine/api/graphql/graphql-query-runner/graphql-query-parsers/graphql-query.parser';
import { type FlatApplicationCacheMaps } from 'src/engine/core-modules/application/types/flat-application-cache-maps.type';
import { findActiveFlatApplicationById } from 'src/engine/core-modules/application/utils/find-active-flat-application-by-id.util';
import { type SerializableAuthContext } from 'src/engine/core-modules/auth/types/serializable-auth-context.type';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { type FlatWorkspaceMemberMaps } from 'src/engine/core-modules/user/types/flat-workspace-member-maps.type';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { UserWorkspaceRoleMap } from 'src/engine/metadata-modules/role-target/types/user-workspace-role-map';
import { type FlatRowLevelPermissionPredicateGroupMaps } from 'src/engine/metadata-modules/row-level-permission-predicate/types/flat-row-level-permission-predicate-group-maps.type';
import { type FlatRowLevelPermissionPredicateMaps } from 'src/engine/metadata-modules/row-level-permission-predicate/types/flat-row-level-permission-predicate-maps.type';
import { DENY_ALL_RECORD_SHARE_GATE } from 'src/engine/record-share/constants/deny-all-record-share-gate.constant';
import { RecordShareService } from 'src/engine/record-share/services/record-share.service';
import { type RecordShareGate } from 'src/engine/record-share/types/record-share-gate.type';
import { type RecordShare } from 'src/engine/record-share/types/record-share.type';
import {
  isLinkedRecordSharedWithPrincipals,
  type LinkedRecordShareGate,
} from 'src/engine/record-share/utils/is-linked-record-shared-with-principals.util';
import { isRecordSharedWithPrincipals } from 'src/engine/record-share/utils/is-record-shared-with-principals.util';
import { resolveRecordShareGateKind } from 'src/engine/record-share/utils/resolve-record-share-gate-kind.util';
import { EventStreamService } from 'src/engine/subscriptions/event-stream.service';
import { SubscriptionService } from 'src/engine/subscriptions/subscription.service';
import {
  type EventStreamData,
  type RecordOrMetadataGqlOperationSignature,
} from 'src/engine/subscriptions/types/event-stream-data.type';
import { type EventStreamPayload } from 'src/engine/subscriptions/types/event-stream-payload.type';
import { ObjectRecordSubscriptionEvent } from 'src/engine/subscriptions/types/object-record-subscription-event.type';
import { resolveRequiredRecordShareAccessLevels } from 'src/engine/twenty-orm/repository/resolve-required-record-share-access-levels.util';
import { RolePermissionConfig } from 'src/engine/twenty-orm/types/role-permission-config';
import { buildRowLevelPermissionRecordFilter } from 'src/engine/twenty-orm/utils/build-row-level-permission-record-filter.util';
import { computePermissionIntersection } from 'src/engine/twenty-orm/utils/compute-permission-intersection.util';
import { isRecordMatchingRLSRowLevelPermissionPredicate } from 'src/engine/twenty-orm/utils/is-record-matching-rls-row-level-permission-predicate.util';
import { resolveRoleIdsForUser } from 'src/engine/twenty-orm/utils/resolve-role-ids-for-user.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { WorkspaceEventBatch } from 'src/engine/workspace-event-emitter/types/workspace-event-batch.type';
import { parseEventNameOrThrow } from 'src/engine/workspace-event-emitter/utils/parse-event-name';

type LinkedRecordShares = {
  linkedFlatObjectMetadatas: FlatObjectMetadata[];
  recordShares: RecordShare[];
};

type StreamPermissionsContext = {
  flatRowLevelPermissionPredicateMaps: FlatRowLevelPermissionPredicateMaps;
  flatRowLevelPermissionPredicateGroupMaps: FlatRowLevelPermissionPredicateGroupMaps;
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
  userWorkspaceRoleMap: UserWorkspaceRoleMap;
  rolesPermissions: ObjectsPermissionsByRoleId;
  flatApplicationMaps: FlatApplicationCacheMaps;
  featureFlagsMap: Record<FeatureFlagKey, boolean>;
};

@Injectable()
export class ObjectRecordEventPublisher {
  private readonly logger = new Logger(ObjectRecordEventPublisher.name);

  constructor(
    private readonly subscriptionService: SubscriptionService,
    private readonly eventStreamService: EventStreamService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly processNestedRelationsHelper: ProcessNestedRelationsHelper,
    private readonly workspaceManyOrAllFlatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
    private readonly commonSelectFieldsHelper: CommonSelectFieldsHelper,
    private readonly recordShareService: RecordShareService,
  ) {}

  async publish(
    eventBatch: WorkspaceEventBatch<ObjectRecordEvent>,
  ): Promise<void> {
    const workspaceId = eventBatch.workspaceId;

    const activeStreamIds =
      await this.eventStreamService.getActiveStreamIds(workspaceId);

    if (activeStreamIds.length === 0) {
      return;
    }

    const streamsData = await this.eventStreamService.getStreamsData(
      workspaceId,
      activeStreamIds,
    );

    const { permissionsContext, flatWorkspaceMemberMaps } =
      await this.fetchObjectRecordStreamContext(workspaceId);

    const recordShares = await this.fetchRecordShares(
      eventBatch,
      permissionsContext.featureFlagsMap,
    );

    const linkedRecordShares = await this.fetchLinkedRecordShares(
      eventBatch,
      permissionsContext.featureFlagsMap,
    );

    const streamIdsToRemove: string[] = [];

    for (const [streamChannelId, streamData] of streamsData) {
      if (!isDefined(streamData)) {
        streamIdsToRemove.push(streamChannelId);
        continue;
      }

      if (Object.keys(streamData.queries).length === 0) {
        continue;
      }

      await this.processObjectRecordStreamEvents({
        streamChannelId,
        streamData,
        workspaceEventBatch: eventBatch,
        permissionsContext,
        flatWorkspaceMemberMaps,
        recordShares,
        linkedRecordShares,
      });
    }

    await this.eventStreamService.removeFromActiveStreams(
      workspaceId,
      streamIdsToRemove,
    );
  }

  private async fetchObjectRecordStreamContext(workspaceId: string) {
    const permissionsContext = await this.fetchPermissionsContext(workspaceId);
    const { flatWorkspaceMemberMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatWorkspaceMemberMaps',
      ]);

    return { permissionsContext, flatWorkspaceMemberMaps };
  }

  private async fetchRecordShares(
    workspaceEventBatch: WorkspaceEventBatch<ObjectRecordEvent>,
    featureFlagsMap: Record<FeatureFlagKey, boolean>,
  ): Promise<RecordShare[]> {
    if (
      !featureFlagsMap[FeatureFlagKey.IS_RECORD_SHARING_ENABLED] ||
      resolveRecordShareGateKind({
        readability: workspaceEventBatch.objectMetadata.readability,
        isOwningApplication: false,
      }) !== 'private'
    ) {
      return [];
    }

    return this.recordShareService.findByRecordIds({
      workspaceId: workspaceEventBatch.workspaceId,
      objectMetadataId: workspaceEventBatch.objectMetadata.id,
      recordIds: workspaceEventBatch.events.map((event) => event.recordId),
    });
  }

  private async fetchLinkedRecordShares(
    workspaceEventBatch: WorkspaceEventBatch<ObjectRecordEvent>,
    featureFlagsMap: Record<FeatureFlagKey, boolean>,
  ): Promise<LinkedRecordShares | undefined> {
    if (
      !featureFlagsMap[FeatureFlagKey.IS_RECORD_SHARING_ENABLED] ||
      workspaceEventBatch.objectMetadata.universalIdentifier !==
        STANDARD_OBJECTS.timelineActivity.universalIdentifier
    ) {
      return undefined;
    }

    const linkedRecordIdsByObjectMetadataId = new Map<string, Set<string>>();

    for (const event of workspaceEventBatch.events) {
      const { linkedObjectMetadataId, linkedRecordId } =
        this.resolveDeliveredRecord(event) ?? {};

      if (
        !isNonEmptyString(linkedObjectMetadataId) ||
        !isNonEmptyString(linkedRecordId)
      ) {
        continue;
      }

      const linkedRecordIds =
        linkedRecordIdsByObjectMetadataId.get(linkedObjectMetadataId) ??
        new Set<string>();

      linkedRecordIds.add(linkedRecordId);
      linkedRecordIdsByObjectMetadataId.set(
        linkedObjectMetadataId,
        linkedRecordIds,
      );
    }

    if (linkedRecordIdsByObjectMetadataId.size === 0) {
      return { linkedFlatObjectMetadatas: [], recordShares: [] };
    }

    const { flatObjectMetadataMaps } =
      await this.workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId: workspaceEventBatch.workspaceId,
          flatMapsKeys: ['flatObjectMetadataMaps'],
        },
      );

    const linkedFlatObjectMetadatas = [
      ...linkedRecordIdsByObjectMetadataId.keys(),
    ]
      .map((linkedObjectMetadataId) =>
        findFlatEntityByIdInFlatEntityMaps({
          flatEntityId: linkedObjectMetadataId,
          flatEntityMaps: flatObjectMetadataMaps,
        }),
      )
      .filter(isDefined);

    const recordShares = (
      await Promise.all(
        linkedFlatObjectMetadatas
          .filter(
            (linkedFlatObjectMetadata) =>
              resolveRecordShareGateKind({
                readability: linkedFlatObjectMetadata.readability,
                isOwningApplication: false,
              }) === 'private',
          )
          .map((linkedFlatObjectMetadata) =>
            this.recordShareService.findByRecordIds({
              workspaceId: workspaceEventBatch.workspaceId,
              objectMetadataId: linkedFlatObjectMetadata.id,
              recordIds: [
                ...(linkedRecordIdsByObjectMetadataId.get(
                  linkedFlatObjectMetadata.id,
                ) ?? []),
              ],
            }),
          ),
      )
    ).flat();

    return { linkedFlatObjectMetadatas, recordShares };
  }

  private resolveDeliveredRecord(
    event: ObjectRecordEvent,
  ): Record<string, unknown> | undefined {
    const properties = event.properties as {
      after?: Record<string, unknown>;
      before?: Record<string, unknown>;
    };

    return properties.after ?? properties.before;
  }

  private async processObjectRecordStreamEvents({
    streamChannelId,
    streamData,
    workspaceEventBatch,
    permissionsContext,
    flatWorkspaceMemberMaps,
    recordShares,
    linkedRecordShares,
  }: {
    streamChannelId: string;
    streamData: EventStreamData;
    workspaceEventBatch: WorkspaceEventBatch<ObjectRecordEvent>;
    permissionsContext: StreamPermissionsContext;
    flatWorkspaceMemberMaps: FlatWorkspaceMemberMaps;
    recordShares: RecordShare[];
    linkedRecordShares: LinkedRecordShares | undefined;
  }): Promise<void> {
    const roleIds = this.resolveStreamRoleIds(
      streamData.authContext,
      permissionsContext,
    );

    if (!isNonEmptyArray(roleIds)) {
      return;
    }

    const objectsPermissions = this.resolveStreamObjectsPermissions(
      roleIds,
      permissionsContext.rolesPermissions,
    );

    if (!isDefined(objectsPermissions)) {
      return;
    }

    const objectPermissions =
      objectsPermissions[workspaceEventBatch.objectMetadata.id];

    if (!objectPermissions?.canReadObjectRecords) {
      return;
    }

    const matchedEvents: {
      queryIds: string[];
      objectRecordEvent: ObjectRecordSubscriptionEvent;
    }[] = [];

    const objectNameSingular = workspaceEventBatch.objectMetadata.nameSingular;

    const subscriberRLSFilter = this.buildSubscriberRLSFilter(
      streamData.authContext,
      roleIds,
      workspaceEventBatch.objectMetadata,
      permissionsContext,
      flatWorkspaceMemberMaps,
    );

    const subscriberRecordShareGate = this.buildSubscriberRecordShareGate(
      streamData.authContext,
      roleIds,
      workspaceEventBatch.objectMetadata,
      permissionsContext.featureFlagsMap,
      recordShares,
    );

    const subscriberLinkedRecordShareGate =
      this.buildSubscriberLinkedRecordShareGate(
        streamData.authContext,
        roleIds,
        workspaceEventBatch.objectMetadata,
        linkedRecordShares,
      );

    const restrictedFields = objectPermissions.restrictedFields;

    for (const event of workspaceEventBatch.events) {
      const { action } = parseEventNameOrThrow(workspaceEventBatch.name);

      const eventWithObjectName: ObjectRecordSubscriptionEvent = {
        action,
        objectNameSingular,
        ...event,
      };

      const filteredEvent = this.filterRestrictedFieldsFromEvent(
        eventWithObjectName,
        restrictedFields,
        permissionsContext.flatFieldMetadataMaps,
      );

      const filteredProperties = filteredEvent.properties as {
        updatedFields?: string[];
      };

      if (
        isDefined(filteredProperties.updatedFields) &&
        filteredProperties.updatedFields.length === 0
      ) {
        continue;
      }

      const matchedQueryIds = this.getMatchingObjectRecordQueryIds(
        streamData.queries,
        filteredEvent,
        subscriberRLSFilter,
        subscriberRecordShareGate,
        subscriberLinkedRecordShareGate,
        workspaceEventBatch.objectMetadata,
        permissionsContext.flatFieldMetadataMaps,
      );

      if (matchedQueryIds.length === 0) {
        continue;
      }

      matchedEvents.push({
        queryIds: matchedQueryIds,
        objectRecordEvent: filteredEvent,
      });
    }

    if (matchedEvents.length > 0) {
      try {
        await this.enrichEventBatchWithNestedRelations({
          objectMetadata: workspaceEventBatch.objectMetadata,
          events: matchedEvents.map(
            (matchedEvent) => matchedEvent.objectRecordEvent,
          ),
          streamData,
          workspaceId: workspaceEventBatch.workspaceId,
          roleIds,
          objectsPermissions,
        });
      } catch (error) {
        this.logger.warn(
          `Failed to enrich nested relations for ${workspaceEventBatch.name} subscription event, broadcasting without them: ${
            error instanceof Error ? error.message : String(error)
          }`,
          error instanceof Error ? error.stack : undefined,
        );
      }

      const payload: EventStreamPayload = {
        objectRecordEventsWithQueryIds: matchedEvents,
        metadataEvents: [],
      };

      await this.subscriptionService.publishToEventStream({
        workspaceId: workspaceEventBatch.workspaceId,
        eventStreamChannelId: streamChannelId,
        payload,
      });
    }
  }

  private async enrichEventBatchWithNestedRelations({
    streamData,
    objectMetadata,
    events,
    workspaceId,
    roleIds,
    objectsPermissions,
  }: {
    streamData: EventStreamData;
    objectMetadata: FlatObjectMetadata;
    events: ObjectRecordEvent[];
    workspaceId: string;
    roleIds: string[];
    objectsPermissions: ObjectsPermissions;
  }) {
    const { flatFieldMetadataMaps, flatObjectMetadataMaps } =
      await this.workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatObjectMetadataMaps', 'flatFieldMetadataMaps'],
        },
      );

    const allRecords: ObjectRecord[] = [];

    for (const event of events) {
      if ('before' in event.properties) {
        const recordBefore = event.properties.before as Nullable<ObjectRecord>;

        if (isDefined(recordBefore)) {
          allRecords.push(recordBefore);
        }
      }

      if ('after' in event.properties) {
        const recordAfter = event.properties.after as Nullable<ObjectRecord>;

        if (isDefined(recordAfter)) {
          allRecords.push(recordAfter);
        }
      }
    }

    const rolePermissionConfig: RolePermissionConfig = {
      intersectionOf: roleIds,
    };

    const selectedFields = this.commonSelectFieldsHelper.computeFromDepth({
      depth: 1,
      flatObjectMetadata: objectMetadata,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
      objectsPermissions,
      onlyUseLabelIdentifierFieldsInRelations: true,
      recurseIntoJunctionTableRelations: true,
    });

    const commonQueryParser = new GraphqlQueryParser(
      objectMetadata,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
    );

    const selectedFieldsResult =
      commonQueryParser.parseSelectedFields(selectedFields);

    await this.processNestedRelationsHelper.processNestedRelations({
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
      parentObjectMetadataItem: objectMetadata,
      parentObjectRecords: allRecords,
      authContext: streamData.authContext as unknown as WorkspaceAuthContext,
      limit: QUERY_MAX_RECORDS_FROM_RELATION,
      rolePermissionConfig,
      relations: selectedFieldsResult.relations as Record<
        string,
        FindOptionsRelations<ObjectLiteral>
      >,
      selectedFields: selectedFieldsResult.select,
    });
  }

  private resolveStreamRoleIds(
    subscriberAuthContext: SerializableAuthContext,
    permissionsContext: Pick<
      StreamPermissionsContext,
      'userWorkspaceRoleMap' | 'flatApplicationMaps'
    >,
  ): string[] {
    const { userWorkspaceId, applicationId } = subscriberAuthContext;

    if (!isDefined(userWorkspaceId)) {
      return [];
    }

    const userRoleId = permissionsContext.userWorkspaceRoleMap[userWorkspaceId];

    if (!isDefined(applicationId)) {
      return resolveRoleIdsForUser({
        userRoleId,
        applicationRoleId: undefined,
      });
    }

    // The cache keeps soft-deleted applications, so absence is not enough.
    // An application that has gone away is not one declaring no role: falling
    // back to the user alone would widen a stream that is already open.
    const application = findActiveFlatApplicationById(
      permissionsContext.flatApplicationMaps,
      applicationId,
    );

    if (!isDefined(application)) {
      return [];
    }

    return resolveRoleIdsForUser({
      userRoleId,
      applicationRoleId: application.defaultRoleId,
    });
  }

  private resolveStreamObjectsPermissions(
    roleIds: string[],
    rolesPermissions: ObjectsPermissionsByRoleId,
  ): ObjectsPermissions | undefined {
    const allRolePermissions = roleIds.map(
      (roleId) => rolesPermissions[roleId],
    );

    if (!allRolePermissions.every(isDefined)) {
      return undefined;
    }

    return computePermissionIntersection(allRolePermissions);
  }

  private buildSubscriberRLSFilter(
    subscriberAuthContext: SerializableAuthContext,
    roleIds: string[],
    objectMetadata: FlatObjectMetadata,
    permissionsContext: {
      flatRowLevelPermissionPredicateMaps: FlatRowLevelPermissionPredicateMaps;
      flatRowLevelPermissionPredicateGroupMaps: FlatRowLevelPermissionPredicateGroupMaps;
      flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
    },
    flatWorkspaceMemberMaps: FlatWorkspaceMemberMaps,
  ): RecordGqlOperationFilter | null {
    const workspaceMember = isDefined(subscriberAuthContext.workspaceMemberId)
      ? flatWorkspaceMemberMaps.byId[subscriberAuthContext.workspaceMemberId]
      : undefined;

    return buildRowLevelPermissionRecordFilter({
      flatRowLevelPermissionPredicateMaps:
        permissionsContext.flatRowLevelPermissionPredicateMaps,
      flatRowLevelPermissionPredicateGroupMaps:
        permissionsContext.flatRowLevelPermissionPredicateGroupMaps,
      flatFieldMetadataMaps: permissionsContext.flatFieldMetadataMaps,
      objectMetadata,
      roleIds,
      workspaceMember,
    });
  }

  private buildSubscriberRecordShareGate(
    subscriberAuthContext: SerializableAuthContext,
    roleIds: string[],
    objectMetadata: FlatObjectMetadata,
    featureFlagsMap: Record<FeatureFlagKey, boolean>,
    recordShares: RecordShare[],
  ): RecordShareGate | null {
    if (!featureFlagsMap[FeatureFlagKey.IS_RECORD_SHARING_ENABLED]) {
      return null;
    }

    const gateKind = resolveRecordShareGateKind({
      readability: objectMetadata.readability,
      isOwningApplication: this.isSubscriberOwningApplication(
        subscriberAuthContext,
        objectMetadata,
      ),
    });

    switch (gateKind) {
      case 'open':
        return null;
      case 'deny':
        return DENY_ALL_RECORD_SHARE_GATE;
      case 'private':
        return {
          recordShares,
          principalIds: this.resolveSubscriberPrincipalIds(
            subscriberAuthContext,
            roleIds,
          ),
        };
      default:
        assertUnreachable(gateKind);
    }
  }

  private buildSubscriberLinkedRecordShareGate(
    subscriberAuthContext: SerializableAuthContext,
    roleIds: string[],
    objectMetadata: FlatObjectMetadata,
    linkedRecordShares: LinkedRecordShares | undefined,
  ): LinkedRecordShareGate | null {
    if (
      !isDefined(linkedRecordShares) ||
      this.isSubscriberOwningApplication(subscriberAuthContext, objectMetadata)
    ) {
      return null;
    }

    return {
      gateKindByObjectMetadataId: Object.fromEntries(
        linkedRecordShares.linkedFlatObjectMetadatas.map(
          (linkedFlatObjectMetadata) => [
            linkedFlatObjectMetadata.id,
            resolveRecordShareGateKind({
              readability: linkedFlatObjectMetadata.readability,
              isOwningApplication: this.isSubscriberOwningApplication(
                subscriberAuthContext,
                linkedFlatObjectMetadata,
              ),
            }),
          ],
        ),
      ),
      recordShares: linkedRecordShares.recordShares,
      principalIds: this.resolveSubscriberPrincipalIds(
        subscriberAuthContext,
        roleIds,
      ),
    };
  }

  private isSubscriberOwningApplication(
    subscriberAuthContext: SerializableAuthContext,
    objectMetadata: FlatObjectMetadata,
  ): boolean {
    return (
      isDefined(objectMetadata.applicationId) &&
      subscriberAuthContext.applicationId === objectMetadata.applicationId
    );
  }

  private resolveSubscriberPrincipalIds(
    subscriberAuthContext: SerializableAuthContext,
    roleIds: string[],
  ): string[] {
    return [
      ...new Set(
        [
          EVERYONE_PRINCIPAL_ID,
          subscriberAuthContext.workspaceMemberId,
          ...roleIds,
        ].filter(isDefined),
      ),
    ];
  }

  private filterRestrictedFieldsFromEvent(
    event: ObjectRecordSubscriptionEvent,
    restrictedFields: RestrictedFieldsPermissions | undefined,
    flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>,
  ): ObjectRecordSubscriptionEvent {
    if (!restrictedFields || Object.keys(restrictedFields).length === 0) {
      return event;
    }

    const restrictedFieldNames = new Set(
      Object.entries(restrictedFields)
        .filter(([, permissions]) => permissions.canRead === false)
        .map(([fieldMetadataId]) => {
          const fieldMetadata = findFlatEntityByIdInFlatEntityMaps({
            flatEntityId: fieldMetadataId,
            flatEntityMaps: flatFieldMetadataMaps,
          });

          return fieldMetadata?.name;
        })
        .filter(isDefined),
    );

    if (restrictedFieldNames.size === 0) {
      return event;
    }

    const filterRecord = (record: object | undefined): object | undefined => {
      if (!record) {
        return record;
      }

      return Object.fromEntries(
        Object.entries(record).filter(
          ([key]) => !restrictedFieldNames.has(key),
        ),
      );
    };

    const properties = event.properties as {
      before?: object;
      after?: object;
      updatedFields?: string[];
      diff?: object;
    };

    const filteredBefore = filterRecord(properties.before);
    const filteredAfter = filterRecord(properties.after);
    const filteredDiff = filterRecord(properties.diff);

    const filteredProperties = {
      ...properties,
      ...(filteredBefore !== undefined && { before: filteredBefore }),
      ...(filteredAfter !== undefined && { after: filteredAfter }),
      ...(filteredDiff !== undefined && { diff: filteredDiff }),
      updatedFields: properties.updatedFields?.filter(
        (field) => !restrictedFieldNames.has(field),
      ),
    };

    return {
      ...event,
      properties: filteredProperties,
    } as ObjectRecordSubscriptionEvent;
  }

  private getMatchingObjectRecordQueryIds(
    queries: Record<string, RecordOrMetadataGqlOperationSignature>,
    event: ObjectRecordSubscriptionEvent,
    subscriberRLSFilter: RecordGqlOperationFilter | null,
    subscriberRecordShareGate: RecordShareGate | null,
    subscriberLinkedRecordShareGate: LinkedRecordShareGate | null,
    objectMetadata: FlatObjectMetadata,
    flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>,
  ): string[] {
    const matchedQueryIds: string[] = [];

    for (const [queryId, operationSignature] of Object.entries(queries)) {
      if (!isRecordGqlOperationSignature(operationSignature)) {
        continue;
      }

      if (
        this.isQueryMatchingObjectRecordEvent(
          operationSignature,
          event,
          subscriberRLSFilter,
          subscriberRecordShareGate,
          subscriberLinkedRecordShareGate,
          objectMetadata,
          flatFieldMetadataMaps,
        )
      ) {
        matchedQueryIds.push(queryId);
      }
    }

    return matchedQueryIds;
  }

  private isQueryMatchingObjectRecordEvent(
    operationSignature: RecordGqlOperationSignature,
    event: ObjectRecordSubscriptionEvent,
    subscriberRLSFilter: RecordGqlOperationFilter | null,
    subscriberRecordShareGate: RecordShareGate | null,
    subscriberLinkedRecordShareGate: LinkedRecordShareGate | null,
    objectMetadata: FlatObjectMetadata,
    flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>,
  ): boolean {
    if (operationSignature.objectNameSingular !== event.objectNameSingular) {
      return false;
    }

    const properties = event.properties as {
      after?: object;
      before?: object;
    };

    const deliveredRecord = properties?.after ?? properties?.before;

    if (!isDefined(deliveredRecord)) {
      return false;
    }

    const shouldIgnoreSoftDeleteDefaultFilter =
      event.action === DatabaseEventAction.DELETED ||
      event.action === DatabaseEventAction.RESTORED;

    if (
      isDefined(subscriberRLSFilter) &&
      Object.keys(subscriberRLSFilter).length > 0 &&
      !isRecordMatchingRLSRowLevelPermissionPredicate({
        record: deliveredRecord,
        filter: subscriberRLSFilter,
        flatObjectMetadata: objectMetadata,
        flatFieldMetadataMaps,
        shouldIgnoreSoftDeleteDefaultFilter,
      })
    ) {
      return false;
    }

    if (
      isDefined(subscriberRecordShareGate) &&
      !isRecordSharedWithPrincipals({
        recordShares: subscriberRecordShareGate.recordShares,
        recordId: event.recordId,
        principalIds: subscriberRecordShareGate.principalIds,
        accessLevels: resolveRequiredRecordShareAccessLevels('select'),
      })
    ) {
      return false;
    }

    if (
      isDefined(subscriberLinkedRecordShareGate) &&
      !isLinkedRecordSharedWithPrincipals({
        record: deliveredRecord as Record<string, unknown>,
        linkedRecordShareGate: subscriberLinkedRecordShareGate,
        accessLevels: resolveRequiredRecordShareAccessLevels('select'),
      })
    ) {
      return false;
    }

    const queryFilter = operationSignature.variables?.filter ?? {};

    if (Object.keys(queryFilter).length === 0) {
      return true;
    }

    const candidateRecords =
      event.action === DatabaseEventAction.UPDATED
        ? [properties?.after, properties?.before].filter(isDefined)
        : [deliveredRecord];

    return candidateRecords.some((record) =>
      isRecordMatchingRLSRowLevelPermissionPredicate({
        record,
        filter: queryFilter,
        flatObjectMetadata: objectMetadata,
        flatFieldMetadataMaps,
        shouldIgnoreSoftDeleteDefaultFilter,
      }),
    );
  }

  private async fetchPermissionsContext(
    workspaceId: string,
  ): Promise<StreamPermissionsContext> {
    const {
      flatRowLevelPermissionPredicateMaps,
      flatRowLevelPermissionPredicateGroupMaps,
      flatFieldMetadataMaps,
      userWorkspaceRoleMap,
      rolesPermissions,
      flatApplicationMaps,
      featureFlagsMap,
    } = await this.workspaceCacheService.getOrRecompute(workspaceId, [
      'flatRowLevelPermissionPredicateMaps',
      'flatRowLevelPermissionPredicateGroupMaps',
      'flatFieldMetadataMaps',
      'userWorkspaceRoleMap',
      'rolesPermissions',
      'flatApplicationMaps',
      'featureFlagsMap',
    ]);

    return {
      flatRowLevelPermissionPredicateMaps,
      flatRowLevelPermissionPredicateGroupMaps,
      flatFieldMetadataMaps,
      userWorkspaceRoleMap,
      rolesPermissions,
      flatApplicationMaps,
      featureFlagsMap,
    };
  }
}
