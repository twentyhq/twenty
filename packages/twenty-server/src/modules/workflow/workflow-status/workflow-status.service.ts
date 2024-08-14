import { Injectable } from '@nestjs/common';

import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import {
  WorkflowRunStatus,
  WorkflowRunWorkspaceEntity,
} from 'src/modules/workflow/common/standard-objects/workflow-run.workspace-entity';
import {
  WorkflowStatusException,
  WorkflowStatusExceptionCode,
} from 'src/modules/workflow/workflow-status/workflow-status.exception';

@Injectable()
export class WorkflowStatusService {
  constructor(
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
  ) {}

  async createWorkflowRun(workspaceId: string, workflowVersionId: string) {
    const workflowRunDataSource =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<WorkflowRunWorkspaceEntity>(
        workspaceId,
        'workflowRun',
      );

    const onGoingWorkflowRuns = (
      await workflowRunDataSource.findBy({
        workflowVersionId,
      })
    ).filter((workflow) =>
      [WorkflowRunStatus.NOT_STARTED, WorkflowRunStatus.RUNNING].includes(
        workflow.status,
      ),
    );

    if (onGoingWorkflowRuns.length > 0) {
      throw new WorkflowStatusException(
        'There is already an on going workflow run',
        WorkflowStatusExceptionCode.WORKFLOW_RUN_ALREADY_STARTED,
      );
    }

    const workflowRunToCreate = await workflowRunDataSource.create({
      workflowVersionId,
      status: WorkflowRunStatus.NOT_STARTED,
    });

    return workflowRunDataSource.save(workflowRunToCreate);
  }

  async startWorkflowRun(workspaceId: string, workflowVersionId: string) {
    const workflowRunDataSource =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<WorkflowRunWorkspaceEntity>(
        workspaceId,
        'workflowRun',
      );

    const workflowRunToUpdate = await workflowRunDataSource.findOneBy({
      workflowVersionId,
      status: WorkflowRunStatus.NOT_STARTED,
    });

    if (!workflowRunToUpdate) {
      throw new WorkflowStatusException(
        'No workflow run to start',
        WorkflowStatusExceptionCode.WORKFLOW_RUN_NOT_FOUND,
      );
    }

    return workflowRunDataSource.update(workflowRunToUpdate.id, {
      status: WorkflowRunStatus.RUNNING,
      startedAt: new Date().toISOString(),
    });
  }

  async endWorkflowRun(
    workspaceId: string,
    workflowVersionId: string,
    status: WorkflowRunStatus,
  ) {
    const workflowRunDataSource =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<WorkflowRunWorkspaceEntity>(
        workspaceId,
        'workflowRun',
      );

    const workflowRunToUpdate = await workflowRunDataSource.findOneBy({
      workflowVersionId,
      status: WorkflowRunStatus.RUNNING,
    });

    if (!workflowRunToUpdate) {
      throw new WorkflowStatusException(
        'No workflow run to end',
        WorkflowStatusExceptionCode.WORKFLOW_RUN_NOT_FOUND,
      );
    }

    return workflowRunDataSource.update(workflowRunToUpdate.id, {
      status,
      endedAt: new Date().toISOString(),
    });
  }
}
