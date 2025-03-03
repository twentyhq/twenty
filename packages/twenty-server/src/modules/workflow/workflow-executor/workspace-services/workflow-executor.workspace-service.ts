import { Injectable } from '@nestjs/common';

import { WorkflowExecutor } from 'src/modules/workflow/workflow-executor/interfaces/workflow-executor.interface';

import { BILLING_FEATURE_USED } from 'src/engine/core-modules/billing/constants/billing-feature-used.constant';
import { BillingMeterEventName } from 'src/engine/core-modules/billing/enums/billing-meter-event-names';
import { BillingUsageEvent } from 'src/engine/core-modules/billing/types/billing-usage-event.type';
import { ScopedWorkspaceContextFactory } from 'src/engine/twenty-orm/factories/scoped-workspace-context.factory';
import { WorkspaceEventEmitter } from 'src/engine/workspace-event-emitter/workspace-event-emitter';
import {
  StepOutput,
  WorkflowRunOutput,
  WorkflowRunStatus,
} from 'src/modules/workflow/common/standard-objects/workflow-run.workspace-entity';
import { WorkflowExecutorFactory } from 'src/modules/workflow/workflow-executor/factories/workflow-executor.factory';
import { WorkflowExecutorInput } from 'src/modules/workflow/workflow-executor/types/workflow-executor-input';
import { WorkflowExecutorOutput } from 'src/modules/workflow/workflow-executor/types/workflow-executor-output.type';
import { WorkflowRunWorkspaceService } from 'src/modules/workflow/workflow-runner/workflow-run/workflow-run.workspace-service';

const MAX_RETRIES_ON_FAILURE = 3;

export type WorkflowExecutorState = {
  stepsOutput: WorkflowRunOutput['stepsOutput'];
  status: WorkflowRunStatus;
};

@Injectable()
export class WorkflowExecutorWorkspaceService implements WorkflowExecutor {
  constructor(
    private readonly workflowExecutorFactory: WorkflowExecutorFactory,
    private readonly workspaceEventEmitter: WorkspaceEventEmitter,
    private readonly scopedWorkspaceContextFactory: ScopedWorkspaceContextFactory,
    private readonly workflowRunWorkspaceService: WorkflowRunWorkspaceService,
  ) {}

  async execute({
    currentStepIndex,
    steps,
    context,
    attemptCount = 1,
    workflowRunId,
  }: WorkflowExecutorInput): Promise<WorkflowExecutorOutput> {
    if (currentStepIndex >= steps.length) {
      return {
        result: {
          success: true,
        },
      };
    }

    const step = steps[currentStepIndex];

    const workflowExecutor = this.workflowExecutorFactory.get(step.type);

    let actionOutput: WorkflowExecutorOutput;

    try {
      actionOutput = await workflowExecutor.execute({
        currentStepIndex,
        steps,
        context,
        attemptCount,
        workflowRunId,
      });
    } catch (error) {
      actionOutput = {
        error: error.message ?? 'Execution result error, no data or error',
      };
    }

    if (!actionOutput.error) {
      this.sendWorkflowNodeRunEvent();
    }

    const stepOutput: StepOutput = {
      id: step.id,
      output: actionOutput,
    };

    if (actionOutput.pendingEvent) {
      await this.workflowRunWorkspaceService.saveWorkflowRunState({
        workflowRunId,
        stepOutput,
        context,
      });

      return actionOutput;
    }

    if (actionOutput.result) {
      const updatedContext = {
        ...context,
        [step.id]: actionOutput.result,
      };

      await this.workflowRunWorkspaceService.saveWorkflowRunState({
        workflowRunId,
        stepOutput,
        context: updatedContext,
      });

      return await this.execute({
        workflowRunId,
        currentStepIndex: currentStepIndex + 1,
        steps,
        context: updatedContext,
      });
    }

    if (step.settings.errorHandlingOptions.continueOnFailure.value) {
      await this.workflowRunWorkspaceService.saveWorkflowRunState({
        workflowRunId,
        stepOutput,
        context,
      });

      return await this.execute({
        workflowRunId,
        currentStepIndex: currentStepIndex + 1,
        steps,
        context,
      });
    }

    if (
      step.settings.errorHandlingOptions.retryOnFailure.value &&
      attemptCount < MAX_RETRIES_ON_FAILURE
    ) {
      return await this.execute({
        workflowRunId,
        currentStepIndex,
        steps,
        context,
        attemptCount: attemptCount + 1,
      });
    }

    await this.workflowRunWorkspaceService.saveWorkflowRunState({
      workflowRunId,
      stepOutput,
      context,
    });

    return actionOutput;
  }

  private sendWorkflowNodeRunEvent() {
    const workspaceId =
      this.scopedWorkspaceContextFactory.create().workspaceId ?? '';

    this.workspaceEventEmitter.emitCustomBatchEvent<BillingUsageEvent>(
      BILLING_FEATURE_USED,
      [
        {
          eventName: BillingMeterEventName.WORKFLOW_NODE_RUN,
          value: 1,
        },
      ],
      workspaceId,
    );
  }
}
