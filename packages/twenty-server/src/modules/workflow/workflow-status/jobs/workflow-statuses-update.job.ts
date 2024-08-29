import { Scope } from '@nestjs/common';

import { isEqual } from 'lodash';

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

export type WorkflowVersionEvent = { workspaceId: string } & (
  | WorkflowVersionCreated
  | WorkflowVersionStatusUpdate
  | WorkflowVersionDeleted
);

export type WorkflowVersionCreated = {
  type: WorkflowVersionEventType.CREATE;
  workflowId: string;
};

export type WorkflowVersionStatusUpdate = {
  type: WorkflowVersionEventType.STATUS_UPDATE;
  workflowId: string;
  previousStatus: WorkflowVersionStatus;
  newStatus: WorkflowVersionStatus;
};

export type WorkflowVersionDeleted = {
  type: WorkflowVersionEventType.DELETE;
  workflowId: string;
};

@Processor({ queueName: MessageQueue.workflowQueue, scope: Scope.REQUEST })
export class WorkflowStatusesUpdateJob {
  constructor(private readonly twentyORMManager: TwentyORMManager) {}

  async handle(event: WorkflowVersionEvent): Promise<void> {
    switch (event.type) {
      case WorkflowVersionEventType.CREATE:
        return this.handleWorkflowVersionCreated(event);
      case WorkflowVersionEventType.STATUS_UPDATE:
        return this.handleWorkflowVersionStatusUpdated(event);
      case WorkflowVersionEventType.DELETE:
        return this.handleWorkflowVersionDeleted(event);
    }
  }

  private async handleWorkflowVersionCreated(
    event: WorkflowVersionCreated,
  ): Promise<void> {
    const workflowRepository =
      await this.twentyORMManager.getRepository<WorkflowWorkspaceEntity>(
        'workflow',
      );

    const workflow = await workflowRepository.findOneOrFail({
      where: {
        id: event.workflowId,
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
    event: WorkflowVersionStatusUpdate,
  ): Promise<void> {
    const workflowRepository =
      await this.twentyORMManager.getRepository<WorkflowWorkspaceEntity>(
        'workflow',
      );

    const workflow = await workflowRepository.findOneOrFail({
      where: {
        id: event.workflowId,
      },
    });

    const currentWorkflowStatuses = workflow.statuses || [];
    let newWorkflowStatuses = new Set<WorkflowStatus>(currentWorkflowStatuses);

    if (
      event.previousStatus === WorkflowVersionStatus.DEACTIVATED &&
      event.newStatus === WorkflowVersionStatus.ACTIVE
    ) {
      newWorkflowStatuses = await this.buildStatusesFromNewActivation(
        currentWorkflowStatuses,
      );
    }

    if (
      event.previousStatus === WorkflowVersionStatus.ACTIVE &&
      event.newStatus === WorkflowVersionStatus.DEACTIVATED
    ) {
      newWorkflowStatuses = await this.buildStatusesFromDeactivation(
        event.workflowId,
        currentWorkflowStatuses,
      );
    }

    if (
      event.previousStatus === WorkflowVersionStatus.DRAFT &&
      event.newStatus === WorkflowVersionStatus.ACTIVE
    ) {
      newWorkflowStatuses = await this.buildStatusesFromFirstActivation(
        event.workflowId,
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
        id: event.workflowId,
      },
      {
        statuses: newWorkflowStatusesArray,
      },
    );
  }

  private async handleWorkflowVersionDeleted(
    event: WorkflowVersionDeleted,
  ): Promise<void> {
    const workflowRepository =
      await this.twentyORMManager.getRepository<WorkflowWorkspaceEntity>(
        'workflow',
      );

    const workflow = await workflowRepository.findOneOrFail({
      where: {
        id: event.workflowId,
      },
    });

    const currentWorkflowStatuses = workflow.statuses || [];

    if (!currentWorkflowStatuses.includes(WorkflowStatus.DRAFT)) {
      return;
    }

    const hasWorkflowVersionByStatus = await this.hasWorkflowVersionByStatus(
      event.workflowId,
      WorkflowVersionStatus.DRAFT,
    );

    if (hasWorkflowVersionByStatus) {
      return;
    }

    await workflowRepository.update(
      {
        id: event.workflowId,
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
