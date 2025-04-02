import { Injectable } from '@nestjs/common';

import { RecordPositionService } from 'src/engine/core-modules/record-position/services/record-position.service';
import { ActorMetadata } from 'src/engine/metadata-modules/field-metadata/composite-types/actor.composite-type';
import { ScopedWorkspaceContextFactory } from 'src/engine/twenty-orm/factories/scoped-workspace-context.factory';
import { TwentyORMManager } from 'src/engine/twenty-orm/twenty-orm.manager';
import {
  StepOutput,
  WorkflowRunOutput,
  WorkflowRunStatus,
  WorkflowRunWorkspaceEntity,
} from 'src/modules/workflow/common/standard-objects/workflow-run.workspace-entity';
import { WorkflowWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow.workspace-entity';
import { WorkflowCommonWorkspaceService } from 'src/modules/workflow/common/workspace-services/workflow-common.workspace-service';
import { WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';
import {
  WorkflowRunException,
  WorkflowRunExceptionCode,
} from 'src/modules/workflow/workflow-runner/exceptions/workflow-run.exception';

@Injectable()
export class WorkflowRunWorkspaceService {
  constructor(
    private readonly twentyORMManager: TwentyORMManager,
    private readonly workflowCommonWorkspaceService: WorkflowCommonWorkspaceService,
    private readonly recordPositionService: RecordPositionService,
    private readonly scopedWorkspaceContextFactory: ScopedWorkspaceContextFactory,
  ) {}

  async createWorkflowRun({
    workflowVersionId,
    createdBy,
  }: {
    workflowVersionId: string;
    createdBy: ActorMetadata;
  }) {
    const workflowRunRepository =
      await this.twentyORMManager.getRepository<WorkflowRunWorkspaceEntity>(
        'workflowRun',
      );

    const workflowVersion =
      await this.workflowCommonWorkspaceService.getWorkflowVersionOrFail(
        workflowVersionId,
      );

    const workflowRepository =
      await this.twentyORMManager.getRepository<WorkflowWorkspaceEntity>(
        'workflow',
      );

    const workflow = await workflowRepository.findOne({
      where: {
        id: workflowVersion.workflowId,
      },
    });

    if (!workflow) {
      throw new WorkflowRunException(
        'Workflow id is invalid',
        WorkflowRunExceptionCode.WORKFLOW_RUN_INVALID,
      );
    }

    const workflowRunCount = await workflowRunRepository.count({
      where: {
        workflowId: workflow.id,
      },
    });

    const workspaceId =
      this.scopedWorkspaceContextFactory.create()?.workspaceId;

    if (!workspaceId) {
      throw new WorkflowRunException(
        'Workspace id is invalid',
        WorkflowRunExceptionCode.WORKFLOW_RUN_INVALID,
      );
    }

    const position = await this.recordPositionService.buildRecordPosition({
      value: 'first',
      objectMetadata: {
        isCustom: false,
        nameSingular: 'workflowRun',
      },
      workspaceId,
    });

    return (
      await workflowRunRepository.save({
        name: `#${workflowRunCount + 1} - ${workflow.name}`,
        workflowVersionId,
        createdBy,
        workflowId: workflow.id,
        status: WorkflowRunStatus.NOT_STARTED,
        position,
      })
    ).id;
  }

  async startWorkflowRun({
    workflowRunId,
    context,
    output,
  }: {
    workflowRunId: string;
    context: Record<string, any>;
    output: Pick<WorkflowRunOutput, 'flow'>;
  }) {
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
      context,
      output,
    });
  }

  async endWorkflowRun({
    workflowRunId,
    status,
    error,
  }: {
    workflowRunId: string;
    status: WorkflowRunStatus;
    error?: string;
  }) {
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

    return workflowRunRepository.update(workflowRunToUpdate.id, {
      status,
      endedAt: new Date().toISOString(),
      output: {
        ...(workflowRunToUpdate.output ?? {}),
        error,
      },
    });
  }

  async saveWorkflowRunState({
    workflowRunId,
    stepOutput,
    context,
  }: {
    workflowRunId: string;
    stepOutput: StepOutput;
    context: Record<string, any>;
  }) {
    const workflowRunRepository =
      await this.twentyORMManager.getRepository<WorkflowRunWorkspaceEntity>(
        'workflowRun',
      );

    const workflowRunToUpdate = await workflowRunRepository.findOneBy({
      id: workflowRunId,
    });

    if (!workflowRunToUpdate) {
      throw new WorkflowRunException(
        'No workflow run to save',
        WorkflowRunExceptionCode.WORKFLOW_RUN_NOT_FOUND,
      );
    }

    return workflowRunRepository.update(workflowRunId, {
      output: {
        flow: workflowRunToUpdate.output?.flow ?? {
          trigger: undefined,
          steps: [],
        },
        stepsOutput: {
          ...(workflowRunToUpdate.output?.stepsOutput ?? {}),
          [stepOutput.id]: stepOutput.output,
        },
      },
      context,
    });
  }

  async updateWorkflowRunStep({
    workflowRunId,
    step,
  }: {
    workflowRunId: string;
    step: WorkflowAction;
  }) {
    const workflowRunRepository =
      await this.twentyORMManager.getRepository<WorkflowRunWorkspaceEntity>(
        'workflowRun',
      );

    const workflowRunToUpdate = await workflowRunRepository.findOneBy({
      id: workflowRunId,
    });

    if (!workflowRunToUpdate) {
      throw new WorkflowRunException(
        'No workflow run to update',
        WorkflowRunExceptionCode.WORKFLOW_RUN_NOT_FOUND,
      );
    }

    if (
      workflowRunToUpdate.status === WorkflowRunStatus.COMPLETED ||
      workflowRunToUpdate.status === WorkflowRunStatus.FAILED
    ) {
      throw new WorkflowRunException(
        'Cannot update steps of a completed or failed workflow run',
        WorkflowRunExceptionCode.INVALID_OPERATION,
      );
    }

    const updatedSteps = workflowRunToUpdate.output?.flow?.steps?.map(
      (existingStep) => (step.id === existingStep.id ? step : existingStep),
    );

    return workflowRunRepository.update(workflowRunToUpdate.id, {
      output: {
        ...(workflowRunToUpdate.output ?? {}),
        flow: {
          ...(workflowRunToUpdate.output?.flow ?? {}),
          steps: updatedSteps,
        },
      },
    });
  }

  async getWorkflowRunOrFail(
    workflowRunId: string,
  ): Promise<WorkflowRunWorkspaceEntity> {
    const workflowRunRepository =
      await this.twentyORMManager.getRepository<WorkflowRunWorkspaceEntity>(
        'workflowRun',
      );

    const workflowRun = await workflowRunRepository.findOne({
      where: { id: workflowRunId },
    });

    if (!workflowRun) {
      throw new WorkflowRunException(
        'Workflow run not found',
        WorkflowRunExceptionCode.WORKFLOW_RUN_NOT_FOUND,
      );
    }

    return workflowRun;
  }
}
