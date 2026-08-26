import { Logger, Scope } from '@nestjs/common';

import isEqual from 'lodash.isequal';
import { In } from 'typeorm';

import { computeCoreWorkflowStatuses } from 'src/engine/core-modules/workflow/utils/compute-core-workflow-statuses.util';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { type WorkspaceRepository } from 'src/engine/twenty-orm/repository/workspace-repository';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import {
  WorkflowVersionStatus,
  type WorkflowVersionWorkspaceEntity,
} from 'src/modules/workflow/common/standard-objects/workflow-version.workspace-entity';
import { type WorkflowWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow.workspace-entity';

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
  workflowVersionId: string;
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
  protected readonly logger = new Logger(WorkflowStatusesUpdateJob.name);

  constructor(private readonly workspaceOrmManager: WorkspaceOrmManager) {}

  @Process(WorkflowStatusesUpdateJob.name)
  async handle(event: WorkflowVersionBatchEvent): Promise<void> {
    const authContext = buildSystemAuthContext(event.workspaceId);

    await this.workspaceOrmManager.executeInWorkspaceContext(async () => {
      switch (event.type) {
        case WorkflowVersionEventType.CREATE:
        case WorkflowVersionEventType.DELETE:
          await Promise.all(
            event.workflowIds.map((workflowId) =>
              this.handleWorkflowVersionCreatedOrDeleted({
                workflowId,
              }),
            ),
          );
          break;
        case WorkflowVersionEventType.STATUS_UPDATE:
          await Promise.all(
            event.statusUpdates.map((statusUpdate) =>
              this.handleWorkflowVersionStatusUpdated({
                statusUpdate,
              }),
            ),
          );
          break;
        default:
          break;
      }
    }, authContext);
  }

  private async handleWorkflowVersionCreatedOrDeleted({
    workflowId,
  }: {
    workflowId: string;
  }): Promise<void> {
    const workflowRepository =
      this.workspaceOrmManager.getRepository<WorkflowWorkspaceEntity>(
        'workflow',
        { shouldBypassPermissionChecks: true },
      );

    const workflowVersionRepository =
      this.workspaceOrmManager.getRepository<WorkflowVersionWorkspaceEntity>(
        'workflowVersion',
        { shouldBypassPermissionChecks: true },
      );

    const newWorkflowStatuses = await this.getWorkflowStatuses({
      workflowId,
      workflowVersionRepository,
    });

    const previousWorkflow = await workflowRepository.findOneOrFail({
      where: {
        id: workflowId,
      },
      withDeleted: true,
    });

    if (isEqual(newWorkflowStatuses, previousWorkflow.statuses)) {
      return;
    }

    await workflowRepository.update(
      {
        id: workflowId,
      },
      {
        statuses: newWorkflowStatuses,
      },
    );
  }

  private async handleWorkflowVersionStatusUpdated({
    statusUpdate,
  }: {
    statusUpdate: WorkflowVersionStatusUpdate;
  }): Promise<void> {
    const workflowRepository =
      this.workspaceOrmManager.getRepository<WorkflowWorkspaceEntity>(
        'workflow',
        { shouldBypassPermissionChecks: true },
      );

    const workflowVersionRepository =
      this.workspaceOrmManager.getRepository<WorkflowVersionWorkspaceEntity>(
        'workflowVersion',
        { shouldBypassPermissionChecks: true },
      );

    const workflow = await workflowRepository.findOneOrFail({
      where: {
        id: statusUpdate.workflowId,
      },
    });

    const newWorkflowStatuses = await this.getWorkflowStatuses({
      workflowId: statusUpdate.workflowId,
      workflowVersionRepository,
    });

    if (isEqual(newWorkflowStatuses, workflow.statuses)) {
      return;
    }

    await workflowRepository.update(
      {
        id: statusUpdate.workflowId,
      },
      {
        statuses: newWorkflowStatuses,
      },
    );
  }

  private async getWorkflowStatuses({
    workflowId,
    workflowVersionRepository,
  }: {
    workflowId: string;
    workflowVersionRepository: WorkspaceRepository<WorkflowVersionWorkspaceEntity>;
  }) {
    const workflowVersions = await workflowVersionRepository.find({
      where: {
        workflowId,
        status: In([
          WorkflowVersionStatus.ACTIVE,
          WorkflowVersionStatus.DRAFT,
          WorkflowVersionStatus.DEACTIVATED,
        ]),
      },
    });

    return computeCoreWorkflowStatuses({
      hasDraftVersion: workflowVersions.some(
        (version) => version.status === WorkflowVersionStatus.DRAFT,
      ),
      hasActiveVersion: workflowVersions.some(
        (version) => version.status === WorkflowVersionStatus.ACTIVE,
      ),
      hasDeactivatedVersion: workflowVersions.some(
        (version) => version.status === WorkflowVersionStatus.DEACTIVATED,
      ),
    });
  }
}
