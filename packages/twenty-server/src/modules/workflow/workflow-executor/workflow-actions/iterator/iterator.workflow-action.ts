import { Injectable } from '@nestjs/common';

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
import { WorkflowIteratorResult } from 'src/modules/workflow/workflow-executor/workflow-actions/iterator/types/workflow-iterator-result.type';
import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';
import { WorkflowRunWorkspaceService } from 'src/modules/workflow/workflow-runner/workflow-run/workflow-run.workspace-service';

@Injectable()
export class IteratorWorkflowAction implements WorkflowActionInterface {
  constructor(
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

    if (parsedInitialLoopStepIds.length === 0 || parsedItems.length === 0) {
      return {
        result: {
          itemsProcessed: 0,
          nextItemToProcess: undefined,
          hasProcessedAllItems: true,
        } satisfies WorkflowIteratorResult,
      };
    }

    const workflowRun =
      await this.workflowRunWorkspaceService.getWorkflowRunOrFail({
        workflowRunId: runInfo.workflowRunId,
        workspaceId: runInfo.workspaceId,
      });

    const stepInfos = workflowRun.state.stepInfos;
    const existingIteratorStepResult = stepInfos[iteratorStepId]
      ?.result as WorkflowIteratorResult;

    const itemsProcessed = isDefined(existingIteratorStepResult)
      ? existingIteratorStepResult.itemsProcessed + 1
      : 0;

    const hasProcessedAllItems = itemsProcessed === parsedItems.length;

    const nextIteratorStepInfoResult: WorkflowIteratorResult = {
      itemsProcessed,
      nextItemToProcess:
        itemsProcessed < parsedItems.length
          ? parsedItems[itemsProcessed]
          : undefined,
      hasProcessedAllItems,
    };

    if (!hasProcessedAllItems) {
      await this.resetStepsInLoop({
        iteratorStepId,
        initialLoopStepIds: parsedInitialLoopStepIds,
        workflowRunId: runInfo.workflowRunId,
        workspaceId: runInfo.workspaceId,
        steps,
      });
    }

    return {
      result: nextIteratorStepInfoResult,
      shouldRemainRunning: !hasProcessedAllItems,
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
