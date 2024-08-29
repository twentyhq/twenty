import { Scope } from '@nestjs/common';

import isEqual from 'lodash.isequal';

import { Process } from 'src/engine/integrations/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/integrations/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/integrations/message-queue/message-queue.constants';
import { TwentyORMManager } from 'src/engine/twenty-orm/twenty-orm.manager';
import {
  WorkflowVersionStatus,
  WorkflowVersionWorkspaceEntity,
} from 'src/modules/workflow/common/standard-objects/workflow-version.workspace-entity';
import {
  WorkflowStatus,
  WorkflowWorkspaceEntity,
} from 'src/modules/workflow/common/standard-objects/workflow.workspace-entity';

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

    const currentWorkflowStatuses = workflow.statuses || [];

    if (currentWorkflowStatuses.includes(WorkflowStatus.DRAFT)) {
      return;
    }

    await workflowRepository.update(
      {
        id: workflow.id,
      },
      {
        statuses: [...currentWorkflowStatuses, WorkflowStatus.DRAFT],
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

    const currentWorkflowStatuses = workflow.statuses || [];
    let newWorkflowStatuses = new Set<WorkflowStatus>(currentWorkflowStatuses);

    if (
      statusUpdate.previousStatus === WorkflowVersionStatus.DEACTIVATED &&
      statusUpdate.newStatus === WorkflowVersionStatus.ACTIVE
    ) {
      newWorkflowStatuses = await this.buildStatusesFromNewActivation(
        currentWorkflowStatuses,
      );
    }

    if (
      statusUpdate.previousStatus === WorkflowVersionStatus.ACTIVE &&
      statusUpdate.newStatus === WorkflowVersionStatus.DEACTIVATED
    ) {
      newWorkflowStatuses = await this.buildStatusesFromDeactivation(
        statusUpdate.workflowId,
        currentWorkflowStatuses,
      );
    }

    if (
      statusUpdate.previousStatus === WorkflowVersionStatus.DRAFT &&
      statusUpdate.newStatus === WorkflowVersionStatus.ACTIVE
    ) {
      newWorkflowStatuses = await this.buildStatusesFromFirstActivation(
        statusUpdate.workflowId,
      );
    }

    const newWorkflowStatusesArray = Array.from(newWorkflowStatuses);

    if (
      isEqual(newWorkflowStatusesArray.sort(), currentWorkflowStatuses.sort())
    ) {
      return;
    }

    await workflowRepository.update(
      {
        id: statusUpdate.workflowId,
      },
      {
        statuses: newWorkflowStatusesArray,
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

    const currentWorkflowStatuses = workflow.statuses || [];

    if (!currentWorkflowStatuses.includes(WorkflowStatus.DRAFT)) {
      return;
    }

    const hasWorkflowVersionByStatus = await this.hasWorkflowVersionByStatus(
      workflowId,
      WorkflowVersionStatus.DRAFT,
    );

    if (hasWorkflowVersionByStatus) {
      return;
    }

    await workflowRepository.update(
      {
        id: workflowId,
      },
      {
        statuses: currentWorkflowStatuses.filter(
          (status) => status !== WorkflowStatus.DRAFT,
        ),
      },
    );
  }

  private async buildStatusesFromFirstActivation(workflowId: string) {
    const hasWorkflowVersionDraft = await this.hasWorkflowVersionByStatus(
      workflowId,
      WorkflowVersionStatus.DRAFT,
    );

    if (hasWorkflowVersionDraft) {
      return new Set([WorkflowStatus.ACTIVE, WorkflowStatus.DRAFT]);
    }

    return new Set([WorkflowStatus.ACTIVE]);
  }

  private async buildStatusesFromDeactivation(
    workflowId: string,
    currentWorkflowStatuses: WorkflowStatus[],
  ) {
    const hasWorkflowVersionActive = await this.hasWorkflowVersionByStatus(
      workflowId,
      WorkflowVersionStatus.ACTIVE,
    );

    if (hasWorkflowVersionActive) {
      return new Set(currentWorkflowStatuses);
    }

    return new Set(
      currentWorkflowStatuses
        .filter((status) => status !== WorkflowStatus.ACTIVE)
        .concat(WorkflowStatus.DEACTIVATED),
    );
  }

  private async buildStatusesFromNewActivation(
    currentWorkflowStatuses: WorkflowStatus[],
  ) {
    return new Set(
      currentWorkflowStatuses
        .filter((status) => status !== WorkflowStatus.DEACTIVATED)
        .concat(WorkflowStatus.ACTIVE),
    );
  }

  private async hasWorkflowVersionByStatus(
    workflowId: string,
    status: WorkflowVersionStatus,
  ): Promise<boolean> {
    const workflowVersionRepository =
      await this.twentyORMManager.getRepository<WorkflowVersionWorkspaceEntity>(
        'workflowVersion',
      );

    const workflowVersions = await workflowVersionRepository.find({
      where: {
        workflowId,
        status,
      },
    });

    return workflowVersions.length > 0;
  }
}
