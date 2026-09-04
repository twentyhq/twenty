import { Injectable, Logger } from '@nestjs/common';

import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';
import { EVERYONE_PRINCIPAL_ID } from 'twenty-shared/constants';
import {
  ObjectRecordEvent,
  type ObjectRecordCreateEvent,
  type ObjectRecordDeleteEvent,
  type ObjectRecordDestroyEvent,
  type ObjectRecordUpdateEvent,
  type ObjectRecordUpsertEvent,
} from 'twenty-shared/database-events';
import { FeatureFlagKey, type ObjectRecord } from 'twenty-shared/types';
import {
  assertUnreachable,
  isDefined,
  isNonEmptyArray,
} from 'twenty-shared/utils';
import { TRIGGER_STEP_ID } from 'twenty-shared/workflow';
import { In } from 'typeorm';

import { OnDatabaseBatchEvent } from 'src/engine/api/graphql/graphql-query-runner/decorators/on-database-batch-event.decorator';
import { DatabaseEventAction } from 'src/engine/api/graphql/graphql-query-runner/enums/database-event-action';
import { findActiveFlatApplicationByUniversalIdentifier } from 'src/engine/core-modules/application/utils/find-active-flat-application-by-universal-identifier.util';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { buildFieldMapsFromFlatObjectMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/build-field-maps-from-flat-object-metadata.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { DENY_ALL_RECORD_SHARE_GATE } from 'src/engine/record-share/constants/deny-all-record-share-gate.constant';
import { RecordShareService } from 'src/engine/record-share/services/record-share.service';
import { type RecordShareGate } from 'src/engine/record-share/types/record-share-gate.type';
import { isRecordSharedWithPrincipals } from 'src/engine/record-share/utils/is-record-shared-with-principals.util';
import { resolveRecordShareGateKind } from 'src/engine/record-share/utils/resolve-record-share-gate-kind.util';
import { resolveRequiredRecordShareAccessLevels } from 'src/engine/twenty-orm/repository/resolve-required-record-share-access-levels.util';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { STANDARD_ROLE } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-role.constant';
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
import { type CoreDispatchIds } from 'src/engine/core-modules/workflow/types/workflow-automated-trigger-maps.type';
import {
  WorkflowTriggerJob,
  type WorkflowTriggerJobData,
} from 'src/modules/workflow/workflow-trigger/jobs/workflow-trigger.job';

type DatabaseEventTriggerListener = {
  workflowId: string;
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
    private readonly recordShareService: RecordShareService,
  ) {}

  @OnDatabaseBatchEvent('*', DatabaseEventAction.CREATED)
  async handleObjectRecordCreateEvent(
    payload: WorkspaceEventBatch<ObjectRecordCreateEvent>,
  ) {
    if (await this.shouldIgnoreEvent(payload)) {
      return;
    }

    const clonedPayload = structuredClone(payload);

    await this.enrichCreatedEvent(clonedPayload);
    await this.handleEvent({
      payload: clonedPayload,
      action: DatabaseEventAction.CREATED,
    });
  }

  @OnDatabaseBatchEvent('*', DatabaseEventAction.UPDATED)
  async handleObjectRecordUpdateEvent(
    payload: WorkspaceEventBatch<ObjectRecordUpdateEvent>,
  ) {
    if (await this.shouldIgnoreEvent(payload)) {
      return;
    }

    const clonedPayload = structuredClone(payload);

    await this.enrichUpdatedEvent(clonedPayload);

    await this.handleEvent({
      payload: clonedPayload,
      action: DatabaseEventAction.UPDATED,
    });
  }

  @OnDatabaseBatchEvent('*', DatabaseEventAction.DELETED)
  async handleObjectRecordDeleteEvent(
    payload: WorkspaceEventBatch<ObjectRecordDeleteEvent>,
  ) {
    if (await this.shouldIgnoreEvent(payload)) {
      return;
    }

    const clonedPayload = structuredClone(payload);

    await this.enrichDeletedEvent(clonedPayload);
    await this.handleEvent({
      payload: clonedPayload,
      action: DatabaseEventAction.DELETED,
    });
  }

  @OnDatabaseBatchEvent('*', DatabaseEventAction.DESTROYED)
  async handleObjectRecordDestroyEvent(
    payload: WorkspaceEventBatch<ObjectRecordDestroyEvent>,
  ) {
    if (await this.shouldIgnoreEvent(payload)) {
      return;
    }

    const clonedPayload = structuredClone(payload);

    await this.enrichDestroyedEvent(clonedPayload);
    await this.handleEvent({
      payload: clonedPayload,
      action: DatabaseEventAction.DESTROYED,
    });
  }

  @OnDatabaseBatchEvent('*', DatabaseEventAction.UPSERTED)
  async handleObjectRecordUpsertEvent(
    payload: WorkspaceEventBatch<ObjectRecordUpsertEvent>,
  ) {
    if (await this.shouldIgnoreEvent(payload)) {
      return;
    }

    const clonedPayload = structuredClone(payload);

    await this.handleEvent({
      payload: clonedPayload,
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

  private async handleEvent({
    payload,
    action,
  }: {
    payload: WorkspaceEventBatch<ObjectRecordEvent>;
    action: DatabaseEventAction;
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

    const recordShareGate = await this.buildRecordShareGate(payload);

    for (const eventListener of eventListeners) {
      for (const eventPayload of payload.events) {
        const shouldTriggerJob = this.shouldTriggerJob({
          eventPayload,
          eventListener,
          action,
          recordShareGate,
        });

        if (shouldTriggerJob) {
          await this.messageQueueService.add<WorkflowTriggerJobData>(
            WorkflowTriggerJob.name,
            {
              workspaceId,
              workflowId: eventListener.workflowId,
              coreWorkflowVersionId: eventListener.coreWorkflowVersionId,
              workspaceWorkflowVersionId:
                eventListener.workspaceWorkflowVersionId,
              payload: eventPayload,
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
    const { workflowAutomatedTriggerMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'workflowAutomatedTriggerMaps',
      ]);

    return Object.values(workflowAutomatedTriggerMaps.byWorkflowId).filter(
      (trigger) =>
        isCachedDatabaseEventTrigger(trigger) &&
        trigger.settings.eventName === databaseEventName,
    );
  }

  private async buildRecordShareGate(
    payload: WorkspaceEventBatch<ObjectRecordEvent>,
  ): Promise<RecordShareGate | null> {
    const { featureFlagsMap, flatApplicationMaps, flatRoleMaps } =
      await this.workspaceCacheService.getOrRecompute(payload.workspaceId, [
        'featureFlagsMap',
        'flatApplicationMaps',
        'flatRoleMaps',
      ]);

    if (!featureFlagsMap[FeatureFlagKey.IS_RECORD_SHARING_ENABLED]) {
      return null;
    }

    const standardApplication = findActiveFlatApplicationByUniversalIdentifier(
      flatApplicationMaps,
      TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
    );

    const gateKind = resolveRecordShareGateKind({
      readability: payload.objectMetadata.readability,
      isOwningApplication:
        isDefined(standardApplication) &&
        payload.objectMetadata.applicationId === standardApplication.id,
    });

    if (gateKind === 'open') {
      return null;
    }

    const roleId =
      standardApplication?.defaultRoleId ??
      findFlatEntityByUniversalIdentifier({
        flatEntityMaps: flatRoleMaps,
        universalIdentifier: STANDARD_ROLE.admin.universalIdentifier,
      })?.id;

    if (!isDefined(roleId)) {
      return null;
    }

    switch (gateKind) {
      case 'deny':
        return DENY_ALL_RECORD_SHARE_GATE;
      case 'private':
        return {
          recordShares: await this.recordShareService.findByRecordIds({
            workspaceId: payload.workspaceId,
            objectMetadataId: payload.objectMetadata.id,
            recordIds: payload.events.map((event) => event.recordId),
          }),
          principalIds: [EVERYONE_PRINCIPAL_ID, roleId],
        };
      default:
        assertUnreachable(gateKind);
    }
  }

  private shouldTriggerJob({
    eventPayload,
    eventListener,
    action,
    recordShareGate,
  }: TriggerEvaluationArgs & { recordShareGate: RecordShareGate | null }) {
    return (
      this.eventMatchesWatchedFields({ eventPayload, eventListener, action }) &&
      this.eventMatchesRecordFilter({ eventPayload, eventListener }) &&
      this.eventMatchesRecordShare({ eventPayload, recordShareGate })
    );
  }

  private eventMatchesRecordShare({
    eventPayload,
    recordShareGate,
  }: Pick<TriggerEvaluationArgs, 'eventPayload'> & {
    recordShareGate: RecordShareGate | null;
  }) {
    if (!isDefined(recordShareGate)) {
      return true;
    }

    return isRecordSharedWithPrincipals({
      recordShares: recordShareGate.recordShares,
      recordId: eventPayload.recordId,
      principalIds: recordShareGate.principalIds,
      accessLevels: resolveRequiredRecordShareAccessLevels('select'),
    });
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
