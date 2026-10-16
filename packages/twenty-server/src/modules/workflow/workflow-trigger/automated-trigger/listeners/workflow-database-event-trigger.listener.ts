import { buildCoreDispatchIds } from 'src/engine/core-modules/workflow/utils/build-core-dispatch-ids.util';
import { Injectable, Logger } from '@nestjs/common';

import {
  ObjectRecordEvent,
  type ObjectRecordCreateEvent,
  type ObjectRecordDeleteEvent,
  type ObjectRecordDestroyEvent,
  type ObjectRecordUpdateEvent,
  type ObjectRecordUpsertEvent,
} from 'twenty-shared/database-events';
import { type ObjectRecord } from 'twenty-shared/types';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { TRIGGER_STEP_ID } from 'twenty-shared/workflow';
import { In } from 'typeorm';

import { OnDatabaseBatchEvent } from 'src/engine/api/graphql/graphql-query-runner/decorators/on-database-batch-event.decorator';
import { DatabaseEventAction } from 'src/engine/api/graphql/graphql-query-runner/enums/database-event-action';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { buildFieldMapsFromFlatObjectMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/build-field-maps-from-flat-object-metadata.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { RecordAccessPolicyService } from 'src/engine/core-modules/record-share/services/record-access-policy.service';
import { omitInheritedReadabilityChildRecords } from 'src/engine/core-modules/record-share/utils/omit-inherited-readability-child-records.util';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { CoreEntityCacheService } from 'src/engine/core-entity-cache/services/core-entity-cache.service';
import { findActiveFlatApplicationById } from 'src/engine/core-modules/application/utils/find-active-flat-application-by-id.util';
import { isApplicationInstallPending } from 'src/engine/core-modules/application/utils/is-application-install-pending.util';
import { isCachedDatabaseEventTrigger } from 'src/engine/core-modules/workflow/utils/cached-workflow-automated-trigger.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { type WorkspaceEventBatch } from 'src/engine/workspace-event-emitter/types/workspace-event-batch.type';
import { WorkflowCommonWorkspaceService } from 'src/modules/workflow/common/workspace-services/workflow-common.workspace-service';
import { evaluateStepFilters } from 'src/modules/workflow/workflow-executor/workflow-actions/filter/utils/evaluate-step-filters.util';
import {
  type AutomatedTriggerSettings,
  type BaseDatabaseEventTriggerSettings,
  type UpdateEventTriggerSettings,
} from 'src/modules/workflow/workflow-trigger/automated-trigger/constants/automated-trigger-settings';
import { resolveEventsReadableByRole } from 'src/engine/metadata-modules/permissions/utils/resolve-events-readable-by-role.util';
import { resolveAutomationAdmittedRecordIds } from 'src/engine/core-modules/record-share/utils/resolve-automation-admitted-record-ids.util';
import { type CoreDispatchIds } from 'src/engine/core-modules/workflow/types/workflow-automated-trigger-maps.type';
import {
  WorkflowTriggerJob,
  type WorkflowTriggerJobData,
} from 'src/modules/workflow/workflow-trigger/jobs/workflow-trigger.job';

type DatabaseEventTriggerListener = {
  workflowId: string;
  legacyWorkflowId?: string;
  applicationId: string;
  settings: AutomatedTriggerSettings;
} & CoreDispatchIds;

type TriggerEvaluationArgs = {
  eventPayload: ObjectRecordEvent;
  eventListener: DatabaseEventTriggerListener;
  action: DatabaseEventAction;
};

@Injectable()
export class WorkflowDatabaseEventTriggerListener {
  private readonly logger = new Logger(
    WorkflowDatabaseEventTriggerListener.name,
  );

  constructor(
    private readonly workspaceOrmManager: WorkspaceOrmManager,
    @InjectMessageQueue(MessageQueue.workflowQueue)
    private readonly messageQueueService: MessageQueueService,
    private readonly workflowCommonWorkspaceService: WorkflowCommonWorkspaceService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly recordAccessPolicyService: RecordAccessPolicyService,
    private readonly applicationService: ApplicationService,
    private readonly coreEntityCacheService: CoreEntityCacheService,
  ) {}

  @OnDatabaseBatchEvent('*', DatabaseEventAction.CREATED)
  async handleObjectRecordCreateEvent(
    payload: WorkspaceEventBatch<ObjectRecordCreateEvent>,
  ) {
    if (await this.shouldIgnoreEvent(payload)) {
      return;
    }

    await this.handleEvent({
      payload,
      action: DatabaseEventAction.CREATED,
      enrichPayload: (payloadToEnrich) =>
        this.enrichCreatedEvent(payloadToEnrich),
    });
  }

  @OnDatabaseBatchEvent('*', DatabaseEventAction.UPDATED)
  async handleObjectRecordUpdateEvent(
    payload: WorkspaceEventBatch<ObjectRecordUpdateEvent>,
  ) {
    if (await this.shouldIgnoreEvent(payload)) {
      return;
    }

    await this.handleEvent({
      payload,
      action: DatabaseEventAction.UPDATED,
      enrichPayload: (payloadToEnrich) =>
        this.enrichUpdatedEvent(payloadToEnrich),
    });
  }

  @OnDatabaseBatchEvent('*', DatabaseEventAction.DELETED)
  async handleObjectRecordDeleteEvent(
    payload: WorkspaceEventBatch<ObjectRecordDeleteEvent>,
  ) {
    if (await this.shouldIgnoreEvent(payload)) {
      return;
    }

    await this.handleEvent({
      payload,
      action: DatabaseEventAction.DELETED,
      enrichPayload: (payloadToEnrich) =>
        this.enrichDeletedEvent(payloadToEnrich),
    });
  }

  @OnDatabaseBatchEvent('*', DatabaseEventAction.DESTROYED)
  async handleObjectRecordDestroyEvent(
    payload: WorkspaceEventBatch<ObjectRecordDestroyEvent>,
  ) {
    if (await this.shouldIgnoreEvent(payload)) {
      return;
    }

    await this.handleEvent({
      payload,
      action: DatabaseEventAction.DESTROYED,
      enrichPayload: (payloadToEnrich) =>
        this.enrichDestroyedEvent(payloadToEnrich),
    });
  }

  @OnDatabaseBatchEvent('*', DatabaseEventAction.UPSERTED)
  async handleObjectRecordUpsertEvent(
    payload: WorkspaceEventBatch<ObjectRecordUpsertEvent>,
  ) {
    if (await this.shouldIgnoreEvent(payload)) {
      return;
    }

    await this.handleEvent({
      payload,
      action: DatabaseEventAction.UPSERTED,
    });
  }

  private async enrichCreatedEvent(
    payload: WorkspaceEventBatch<ObjectRecordCreateEvent>,
  ) {
    const workspaceId = payload.workspaceId;
    const {
      flatObjectMetadata,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
    } = await this.workflowCommonWorkspaceService.getObjectMetadataInfo(
      payload.objectMetadata.nameSingular,
      workspaceId,
    );

    await this.enrichRecordsWithRelations({
      records: payload.events.map((event) => event.properties.after),
      workspaceId,
      flatObjectMetadata,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
    });
  }

  private async enrichUpdatedEvent(
    payload: WorkspaceEventBatch<ObjectRecordUpdateEvent>,
  ) {
    const workspaceId = payload.workspaceId;
    const {
      flatObjectMetadata,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
    } = await this.workflowCommonWorkspaceService.getObjectMetadataInfo(
      payload.objectMetadata.nameSingular,
      workspaceId,
    );

    await this.enrichRecordsWithRelations({
      records: payload.events.map((event) => event.properties.before),
      workspaceId,
      flatObjectMetadata,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
    });
    await this.enrichRecordsWithRelations({
      records: payload.events.map((event) => event.properties.after),
      workspaceId,
      flatObjectMetadata,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
    });
  }

  private async enrichDeletedEvent(
    payload: WorkspaceEventBatch<ObjectRecordDeleteEvent>,
  ) {
    const workspaceId = payload.workspaceId;
    const {
      flatObjectMetadata,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
    } = await this.workflowCommonWorkspaceService.getObjectMetadataInfo(
      payload.objectMetadata.nameSingular,
      workspaceId,
    );

    await this.enrichRecordsWithRelations({
      records: payload.events.map((event) => event.properties.before),
      workspaceId,
      flatObjectMetadata,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
    });
  }

  private async enrichDestroyedEvent(
    payload: WorkspaceEventBatch<ObjectRecordDestroyEvent>,
  ) {
    const workspaceId = payload.workspaceId;
    const {
      flatObjectMetadata,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
    } = await this.workflowCommonWorkspaceService.getObjectMetadataInfo(
      payload.objectMetadata.nameSingular,
      workspaceId,
    );

    await this.enrichRecordsWithRelations({
      records: payload.events.map((event) => event.properties.before),
      workspaceId,
      flatObjectMetadata,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
    });
  }

  private async enrichRecordsWithRelations({
    records,
    workspaceId,
    flatObjectMetadata,
    flatObjectMetadataMaps,
    flatFieldMetadataMaps,
  }: {
    records: Partial<ObjectRecord>[];
    workspaceId: string;
    flatObjectMetadata: FlatObjectMetadata;
    flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
    flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
  }) {
    const authContext = buildSystemAuthContext(workspaceId);

    await this.workspaceOrmManager.executeInWorkspaceContext(async () => {
      const { fieldIdByJoinColumnName } = buildFieldMapsFromFlatObjectMetadata(
        flatFieldMetadataMaps,
        flatObjectMetadata,
      );

      for (const [joinColumnName, joinFieldId] of Object.entries(
        fieldIdByJoinColumnName,
      )) {
        const joinField = findFlatEntityByIdInFlatEntityMapsOrThrow({
          flatEntityMaps: flatFieldMetadataMaps,
          flatEntityId: joinFieldId,
        });

        const joinRecordIds = records
          .map((record) => record[joinColumnName])
          .filter(isDefined);

        if (joinRecordIds.length === 0) {
          continue;
        }

        const relatedObjectMetadataId =
          joinField.relationTargetObjectMetadataId;

        if (!isDefined(relatedObjectMetadataId)) {
          continue;
        }

        const relatedObjectMetadataNameSingular =
          findFlatEntityByIdInFlatEntityMaps({
            flatEntityId: relatedObjectMetadataId,
            flatEntityMaps: flatObjectMetadataMaps,
          })?.nameSingular;

        if (!isDefined(relatedObjectMetadataNameSingular)) {
          continue;
        }

        const relatedObjectRepository = this.workspaceOrmManager.getRepository(
          relatedObjectMetadataNameSingular,
          { shouldBypassPermissionChecks: true },
        );

        const relatedRecords = await relatedObjectRepository.find({
          where: { id: In(joinRecordIds) },
        });

        for (const record of records) {
          record[joinField.name] = relatedRecords.find(
            (relatedRecord) => relatedRecord.id === record[joinColumnName],
          );
        }
      }
    }, authContext);
  }

  private async shouldIgnoreEvent(
    payload: WorkspaceEventBatch<ObjectRecordEvent>,
  ) {
    const workspaceId = payload.workspaceId;
    const databaseEventName = payload.name;

    if (!workspaceId || !databaseEventName) {
      this.logger.error(
        `Missing workspaceId or eventName in payload ${JSON.stringify(
          payload,
        )}`,
      );

      return true;
    }

    return false;
  }

  private async handleEvent<TEvent extends ObjectRecordEvent>({
    payload,
    action,
    enrichPayload,
  }: {
    payload: WorkspaceEventBatch<TEvent>;
    action: DatabaseEventAction;
    enrichPayload?: (payload: WorkspaceEventBatch<TEvent>) => Promise<void>;
  }) {
    const workspaceId = payload.workspaceId;
    const databaseEventName = payload.name;

    const eventListeners = await this.getDatabaseEventListeners(
      workspaceId,
      databaseEventName,
    );

    if (eventListeners.length === 0) {
      return;
    }

    const workspace = await this.coreEntityCacheService.get(
      'workspaceEntity',
      workspaceId,
    );

    if (!isDefined(workspace)) {
      return;
    }

    const { twentyStandardFlatApplication, workspaceCustomFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspace },
      );

    const standardAndCustomApplicationIds = new Set([
      twentyStandardFlatApplication.id,
      workspaceCustomFlatApplication.id,
    ]);

    const enrichedPayload = eventListeners.some(({ applicationId }) =>
      standardAndCustomApplicationIds.has(applicationId),
    )
      ? await this.buildEnrichedPayload({ payload, enrichPayload })
      : payload;

    const admittedEventsByApplicationId = new Map<
      string,
      ObjectRecordEvent[]
    >();

    for (const eventListener of eventListeners) {
      const { applicationId } = eventListener;

      if (!admittedEventsByApplicationId.has(applicationId)) {
        admittedEventsByApplicationId.set(
          applicationId,
          await this.resolveAdmittedEvents({
            payload,
            enrichedPayload,
            applicationId,
            standardAndCustomApplicationIds,
          }),
        );
      }

      for (const eventPayload of admittedEventsByApplicationId.get(
        applicationId,
      ) ?? []) {
        const shouldTriggerJob = this.shouldTriggerJob({
          eventPayload,
          eventListener,
          action,
        });

        if (shouldTriggerJob) {
          await this.messageQueueService.add<WorkflowTriggerJobData>(
            WorkflowTriggerJob.name,
            {
              workspaceId,
              workflowId:
                eventListener.legacyWorkflowId ?? eventListener.workflowId,
              ...buildCoreDispatchIds(eventListener),
              payload: omitInheritedReadabilityChildRecords(eventPayload),
            },
            { retryLimit: 3 },
          );
        }
      }
    }
  }

  private async getDatabaseEventListeners(
    workspaceId: string,
    databaseEventName: string,
  ): Promise<DatabaseEventTriggerListener[]> {
    const { workflowAutomatedTriggerMaps, flatApplicationMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'workflowAutomatedTriggerMaps',
        'flatApplicationMaps',
      ]);

    return Object.values(
      workflowAutomatedTriggerMaps.byWorkflowId,
    ).flatMap<DatabaseEventTriggerListener>((trigger) => {
      if (
        !isCachedDatabaseEventTrigger(trigger) ||
        trigger.settings.eventName !== databaseEventName ||
        isApplicationInstallPending(flatApplicationMaps, trigger.applicationId)
      ) {
        return [];
      }

      return [trigger];
    });
  }

  private async buildEnrichedPayload<TEvent extends ObjectRecordEvent>({
    payload,
    enrichPayload,
  }: {
    payload: WorkspaceEventBatch<TEvent>;
    enrichPayload?: (payload: WorkspaceEventBatch<TEvent>) => Promise<void>;
  }): Promise<WorkspaceEventBatch<TEvent>> {
    if (!isDefined(enrichPayload)) {
      return payload;
    }

    const enrichedPayload = structuredClone(payload);

    await enrichPayload(enrichedPayload);

    return enrichedPayload;
  }

  private async resolveAdmittedEvents({
    payload,
    enrichedPayload,
    applicationId,
    standardAndCustomApplicationIds,
  }: {
    payload: WorkspaceEventBatch<ObjectRecordEvent>;
    enrichedPayload: WorkspaceEventBatch<ObjectRecordEvent>;
    applicationId: string;
    standardAndCustomApplicationIds: Set<string>;
  }): Promise<ObjectRecordEvent[]> {
    if (standardAndCustomApplicationIds.has(applicationId)) {
      const admittedRecordIds = await resolveAutomationAdmittedRecordIds({
        payload: enrichedPayload,
        workspaceCacheService: this.workspaceCacheService,
        recordAccessPolicyService: this.recordAccessPolicyService,
      });

      return enrichedPayload.events.filter((event) =>
        admittedRecordIds.has(event.recordId),
      );
    }

    const {
      flatApplicationMaps,
      rolesPermissions,
      roleIdsWithAllRecordsAccess,
      flatRowLevelPermissionPredicateMaps,
      flatRowLevelPermissionPredicateGroupMaps,
      flatFieldMetadataMaps,
      flatObjectMetadataMaps,
    } = await this.workspaceCacheService.getOrRecompute(payload.workspaceId, [
      'flatApplicationMaps',
      'rolesPermissions',
      'roleIdsWithAllRecordsAccess',
      'flatRowLevelPermissionPredicateMaps',
      'flatRowLevelPermissionPredicateGroupMaps',
      'flatFieldMetadataMaps',
      'flatObjectMetadataMaps',
    ]);

    return resolveEventsReadableByRole({
      roleId:
        findActiveFlatApplicationById(flatApplicationMaps, applicationId)
          ?.defaultRoleId ?? null,
      owningApplicationId: applicationId,
      workspaceEventBatch: payload,
      eventRecordAccessGate:
        this.recordAccessPolicyService.buildEventRecordAccessGate(payload),
      rolesPermissions,
      roleIdsWithAllRecordsAccess,
      flatRowLevelPermissionPredicateMaps,
      flatRowLevelPermissionPredicateGroupMaps,
      flatFieldMetadataMaps,
      flatObjectMetadataMaps,
    });
  }

  private shouldTriggerJob({
    eventPayload,
    eventListener,
    action,
  }: TriggerEvaluationArgs) {
    return (
      this.eventMatchesWatchedFields({ eventPayload, eventListener, action }) &&
      this.eventMatchesRecordFilter({ eventPayload, eventListener })
    );
  }

  private eventMatchesWatchedFields({
    eventPayload,
    eventListener,
    action,
  }: TriggerEvaluationArgs) {
    if (
      action === DatabaseEventAction.UPDATED ||
      action === DatabaseEventAction.UPSERTED
    ) {
      const settings = eventListener.settings as UpdateEventTriggerSettings;
      const updatedFields =
        (eventPayload as ObjectRecordUpdateEvent)?.properties?.updatedFields ??
        [];

      return (
        !settings.fields ||
        settings.fields.length === 0 ||
        settings.fields.some((field) => updatedFields.includes(field))
      );
    }

    return true;
  }

  private eventMatchesRecordFilter({
    eventPayload,
    eventListener,
  }: Pick<TriggerEvaluationArgs, 'eventPayload' | 'eventListener'>) {
    const { filter } =
      eventListener.settings as BaseDatabaseEventTriggerSettings;

    if (!isDefined(filter) || !isNonEmptyArray(filter.stepFilters)) {
      return true;
    }

    try {
      return evaluateStepFilters({
        stepFilters: filter.stepFilters,
        stepFilterGroups: filter.stepFilterGroups,
        context: { [TRIGGER_STEP_ID]: eventPayload },
      });
    } catch (error) {
      this.logger.error(
        `Failed to evaluate database-event trigger filter for workflow ${eventListener.workflowId}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );

      return false;
    }
  }
}
