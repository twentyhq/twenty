import { Injectable, Logger } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { OnDatabaseBatchEvent } from 'src/engine/api/graphql/graphql-query-runner/decorators/on-database-batch-event.decorator';
import { DatabaseEventAction } from 'src/engine/api/graphql/graphql-query-runner/enums/database-event-action';
import { ObjectRecordCreateEvent } from 'src/engine/core-modules/event-emitter/types/object-record-create.event';
import { ObjectRecordDeleteEvent } from 'src/engine/core-modules/event-emitter/types/object-record-delete.event';
import { ObjectRecordDestroyEvent } from 'src/engine/core-modules/event-emitter/types/object-record-destroy.event';
import { ObjectRecordUpdateEvent } from 'src/engine/core-modules/event-emitter/types/object-record-update.event';
import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { WorkspaceEventBatch } from 'src/engine/workspace-event-emitter/types/workspace-event.type';
import {
  WorkflowTriggerJob,
  WorkflowTriggerJobData,
} from 'src/modules/workflow/workflow-trigger/jobs/workflow-trigger.job';
import { WorkflowEventListenerWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow-event-listener.workspace-entity';
import { ObjectRecordNonDestructiveEvent } from 'src/engine/core-modules/event-emitter/types/object-record-non-destructive-event';
import { WorkflowCommonWorkspaceService } from 'src/modules/workflow/common/workspace-services/workflow-common.workspace-service';

@Injectable()
export class DatabaseEventTriggerListener {
  private readonly logger = new Logger('DatabaseEventTriggerListener');

  constructor(
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    @InjectMessageQueue(MessageQueue.workflowQueue)
    private readonly messageQueueService: MessageQueueService,
    private readonly isFeatureFlagEnabledService: FeatureFlagService,
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
    await this.handleEvent(clonedPayload);
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
    await this.handleEvent(clonedPayload);
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
    await this.handleEvent(clonedPayload);
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
    await this.handleEvent(clonedPayload);
  }

  private async enrichCreatedEvent(
    payload: WorkspaceEventBatch<ObjectRecordCreateEvent>,
  ) {
    const workspaceId = payload.workspaceId;

    for (const event of payload.events) {
      await this.enrichRecord({
        event,
        record: event.properties.after,
        workspaceId,
      });
    }
  }

  private async enrichUpdatedEvent(
    payload: WorkspaceEventBatch<ObjectRecordUpdateEvent>,
  ) {
    const workspaceId = payload.workspaceId;

    for (const event of payload.events) {
      await this.enrichRecord({
        event,
        record: event.properties.before,
        workspaceId,
      });
      await this.enrichRecord({
        event,
        record: event.properties.after,
        workspaceId,
      });
    }
  }

  private async enrichDeletedEvent(
    payload: WorkspaceEventBatch<ObjectRecordDeleteEvent>,
  ) {
    const workspaceId = payload.workspaceId;

    for (const event of payload.events) {
      await this.enrichRecord({
        event,
        record: event.properties.before,
        workspaceId,
      });
    }
  }

  private async enrichDestroyedEvent(
    payload: WorkspaceEventBatch<ObjectRecordDestroyEvent>,
  ) {
    const workspaceId = payload.workspaceId;

    for (const event of payload.events) {
      await this.enrichRecord({
        event,
        record: event.properties.before,
        workspaceId,
      });
    }
  }

  private async enrichRecord({
    event,
    record,
    workspaceId,
  }: {
    event: ObjectRecordNonDestructiveEvent;
    record: object;
    workspaceId: string;
  }) {
    const fieldsByJoinColumnName = event.objectMetadata.fieldsByJoinColumnName;

    for (const [joinColumn, joinField] of Object.entries(
      fieldsByJoinColumnName,
    )) {
      const joinRecordId = record[joinColumn];
      const relatedObjectMetadataId = joinField.relationTargetObjectMetadataId;

      if (!isDefined(relatedObjectMetadataId)) {
        continue;
      }

      const { objectMetadataMaps } =
        await this.workflowCommonWorkspaceService.getObjectMetadataItemWithFieldsMaps(
          event.objectMetadata.nameSingular,
          workspaceId,
        );

      const relatedObjectMetadataNameSingular =
        objectMetadataMaps.byId[relatedObjectMetadataId].nameSingular;

      const relatedObjectRepository =
        await this.twentyORMGlobalManager.getRepositoryForWorkspace(
          workspaceId,
          relatedObjectMetadataNameSingular,
        );

      record[joinField.name] = await relatedObjectRepository.findOne({
        where: { id: joinRecordId },
      });
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

    const isWorkflowEnabled =
      await this.isFeatureFlagEnabledService.isFeatureEnabled(
        FeatureFlagKey.IsWorkflowEnabled,
        workspaceId,
      );

    return !isWorkflowEnabled;
  }

  private async handleEvent(
    payload: WorkspaceEventBatch<ObjectRecordNonDestructiveEvent>,
  ) {
    const workspaceId = payload.workspaceId;
    const databaseEventName = payload.name;

    // Todo: uncomment that when data are migrated to workflowAutomatedTrigger
    /*
    const workflowAutomatedTriggerRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<WorkflowAutomatedTriggerWorkspaceEntity>(
        workspaceId,
        'workflowAutomatedTrigger',
      );

    const eventListeners = await workflowAutomatedTriggerRepository.find({
      where: {
        type: AutomatedTriggerType.DATABASE_EVENT,
        settings: { eventName: databaseEventName },
      },
    });
    */
    // end Todo

    // Todo: remove that when data are migrated to workflowAutomatedTrigger
    const workflowEventListenerRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<WorkflowEventListenerWorkspaceEntity>(
        workspaceId,
        'workflowEventListener',
      );

    const oldEventListeners = await workflowEventListenerRepository.find({
      where: { eventName: databaseEventName },
    });

    // end Todo

    // Todo: uncomment that when data are migrated to workflowAutomatedTrigger
    //for (const eventListener of eventListeners) {
    // end Todo

    // Todo: remove that when data are migrated to workflowAutomatedTrigger
    for (const eventListener of oldEventListeners) {
      // end Todo
      for (const eventPayload of payload.events) {
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
