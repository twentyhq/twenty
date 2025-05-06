import { Injectable, Logger } from '@nestjs/common';

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

@Injectable()
export class DatabaseEventTriggerListener {
  private readonly logger = new Logger('DatabaseEventTriggerListener');

  constructor(
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    @InjectMessageQueue(MessageQueue.workflowQueue)
    private readonly messageQueueService: MessageQueueService,
    private readonly isFeatureFlagEnabledService: FeatureFlagService,
  ) {}

  @OnDatabaseBatchEvent('*', DatabaseEventAction.CREATED)
  async handleObjectRecordCreateEvent(
    payload: WorkspaceEventBatch<ObjectRecordCreateEvent>,
  ) {
    await this.handleEvent(payload);
  }

  @OnDatabaseBatchEvent('*', DatabaseEventAction.UPDATED)
  async handleObjectRecordUpdateEvent(
    payload: WorkspaceEventBatch<ObjectRecordUpdateEvent>,
  ) {
    await this.handleEvent(payload);
  }

  @OnDatabaseBatchEvent('*', DatabaseEventAction.DELETED)
  async handleObjectRecordDeleteEvent(
    payload: WorkspaceEventBatch<ObjectRecordDeleteEvent>,
  ) {
    await this.handleEvent(payload);
  }

  @OnDatabaseBatchEvent('*', DatabaseEventAction.DESTROYED)
  async handleObjectRecordDestroyEvent(
    payload: WorkspaceEventBatch<ObjectRecordDestroyEvent>,
  ) {
    await this.handleEvent(payload);
  }

  private async handleEvent(
    payload: WorkspaceEventBatch<
      | ObjectRecordCreateEvent
      | ObjectRecordUpdateEvent
      | ObjectRecordDeleteEvent
      | ObjectRecordDestroyEvent
    >,
  ) {
    const workspaceId = payload.workspaceId;
    const databaseEventName = payload.name;

    if (!workspaceId || !databaseEventName) {
      this.logger.error(
        `Missing workspaceId or eventName in payload ${JSON.stringify(
          payload,
        )}`,
      );

      return;
    }

    for (const eventPayload of payload.events) {
      console.log('eventPayload44', eventPayload.properties);
    }

    const isWorkflowEnabled =
      await this.isFeatureFlagEnabledService.isFeatureEnabled(
        FeatureFlagKey.IsWorkflowEnabled,
        workspaceId,
      );

    for (const eventPayload of payload.events) {
      console.log('eventPayload55', eventPayload.properties);
    }

    if (!isWorkflowEnabled) {
      return;
    }

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
    for (const eventPayload of payload.events) {
      console.log('eventPayload3', eventPayload.properties);
    }

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
        this.messageQueueService.add<WorkflowTriggerJobData>(
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
