import { Scope } from '@nestjs/common';

import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { TwentyORMManager } from 'src/engine/twenty-orm/twenty-orm.manager';
import { WorkflowVersionStatus } from 'src/modules/workflow/common/standard-objects/workflow-version.workspace-entity';
import { WorkflowWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow.workspace-entity';
import { getStatusCombinationFromArray } from 'src/modules/workflow/workflow-status/utils/get-status-combination-from-array.util';
import { getStatusCombinationFromUpdate } from 'src/modules/workflow/workflow-status/utils/get-status-combination-from-update.util';
import { getWorkflowStatusesFromCombination } from 'src/modules/workflow/workflow-status/utils/get-statuses-from-combination.util';

export enum WorkflowVersionEventType {
  CREATE = 'CREATE',
  STATUS_UPDATE = 'STATUS_UPDATE',
  DELETE = 'DELETE',
}

export type WorkflowVersionBatchEvent = {
  workspaceId: string;
} & (
  | WorkflowVersionBatchCreateEvent
  | WorkflowVersionBatchStatusUpdate
  | WorkflowVersionBatchDelete
);

export type WorkflowVersionBatchCreateEvent = {
  type: WorkflowVersionEventType.CREATE;
} & {
  workflowIds: string[];
};

export type WorkflowVersionStatusUpdate = {
  workflowId: string;
  previousStatus: WorkflowVersionStatus;
  newStatus: WorkflowVersionStatus;
};

export type WorkflowVersionBatchStatusUpdate = {
  type: WorkflowVersionEventType.STATUS_UPDATE;
} & {
  statusUpdates: WorkflowVersionStatusUpdate[];
};

export type WorkflowVersionBatchDelete = {
  type: WorkflowVersionEventType.DELETE;
} & { workflowIds: string[] };

@Processor({ queueName: MessageQueue.workflowQueue, scope: Scope.REQUEST })
export class WorkflowStatusesUpdateJob {
  constructor(private readonly twentyORMManager: TwentyORMManager) {}

  @Process(WorkflowStatusesUpdateJob.name)
  async handle(event: WorkflowVersionBatchEvent): Promise<void> {
    switch (event.type) {
      case WorkflowVersionEventType.CREATE:
        await Promise.all(
          event.workflowIds.map((workflowId) =>
            this.handleWorkflowVersionCreated(workflowId),
          ),
        );
        break;
      case WorkflowVersionEventType.STATUS_UPDATE:
        await Promise.all(
          event.statusUpdates.map((statusUpdate) =>
            this.handleWorkflowVersionStatusUpdated(statusUpdate),
          ),
        );
        break;
      case WorkflowVersionEventType.DELETE:
        await Promise.all(
          event.workflowIds.map((workflowId) =>
            this.handleWorkflowVersionDeleted(workflowId),
          ),
        );
        break;
      default:
        break;
    }
  }

  private async handleWorkflowVersionCreated(
    workflowId: string,
  ): Promise<void> {
    const workflowRepository =
      await this.twentyORMManager.getRepository<WorkflowWorkspaceEntity>(
        'workflow',
      );

    const workflow = await workflowRepository.findOneOrFail({
      where: {
        id: workflowId,
      },
    });

    const currentWorkflowStatusCombination = getStatusCombinationFromArray(
      workflow.statuses || [],
    );

    const newWorkflowStatusCombination = getStatusCombinationFromUpdate(
      currentWorkflowStatusCombination,
      undefined,
      WorkflowVersionStatus.DRAFT,
    );

    if (newWorkflowStatusCombination === currentWorkflowStatusCombination) {
      return;
    }

    await workflowRepository.update(
      {
        id: workflow.id,
      },
      {
        statuses: getWorkflowStatusesFromCombination(
          newWorkflowStatusCombination,
        ),
      },
    );
  }

  private async handleWorkflowVersionStatusUpdated(
    statusUpdate: WorkflowVersionStatusUpdate,
  ): Promise<void> {
    const workflowRepository =
      await this.twentyORMManager.getRepository<WorkflowWorkspaceEntity>(
        'workflow',
      );

    const workflow = await workflowRepository.findOneOrFail({
      where: {
        id: statusUpdate.workflowId,
      },
    });

    const currentWorkflowStatusCombination = getStatusCombinationFromArray(
      workflow.statuses || [],
    );

    const newWorkflowStatusCombination = getStatusCombinationFromUpdate(
      currentWorkflowStatusCombination,
      statusUpdate.previousStatus,
      statusUpdate.newStatus,
    );

    if (newWorkflowStatusCombination === currentWorkflowStatusCombination) {
      return;
    }

    await workflowRepository.update(
      {
        id: statusUpdate.workflowId,
      },
      {
        statuses: getWorkflowStatusesFromCombination(
          newWorkflowStatusCombination,
        ),
      },
    );
  }

  private async handleWorkflowVersionDeleted(
    workflowId: string,
  ): Promise<void> {
    const workflowRepository =
      await this.twentyORMManager.getRepository<WorkflowWorkspaceEntity>(
        'workflow',
      );

    const workflow = await workflowRepository.findOneOrFail({
      where: {
        id: workflowId,
      },
    });

    const currentWorkflowStatusCombination = getStatusCombinationFromArray(
      workflow.statuses || [],
    );

    const newWorkflowStatusCombination = getStatusCombinationFromUpdate(
      currentWorkflowStatusCombination,
      WorkflowVersionStatus.DRAFT,
      undefined,
    );

    if (newWorkflowStatusCombination === currentWorkflowStatusCombination) {
      return;
    }

    await workflowRepository.update(
      {
        id: workflowId,
      },
      {
        statuses: getWorkflowStatusesFromCombination(
          newWorkflowStatusCombination,
        ),
      },
    );
  }
}
