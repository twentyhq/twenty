import { Injectable } from '@nestjs/common';

import { ActorMetadata } from 'src/engine/metadata-modules/field-metadata/composite-types/actor.composite-type';
import { TwentyORMManager } from 'src/engine/twenty-orm/twenty-orm.manager';
import {
  WorkflowRunStatus,
  WorkflowRunWorkspaceEntity,
} from 'src/modules/workflow/common/standard-objects/workflow-run.workspace-entity';
import {
  WorkflowStatusException,
  WorkflowStatusExceptionCode,
} from 'src/modules/workflow/workflow-status/workflow-status.exception';

@Injectable()
export class WorkflowStatusWorkspaceService {
  constructor(private readonly twentyORMManager: TwentyORMManager) {}

  async createWorkflowRun(workflowVersionId: string, createdBy: ActorMetadata) {
    const workflowRunRepository =
      await this.twentyORMManager.getRepository<WorkflowRunWorkspaceEntity>(
        'workflowRun',
      );

    return (
      await workflowRunRepository.save({
        workflowVersionId,
        createdBy,
        status: WorkflowRunStatus.NOT_STARTED,
      })
    ).id;
  }

  async startWorkflowRun(workflowRunId: string) {
    const workflowRunRepository =
      await this.twentyORMManager.getRepository<WorkflowRunWorkspaceEntity>(
        'workflowRun',
      );

    const workflowRunToUpdate = await workflowRunRepository.findOneBy({
      id: workflowRunId,
    });

    if (!workflowRunToUpdate) {
      throw new WorkflowStatusException(
        'No workflow run to start',
        WorkflowStatusExceptionCode.WORKFLOW_RUN_NOT_FOUND,
      );
    }

    if (workflowRunToUpdate.status !== WorkflowRunStatus.NOT_STARTED) {
      throw new WorkflowStatusException(
        'Workflow run already started',
        WorkflowStatusExceptionCode.INVALID_OPERATION,
      );
    }

    return workflowRunRepository.update(workflowRunToUpdate.id, {
      status: WorkflowRunStatus.RUNNING,
      startedAt: new Date().toISOString(),
    });
  }

  async endWorkflowRun(workflowRunId: string, status: WorkflowRunStatus) {
    const workflowRunRepository =
      await this.twentyORMManager.getRepository<WorkflowRunWorkspaceEntity>(
        'workflowRun',
      );

    const workflowRunToUpdate = await workflowRunRepository.findOneBy({
      id: workflowRunId,
    });

    if (!workflowRunToUpdate) {
      throw new WorkflowStatusException(
        'No workflow run to end',
        WorkflowStatusExceptionCode.WORKFLOW_RUN_NOT_FOUND,
      );
    }

    if (workflowRunToUpdate.status !== WorkflowRunStatus.RUNNING) {
      throw new WorkflowStatusException(
        'Workflow cannot be ended as it is not running',
        WorkflowStatusExceptionCode.INVALID_OPERATION,
      );
    }

    return workflowRunRepository.update(workflowRunToUpdate.id, {
      status,
      endedAt: new Date().toISOString(),
    });
  }
}
