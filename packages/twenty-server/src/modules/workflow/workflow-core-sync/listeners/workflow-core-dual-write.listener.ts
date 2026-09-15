import { Injectable } from '@nestjs/common';

import {
  type ObjectRecordCreateEvent,
  type ObjectRecordDeleteEvent,
  type ObjectRecordDestroyEvent,
  type ObjectRecordRestoreEvent,
  type ObjectRecordUpdateEvent,
} from 'twenty-shared/database-events';
import { isDefined } from 'twenty-shared/utils';

import { OnDatabaseBatchEvent } from 'src/engine/api/graphql/graphql-query-runner/decorators/on-database-batch-event.decorator';
import { DatabaseEventAction } from 'src/engine/api/graphql/graphql-query-runner/enums/database-event-action';
import { ExceptionHandlerService } from 'src/engine/core-modules/exception-handler/exception-handler.service';
import { WorkflowCoreSyncService } from 'src/engine/core-modules/workflow/services/workflow-core-sync.service';
import { type CustomWorkspaceEventBatch } from 'src/engine/workspace-event-emitter/types/custom-workspace-batch-event.type';
import { type WorkflowWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow.workspace-entity';

@Injectable()
export class WorkflowCoreDualWriteListener {
  constructor(
    private readonly exceptionHandlerService: ExceptionHandlerService,
    private readonly workflowCoreSyncService: WorkflowCoreSyncService,
  ) {}

  @OnDatabaseBatchEvent('workflow', DatabaseEventAction.CREATED)
  async handleCreated(
    batchEvent: CustomWorkspaceEventBatch<
      ObjectRecordCreateEvent<WorkflowWorkspaceEntity>
    >,
  ): Promise<void> {
    await this.upsertToCore(
      batchEvent.workspaceId,
      batchEvent.events.map((event) => event.properties.after),
    );
  }

  @OnDatabaseBatchEvent('workflow', DatabaseEventAction.UPDATED)
  async handleUpdated(
    batchEvent: CustomWorkspaceEventBatch<
      ObjectRecordUpdateEvent<WorkflowWorkspaceEntity>
    >,
  ): Promise<void> {
    await this.upsertToCore(
      batchEvent.workspaceId,
      batchEvent.events.map((event) => event.properties.after),
    );
  }

  @OnDatabaseBatchEvent('workflow', DatabaseEventAction.RESTORED)
  async handleRestored(
    batchEvent: CustomWorkspaceEventBatch<
      ObjectRecordRestoreEvent<WorkflowWorkspaceEntity>
    >,
  ): Promise<void> {
    await this.upsertToCore(
      batchEvent.workspaceId,
      batchEvent.events.map((event) => event.properties.after),
    );
  }

  @OnDatabaseBatchEvent('workflow', DatabaseEventAction.DELETED)
  async handleDeleted(
    batchEvent: CustomWorkspaceEventBatch<
      ObjectRecordDeleteEvent<WorkflowWorkspaceEntity>
    >,
  ): Promise<void> {
    await this.deleteFromCore(
      batchEvent.workspaceId,
      batchEvent.events
        .map((event) => event.properties.before.coreWorkflowId)
        .filter(isDefined),
    );
  }

  @OnDatabaseBatchEvent('workflow', DatabaseEventAction.DESTROYED)
  async handleDestroyed(
    batchEvent: CustomWorkspaceEventBatch<
      ObjectRecordDestroyEvent<WorkflowWorkspaceEntity>
    >,
  ): Promise<void> {
    await this.deleteFromCore(
      batchEvent.workspaceId,
      batchEvent.events
        .map((event) => event.properties.before.coreWorkflowId)
        .filter(isDefined),
    );
  }

  private async upsertToCore(
    workspaceId: string | undefined,
    workflows: WorkflowWorkspaceEntity[],
  ): Promise<void> {
    if (!isDefined(workspaceId)) {
      return;
    }

    try {
      await this.workflowCoreSyncService.upsertToCore(workspaceId, workflows);
    } catch (error) {
      this.exceptionHandlerService.captureExceptions([error], {
        workspace: { id: workspaceId },
      });
    }
  }

  private async deleteFromCore(
    workspaceId: string | undefined,
    coreWorkflowIds: string[],
  ): Promise<void> {
    if (!isDefined(workspaceId)) {
      return;
    }

    try {
      await this.workflowCoreSyncService.deleteFromCore(
        workspaceId,
        coreWorkflowIds,
      );
    } catch (error) {
      this.exceptionHandlerService.captureExceptions([error], {
        workspace: { id: workspaceId },
      });
    }
  }
}
