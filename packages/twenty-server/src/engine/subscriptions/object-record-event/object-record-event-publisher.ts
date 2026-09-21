import { Injectable, Logger } from '@nestjs/common';

import {
  EVERYONE_PRINCIPAL_ID,
  QUERY_MAX_RECORDS_FROM_RELATION,
} from 'twenty-shared/constants';
import { type ObjectRecordEvent } from 'twenty-shared/database-events';
import {
  Nullable,
  ObjectRecord,
  type ObjectsPermissions,
  type ObjectsPermissionsByRoleId,
  type RecordGqlOperationFilter,
  type RecordGqlOperationSignature,
} from 'twenty-shared/types';
import {
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
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { UserWorkspaceRoleMap } from 'src/engine/metadata-modules/role-target/types/user-workspace-role-map';
import { type FlatRowLevelPermissionPredicateGroupMaps } from 'src/engine/metadata-modules/row-level-permission-predicate/types/flat-row-level-permission-predicate-group-maps.type';
import { type FlatRowLevelPermissionPredicateMaps } from 'src/engine/metadata-modules/row-level-permission-predicate/types/flat-row-level-permission-predicate-maps.type';
import { RecordAccessPolicyService } from 'src/engine/core-modules/record-share/services/record-access-policy.service';
import { type EventRecordAccessGate } from 'src/engine/core-modules/record-share/types/event-record-access-gate.type';
import { omitInheritedReadabilityChildRecords } from 'src/engine/core-modules/record-share/utils/omit-inherited-readability-child-records.util';
import { omitRestrictedFieldsFromEvent } from 'src/engine/core-modules/record-share/utils/omit-restricted-fields-from-event.util';
import { EventStreamService } from 'src/engine/subscriptions/event-stream.service';
import { SubscriptionService } from 'src/engine/subscriptions/subscription.service';
import {
  type EventStreamData,
  type RecordOrMetadataGqlOperationSignature,
} from 'src/engine/subscriptions/types/event-stream-data.type';
import { type EventStreamPayload } from 'src/engine/subscriptions/types/event-stream-payload.type';
import { ObjectRecordSubscriptionEvent } from 'src/engine/subscriptions/types/object-record-subscription-event.type';
import { RolePermissionConfig } from 'src/engine/twenty-orm/types/role-permission-config';
import { buildRowLevelPermissionRecordFilter } from 'src/engine/twenty-orm/utils/build-row-level-permission-record-filter.util';
import { computePermissionIntersection } from 'src/engine/twenty-orm/utils/compute-permission-intersection.util';
import { type RowAccessPolicySubject } from 'src/engine/twenty-orm/types/row-access-policy.type';
import { isRecordMatchingRLSRowLevelPermissionPredicate } from 'src/engine/twenty-orm/utils/is-record-matching-rls-row-level-permission-predicate.util';
import { resolveRoleIdsForUser } from 'src/engine/twenty-orm/utils/resolve-role-ids-for-user.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { WorkspaceEventBatch } from 'src/engine/workspace-event-emitter/types/workspace-event-batch.type';
import { parseEventNameOrThrow } from 'src/engine/workspace-event-emitter/utils/parse-event-name';

type StreamPermissionsContext = {
  flatRowLevelPermissionPredicateMaps: FlatRowLevelPermissionPredicateMaps;
  flatRowLevelPermissionPredicateGroupMaps: FlatRowLevelPermissionPredicateGroupMaps;
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
  userWorkspaceRoleMap: UserWorkspaceRoleMap;
  rolesPermissions: ObjectsPermissionsByRoleId;
  flatApplicationMaps: FlatApplicationCacheMaps;
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
    private readonly recordAccessPolicyService: RecordAccessPolicyService,
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

    const workspaceMemberIdByUserId = this.buildWorkspaceMemberIdByUserId(
      flatWorkspaceMemberMaps,
    );

    const eventRecordAccessGate =
      this.recordAccessPolicyService.buildEventRecordAccessGate(eventBatch);

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
        workspaceMemberIdByUserId,
        eventRecordAccessGate,
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

  private async processObjectRecordStreamEvents({
    streamChannelId,
    streamData,
    workspaceEventBatch,
    permissionsContext,
    flatWorkspaceMemberMaps,
    workspaceMemberIdByUserId,
    eventRecordAccessGate,
  }: {
    streamChannelId: string;
    streamData: EventStreamData;
    workspaceEventBatch: WorkspaceEventBatch<ObjectRecordEvent>;
    permissionsContext: StreamPermissionsContext;
    flatWorkspaceMemberMaps: FlatWorkspaceMemberMaps;
    workspaceMemberIdByUserId: Map<string, string>;
    eventRecordAccessGate: EventRecordAccessGate;
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

    const objectNameSingular = workspaceEventBatch.objectMetadata.nameSingular;

    if (
      !Object.values(streamData.queries).some(
        (operationSignature) =>
          isRecordGqlOperationSignature(operationSignature) &&
          operationSignature.objectNameSingular === objectNameSingular,
      )
    ) {
      return;
    }

    const matchedEvents: {
      queryIds: string[];
      objectRecordEvent: ObjectRecordSubscriptionEvent;
    }[] = [];

    const subscriberAuthContext: SerializableAuthContext = {
      ...streamData.authContext,
      workspaceMemberId: this.resolveSubscriberWorkspaceMemberId({
        subscriberAuthContext: streamData.authContext,
        workspaceMemberIdByUserId,
      }),
    };

    const subscriberRLSFilter = this.buildSubscriberRLSFilter(
      subscriberAuthContext,
      roleIds,
      workspaceEventBatch.objectMetadata,
      permissionsContext,
      flatWorkspaceMemberMaps,
    );

    const admittedRecordIds =
      await eventRecordAccessGate.resolveAdmittedRecordIds(
        this.buildSubscriberRowAccessPolicySubject({
          subscriberAuthContext,
          roleIds,
          objectsPermissions,
          permissionsContext,
          flatWorkspaceMemberMaps,
        }),
      );

    const restrictedFields = objectPermissions.restrictedFields;

    for (const event of workspaceEventBatch.events) {
      const { action } = parseEventNameOrThrow(workspaceEventBatch.name);

      const eventWithObjectName: ObjectRecordSubscriptionEvent = {
        action,
        objectNameSingular,
        ...omitInheritedReadabilityChildRecords(event),
      };

      const filteredEvent = omitRestrictedFieldsFromEvent({
        event: eventWithObjectName,
        restrictedFields,
        flatFieldMetadataMaps: permissionsContext.flatFieldMetadataMaps,
      });

      const filteredProperties = filteredEvent.properties as {
        updatedFields?: string[];
      };

      if (
        isDefined(filteredProperties.updatedFields) &&
        filteredProperties.updatedFields.length === 0
      ) {
        continue;
      }

      if (!admittedRecordIds.has(filteredEvent.recordId)) {
        continue;
      }

      const matchedQueryIds = this.getMatchingObjectRecordQueryIds({
        queries: streamData.queries,
        event: filteredEvent,
        subscriberRLSFilter,
        objectMetadata: workspaceEventBatch.objectMetadata,
        flatFieldMetadataMaps: permissionsContext.flatFieldMetadataMaps,
      });

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

  private buildWorkspaceMemberIdByUserId(
    flatWorkspaceMemberMaps: FlatWorkspaceMemberMaps,
  ): Map<string, string> {
    const workspaceMemberIdByUserId = new Map<string, string>();

    for (const flatWorkspaceMember of Object.values(
      flatWorkspaceMemberMaps.byId,
    )) {
      if (
        !isDefined(flatWorkspaceMember) ||
        isDefined(flatWorkspaceMember.deletedAt) ||
        !isDefined(flatWorkspaceMember.userId)
      ) {
        continue;
      }

      workspaceMemberIdByUserId.set(
        flatWorkspaceMember.userId,
        flatWorkspaceMember.id,
      );
    }

    return workspaceMemberIdByUserId;
  }

  // A stream created before the member id was stored only carries the user id
  private resolveSubscriberWorkspaceMemberId({
    subscriberAuthContext,
    workspaceMemberIdByUserId,
  }: {
    subscriberAuthContext: SerializableAuthContext;
    workspaceMemberIdByUserId: Map<string, string>;
  }): string | undefined {
    if (isDefined(subscriberAuthContext.workspaceMemberId)) {
      return subscriberAuthContext.workspaceMemberId;
    }

    if (!isDefined(subscriberAuthContext.userId)) {
      return undefined;
    }

    return workspaceMemberIdByUserId.get(subscriberAuthContext.userId);
  }

  private buildSubscriberRowAccessPolicySubject({
    subscriberAuthContext,
    roleIds,
    objectsPermissions,
    permissionsContext,
    flatWorkspaceMemberMaps,
  }: {
    subscriberAuthContext: SerializableAuthContext;
    roleIds: string[];
    objectsPermissions: ObjectsPermissions;
    permissionsContext: StreamPermissionsContext;
    flatWorkspaceMemberMaps: FlatWorkspaceMemberMaps;
  }): RowAccessPolicySubject {
    return {
      objectsPermissions,
      principalIds: [
        EVERYONE_PRINCIPAL_ID,
        subscriberAuthContext.workspaceMemberId,
        ...roleIds,
      ].filter(isDefined),
      isOwningApplication: (objectMetadata) =>
        isDefined(objectMetadata.applicationId) &&
        subscriberAuthContext.applicationId === objectMetadata.applicationId,
      resolveRowLevelPermissionRecordFilter: (objectMetadata) => {
        const recordFilter = this.buildSubscriberRLSFilter(
          subscriberAuthContext,
          roleIds,
          objectMetadata,
          permissionsContext,
          flatWorkspaceMemberMaps,
        );

        return isDefined(recordFilter) && Object.keys(recordFilter).length > 0
          ? recordFilter
          : null;
      },
    };
  }

  private getMatchingObjectRecordQueryIds({
    queries,
    event,
    subscriberRLSFilter,
    objectMetadata,
    flatFieldMetadataMaps,
  }: {
    queries: Record<string, RecordOrMetadataGqlOperationSignature>;
    event: ObjectRecordSubscriptionEvent;
    subscriberRLSFilter: RecordGqlOperationFilter | null;
    objectMetadata: FlatObjectMetadata;
    flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
  }): string[] {
    const matchedQueryIds: string[] = [];

    for (const [queryId, operationSignature] of Object.entries(queries)) {
      if (!isRecordGqlOperationSignature(operationSignature)) {
        continue;
      }

      try {
        if (
          this.isQueryMatchingObjectRecordEvent({
            operationSignature,
            event,
            subscriberRLSFilter,
            objectMetadata,
            flatFieldMetadataMaps,
          })
        ) {
          matchedQueryIds.push(queryId);
        }
      } catch (error) {
        this.logger.warn(
          `Failed to evaluate live query filter for queryId ${queryId} on ${operationSignature.objectNameSingular}: ${
            error instanceof Error ? error.message : String(error)
          }`,
        );
      }
    }

    return matchedQueryIds;
  }

  private isQueryMatchingObjectRecordEvent({
    operationSignature,
    event,
    subscriberRLSFilter,
    objectMetadata,
    flatFieldMetadataMaps,
  }: {
    operationSignature: RecordGqlOperationSignature;
    event: ObjectRecordSubscriptionEvent;
    subscriberRLSFilter: RecordGqlOperationFilter | null;
    objectMetadata: FlatObjectMetadata;
    flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
  }): boolean {
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
      Object.keys(subscriberRLSFilter).length > 0
    ) {
      try {
        if (
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
      } catch (error) {
        this.logger.warn(
          `Failed to evaluate subscriber RLS filter for ${operationSignature.objectNameSingular}: ${
            error instanceof Error ? error.message : String(error)
          }`,
        );
        return false;
      }
    }

    const queryFilter = operationSignature.variables?.filter ?? {};

    if (Object.keys(queryFilter).length === 0) {
      return true;
    }

    const candidateRecords =
      event.action === DatabaseEventAction.UPDATED
        ? [properties?.after, properties?.before].filter(isDefined)
        : [deliveredRecord];

    try {
      return candidateRecords.some((record) =>
        isRecordMatchingRLSRowLevelPermissionPredicate({
          record,
          filter: queryFilter,
          flatObjectMetadata: objectMetadata,
          flatFieldMetadataMaps,
          shouldIgnoreSoftDeleteDefaultFilter,
        }),
      );
    } catch (error) {
      this.logger.warn(
        `Failed to evaluate live query filter for ${operationSignature.objectNameSingular}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
      return false;
    }
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
    } = await this.workspaceCacheService.getOrRecompute(workspaceId, [
      'flatRowLevelPermissionPredicateMaps',
      'flatRowLevelPermissionPredicateGroupMaps',
      'flatFieldMetadataMaps',
      'userWorkspaceRoleMap',
      'rolesPermissions',
      'flatApplicationMaps',
    ]);

    return {
      flatRowLevelPermissionPredicateMaps,
      flatRowLevelPermissionPredicateGroupMaps,
      flatFieldMetadataMaps,
      userWorkspaceRoleMap,
      rolesPermissions,
      flatApplicationMaps,
    };
  }
}
