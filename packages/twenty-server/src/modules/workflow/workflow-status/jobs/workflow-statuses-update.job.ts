import { Scope } from '@nestjs/common';

import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { TwentyORMManager } from 'src/engine/twenty-orm/twenty-orm.manager';
import {
  WorkflowVersionStatus,
  WorkflowVersionWorkspaceEntity,
} from 'src/modules/workflow/common/standard-objects/workflow-version.workspace-entity';
import { WorkflowWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow.workspace-entity';
import { getStatusCombinationFromArray } from 'src/modules/workflow/workflow-status/utils/get-status-combination-from-array.util';
import { getStatusCombinationFromUpdate } from 'src/modules/workflow/workflow-status/utils/get-status-combination-from-update.util';
import { getWorkflowStatusesFromCombination } from 'src/modules/workflow/workflow-status/utils/get-statuses-from-combination.util';
import { ServerlessFunctionService } from 'src/engine/metadata-modules/serverless-function/serverless-function.service';
import {
  WorkflowAction,
  WorkflowActionType,
} from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';
import { isDefined } from 'src/utils/is-defined';
import { WorkspaceRepository } from 'src/engine/twenty-orm/repository/workspace.repository';

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
  constructor(
    private readonly twentyORMManager: TwentyORMManager,
    private readonly serverlessFunctionService: ServerlessFunctionService,
  ) {}

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
            this.handleWorkflowVersionStatusUpdated(
              statusUpdate,
              event.workspaceId,
            ),
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
          let serverlessFunction;

          try {
            serverlessFunction =
              await this.serverlessFunctionService.publishOneServerlessFunction(
                step.settings.input.serverlessFunctionId,
                workspaceId,
              );
          } catch (e) {
            serverlessFunction = null;
          }

          if (serverlessFunction) {
            const newStepSettings = { ...step.settings };

            newStepSettings.input.serverlessFunctionVersion =
              serverlessFunction.latestVersion;

            newStep.settings = newStepSettings;
          }
        }
        newSteps.push(newStep);
      }

      await workflowVersionRepository.update(statusUpdate.workflowVersionId, {
        steps: newSteps,
      });
    }
  }

  private async handleWorkflowVersionStatusUpdated(
    statusUpdate: WorkflowVersionStatusUpdate,
    workspaceId: string,
  ): Promise<void> {
    const workflowRepository =
      await this.twentyORMManager.getRepository<WorkflowWorkspaceEntity>(
        'workflow',
      );

    const workflowVersionRepository =
      await this.twentyORMManager.getRepository<WorkflowVersionWorkspaceEntity>(
        'workflowVersion',
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
