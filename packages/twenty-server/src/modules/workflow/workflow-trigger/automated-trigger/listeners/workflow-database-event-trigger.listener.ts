import { Injectable, Logger } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';
import { In, Raw } from 'typeorm';

import { type ObjectRecord } from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';

import { OnDatabaseBatchEvent } from 'src/engine/api/graphql/graphql-query-runner/decorators/on-database-batch-event.decorator';
import { DatabaseEventAction } from 'src/engine/api/graphql/graphql-query-runner/enums/database-event-action';
import { type ObjectRecordCreateEvent } from 'src/engine/core-modules/event-emitter/types/object-record-create.event';
import { type ObjectRecordDeleteEvent } from 'src/engine/core-modules/event-emitter/types/object-record-delete.event';
import { type ObjectRecordDestroyEvent } from 'src/engine/core-modules/event-emitter/types/object-record-destroy.event';
import { type ObjectRecordNonDestructiveEvent } from 'src/engine/core-modules/event-emitter/types/object-record-non-destructive-event';
import { type ObjectRecordUpdateEvent } from 'src/engine/core-modules/event-emitter/types/object-record-update.event';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { WorkspaceEventBatch } from 'src/engine/workspace-event-emitter/types/workspace-event.type';
import {
  AutomatedTriggerType,
  type WorkflowAutomatedTriggerWorkspaceEntity,
} from 'src/modules/workflow/common/standard-objects/workflow-automated-trigger.workspace-entity';
import { WorkflowCommonWorkspaceService } from 'src/modules/workflow/common/workspace-services/workflow-common.workspace-service';
import { type UpdateEventTriggerSettings } from 'src/modules/workflow/workflow-trigger/automated-trigger/constants/automated-trigger-settings';
import {
  WorkflowTriggerJob,
  type WorkflowTriggerJobData,
} from 'src/modules/workflow/workflow-trigger/jobs/workflow-trigger.job';
import { hasSubstantialRecordData } from 'src/modules/workflow/workflow-trigger/utils/has-substantial-record-data.util';

@Injectable()
export class WorkflowDatabaseEventTriggerListener {
  private readonly logger = new Logger(
    WorkflowDatabaseEventTriggerListener.name,
  );

