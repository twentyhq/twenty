import { Logger, Scope } from '@nestjs/common';

import isEqual from 'lodash.isequal';
import { isDefined } from 'twenty-shared/utils';
import { In } from 'typeorm';

import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { ServerlessFunctionService } from 'src/engine/metadata-modules/serverless-function/serverless-function.service';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { type WorkspaceRepository } from 'src/engine/twenty-orm/repository/workspace.repository';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import {
  WorkflowVersionStepException,
  WorkflowVersionStepExceptionCode,
} from 'src/modules/workflow/common/exceptions/workflow-version-step.exception';
import {
  WorkflowVersionStatus,
  type WorkflowVersionWorkspaceEntity,
} from 'src/modules/workflow/common/standard-objects/workflow-version.workspace-entity';
import {
  WorkflowStatus,
  type WorkflowWorkspaceEntity,
} from 'src/modules/workflow/common/standard-objects/workflow.workspace-entity';
import {
  type WorkflowAction,
  WorkflowActionType,
} from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

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
    private readonly serverlessFunctionService: ServerlessFunctionService,
  ) {}

  @Process(WorkflowStatusesUpdateJob.name)
  async handle(event: WorkflowVersionBatchEvent): Promise<void> {
    const authContext = buildSystemAuthContext(event.workspaceId);

    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      authContext,
      async () => {
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
      },
    );
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

  private async handlePublishServerlessFunction({
    statusUpdate,
    workspaceId,
    workflowVersion,
    workflowVersionRepository,
  }: {
    statusUpdate: WorkflowVersionStatusUpdate;
    workspaceId: string;
    workflowVersion: WorkflowVersionWorkspaceEntity;
    workflowVersionRepository: WorkspaceRepository<WorkflowVersionWorkspaceEntity>;
  }) {
    const shouldComputeNewSteps =
      statusUpdate.newStatus === WorkflowVersionStatus.ACTIVE &&
      isDefined(workflowVersion.steps) &&
      workflowVersion.steps.filter(
        (step) => step.type === WorkflowActionType.CODE,
      ).length > 0;

    if (shouldComputeNewSteps) {
      const newSteps: WorkflowAction[] = [];

      for (const step of workflowVersion.steps || []) {
        const newStep = { ...step };

        if (step.type === WorkflowActionType.CODE) {
          const serverlessFunction =
            await this.serverlessFunctionService.publishOneServerlessFunctionOrFail(
              step.settings.input.serverlessFunctionId,
              workspaceId,
            );

          const newStepSettings = { ...step.settings };

          if (!isDefined(serverlessFunction.latestVersion)) {
            throw new WorkflowVersionStepException(
              `Fail to publish serverless function ${serverlessFunction.id}. Latest version is null`,
              WorkflowVersionStepExceptionCode.CODE_STEP_FAILURE,
            );
          }

          newStepSettings.input.serverlessFunctionVersion =
            serverlessFunction.latestVersion;

          newStep.settings = newStepSettings;
        }

        newSteps.push(newStep);
      }

      await workflowVersionRepository.update(statusUpdate.workflowVersionId, {
        steps: newSteps,
      });
    }
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

    const workflowVersion = await workflowVersionRepository.findOneOrFail({
      where: { id: statusUpdate.workflowVersionId },
    });

    await this.handlePublishServerlessFunction({
      workflowVersion,
      workflowVersionRepository,
      workspaceId,
      statusUpdate,
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
