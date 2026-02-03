import { Logger, Scope } from '@nestjs/common';

import isEqual from 'lodash.isequal';
import { In } from 'typeorm';

import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { type WorkspaceRepository } from 'src/engine/twenty-orm/repository/workspace.repository';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import {
  WorkflowVersionStatus,
  type WorkflowVersionWorkspaceEntity,
} from 'src/modules/workflow/common/standard-objects/workflow-version.workspace-entity';
import {
  WorkflowStatus,
  type WorkflowWorkspaceEntity,
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

  constructor(
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
  ) {}

  @Process(WorkflowStatusesUpdateJob.name)
  async handle(event: WorkflowVersionBatchEvent): Promise<void> {
    const authContext = buildSystemAuthContext(event.workspaceId);

    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(async () => {
      switch (event.type) {
        case WorkflowVersionEventType.CREATE:
        case WorkflowVersionEventType.DELETE:
          await Promise.all(
            event.workflowIds.map((workflowId) =>
              this.handleWorkflowVersionCreatedOrDeleted({
                workflowId,
                workspaceId: event.workspaceId,
              }),
            ),
          );
          break;
        case WorkflowVersionEventType.STATUS_UPDATE:
          await Promise.all(
            event.statusUpdates.map((statusUpdate) =>
              this.handleWorkflowVersionStatusUpdated({
                statusUpdate,
                workspaceId: event.workspaceId,
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
    workspaceId,
  }: {
    workflowId: string;
    workspaceId: string;
  }): Promise<void> {
    const workflowRepository =
      await this.globalWorkspaceOrmManager.getRepository<WorkflowWorkspaceEntity>(
        workspaceId,
        'workflow',
        { shouldBypassPermissionChecks: true },
      );

    const workflowVersionRepository =
      await this.globalWorkspaceOrmManager.getRepository<WorkflowVersionWorkspaceEntity>(
        workspaceId,
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
    workspaceId,
  }: {
    statusUpdate: WorkflowVersionStatusUpdate;
    workspaceId: string;
  }): Promise<void> {
    const workflowRepository =
      await this.globalWorkspaceOrmManager.getRepository<WorkflowWorkspaceEntity>(
        workspaceId,
        'workflow',
        { shouldBypassPermissionChecks: true },
      );

    const workflowVersionRepository =
      await this.globalWorkspaceOrmManager.getRepository<WorkflowVersionWorkspaceEntity>(
        workspaceId,
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
    const statuses: WorkflowStatus[] = [];

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

    const hasDraftVersion = workflowVersions.some(
      (version) => version.status === WorkflowVersionStatus.DRAFT,
    );

    if (hasDraftVersion) {
      statuses.push(WorkflowStatus.DRAFT);
    }

    const hasActiveVersion = workflowVersions.some(
      (version) => version.status === WorkflowVersionStatus.ACTIVE,
    );

    if (hasActiveVersion) {
      statuses.push(WorkflowStatus.ACTIVE);
    }

    const hasDeactivatedVersion = workflowVersions.some(
      (version) => version.status === WorkflowVersionStatus.DEACTIVATED,
    );

    if (!hasActiveVersion && hasDeactivatedVersion) {
      statuses.push(WorkflowStatus.DEACTIVATED);
    }

    return statuses;
  }
}
