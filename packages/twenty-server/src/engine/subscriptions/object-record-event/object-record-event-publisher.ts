import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { Injectable, Logger } from '@nestjs/common';

import { QUERY_MAX_RECORDS_FROM_RELATION } from 'twenty-shared/constants';
import { type ObjectRecordEvent } from 'twenty-shared/database-events';
import {
  Nullable,
  ObjectRecord,
  type ObjectsPermissions,
  type RecordGqlOperationSignature,
} from 'twenty-shared/types';
import { isDefined, isRecordGqlOperationSignature } from 'twenty-shared/utils';
import { FindOptionsRelations, ObjectLiteral } from 'typeorm';

import { ProcessNestedRelationsHelper } from 'src/engine/api/common/common-nested-relations-processor/process-nested-relations.helper';
import { CommonSelectFieldsBuilder } from 'src/engine/api/common/common-select-fields/common-select-fields-builder';
import { DatabaseEventAction } from 'src/engine/api/graphql/graphql-query-runner/enums/database-event-action';
import { GraphqlQueryParser } from 'src/engine/api/graphql/graphql-query-runner/graphql-query-parsers/graphql-query.parser';
import { type SerializableAuthContext } from 'src/engine/core-modules/auth/types/serializable-auth-context.type';
import { type FlatWorkspaceMemberMaps } from 'src/engine/core-modules/user/types/flat-workspace-member-maps.type';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type FlatRowLevelPermissionPredicateGroupMaps } from 'src/engine/metadata-modules/row-level-permission-predicate/types/flat-row-level-permission-predicate-group-maps.type';
import { type FlatRowLevelPermissionPredicateMaps } from 'src/engine/metadata-modules/row-level-permission-predicate/types/flat-row-level-permission-predicate-maps.type';
import { RecordAccessPolicyService } from 'src/engine/permissions/combine/services/record-access-policy.service';
import { type EventRecordAccessGate } from 'src/engine/permissions/combine/types/event-record-access-gate.type';
import { omitRestrictedFieldsFromEvent } from 'src/engine/permissions/masking/utils/omit-restricted-fields-from-event.util';
import { EventStreamService } from 'src/engine/subscriptions/event-stream.service';
import { SubscriptionService } from 'src/engine/subscriptions/subscription.service';
import {
  type EventStreamData,
  type RecordOrMetadataGqlOperationSignature,
} from 'src/engine/subscriptions/types/event-stream-data.type';
import { type EventStreamPayload } from 'src/engine/subscriptions/types/event-stream-payload.type';
import { ObjectRecordSubscriptionEvent } from 'src/engine/subscriptions/types/object-record-subscription-event.type';
import { isRecordMatchingRLSRowLevelPermissionPredicate } from 'src/engine/permissions/rls/utils/is-record-matching-rls-row-level-permission-predicate.util';
import { UserWorkspaceAuthContextService } from 'src/engine/core-modules/user-workspace/services/user-workspace-auth-context.service';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { type PermissionsPrincipalsContext } from 'src/engine/permissions/principal/types/permissions-principals-context.type';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { WorkspaceEventBatch } from 'src/engine/workspace-event-emitter/types/workspace-event-batch.type';
import { parseEventNameOrThrow } from 'src/engine/workspace-event-emitter/utils/parse-event-name';
import { buildPermissionsPrincipalsContext } from 'src/engine/permissions/principal/utils/build-permissions-principals-context.util';

