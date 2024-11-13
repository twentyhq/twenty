import { Injectable } from '@nestjs/common';

import { ActorMetadata } from 'src/engine/metadata-modules/field-metadata/composite-types/actor.composite-type';
import { TwentyORMManager } from 'src/engine/twenty-orm/twenty-orm.manager';
import {
  WorkflowRunOutput,
  WorkflowRunStatus,
  WorkflowRunWorkspaceEntity,
} from 'src/modules/workflow/common/standard-objects/workflow-run.workspace-entity';
import { WorkflowCommonWorkspaceService } from 'src/modules/workflow/common/workspace-services/workflow-common.workspace-service';
import {
  WorkflowRunException,
  WorkflowRunExceptionCode,
} from 'src/modules/workflow/workflow-runner/exceptions/workflow-run.exception';

@Injectable()
export class WorkflowRunWorkspaceService {
  constructor(
    private readonly twentyORMManager: TwentyORMManager,
    private readonly workflowCommonWorkspaceService: WorkflowCommonWorkspaceService,
  ) {}

  async createWorkflowRun(workflowVersionId: string, createdBy: ActorMetadata) {
    const workflowRunRepository =
      await this.twentyORMManager.getRepository<WorkflowRunWorkspaceEntity>(
        'workflowRun',
      );

    const workflowVersion =
      await this.workflowCommonWorkspaceService.getWorkflowVersionOrFail(
        workflowVersionId,
      );

    return (
      await workflowRunRepository.save({
        name: `Execution of ${workflowVersion.name}`,
        workflowVersionId,
        createdBy,
        workflowId: workflowVersion.workflowId,
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
      throw new WorkflowRunException(
        'No workflow run to start',
        WorkflowRunExceptionCode.WORKFLOW_RUN_NOT_FOUND,
      );
    }

    if (workflowRunToUpdate.status !== WorkflowRunStatus.NOT_STARTED) {
      throw new WorkflowRunException(
        'Workflow run already started',
        WorkflowRunExceptionCode.INVALID_OPERATION,
      );
    }

    return workflowRunRepository.update(workflowRunToUpdate.id, {
      status: WorkflowRunStatus.RUNNING,
      startedAt: new Date().toISOString(),
    });
  }

  async endWorkflowRun(
    workflowRunId: string,
    status: WorkflowRunStatus,
    output: WorkflowRunOutput,
  ) {
    const workflowRunRepository =
      await this.twentyORMManager.getRepository<WorkflowRunWorkspaceEntity>(
        'workflowRun',
      );

    const workflowRunToUpdate = await workflowRunRepository.findOneBy({
      id: workflowRunId,
    });

    if (!workflowRunToUpdate) {
      throw new WorkflowRunException(
        'No workflow run to end',
        WorkflowRunExceptionCode.WORKFLOW_RUN_NOT_FOUND,
      );
    }

    if (workflowRunToUpdate.status !== WorkflowRunStatus.RUNNING) {
      throw new WorkflowRunException(
        'Workflow cannot be ended as it is not running',
        WorkflowRunExceptionCode.INVALID_OPERATION,
      );
    }

    return workflowRunRepository.update(workflowRunToUpdate.id, {
      status,
      output,
      endedAt: new Date().toISOString(),
    });
  }
}
