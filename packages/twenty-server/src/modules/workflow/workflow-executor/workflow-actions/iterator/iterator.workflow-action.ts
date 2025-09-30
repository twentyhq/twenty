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
import { findStepOrThrow } from 'src/modules/workflow/workflow-executor/utils/find-step-or-throw.util';
import { isWorkflowIteratorAction } from 'src/modules/workflow/workflow-executor/workflow-actions/iterator/guards/is-workflow-iterator-action.guard';
import { type WorkflowIteratorActionInput } from 'src/modules/workflow/workflow-executor/workflow-actions/iterator/types/workflow-iterator-action-settings.type';
import { WorkflowIteratorResult } from 'src/modules/workflow/workflow-executor/workflow-actions/iterator/types/workflow-iterator-result.type';
import { getAllStepIdsInLoop } from 'src/modules/workflow/workflow-executor/workflow-actions/iterator/utils/get-all-step-ids-in-loop.util';
import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';
import { WorkflowRunWorkspaceService } from 'src/modules/workflow/workflow-runner/workflow-run/workflow-run.workspace-service';

const MAX_ITERATIONS = 10000;

@Injectable()
export class IteratorWorkflowAction implements WorkflowActionInterface {
  constructor(
    private readonly workflowRunWorkspaceService: WorkflowRunWorkspaceService,
  ) {}

  async execute(input: WorkflowActionInput): Promise<WorkflowActionOutput> {
    const { currentStepId: iteratorStepId, steps, context, runInfo } = input;

    const step = findStepOrThrow({
      stepId: iteratorStepId,
      steps,
    });

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

    const parsedItems = isString(items) ? JSON.parse(items) : items;

    if (!Array.isArray(parsedItems)) {
      throw new WorkflowStepExecutorException(
        'Iterator input items must be an array',
        WorkflowStepExecutorExceptionCode.INTERNAL_ERROR,
      );
    }

    if (
      !isDefined(initialLoopStepIds) ||
      initialLoopStepIds.length === 0 ||
      parsedItems.length === 0
    ) {
      return {
        result: {
          currentItemIndex: 0,
          currentItem: undefined,
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

    const currentItemIndex = isDefined(existingIteratorStepResult)
      ? existingIteratorStepResult.currentItemIndex + 1
      : 0;

    if (currentItemIndex >= MAX_ITERATIONS) {
      throw new WorkflowStepExecutorException(
        'Iterator has reached the maximum number of iterations',
        WorkflowStepExecutorExceptionCode.INTERNAL_ERROR,
      );
    }

    const hasProcessedAllItems = currentItemIndex >= parsedItems.length;

    const nextIteratorStepInfoResult: WorkflowIteratorResult = {
      currentItemIndex,
      currentItem:
        currentItemIndex < parsedItems.length
          ? parsedItems[currentItemIndex]
          : undefined,
      hasProcessedAllItems,
    };

    if (currentItemIndex > 0) {
      await this.resetStepsInLoop({
        iteratorStepId,
        initialLoopStepIds,
        hasProcessedAllItems,
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
    hasProcessedAllItems,
    workflowRunId,
    workspaceId,
    steps,
  }: {
    iteratorStepId: string;
    initialLoopStepIds: string[];
    hasProcessedAllItems: boolean;
    workflowRunId: string;
    workspaceId: string;
    steps: WorkflowAction[];
  }) {
    let stepInfosToUpdate: Record<string, WorkflowRunStepInfo> = {};

    const workflowRunToUpdate =
      await this.workflowRunWorkspaceService.getWorkflowRunOrFail({
        workflowRunId,
        workspaceId,
      });

    const stepInfos = workflowRunToUpdate.state.stepInfos;

    if (!hasProcessedAllItems) {
      const subStepsInfos = await this.buildSubStepInfosReset({
        iteratorStepId,
        initialLoopStepIds,
        stepInfos,
        steps,
      });

      stepInfosToUpdate = {
        ...stepInfosToUpdate,
        ...subStepsInfos,
      };
    }

    const iteratorStepInfo = await this.buildIteratorStepInfoReset({
      iteratorStepId,
      iteratorStepInfo: stepInfos[iteratorStepId],
    });

    stepInfosToUpdate = {
      ...stepInfosToUpdate,
      ...iteratorStepInfo,
    };

    await this.workflowRunWorkspaceService.updateWorkflowRunStepInfos({
      stepInfos: stepInfosToUpdate,
      workflowRunId,
      workspaceId,
    });
  }

  private async buildSubStepInfosReset({
    iteratorStepId,
    initialLoopStepIds,
    stepInfos,
    steps,
  }: {
    iteratorStepId: string;
    initialLoopStepIds: string[];
    stepInfos: Record<string, WorkflowRunStepInfo>;
    steps: WorkflowAction[];
  }) {
    const stepIdsToReset = getAllStepIdsInLoop({
      iteratorStepId,
      initialLoopStepIds,
      steps,
    });

    return stepIdsToReset.reduce(
      (acc, stepId) => {
        acc[stepId] = {
          status: StepStatus.NOT_STARTED,
          result: undefined,
          error: undefined,
          history: [
            ...(stepInfos[stepId]?.history ?? []),
            {
              result: stepInfos[stepId]?.result,
              error: stepInfos[stepId]?.error,
              status: stepInfos[stepId]?.status,
            },
          ],
        };

        return acc;
      },
      {} as Record<string, WorkflowRunStepInfo>,
    );
  }

  private async buildIteratorStepInfoReset({
    iteratorStepId,
    iteratorStepInfo,
  }: {
    iteratorStepId: string;
    iteratorStepInfo: WorkflowRunStepInfo;
  }) {
    return {
      [iteratorStepId]: {
        ...iteratorStepInfo,
        result: undefined,
        error: undefined,
        history: [
          ...(iteratorStepInfo?.history ?? []),
          {
            result: iteratorStepInfo?.result,
            error: iteratorStepInfo?.error,
            status: iteratorStepInfo?.status,
          },
        ],
      },
    };
  }
}
