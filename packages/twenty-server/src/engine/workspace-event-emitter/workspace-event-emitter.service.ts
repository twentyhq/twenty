import { Injectable } from '@nestjs/common';

import { QUERY_MAX_RECORDS_FROM_RELATION } from 'twenty-shared/constants';
import { type ObjectRecordEvent } from 'twenty-shared/database-events';
import {
  Nullable,
  ObjectRecord,
  type ObjectsPermissionsByRoleId,
  type RecordGqlOperationFilter,
  type RecordGqlOperationSignature,
  type RestrictedFieldsPermissions,
} from 'twenty-shared/types';
import {
  combineFilters,
  isDefined,
  isMetadataGqlOperationSignature,
  isNonEmptyArray,
  isRecordGqlOperationSignature,
} from 'twenty-shared/utils';
import { FindOptionsRelations, ObjectLiteral } from 'typeorm';

import { ProcessNestedRelationsHelper } from 'src/engine/api/common/common-nested-relations-processor/process-nested-relations.helper';
import { CommonSelectFieldsHelper } from 'src/engine/api/common/common-select-fields/common-select-fields-helper';
import { DatabaseEventAction } from 'src/engine/api/graphql/graphql-query-runner/enums/database-event-action';
import { GraphqlQueryParser } from 'src/engine/api/graphql/graphql-query-runner/graphql-query-parsers/graphql-query.parser';
import { type SerializableAuthContext } from 'src/engine/core-modules/auth/types/auth-context.type';
import { type FlatWorkspaceMemberMaps } from 'src/engine/core-modules/user/types/flat-workspace-member-maps.type';
import { type MetadataEventBatch } from 'src/engine/metadata-event-emitter/types/metadata-event-batch.type';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { UserWorkspaceRoleMap } from 'src/engine/metadata-modules/role-target/types/user-workspace-role-map';
import { type FlatRowLevelPermissionPredicateGroupMaps } from 'src/engine/metadata-modules/row-level-permission-predicate/types/flat-row-level-permission-predicate-group-maps.type';
import { type FlatRowLevelPermissionPredicateMaps } from 'src/engine/metadata-modules/row-level-permission-predicate/types/flat-row-level-permission-predicate-maps.type';
import { transformEventToWebhookEvent } from 'src/engine/metadata-modules/webhook/utils/transform-event-to-webhook-event';
import { SubscriptionChannel } from 'src/engine/subscriptions/enums/subscription-channel.enum';
import { EventStreamService } from 'src/engine/subscriptions/event-stream.service';
import { SubscriptionService } from 'src/engine/subscriptions/subscription.service';
import {
  type EventStreamData,
  type RecordOrMetadataGqlOperationSignature,
} from 'src/engine/subscriptions/types/event-stream-data.type';
import { type EventStreamPayload } from 'src/engine/subscriptions/types/event-stream-payload.type';
import { ObjectRecordSubscriptionEvent } from 'src/engine/subscriptions/types/object-record-subscription-event.type';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { RolePermissionConfig } from 'src/engine/twenty-orm/types/role-permission-config';
import { buildRowLevelPermissionRecordFilter } from 'src/engine/twenty-orm/utils/build-row-level-permission-record-filter.util';
import { isRecordMatchingRLSRowLevelPermissionPredicate } from 'src/engine/twenty-orm/utils/is-record-matching-rls-row-level-permission-predicate.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { WorkspaceEventBatch } from 'src/engine/workspace-event-emitter/types/workspace-event-batch.type';
import { isMetadataRecordMatchingFilter } from 'src/engine/workspace-event-emitter/utils/is-metadata-record-matching-filter.util';
import { parseEventNameOrThrow } from 'src/engine/workspace-event-emitter/utils/parse-event-name';
import { type MetadataEvent } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/metadata-event';

