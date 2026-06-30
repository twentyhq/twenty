import { StepStatus, type WorkflowRunStepInfo } from 'twenty-shared/workflow';

import {
  createMockCodeStep,
  createMockIteratorStep,
} from 'src/modules/workflow/workflow-executor/utils/create-mock-workflow-steps.util';
import {
  type WorkflowAction,
  type WorkflowIteratorAction,
} from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';
import { buildRetryIteratorStepInfos } from 'src/modules/workflow/workflow-runner/utils/build-retry-iterator-step-infos.util';

describe('buildRetryIteratorStepInfos', () => {
  const iteratorStep = createMockIteratorStep(
    'iterator',
    ['post'],
    ['body'],
  ) as WorkflowIteratorAction;

  const steps: WorkflowAction[] = [
    iteratorStep,
    createMockCodeStep('body', ['iterator']),
    createMockCodeStep('post'),
  ];

  it('restores an iterator that failed mid-loop to RUNNING with its cursor preserved', () => {
    const iteratorStepInfo: WorkflowRunStepInfo = {
      status: StepStatus.FAILED,
      result: {
        currentItemIndex: 2,
        currentItem: 'item-2',
        hasProcessedAllItems: false,
      },
      error: 'ended before completion',
    };

    const { stepInfosToUpdate, stepIdsToRetry } = buildRetryIteratorStepInfos({
      iteratorStep,
      iteratorStepInfo,
      steps,
    });

    expect(stepIdsToRetry).toEqual([]);
    expect(stepInfosToUpdate).toEqual({
      iterator: {
        status: StepStatus.RUNNING,
        result: {
          currentItemIndex: 2,
          currentItem: 'item-2',
          hasProcessedAllItems: false,
        },
        error: undefined,
      },
    });
  });

  it('restarts the whole loop when the iterator itself failed', () => {
    const iteratorStepInfo: WorkflowRunStepInfo = {
      status: StepStatus.FAILED,
      error: 'invalid items input',
    };

    const { stepInfosToUpdate, stepIdsToRetry } = buildRetryIteratorStepInfos({
      iteratorStep,
      iteratorStepInfo,
      steps,
    });

    expect(stepIdsToRetry).toEqual(['iterator']);
    expect(stepInfosToUpdate).toEqual({
      body: { status: StepStatus.NOT_STARTED },
      iterator: { status: StepStatus.NOT_STARTED },
    });
  });
});
