import { Injectable } from '@nestjs/common';

import { type ObjectRecordEvent } from 'twenty-shared/database-events';
import { type RecordGqlOperationFilter } from 'twenty-shared/types';
import { combineFilters, isDefined } from 'twenty-shared/utils';

import { type SerializableAuthContext } from 'src/engine/core-modules/auth/types/auth-context.type';
import { transformEventToWebhookEvent } from 'src/engine/core-modules/webhook/utils/transform-event-to-webhook-event';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type FlatRowLevelPermissionPredicateGroupMaps } from 'src/engine/metadata-modules/row-level-permission-predicate/types/flat-row-level-permission-predicate-group-maps.type';
import { type FlatRowLevelPermissionPredicateMaps } from 'src/engine/metadata-modules/row-level-permission-predicate/types/flat-row-level-permission-predicate-maps.type';
import { SubscriptionChannel } from 'src/engine/subscriptions/enums/subscription-channel.enum';
import { EventStreamService } from 'src/engine/subscriptions/event-stream.service';
import { SubscriptionService } from 'src/engine/subscriptions/subscription.service';
import { type EventStreamData } from 'src/engine/subscriptions/types/event-stream-data.type';
import { buildRowLevelPermissionRecordFilter } from 'src/engine/twenty-orm/utils/build-row-level-permission-record-filter.util';
import { isRecordMatchingRLSRowLevelPermissionPredicate } from 'src/engine/twenty-orm/utils/is-record-matching-rls-row-level-permission-predicate.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { WorkspaceEventBatch } from 'src/engine/workspace-event-emitter/types/workspace-event-batch.type';

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

    const rlsContext = await this.fetchRLSContext(workspaceId);

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
        rlsContext,
      );
    }

    await this.eventStreamService.removeFromActiveStreams(
      workspaceId,
      streamIdsToRemove,
    );
  }

  private async fetchRLSContext(workspaceId: string): Promise<{
    flatRowLevelPermissionPredicateMaps: FlatRowLevelPermissionPredicateMaps;
    flatRowLevelPermissionPredicateGroupMaps: FlatRowLevelPermissionPredicateGroupMaps;
    flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
    userWorkspaceRoleMap: Record<string, string>;
  }> {
    const {
      flatRowLevelPermissionPredicateMaps,
      flatRowLevelPermissionPredicateGroupMaps,
      flatFieldMetadataMaps,
      userWorkspaceRoleMap,
    } = await this.workspaceCacheService.getOrRecompute(workspaceId, [
      'flatRowLevelPermissionPredicateMaps',
      'flatRowLevelPermissionPredicateGroupMaps',
      'flatFieldMetadataMaps',
      'userWorkspaceRoleMap',
    ]);

    return {
      flatRowLevelPermissionPredicateMaps,
      flatRowLevelPermissionPredicateGroupMaps,
      flatFieldMetadataMaps,
      userWorkspaceRoleMap,
    };
  }

  private async processStreamEvents(
    streamChannelId: string,
    streamData: EventStreamData,
    workspaceEventBatch: WorkspaceEventBatch<ObjectRecordEvent>,
    rlsContext: {
      flatRowLevelPermissionPredicateMaps: FlatRowLevelPermissionPredicateMaps;
      flatRowLevelPermissionPredicateGroupMaps: FlatRowLevelPermissionPredicateGroupMaps;
      flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
      userWorkspaceRoleMap: Record<string, string>;
    },
  ): Promise<void> {
    const matchedEvents: {
      queryIds: string[];
      event: ObjectRecordEvent & { objectNameSingular: string };
    }[] = [];

    const objectNameSingular = workspaceEventBatch.objectMetadata.nameSingular;

    const subscriberRLSFilter = this.buildSubscriberRLSFilter(
      streamData.authContext,
      workspaceEventBatch.objectMetadata,
      rlsContext,
    );

    for (const event of workspaceEventBatch.events) {
      const eventWithObjectName = {
        objectNameSingular,
        ...event,
      };

      const matchedQueryIds = this.matchQueriesWithEventAndRLS(
        streamData.queries,
        eventWithObjectName,
        subscriberRLSFilter,
        workspaceEventBatch.objectMetadata,
        rlsContext.flatFieldMetadataMaps,
      );

      if (matchedQueryIds.length === 0) {
        continue;
      }

      matchedEvents.push({
        queryIds: matchedQueryIds,
        event: eventWithObjectName,
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
    objectMetadata: FlatObjectMetadata,
    rlsContext: {
      flatRowLevelPermissionPredicateMaps: FlatRowLevelPermissionPredicateMaps;
      flatRowLevelPermissionPredicateGroupMaps: FlatRowLevelPermissionPredicateGroupMaps;
      flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
      userWorkspaceRoleMap: Record<string, string>;
    },
  ): RecordGqlOperationFilter | null {
    const roleId = subscriberAuthContext.userWorkspaceId
      ? rlsContext.userWorkspaceRoleMap[subscriberAuthContext.userWorkspaceId]
      : undefined;

    if (!roleId) {
      return null;
    }

    return buildRowLevelPermissionRecordFilter({
      flatRowLevelPermissionPredicateMaps:
        rlsContext.flatRowLevelPermissionPredicateMaps,
      flatRowLevelPermissionPredicateGroupMaps:
        rlsContext.flatRowLevelPermissionPredicateGroupMaps,
      flatFieldMetadataMaps: rlsContext.flatFieldMetadataMaps,
      objectMetadata,
      roleId,
      // Note: For dynamic predicates, we would need to load workspaceMember data
      authContext: {
        userWorkspaceId: subscriberAuthContext.userWorkspaceId,
      },
    });
  }

  private matchQueriesWithEventAndRLS(
    queries: Record<
      string,
      {
        objectNameSingular: string;
        variables?: { filter?: RecordGqlOperationFilter };
      }
    >,
    event: ObjectRecordEvent & { objectNameSingular: string },
    subscriberRLSFilter: RecordGqlOperationFilter | null,
    objectMetadata: FlatObjectMetadata,
    flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>,
  ): string[] {
    const matchedQueryIds: string[] = [];

    for (const [queryId, operationSignature] of Object.entries(queries)) {
      if (
        this.isQueryMatchingEventWithRLS(
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

  private isQueryMatchingEventWithRLS(
    operationSignature: {
      objectNameSingular: string;
      variables?: { filter?: RecordGqlOperationFilter };
    },
    event: ObjectRecordEvent & { objectNameSingular: string },
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

    return isRecordMatchingRLSRowLevelPermissionPredicate({
      record,
      filter: combinedFilter,
      flatObjectMetadata: objectMetadata,
      flatFieldMetadataMaps,
    });
  }
}