type StreamPermissionsContext = {
  flatRowLevelPermissionPredicateMaps: FlatRowLevelPermissionPredicateMaps;
  flatRowLevelPermissionPredicateGroupMaps: FlatRowLevelPermissionPredicateGroupMaps;
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
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
    private readonly commonSelectFieldsBuilder: CommonSelectFieldsBuilder,
    private readonly recordAccessPolicyService: RecordAccessPolicyService,
    private readonly workspaceOrmManager: WorkspaceOrmManager,
    private readonly userWorkspaceAuthContextService: UserWorkspaceAuthContextService,
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
    const subscriberAuthContexts = new Map<
      string,
      Promise<WorkspaceAuthContext>
    >();

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
        workspaceMemberIdByUserId,
        eventRecordAccessGate,
        subscriberAuthContexts,
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
    workspaceMemberIdByUserId,
    eventRecordAccessGate,
    subscriberAuthContexts,
  }: {
    streamChannelId: string;
    streamData: EventStreamData;
    workspaceEventBatch: WorkspaceEventBatch<ObjectRecordEvent>;
    permissionsContext: StreamPermissionsContext;
    workspaceMemberIdByUserId: Map<string, string>;
    eventRecordAccessGate: EventRecordAccessGate;
    subscriberAuthContexts: Map<string, Promise<WorkspaceAuthContext>>;
  }): Promise<void> {
    const subscriberAuthContext: SerializableAuthContext = {
      ...streamData.authContext,
      workspaceMemberId: this.resolveSubscriberWorkspaceMemberId({
        subscriberAuthContext: streamData.authContext,
        workspaceMemberIdByUserId,
      }),
    };
    const { userWorkspaceId, workspaceMemberId } = subscriberAuthContext;

    if (!isDefined(userWorkspaceId) || !isDefined(workspaceMemberId)) {
      return;
    }

    const principals = buildPermissionsPrincipalsContext({
      workspaceId: workspaceEventBatch.workspaceId,
      workspaceMemberId,
      apiKeyId: undefined,
      applicationId: subscriberAuthContext.applicationId,
      agentId: undefined,
    });

    if (!isDefined(principals)) {
      return;
    }

    const objectsPermissions =
      await this.recordAccessPolicyService.findObjectsPermissions(principals);

    if (!isDefined(objectsPermissions)) {
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

    const admittedRecordIds =
      await eventRecordAccessGate.resolveAdmittedRecordIds(principals);

    if (admittedRecordIds.size === 0) {
      return;
    }

    for (const event of workspaceEventBatch.events) {
      const { action } = parseEventNameOrThrow(workspaceEventBatch.name);

      const eventWithObjectName: ObjectRecordSubscriptionEvent = {
        action,
        objectNameSingular,
        ...event,
      };

      const filteredEvent = omitRestrictedFieldsFromEvent({
        event: eventWithObjectName,
        objectMetadata: workspaceEventBatch.objectMetadata,
        objectsPermissions,
        flatObjectMetadataMaps: permissionsContext.flatObjectMetadataMaps,
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
          workspaceId: workspaceEventBatch.workspaceId,
          subscriberAuthContext: this.findSubscriberAuthContext({
            subscriberAuthContexts,
            workspaceId: workspaceEventBatch.workspaceId,
            userWorkspaceId,
            applicationId: subscriberAuthContext.applicationId,
          }),
          principals,
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
    objectMetadata,
    events,
    workspaceId,
    subscriberAuthContext,
    principals,
    objectsPermissions,
  }: {
    objectMetadata: FlatObjectMetadata;
    events: ObjectRecordEvent[];
    workspaceId: string;
    subscriberAuthContext: Promise<WorkspaceAuthContext>;
    principals: PermissionsPrincipalsContext;
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

    const { selectedFields } = this.commonSelectFieldsBuilder.buildFromDepth({
      readableObjectMetadataIds:
        await this.commonSelectFieldsBuilder.findReadableObjectMetadataIds({
          principals,
          flatObjectMetadataMaps,
        }),
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

    // The ambient context is the writer's, so relations load as the subscriber
    const resolvedSubscriberAuthContext = await subscriberAuthContext;

    await this.workspaceOrmManager.executeInWorkspaceContext(
      () =>
        this.processNestedRelationsHelper.processNestedRelations({
          flatObjectMetadataMaps,
          flatFieldMetadataMaps,
          parentObjectMetadataItem: objectMetadata,
          parentObjectRecords: allRecords,
          authContext: resolvedSubscriberAuthContext,
          limit: QUERY_MAX_RECORDS_FROM_RELATION,
          relations: selectedFieldsResult.relations as Record<
            string,
            FindOptionsRelations<ObjectLiteral>
          >,
          selectedFields: selectedFieldsResult.select,
        }),
      resolvedSubscriberAuthContext,
    );
  }

  // Streams of one member share their auth context within a batch; null keeps the writer's application out
  private findSubscriberAuthContext({
    subscriberAuthContexts,
    workspaceId,
    userWorkspaceId,
    applicationId,
  }: {
    subscriberAuthContexts: Map<string, Promise<WorkspaceAuthContext>>;
    workspaceId: string;
    userWorkspaceId: string;
    applicationId: string | undefined;
  }): Promise<WorkspaceAuthContext> {
    const key = `${userWorkspaceId}:${applicationId ?? ''}`;
    const cachedAuthContext = subscriberAuthContexts.get(key);

    if (isDefined(cachedAuthContext)) {
      return cachedAuthContext;
    }

    const authContext = this.userWorkspaceAuthContextService.resolve({
      workspaceId,
      userWorkspaceId,
      applicationId: applicationId ?? null,
    });

    subscriberAuthContexts.set(key, authContext);

    return authContext;
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

  private getMatchingObjectRecordQueryIds({
    queries,
    event,
    objectMetadata,
    flatFieldMetadataMaps,
  }: {
    queries: Record<string, RecordOrMetadataGqlOperationSignature>;
    event: ObjectRecordSubscriptionEvent;
    objectMetadata: FlatObjectMetadata;
    flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
  }): string[] {
    const matchedQueryIds: string[] = [];

    for (const [queryId, operationSignature] of Object.entries(queries)) {
      if (!isRecordGqlOperationSignature(operationSignature)) {
        continue;
      }

      if (
        this.isQueryMatchingObjectRecordEvent({
          operationSignature,
          event,
          objectMetadata,
          flatFieldMetadataMaps,
        })
      ) {
        matchedQueryIds.push(queryId);
      }
    }

    return matchedQueryIds;
  }

  private isQueryMatchingObjectRecordEvent({
    operationSignature,
    event,
    objectMetadata,
    flatFieldMetadataMaps,
  }: {
    operationSignature: RecordGqlOperationSignature;
    event: ObjectRecordSubscriptionEvent;
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
      flatObjectMetadataMaps,
    } = await this.workspaceCacheService.getOrRecompute(workspaceId, [
      'flatRowLevelPermissionPredicateMaps',
      'flatRowLevelPermissionPredicateGroupMaps',
      'flatFieldMetadataMaps',
      'flatObjectMetadataMaps',
    ]);

    return {
      flatRowLevelPermissionPredicateMaps,
      flatRowLevelPermissionPredicateGroupMaps,
      flatFieldMetadataMaps,
      flatObjectMetadataMaps,
    };
  }
}
