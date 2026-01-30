import { Injectable } from '@nestjs/common';

import { type ObjectRecordEvent } from 'twenty-shared/database-events';
import {
  type ObjectsPermissionsByRoleId,
  type RecordGqlOperationFilter,
  type RestrictedFieldsPermissions,
} from 'twenty-shared/types';
import { combineFilters, isDefined } from 'twenty-shared/utils';

import { DatabaseEventAction } from 'src/engine/api/graphql/graphql-query-runner/enums/database-event-action';
import { type SerializableAuthContext } from 'src/engine/core-modules/auth/types/auth-context.type';
import { type FlatWorkspaceMemberMaps } from 'src/engine/core-modules/user/types/flat-workspace-member-maps.type';
import { transformEventToWebhookEvent } from 'src/engine/metadata-modules/webhook/utils/transform-event-to-webhook-event';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type FlatRowLevelPermissionPredicateGroupMaps } from 'src/engine/metadata-modules/row-level-permission-predicate/types/flat-row-level-permission-predicate-group-maps.type';
import { type FlatRowLevelPermissionPredicateMaps } from 'src/engine/metadata-modules/row-level-permission-predicate/types/flat-row-level-permission-predicate-maps.type';
import { SubscriptionChannel } from 'src/engine/subscriptions/enums/subscription-channel.enum';
import { EventStreamService } from 'src/engine/subscriptions/event-stream.service';
import { SubscriptionService } from 'src/engine/subscriptions/subscription.service';
import { type EventStreamData } from 'src/engine/subscriptions/types/event-stream-data.type';
import { ObjectRecordSubscriptionEvent } from 'src/engine/subscriptions/types/object-record-subscription-event.type';
import { buildRowLevelPermissionRecordFilter } from 'src/engine/twenty-orm/utils/build-row-level-permission-record-filter.util';
import { isRecordMatchingRLSRowLevelPermissionPredicate } from 'src/engine/twenty-orm/utils/is-record-matching-rls-row-level-permission-predicate.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { WorkspaceEventBatch } from 'src/engine/workspace-event-emitter/types/workspace-event-batch.type';
import { parseEventNameOrThrow } from 'src/engine/workspace-event-emitter/utils/parse-event-name';

@Injectable()
export class WorkspaceEventEmitterService {
  constructor(
    private readonly subscriptionService: SubscriptionService,
    private readonly eventStreamService: EventStreamService,
    private readonly workspaceCacheService: WorkspaceCacheService,
  ) {}

  async publish(
    workspaceEventBatch: WorkspaceEventBatch<ObjectRecordEvent>,
  ): Promise<void> {
    const [nameSingular, operation] = workspaceEventBatch.name.split('.');

    for (const eventData of workspaceEventBatch.events) {
      const { record, updatedFields } = transformEventToWebhookEvent({
        eventName: workspaceEventBatch.name,
        event: eventData,
      });

      const event = {
        action: operation,
        objectNameSingular: nameSingular,
        eventDate: new Date(),
        record,
        ...(updatedFields && { updatedFields }),
      };

      // Publish individual events to legacy channel (onDbEvent)
      await this.subscriptionService.publish({
        channel: SubscriptionChannel.DATABASE_EVENT_CHANNEL,
        workspaceId: workspaceEventBatch.workspaceId,
        payload: { onDbEvent: event },
      });
    }

    await this.publishToEventStreams(workspaceEventBatch);
  }

  private async publishToEventStreams(
    workspaceEventBatch: WorkspaceEventBatch<ObjectRecordEvent>,
  ): Promise<void> {
    const workspaceId = workspaceEventBatch.workspaceId;

    const activeStreamIds =
      await this.eventStreamService.getActiveStreamIds(workspaceId);

    if (activeStreamIds.length === 0) {
      return;
    }

    const streamsData = await this.eventStreamService.getStreamsData(
      workspaceId,
      activeStreamIds,
    );

    const permissionsContext = await this.fetchPermissionsContext(workspaceId);

    const { flatWorkspaceMemberMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatWorkspaceMemberMaps',
      ]);

    const streamIdsToRemove: string[] = [];

    for (const [streamChannelId, streamData] of streamsData) {
      if (!isDefined(streamData)) {
        streamIdsToRemove.push(streamChannelId);
        continue;
      }

      if (Object.keys(streamData.queries).length === 0) {
        continue;
      }

      await this.processStreamEvents(
        streamChannelId,
        streamData,
        workspaceEventBatch,
        permissionsContext,
        flatWorkspaceMemberMaps,
      );
    }

    await this.eventStreamService.removeFromActiveStreams(
      workspaceId,
      streamIdsToRemove,
    );
  }

  private async processStreamEvents(
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
      event: ObjectRecordEvent & { objectNameSingular: string };
    }[] = [];

    const objectNameSingular = workspaceEventBatch.objectMetadata.nameSingular;

    const subscriberRLSFilter = this.buildSubscriberRLSFilter(
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

      const matchedQueryIds = this.getMatchingQueryIds(
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
        event: filteredEvent,
      });
    }

    if (matchedEvents.length > 0) {
      await this.subscriptionService.publishToEventStream({
        workspaceId: workspaceEventBatch.workspaceId,
        eventStreamChannelId: streamChannelId,
        payload: matchedEvents,
      });
    }
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
          const fieldMetadata = flatFieldMetadataMaps.byId[fieldMetadataId];

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

  private getMatchingQueryIds(
    queries: Record<
      string,
      {
        objectNameSingular: string;
        variables?: { filter?: RecordGqlOperationFilter };
      }
    >,
    event: ObjectRecordSubscriptionEvent,
    subscriberRLSFilter: RecordGqlOperationFilter | null,
    objectMetadata: FlatObjectMetadata,
    flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>,
  ): string[] {
    const matchedQueryIds: string[] = [];

    for (const [queryId, operationSignature] of Object.entries(queries)) {
      if (
        this.isQueryMatchingEvent(
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

  private isQueryMatchingEvent(
    operationSignature: {
      objectNameSingular: string;
      variables?: { filter?: RecordGqlOperationFilter };
    },
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
