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
import { WorkflowVersionCoreSyncService } from 'src/engine/core-modules/workflow/services/workflow-version-core-sync.service';
import { type CustomWorkspaceEventBatch } from 'src/engine/workspace-event-emitter/types/custom-workspace-batch-event.type';
import { type WorkflowVersionWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow-version.workspace-entity';

@Injectable()
export class WorkflowVersionCoreDualWriteListener {
  constructor(
    private readonly exceptionHandlerService: ExceptionHandlerService,
    private readonly workflowVersionCoreSyncService: WorkflowVersionCoreSyncService,
  ) {}

  @OnDatabaseBatchEvent('workflowVersion', DatabaseEventAction.CREATED)
  async handleCreated(
    batchEvent: CustomWorkspaceEventBatch<
      ObjectRecordCreateEvent<WorkflowVersionWorkspaceEntity>
    >,
  ): Promise<void> {
    await this.upsertToCore(
      batchEvent.workspaceId,
      batchEvent.events.map((event) => event.properties.after),
    );
  }

  @OnDatabaseBatchEvent('workflowVersion', DatabaseEventAction.UPDATED)
  async handleUpdated(
    batchEvent: CustomWorkspaceEventBatch<
      ObjectRecordUpdateEvent<WorkflowVersionWorkspaceEntity>
    >,
  ): Promise<void> {
    await this.upsertToCore(
      batchEvent.workspaceId,
      batchEvent.events.map((event) => event.properties.after),
    );
  }

  @OnDatabaseBatchEvent('workflowVersion', DatabaseEventAction.RESTORED)
  async handleRestored(
    batchEvent: CustomWorkspaceEventBatch<
      ObjectRecordRestoreEvent<WorkflowVersionWorkspaceEntity>
    >,
  ): Promise<void> {
    await this.upsertToCore(
      batchEvent.workspaceId,
      batchEvent.events.map((event) => event.properties.after),
    );
  }

  @OnDatabaseBatchEvent('workflowVersion', DatabaseEventAction.DELETED)
  async handleDeleted(
    batchEvent: CustomWorkspaceEventBatch<
      ObjectRecordDeleteEvent<WorkflowVersionWorkspaceEntity>
    >,
  ): Promise<void> {
    await this.deleteFromCore(
      batchEvent.workspaceId,
      batchEvent.events
        .map((event) => event.properties.before.coreWorkflowVersionId)
        .filter(isDefined),
    );
  }

  @OnDatabaseBatchEvent('workflowVersion', DatabaseEventAction.DESTROYED)
  async handleDestroyed(
    batchEvent: CustomWorkspaceEventBatch<
      ObjectRecordDestroyEvent<WorkflowVersionWorkspaceEntity>
    >,
  ): Promise<void> {
    await this.deleteFromCore(
      batchEvent.workspaceId,
      batchEvent.events
        .map((event) => event.properties.before.coreWorkflowVersionId)
        .filter(isDefined),
    );
  }

  private async upsertToCore(
    workspaceId: string | undefined,
    workflowVersions: WorkflowVersionWorkspaceEntity[],
  ): Promise<void> {
    if (!isDefined(workspaceId)) {
      return;
    }

    try {
      await this.workflowVersionCoreSyncService.upsertToCore(
        workspaceId,
        workflowVersions,
      );
    } catch (error) {
      this.exceptionHandlerService.captureExceptions([error], {
        workspace: { id: workspaceId },
      });
    }
  }

  private async deleteFromCore(
    workspaceId: string | undefined,
    coreWorkflowVersionIds: string[],
  ): Promise<void> {
    if (!isDefined(workspaceId)) {
      return;
    }

    try {
      await this.workflowVersionCoreSyncService.deleteFromCore(
        workspaceId,
        coreWorkflowVersionIds,
      );
    } catch (error) {
      this.exceptionHandlerService.captureExceptions([error], {
        workspace: { id: workspaceId },
      });
    }
  }
}