@Injectable()
export class WorkspaceEventEmitterService {
  constructor(
    private readonly subscriptionService: SubscriptionService,
    private readonly eventStreamService: EventStreamService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly processNestedRelationsHelper: ProcessNestedRelationsHelper,
    private readonly workspaceManyOrAllFlatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
    private readonly commonSelectFieldsHelper: CommonSelectFieldsHelper,
  ) {}

  async publish(
    eventBatch: WorkspaceEventBatch<ObjectRecordEvent> | MetadataEventBatch,
  ): Promise<void> {
    if (!this.isMetadataEventBatch(eventBatch)) {
      await this.publishToLegacyChannel(eventBatch);
    }

    await this.publishToEventStreams(eventBatch);
  }

  private isMetadataEventBatch(
    eventBatch: WorkspaceEventBatch<ObjectRecordEvent> | MetadataEventBatch,
  ): eventBatch is MetadataEventBatch {
    return 'metadataName' in eventBatch;
  }

  private async publishToLegacyChannel(
    eventBatch: WorkspaceEventBatch<ObjectRecordEvent>,
  ): Promise<void> {
    const [nameSingular, operation] = eventBatch.name.split('.');

    for (const eventData of eventBatch.events) {
      const { record, updatedFields } = transformEventToWebhookEvent({
        eventName: eventBatch.name,
        event: eventData,
      });

      const event = {
        action: operation,
        objectNameSingular: nameSingular,
        eventDate: new Date(),
        record,
        ...(updatedFields && { updatedFields }),
      };

      await this.subscriptionService.publish({
        channel: SubscriptionChannel.DATABASE_EVENT_CHANNEL,
        workspaceId: eventBatch.workspaceId,
        payload: { onDbEvent: event },
      });
    }
  }

