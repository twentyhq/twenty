import { forwardRef, Inject, Injectable } from '@nestjs/common';

import { isString } from '@sniptt/guards';
import { isDefined, resolveInput } from 'twenty-shared/utils';
import { StepStatus, WorkflowRunStepInfo } from 'twenty-shared/workflow';

import { WorkflowAction as WorkflowActionInterface } from 'src/modules/workflow/workflow-executor/interfaces/workflow-action.interface';

import {
  WorkflowStepExecutorException,
  WorkflowStepExecutorExceptionCode,
} from 'src/modules/workflow/workflow-executor/exceptions/workflow-step-executor.exception';
import { type WorkflowActionInput } from 'src/modules/workflow/workflow-executor/types/workflow-action-input';
import { type WorkflowActionOutput } from 'src/modules/workflow/workflow-executor/types/workflow-action-output.type';
import { getAllStepIdsInLoop } from 'src/modules/workflow/workflow-executor/utils/get-all-step-ids-in-loop.util';
import { isWorkflowIteratorAction } from 'src/modules/workflow/workflow-executor/workflow-actions/iterator/guards/is-workflow-iterator-action.guard';
import { type WorkflowIteratorActionInput } from 'src/modules/workflow/workflow-executor/workflow-actions/iterator/types/workflow-iterator-action-settings.type';
import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';
import { WorkflowExecutorWorkspaceService } from 'src/modules/workflow/workflow-executor/workspace-services/workflow-executor.workspace-service';
import { WorkflowRunWorkspaceService } from 'src/modules/workflow/workflow-runner/workflow-run/workflow-run.workspace-service';

type WorkflowIteratorStepResult = {
  itemsProcessed: number;
  currentItem: unknown;
};

@Injectable()
export class IteratorWorkflowAction implements WorkflowActionInterface {
  constructor(
    @Inject(forwardRef(() => WorkflowExecutorWorkspaceService))
    private readonly workflowExecutorWorkspaceService: CircularDep<WorkflowExecutorWorkspaceService>,
    private readonly workflowRunWorkspaceService: WorkflowRunWorkspaceService,
  ) {}

  async execute(input: WorkflowActionInput): Promise<WorkflowActionOutput> {
    const { currentStepId: iteratorStepId, steps, context, runInfo } = input;

    const step = steps.find((step) => step.id === iteratorStepId);

    if (!step) {
      throw new WorkflowStepExecutorException(
        'Step not found',
        WorkflowStepExecutorExceptionCode.STEP_NOT_FOUND,
      );
    }

    if (!isWorkflowIteratorAction(step)) {
      throw new WorkflowStepExecutorException(
        'Step is not an iterator action',
        WorkflowStepExecutorExceptionCode.INVALID_STEP_TYPE,
      );
    }

    const iteratorInput = resolveInput(
      step.settings.input,
      context,
    ) as WorkflowIteratorActionInput;

    const { items, initialLoopStepIds } = iteratorInput;

    // testing purpose, will be removed once the UI is implemented
    const parsedInitialLoopStepIds = isString(initialLoopStepIds)
      ? JSON.parse(initialLoopStepIds)
      : initialLoopStepIds;

    const parsedItems = isString(items) ? JSON.parse(items) : items;

    if (!Array.isArray(parsedItems)) {
      throw new WorkflowStepExecutorException(
        'Iterator input items must be an array',
        WorkflowStepExecutorExceptionCode.INTERNAL_ERROR,
      );
    }

    if (
      !Array.isArray(parsedInitialLoopStepIds) ||
      parsedInitialLoopStepIds.length === 0
    ) {
      return {
        result: {
          itemsProcessed: 0,
        },
      };
    }

    const workflowRun =
      await this.workflowRunWorkspaceService.getWorkflowRunOrFail({
        workflowRunId: runInfo.workflowRunId,
        workspaceId: runInfo.workspaceId,
      });

    const stepInfos = workflowRun.state.stepInfos;
    const existingIteratorStepResult = stepInfos[iteratorStepId]
      ?.result as WorkflowIteratorStepResult;

    const hasProcessedAllItems =
      parsedItems.length === 0 ||
      existingIteratorStepResult?.itemsProcessed === parsedItems.length;

    if (hasProcessedAllItems) {
      return {
        result: {
          itemsProcessed: parsedItems.length,
        },
      };
    }

    const nextIteratorStepInfoResult = isDefined(existingIteratorStepResult)
      ? {
          itemsProcessed: existingIteratorStepResult.itemsProcessed + 1,
          currentItem: parsedItems[existingIteratorStepResult.itemsProcessed],
        }
      : {
          itemsProcessed: 1,
          currentItem: parsedItems[0],
        };

    await this.workflowRunWorkspaceService.updateWorkflowRunStepInfo({
      stepId: iteratorStepId,
      stepInfo: {
        result: nextIteratorStepInfoResult,
        status: StepStatus.RUNNING,
      },
      workflowRunId: runInfo.workflowRunId,
      workspaceId: runInfo.workspaceId,
    });

    await this.resetStepsInLoop({
      iteratorStepId,
      initialLoopStepIds: parsedInitialLoopStepIds,
      workflowRunId: runInfo.workflowRunId,
      workspaceId: runInfo.workspaceId,
      steps,
    });

    try {
      await this.workflowExecutorWorkspaceService.executeFromSteps({
        stepIds: parsedInitialLoopStepIds,
        workflowRunId: runInfo.workflowRunId,
        workspaceId: runInfo.workspaceId,
      });
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Unknown error',
      } as WorkflowActionOutput;
    }

    return {
      result: {
        itemsProcessed: parsedItems.length,
      },
    };
  }

  private async resetStepsInLoop({
    iteratorStepId,
    initialLoopStepIds,
    workflowRunId,
    workspaceId,
    steps,
  }: {
    iteratorStepId: string;
    initialLoopStepIds: string[];
    workflowRunId: string;
    workspaceId: string;
    steps: WorkflowAction[];
  }) {
    const stepIdsToReset = getAllStepIdsInLoop({
      iteratorStepId,
      initialLoopStepIds,
      steps,
    });

    await this.workflowRunWorkspaceService.updateWorkflowRunStepInfos({
      stepInfos: stepIdsToReset.reduce(
        (acc, stepId) => {
          acc[stepId] = {
            status: StepStatus.NOT_STARTED,
            result: undefined,
            error: undefined,
          };

          return acc;
        },
        {} as Record<string, WorkflowRunStepInfo>,
      ),
      workflowRunId,
      workspaceId,
    });
  }
}
