import { Injectable } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';

import { isDefined, resolveInput } from 'twenty-shared/utils';

import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { type WorkflowRunWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow-run.workspace-entity';
import { WorkflowVersionStatus } from 'src/modules/workflow/common/standard-objects/workflow-version.workspace-entity';
import { type WorkflowWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow.workspace-entity';
import { WorkflowCommonWorkspaceService } from 'src/modules/workflow/common/workspace-services/workflow-common.workspace-service';
import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/interfaces/workflow-action.interface';
import {
  WorkflowStepExecutorException,
  WorkflowStepExecutorExceptionCode,
} from 'src/modules/workflow/workflow-executor/exceptions/workflow-step-executor.exception';
import { type WorkflowActionInput } from 'src/modules/workflow/workflow-executor/types/workflow-action-input';
import { type WorkflowActionOutput } from 'src/modules/workflow/workflow-executor/types/workflow-action-output.type';
import { findStepOrThrow } from 'src/modules/workflow/workflow-executor/utils/find-step-or-throw.util';
import { isWorkflowRunWorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/run-workflow/guards/is-workflow-run-workflow-action.guard';
import { type WorkflowRunWorkflowActionInput } from 'src/modules/workflow/workflow-executor/workflow-actions/run-workflow/types/workflow-run-workflow-action-input.type';
import { WorkflowRunnerWorkspaceService } from 'src/modules/workflow/workflow-runner/workspace-services/workflow-runner.workspace-service';
import { buildWorkflowRunSource } from 'src/modules/workflow/workflow-trigger/utils/build-workflow-run-source.util';

// Nesting cap for RUN_WORKFLOW chains, D-04/D-05: chains at or below this depth
// execute normally, the next hop fails the step instead of recursing unbounded.
const RUN_WORKFLOW_MAX_DEPTH = 5;

@Injectable()
export class RunWorkflowWorkflowAction implements WorkflowAction {
  constructor(
    private readonly workspaceOrmManager: WorkspaceOrmManager,
    private readonly workflowCommonWorkspaceService: WorkflowCommonWorkspaceService,
    private readonly moduleRef: ModuleRef,
  ) {}

  async execute({
    currentStepId,
    steps,
    runInfo,
    context,
  }: WorkflowActionInput): Promise<WorkflowActionOutput> {
    const step = findStepOrThrow({
      stepId: currentStepId,
      steps,
    });

    if (!isWorkflowRunWorkflowAction(step)) {
      throw new WorkflowStepExecutorException(
        'Step is not a run workflow action',
        WorkflowStepExecutorExceptionCode.INVALID_STEP_TYPE,
      );
    }

    const workflowActionInput = resolveInput(
      step.settings.input,
      context,
    ) as WorkflowRunWorkflowActionInput;

    // Only RUN_WORKFLOW itself writes runDepth onto the payload (D-10) — a
    // mapped `input` field can never spoof this counter, it is read from
    // context.trigger.metadata, which the runner populates on each hop.
    // context.trigger is the persisted trigger payload of the *current* run,
    // which for a WEBHOOK-triggered workflow is entirely caller-controlled,
    // so the value must be validated rather than trusted as a number.
    const rawRunDepth = (
      context.trigger as { metadata?: { runDepth?: unknown } } | undefined
    )?.metadata?.runDepth;

    const runDepth = isDefined(rawRunDepth) ? rawRunDepth : 0;

    if (
      typeof runDepth !== 'number' ||
      !Number.isInteger(runDepth) ||
      runDepth < 0
    ) {
      throw new WorkflowStepExecutorException(
        'Invalid workflow run depth in trigger payload',
        WorkflowStepExecutorExceptionCode.WORKFLOW_RUN_DEPTH_EXCEEDED,
      );
    }

    const nextRunDepth = runDepth + 1;

    const authContext = buildSystemAuthContext(runInfo.workspaceId);

    const { calleeWorkflow, parentWorkflowName } =
      await this.workspaceOrmManager.executeInWorkspaceContext(async () => {
        const workflowRepository =
          this.workspaceOrmManager.getRepository<WorkflowWorkspaceEntity>(
            'workflow',
            { shouldBypassPermissionChecks: true },
          );

        const calleeWorkflowResult = await workflowRepository.findOneBy({
          id: workflowActionInput.workflowId,
        });

        const workflowRunRepository =
          this.workspaceOrmManager.getRepository<WorkflowRunWorkspaceEntity>(
            'workflowRun',
            { shouldBypassPermissionChecks: true },
          );

        const parentRun = await workflowRunRepository.findOneBy({
          id: runInfo.workflowRunId,
        });

        const parentWorkflow = parentRun
          ? await workflowRepository.findOneBy({ id: parentRun.workflowId })
          : null;

        return {
          calleeWorkflow: calleeWorkflowResult,
          parentWorkflowName: parentWorkflow?.name,
        };
      }, authContext);

    if (!calleeWorkflow) {
      throw new WorkflowStepExecutorException(
        `Cannot start workflow run: workflow '${workflowActionInput.workflowId}' not found`,
        WorkflowStepExecutorExceptionCode.NO_ACTIVE_WORKFLOW_VERSION,
      );
    }

    if (nextRunDepth > RUN_WORKFLOW_MAX_DEPTH) {
      throw new WorkflowStepExecutorException(
        `Workflow run depth exceeded (${nextRunDepth} > ${RUN_WORKFLOW_MAX_DEPTH}) while starting '${calleeWorkflow.name}'`,
        WorkflowStepExecutorExceptionCode.WORKFLOW_RUN_DEPTH_EXCEEDED,
      );
    }

    if (!calleeWorkflow.lastPublishedVersionId) {
      throw new WorkflowStepExecutorException(
        `Cannot start workflow run: '${calleeWorkflow.name}' has no active version`,
        WorkflowStepExecutorExceptionCode.NO_ACTIVE_WORKFLOW_VERSION,
      );
    }

    let calleeWorkflowVersionStatus: WorkflowVersionStatus;

    try {
      const calleeWorkflowVersion =
        await this.workflowCommonWorkspaceService.getWorkflowVersionOrFail({
          workspaceId: runInfo.workspaceId,
          workflowVersionId: calleeWorkflow.lastPublishedVersionId,
        });

      calleeWorkflowVersionStatus = calleeWorkflowVersion.status;
    } catch {
      // getWorkflowVersionOrFail throws WorkflowTriggerException on a missing
      // version row — RUN_WORKFLOW must never let a non-WorkflowStepExecutorException
      // escape execute() (D-07), so any failure here collapses to the same guard.
      throw new WorkflowStepExecutorException(
        `Cannot start workflow run: '${calleeWorkflow.name}' has no active version`,
        WorkflowStepExecutorExceptionCode.NO_ACTIVE_WORKFLOW_VERSION,
      );
    }

    if (calleeWorkflowVersionStatus !== WorkflowVersionStatus.ACTIVE) {
      throw new WorkflowStepExecutorException(
        `Cannot start workflow run: '${calleeWorkflow.name}' has no active version`,
        WorkflowStepExecutorExceptionCode.NO_ACTIVE_WORKFLOW_VERSION,
      );
    }

    const payload = {
      ...workflowActionInput.input,
      metadata: { runDepth: nextRunDepth },
    };

    const workflowRunnerWorkspaceService = this.moduleRef.get(
      WorkflowRunnerWorkspaceService,
      { strict: false },
    );

    const { workflowRunId } = await workflowRunnerWorkspaceService.run({
      workspaceId: runInfo.workspaceId,
      workflowVersionId: calleeWorkflow.lastPublishedVersionId,
      payload,
      source: buildWorkflowRunSource(parentWorkflowName),
    });

    return { result: { workflowRunId } };
  }
}