  private async publishToEventStreams(
    eventBatch: WorkspaceEventBatch<ObjectRecordEvent> | MetadataEventBatch,
  ): Promise<void> {
    const workspaceId = eventBatch.workspaceId;
    const isMetadata = this.isMetadataEventBatch(eventBatch);

    const activeStreamIds =
      await this.eventStreamService.getActiveStreamIds(workspaceId);

    if (activeStreamIds.length === 0) {
      return;
    }

    const streamsData = await this.eventStreamService.getStreamsData(
      workspaceId,
      activeStreamIds,
    );

    const streamIdsToRemove: string[] = [];

    const objectRecordStreamContext = !isMetadata
      ? await this.fetchObjectRecordStreamContext(workspaceId)
      : undefined;

    for (const [streamChannelId, streamData] of streamsData) {
      if (!isDefined(streamData)) {
        streamIdsToRemove.push(streamChannelId);
        continue;
      }

      if (Object.keys(streamData.queries).length === 0) {
        continue;
      }

      if (isMetadata) {
        await this.processMetadataStreamEvents(
          streamChannelId,
          streamData,
          eventBatch as MetadataEventBatch,
        );
      } else {
        if (!isDefined(objectRecordStreamContext)) {
          continue;
        }

        await this.processObjectRecordStreamEvents(
          streamChannelId,
          streamData,
          eventBatch as WorkspaceEventBatch<ObjectRecordEvent>,
          objectRecordStreamContext.permissionsContext,
          objectRecordStreamContext.flatWorkspaceMemberMaps,
        );
      }
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

  private async processMetadataStreamEvents(
    streamChannelId: string,
    streamData: EventStreamData,
    metadataEventBatch: MetadataEventBatch,
  ): Promise<void> {
    const metadataEventsWithQueryIds: {
      queryIds: string[];
      metadataEvent: MetadataEvent;
    }[] = [];

    for (const metadataEvent of metadataEventBatch.events) {
      const matchedQueryIds = this.getMatchingMetadataQueryIds(
        streamData.queries,
        metadataEvent,
      );

      if (!isNonEmptyArray(matchedQueryIds)) {
        continue;
      }

      metadataEventsWithQueryIds.push({
        queryIds: matchedQueryIds,
        metadataEvent,
      });
    }

    if (!isNonEmptyArray(metadataEventsWithQueryIds)) {
      return;
    }

    const payload: EventStreamPayload = {
      objectRecordEventsWithQueryIds: [],
      metadataEventsWithQueryIds,
    };

    await this.subscriptionService.publishToEventStream({
      workspaceId: metadataEventBatch.workspaceId,
      eventStreamChannelId: streamChannelId,
      payload,
    });
  }

  private getMatchingMetadataQueryIds(
    queries: Record<string, RecordOrMetadataGqlOperationSignature>,
    metadataEvent: MetadataEvent,
  ): string[] {
    const properties = metadataEvent.properties as {
      after?: Record<string, unknown>;
      before?: Record<string, unknown>;
    };

    const record = properties?.after ?? properties?.before;

    return Object.entries(queries)
      .filter(([, operationSignature]) => {
        if (!isMetadataGqlOperationSignature(operationSignature)) {
          return false;
        }

        if (operationSignature.metadataName !== metadataEvent.metadataName) {
          return false;
        }

        const queryFilter = (
          operationSignature.variables as {
            filter?: Record<string, unknown>;
          }
        )?.filter;

        if (!isDefined(queryFilter) || Object.keys(queryFilter).length === 0) {
          return true;
        }

        if (!isDefined(record)) {
          return false;
        }

        return isMetadataRecordMatchingFilter({
          record,
          filter: queryFilter,
        });
      })
      .map(([queryId]) => queryId);
  }

  private async processObjectRecordStreamEvents(
    streamChannelId: string,
    streamData: EventStreamData,
    workspaceEventBatch: WorkspaceEventBatch<ObjectRecordEvent>,
    permissionsContext: {
      flatRowLevelPermissionPredicateMaps: FlatRowLevelPermissionPredicateMaps;
      flatRowLevelPermissionPredicateGroupMaps: FlatRowLevelPermissionPredicateGroupMaps;
      flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
      userWorkspaceRoleMap: Record<string, string>;
      rolesPermissions: ObjectsPermissionsByRoleId;
    },
    flatWorkspaceMemberMaps: FlatWorkspaceMemberMaps,
  ): Promise<void> {
    const { userWorkspaceId } = streamData.authContext;

    if (!isDefined(userWorkspaceId)) {
      return;
    }

    const roleId = permissionsContext.userWorkspaceRoleMap[userWorkspaceId];

    if (!isDefined(roleId)) {
      return;
    }

    const objectPermissions =
      permissionsContext.rolesPermissions[roleId]?.[
        workspaceEventBatch.objectMetadata.id
      ];

    if (!objectPermissions?.canReadObjectRecords) {
      return;
    }

    const matchedEvents: {
      queryIds: string[];
      objectRecordEvent: ObjectRecordSubscriptionEvent;
    }[] = [];

    const objectNameSingular = workspaceEventBatch.objectMetadata.nameSingular;

    const subscriberRLSFilter = await this.buildSubscriberRLSFilter(
      streamData.authContext,
      roleId,
      workspaceEventBatch.objectMetadata,
      permissionsContext,
      flatWorkspaceMemberMaps,
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
      await this.enrichEventBatchWithNestedRelations({
        objectMetadata: workspaceEventBatch.objectMetadata,
        events: matchedEvents.map((e) => e.objectRecordEvent),
        streamData,
        permissionsContext,
        workspaceId: workspaceEventBatch.workspaceId,
        roleId,
      });

      const payload: EventStreamPayload = {
        objectRecordEventsWithQueryIds: matchedEvents,
        metadataEventsWithQueryIds: [],
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
    permissionsContext,
    roleId,
  }: {
    streamData: EventStreamData;
    objectMetadata: FlatObjectMetadata;
    events: ObjectRecordEvent[];
    workspaceId: string;
    roleId: string;
    permissionsContext: {
      flatRowLevelPermissionPredicateMaps: FlatRowLevelPermissionPredicateMaps;
      flatRowLevelPermissionPredicateGroupMaps: FlatRowLevelPermissionPredicateGroupMaps;
      flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
      userWorkspaceRoleMap: UserWorkspaceRoleMap;
      rolesPermissions: ObjectsPermissionsByRoleId;
    };
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
      intersectionOf: [roleId],
    };

    const globalWorkspaceDataSource =
      await this.globalWorkspaceOrmManager.getGlobalWorkspaceDataSourceReplica();

    const selectedFields = this.commonSelectFieldsHelper.computeFromDepth({
      depth: 1,
      flatObjectMetadata: objectMetadata,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
      objectsPermissions: permissionsContext.rolesPermissions[roleId],
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
      authContext: streamData.authContext,
      limit: QUERY_MAX_RECORDS_FROM_RELATION,
      rolePermissionConfig,
      workspaceDataSource: globalWorkspaceDataSource,
      relations: selectedFieldsResult.relations as Record<
        string,
        FindOptionsRelations<ObjectLiteral>
      >,
      selectedFields: selectedFieldsResult.select,
    });
  }

  private buildSubscriberRLSFilter(
    subscriberAuthContext: SerializableAuthContext,
    roleId: string,
    objectMetadata: FlatObjectMetadata,
    permissionsContext: {
      flatRowLevelPermissionPredicateMaps: FlatRowLevelPermissionPredicateMaps;
      flatRowLevelPermissionPredicateGroupMaps: FlatRowLevelPermissionPredicateGroupMaps;
      flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
    },
    flatWorkspaceMemberMaps: FlatWorkspaceMemberMaps,
  ): Promise<RecordGqlOperationFilter | null> {
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
      roleId,
      authContext: {
        userWorkspaceId: subscriberAuthContext.userWorkspaceId,
        workspaceMemberId: subscriberAuthContext.workspaceMemberId,
        workspaceMember,
      },
    });
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

    const record = properties?.after ?? properties?.before;

    if (!isDefined(record)) {
      return false;
    }

    const queryFilter = operationSignature.variables?.filter ?? {};

    const filtersToApply: RecordGqlOperationFilter[] = [queryFilter];

    if (subscriberRLSFilter && Object.keys(subscriberRLSFilter).length > 0) {
      filtersToApply.push(subscriberRLSFilter);
    }

    const combinedFilter = combineFilters(filtersToApply);

    if (Object.keys(combinedFilter).length === 0) {
      return true;
    }

    const shouldIgnoreSoftDeleteDefaultFilter =
      event.action === DatabaseEventAction.DELETED ||
      event.action === DatabaseEventAction.RESTORED;

    return isRecordMatchingRLSRowLevelPermissionPredicate({
      record,
      filter: combinedFilter,
      flatObjectMetadata: objectMetadata,
      flatFieldMetadataMaps,
      shouldIgnoreSoftDeleteDefaultFilter,
    });
  }

  private async fetchPermissionsContext(workspaceId: string): Promise<{
    flatRowLevelPermissionPredicateMaps: FlatRowLevelPermissionPredicateMaps;
    flatRowLevelPermissionPredicateGroupMaps: FlatRowLevelPermissionPredicateGroupMaps;
    flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
    userWorkspaceRoleMap: Record<string, string>;
    rolesPermissions: ObjectsPermissionsByRoleId;
  }> {
    const {
      flatRowLevelPermissionPredicateMaps,
      flatRowLevelPermissionPredicateGroupMaps,
      flatFieldMetadataMaps,
      userWorkspaceRoleMap,
      rolesPermissions,
    } = await this.workspaceCacheService.getOrRecompute(workspaceId, [
      'flatRowLevelPermissionPredicateMaps',
      'flatRowLevelPermissionPredicateGroupMaps',
      'flatFieldMetadataMaps',
      'userWorkspaceRoleMap',
      'rolesPermissions',
    ]);

    return {
      flatRowLevelPermissionPredicateMaps,
      flatRowLevelPermissionPredicateGroupMaps,
      flatFieldMetadataMaps,
      userWorkspaceRoleMap,
      rolesPermissions,
    };
  }
}
