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
import { type ObjectRecordUpsertEvent } from 'src/engine/core-modules/event-emitter/types/object-record-upsert.event';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { ObjectMetadataItemWithFieldMaps } from 'src/engine/metadata-modules/types/object-metadata-item-with-field-maps';
import { ObjectMetadataMaps } from 'src/engine/metadata-modules/types/object-metadata-maps';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { WorkspaceEventBatch } from 'src/engine/workspace-event-emitter/types/workspace-event-batch.type';
import {
  AutomatedTriggerType,
  type WorkflowAutomatedTriggerWorkspaceEntity,
} from 'src/modules/workflow/common/standard-objects/workflow-automated-trigger.workspace-entity';
import { WorkflowCommonWorkspaceService } from 'src/modules/workflow/common/workspace-services/workflow-common.workspace-service';
import {
  type UpdateEventTriggerSettings,
  type UpsertEventTriggerSettings,
} from 'src/modules/workflow/workflow-trigger/automated-trigger/constants/automated-trigger-settings';
import {
  WorkflowTriggerJob,
  type WorkflowTriggerJobData,
} from 'src/modules/workflow/workflow-trigger/jobs/workflow-trigger.job';

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
    const { objectMetadataMaps, objectMetadataItemWithFieldsMaps } =
      await this.workflowCommonWorkspaceService.getObjectMetadataItemWithFieldsMaps(
        payload.objectMetadata.nameSingular,
        workspaceId,
      );

    await this.enrichRecordsWithRelations({
      records: payload.events.map((event) => event.properties.after),
      workspaceId,
      objectMetadataMaps,
      objectMetadataItemWithFieldsMaps,
    });
  }

  private async enrichUpdatedEvent(
    payload: WorkspaceEventBatch<ObjectRecordUpdateEvent>,
  ) {
    const workspaceId = payload.workspaceId;
    const { objectMetadataMaps, objectMetadataItemWithFieldsMaps } =
      await this.workflowCommonWorkspaceService.getObjectMetadataItemWithFieldsMaps(
        payload.objectMetadata.nameSingular,
        workspaceId,
      );

    await this.enrichRecordsWithRelations({
      records: payload.events.map((event) => event.properties.before),
      workspaceId,
      objectMetadataMaps,
      objectMetadataItemWithFieldsMaps,
    });
    await this.enrichRecordsWithRelations({
      records: payload.events.map((event) => event.properties.after),
      workspaceId,
      objectMetadataMaps,
      objectMetadataItemWithFieldsMaps,
    });
  }

  private async enrichDeletedEvent(
    payload: WorkspaceEventBatch<ObjectRecordDeleteEvent>,
  ) {
    const workspaceId = payload.workspaceId;
    const { objectMetadataMaps, objectMetadataItemWithFieldsMaps } =
      await this.workflowCommonWorkspaceService.getObjectMetadataItemWithFieldsMaps(
        payload.objectMetadata.nameSingular,
        workspaceId,
      );

    await this.enrichRecordsWithRelations({
      records: payload.events.map((event) => event.properties.before),
      workspaceId,
      objectMetadataMaps,
      objectMetadataItemWithFieldsMaps,
    });
  }

  private async enrichDestroyedEvent(
    payload: WorkspaceEventBatch<ObjectRecordDestroyEvent>,
  ) {
    const workspaceId = payload.workspaceId;
    const { objectMetadataMaps, objectMetadataItemWithFieldsMaps } =
      await this.workflowCommonWorkspaceService.getObjectMetadataItemWithFieldsMaps(
        payload.objectMetadata.nameSingular,
        workspaceId,
      );

    await this.enrichRecordsWithRelations({
      records: payload.events.map((event) => event.properties.before),
      objectMetadataMaps,
      workspaceId,
      objectMetadataItemWithFieldsMaps,
    });
  }

  private async enrichRecordsWithRelations({
    records,
    workspaceId,
    objectMetadataMaps,
    objectMetadataItemWithFieldsMaps,
  }: {
    records: Partial<ObjectRecord>[];
    workspaceId: string;
    objectMetadataMaps: ObjectMetadataMaps;
    objectMetadataItemWithFieldsMaps: ObjectMetadataItemWithFieldMaps;
  }) {
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

    if (action === DatabaseEventAction.UPSERTED) {
      const settings = eventListener.settings as UpsertEventTriggerSettings;
      const upsertEventPayload = eventPayload as ObjectRecordUpsertEvent;

      return (
        !settings.fields ||
        settings.fields.length === 0 ||
        settings.fields.some((field) =>
          upsertEventPayload?.properties?.updatedFields?.includes(field),
        )
      );
    }

    return true;
  }
}
