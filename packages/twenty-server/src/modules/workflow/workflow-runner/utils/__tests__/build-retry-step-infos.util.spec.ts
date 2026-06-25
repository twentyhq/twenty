import { StepStatus, type WorkflowRunStepInfos } from 'twenty-shared/workflow';

import {
  createMockCodeStep,
  createMockIteratorStep,
} from 'src/modules/workflow/workflow-executor/utils/create-mock-workflow-steps.util';
import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';
import { buildRetryStepInfos } from 'src/modules/workflow/workflow-runner/utils/build-retry-step-infos.util';

describe('buildRetryStepInfos', () => {
  it('resets a plain failed step to NOT_STARTED and marks it for retry', () => {
    const steps: WorkflowAction[] = [
      createMockCodeStep('step-1', ['step-2']),
      createMockCodeStep('step-2'),
    ];

    const stepInfos: WorkflowRunStepInfos = {
      'step-1': { status: StepStatus.SUCCESS },
      'step-2': { status: StepStatus.FAILED, error: 'boom' },
    };

    const { stepInfosToUpdate, stepIdsToRetry } = buildRetryStepInfos({
      steps,
      stepInfos,
    });

    expect(stepIdsToRetry).toEqual(['step-2']);
    expect(stepInfosToUpdate).toEqual({
      'step-2': { status: StepStatus.NOT_STARTED },
    });
  });

  it('leaves non-failed steps untouched', () => {
    const steps: WorkflowAction[] = [
      createMockCodeStep('success'),
      createMockCodeStep('failed-safely'),
      createMockCodeStep('skipped'),
    ];

    const stepInfos: WorkflowRunStepInfos = {
      success: { status: StepStatus.SUCCESS },
      'failed-safely': { status: StepStatus.FAILED_SAFELY },
      skipped: { status: StepStatus.SKIPPED },
    };

    const { stepInfosToUpdate, stepIdsToRetry } = buildRetryStepInfos({
      steps,
      stepInfos,
    });

    expect(stepIdsToRetry).toEqual([]);
    expect(stepInfosToUpdate).toEqual({});
  });

  it('restores an iterator that failed mid-loop to RUNNING and resets the failed loop body step', () => {
    const steps: WorkflowAction[] = [
      createMockIteratorStep('iterator', ['post'], ['body']),
      createMockCodeStep('body', ['iterator']),
      createMockCodeStep('post'),
    ];

    const stepInfos: WorkflowRunStepInfos = {
      iterator: {
        status: StepStatus.FAILED,
        result: {
          currentItemIndex: 2,
          currentItem: 'item-2',
          hasProcessedAllItems: false,
        },
        error: 'ended before completion',
      },
      body: { status: StepStatus.FAILED, error: 'boom' },
      post: { status: StepStatus.NOT_STARTED },
    };

    const { stepInfosToUpdate, stepIdsToRetry } = buildRetryStepInfos({
      steps,
      stepInfos,
    });

    expect(stepIdsToRetry).toEqual(['body']);
    expect(stepInfosToUpdate.iterator).toEqual({
      status: StepStatus.RUNNING,
      result: {
        currentItemIndex: 2,
        currentItem: 'item-2',
        hasProcessedAllItems: false,
      },
      error: undefined,
    });
    expect(stepInfosToUpdate.body).toEqual({ status: StepStatus.NOT_STARTED });
  });

  it('resets the whole loop when the iterator itself failed', () => {
    const steps: WorkflowAction[] = [
      createMockIteratorStep('iterator', ['post'], ['body']),
      createMockCodeStep('body', ['iterator']),
      createMockCodeStep('post'),
    ];

    const stepInfos: WorkflowRunStepInfos = {
      iterator: { status: StepStatus.FAILED, error: 'invalid items input' },
      body: { status: StepStatus.NOT_STARTED },
      post: { status: StepStatus.NOT_STARTED },
    };

    const { stepInfosToUpdate, stepIdsToRetry } = buildRetryStepInfos({
      steps,
      stepInfos,
    });

    expect(stepIdsToRetry).toEqual(['iterator']);
    expect(stepInfosToUpdate.iterator).toEqual({
      status: StepStatus.NOT_STARTED,
    });
    expect(stepInfosToUpdate.body).toEqual({ status: StepStatus.NOT_STARTED });
  });
});