  constructor(
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    @InjectMessageQueue(MessageQueue.workflowQueue)
    private readonly messageQueueService: MessageQueueService,
    private readonly workflowCommonWorkspaceService: WorkflowCommonWorkspaceService,
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

    // Also trigger upsert event if record has substantial data
    await this.handleUpsertEventForCreated(clonedPayload);
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

    // Also trigger upsert event for all updates
    await this.handleUpsertEventForUpdated(clonedPayload);
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

  private async enrichCreatedEvent(
    payload: WorkspaceEventBatch<ObjectRecordCreateEvent>,
  ) {
    const workspaceId = payload.workspaceId;

    await this.enrichRecordsWithRelations({
      records: payload.events.map((event) => event.properties.after),
      objectMetadataNameSingular: payload.events[0].objectMetadata.nameSingular,
      workspaceId,
    });
  }

  private async enrichUpdatedEvent(
    payload: WorkspaceEventBatch<ObjectRecordUpdateEvent>,
  ) {
    const workspaceId = payload.workspaceId;

    await this.enrichRecordsWithRelations({
      records: payload.events.map((event) => event.properties.before),
      objectMetadataNameSingular: payload.events[0].objectMetadata.nameSingular,
      workspaceId,
    });
    await this.enrichRecordsWithRelations({
      records: payload.events.map((event) => event.properties.after),
      objectMetadataNameSingular: payload.events[0].objectMetadata.nameSingular,
      workspaceId,
    });
  }

  private async enrichDeletedEvent(
    payload: WorkspaceEventBatch<ObjectRecordDeleteEvent>,
  ) {
    const workspaceId = payload.workspaceId;

    await this.enrichRecordsWithRelations({
      records: payload.events.map((event) => event.properties.before),
      objectMetadataNameSingular: payload.events[0].objectMetadata.nameSingular,
      workspaceId,
    });
  }

  private async enrichDestroyedEvent(
    payload: WorkspaceEventBatch<ObjectRecordDestroyEvent>,
  ) {
    const workspaceId = payload.workspaceId;

    await this.enrichRecordsWithRelations({
      records: payload.events.map((event) => event.properties.before),
      objectMetadataNameSingular: payload.events[0].objectMetadata.nameSingular,
      workspaceId,
    });
  }

  private async enrichRecordsWithRelations({
    records,
    objectMetadataNameSingular,
    workspaceId,
  }: {
    records: Partial<ObjectRecord>[];
    objectMetadataNameSingular: string;
    workspaceId: string;
  }) {
    const { objectMetadataMaps, objectMetadataItemWithFieldsMaps } =
      await this.workflowCommonWorkspaceService.getObjectMetadataItemWithFieldsMaps(
        objectMetadataNameSingular,
        workspaceId,
      );

    for (const [joinColumnName, joinFieldId] of Object.entries(
      objectMetadataItemWithFieldsMaps.fieldIdByJoinColumnName,
    )) {
      const joinField =
        objectMetadataItemWithFieldsMaps.fieldsById[joinFieldId];
      const joinRecordIds = records
        .map((record) => record[joinColumnName])
        .filter(isDefined);

      if (joinRecordIds.length === 0) {
        continue;
      }

      const relatedObjectMetadataId = joinField.relationTargetObjectMetadataId;

      if (!isDefined(relatedObjectMetadataId)) {
        continue;
      }

      const relatedObjectMetadataNameSingular =
        objectMetadataMaps.byId[relatedObjectMetadataId]?.nameSingular;

      if (!isDefined(relatedObjectMetadataNameSingular)) {
        continue;
      }

      const relatedObjectRepository =
        await this.twentyORMGlobalManager.getRepositoryForWorkspace(
          workspaceId,
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
  }

  private async handleUpsertEventForCreated(
    payload: WorkspaceEventBatch<ObjectRecordCreateEvent>,
  ) {
    // Check if any created records have substantial data
    const recordsWithSubstantialData = payload.events.filter((event) => {
      const recordData = event.properties.after;
      return recordData && typeof recordData === 'object' 
        ? hasSubstantialRecordData(recordData as Record<string, unknown>)
        : false;
    });

    if (recordsWithSubstantialData.length === 0) {
      return;
    }

    // Create a new payload with only records that have substantial data
    const upsertPayload: WorkspaceEventBatch<ObjectRecordCreateEvent> = {
      ...payload,
      events: recordsWithSubstantialData,
    };

    await this.handleEvent({
      payload: upsertPayload,
      action: DatabaseEventAction.UPSERTED,
    });
  }

  private async handleUpsertEventForUpdated(
    payload: WorkspaceEventBatch<ObjectRecordUpdateEvent>,
  ) {
    // All update events qualify as upsert events
    await this.handleEvent({
      payload,
      action: DatabaseEventAction.UPSERTED,
    });
  }

  private async shouldIgnoreEvent(
    payload: WorkspaceEventBatch<ObjectRecordNonDestructiveEvent>,
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
    payload: WorkspaceEventBatch<ObjectRecordNonDestructiveEvent>;
    action: DatabaseEventAction;
  }) {
    const workspaceId = payload.workspaceId;
    const databaseEventName = payload.name;
    const automatedTriggerTableName = 'workflowAutomatedTrigger';

    const workflowAutomatedTriggerRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<WorkflowAutomatedTriggerWorkspaceEntity>(
        workspaceId,
        automatedTriggerTableName,
        { shouldBypassPermissionChecks: true },
      );

    const eventListeners = await workflowAutomatedTriggerRepository.find({
      where: {
        type: AutomatedTriggerType.DATABASE_EVENT,
        settings: Raw(
          () =>
            `"${automatedTriggerTableName}"."settings"->>'eventName' = :eventName`,
          { eventName: databaseEventName },
        ),
      },
    });

    for (const eventListener of eventListeners) {
      for (const eventPayload of payload.events) {
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
              workflowId: eventListener.workflowId,
              payload: eventPayload,
            },
            { retryLimit: 3 },
          );
        }
      }
    }
  }

  private shouldTriggerJob({
    eventPayload,
    eventListener,
    action,
  }: {
    eventPayload: ObjectRecordNonDestructiveEvent;
    eventListener: WorkflowAutomatedTriggerWorkspaceEntity;
    action: DatabaseEventAction;
  }) {
    if (action === DatabaseEventAction.UPDATED) {
      const settings = eventListener.settings as UpdateEventTriggerSettings;
      const updateEventPayload = eventPayload as ObjectRecordUpdateEvent;

      return (
        !settings.fields ||
        settings.fields.length === 0 ||
        settings.fields.some((field) =>
          updateEventPayload?.properties?.updatedFields?.includes(field),
        )
      );
    }

    return true;
  }
}
