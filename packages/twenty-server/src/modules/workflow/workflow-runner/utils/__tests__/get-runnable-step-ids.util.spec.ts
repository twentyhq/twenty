import { StepStatus, type WorkflowRunStepInfos } from 'twenty-shared/workflow';

import {
  createMockCodeStep,
  createMockIteratorStep,
} from 'src/modules/workflow/workflow-executor/utils/create-mock-workflow-steps.util';
import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';
import { getRunnableStepIds } from 'src/modules/workflow/workflow-runner/utils/get-runnable-step-ids.util';

describe('getRunnableStepIds', () => {
  it('returns NOT_STARTED steps whose parents are satisfied', () => {
    const steps: WorkflowAction[] = [
      createMockCodeStep('step-1', ['step-2']),
      createMockCodeStep('step-2', ['step-3']),
      createMockCodeStep('step-3'),
    ];

    const stepInfos: WorkflowRunStepInfos = {
      'step-1': { status: StepStatus.SUCCESS },
      'step-2': { status: StepStatus.NOT_STARTED },
      'step-3': { status: StepStatus.NOT_STARTED },
    };

    expect(getRunnableStepIds({ steps, stepInfos })).toEqual(['step-2']);
  });

  it('includes entry steps with no parents', () => {
    const steps: WorkflowAction[] = [createMockCodeStep('entry')];

    const stepInfos: WorkflowRunStepInfos = {
      entry: { status: StepStatus.NOT_STARTED },
    };

    expect(getRunnableStepIds({ steps, stepInfos })).toEqual(['entry']);
  });

  it('excludes steps that have already started', () => {
    const steps: WorkflowAction[] = [createMockCodeStep('done')];

    const stepInfos: WorkflowRunStepInfos = {
      done: { status: StepStatus.SUCCESS },
    };

    expect(getRunnableStepIds({ steps, stepInfos })).toEqual([]);
  });

  it('excludes loop-interior steps and keeps the iterator itself', () => {
    const steps: WorkflowAction[] = [
      createMockIteratorStep('iterator', ['post'], ['body']),
      createMockCodeStep('body', ['iterator']),
      createMockCodeStep('post'),
    ];

    const stepInfos: WorkflowRunStepInfos = {
      iterator: { status: StepStatus.NOT_STARTED },
      body: { status: StepStatus.NOT_STARTED },
      post: { status: StepStatus.NOT_STARTED },
    };

    expect(getRunnableStepIds({ steps, stepInfos })).toEqual(['iterator']);
  });

  it('includes a parallel branch that never started while a sibling failed and was reset', () => {
    const steps: WorkflowAction[] = [
      createMockCodeStep('root', ['branch-a', 'branch-b']),
      createMockCodeStep('branch-a'),
      createMockCodeStep('branch-b'),
    ];

    const stepInfos: WorkflowRunStepInfos = {
      root: { status: StepStatus.SUCCESS },
      'branch-a': { status: StepStatus.NOT_STARTED },
      'branch-b': { status: StepStatus.NOT_STARTED },
    };

    expect(getRunnableStepIds({ steps, stepInfos })).toEqual([
      'branch-a',
      'branch-b',
    ]);
  });
});
