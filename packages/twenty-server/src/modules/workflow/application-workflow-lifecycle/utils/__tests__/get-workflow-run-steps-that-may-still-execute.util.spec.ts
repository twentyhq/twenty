import { StepStatus } from 'twenty-shared/workflow';

import { getWorkflowRunStepsThatMayStillExecute } from 'src/modules/workflow/application-workflow-lifecycle/utils/get-workflow-run-steps-that-may-still-execute.util';
import {
  createMockCodeStep,
  createMockIteratorStep,
} from 'src/modules/workflow/workflow-executor/utils/create-mock-workflow-steps.util';

describe('getWorkflowRunStepsThatMayStillExecute', () => {
  const first = createMockCodeStep('first', ['delay']);
  const delay = createMockCodeStep('delay', ['last']);
  const last = createMockCodeStep('last');

  it('keeps steps that have not finished', () => {
    expect(
      getWorkflowRunStepsThatMayStillExecute({
        steps: [first, delay, last],
        stepInfos: {
          first: { status: StepStatus.SUCCESS },
          delay: { status: StepStatus.PENDING },
          last: { status: StepStatus.NOT_STARTED },
        },
      }).map(({ id }) => id),
    ).toEqual(['delay', 'last']);
  });

  it('treats skipped, stopped and failed steps as finished', () => {
    expect(
      getWorkflowRunStepsThatMayStillExecute({
        steps: [first, delay, last],
        stepInfos: {
          first: { status: StepStatus.SKIPPED },
          delay: { status: StepStatus.FAILED_SAFELY },
          last: { status: StepStatus.STOPPED },
        },
      }),
    ).toEqual([]);
  });

  it('keeps steps without step info', () => {
    expect(
      getWorkflowRunStepsThatMayStillExecute({
        steps: [first],
        stepInfos: {},
      }).map(({ id }) => id),
    ).toEqual(['first']);
  });

  it('keeps every step while an iterator can still loop back', () => {
    const iterator = createMockIteratorStep('iterator', [], ['body']);
    const body = createMockCodeStep('body', ['iterator']);

    expect(
      getWorkflowRunStepsThatMayStillExecute({
        steps: [first, iterator, body],
        stepInfos: {
          first: { status: StepStatus.SUCCESS },
          iterator: { status: StepStatus.RUNNING },
          body: { status: StepStatus.SUCCESS },
        },
      }).map(({ id }) => id),
    ).toEqual(['first', 'iterator', 'body']);
  });
});
