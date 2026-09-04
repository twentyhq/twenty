import {
  StepStatus,
  workflowRunStateStepInfosSchema,
  type WorkflowRunStepInfo,
} from 'twenty-shared/workflow';

import {
  createMockCodeStep,
  createMockIteratorStep,
} from 'src/modules/workflow/workflow-executor/utils/create-mock-workflow-steps.util';
import { buildLoopStepInfosReset } from 'src/modules/workflow/workflow-executor/workflow-actions/iterator/utils/build-loop-step-infos-reset.util';

const steps = [
  createMockIteratorStep('iterator1', ['step1'], []),
  createMockCodeStep('step1', ['step2']),
  createMockCodeStep('step2', ['deleted-step', 'iterator1']),
];

const buildReset = (stepInfos: Record<string, WorkflowRunStepInfo>) =>
  buildLoopStepInfosReset({
    iteratorStepId: 'iterator1',
    initialLoopStepIds: ['step1'],
    steps,
    stepInfos,
  });

describe('buildLoopStepInfosReset', () => {
  it('should reset every step in the loop and archive its outcome in history', () => {
    const result = buildReset({
      step1: { status: StepStatus.SUCCESS, result: { id: '1' } },
      step2: { status: StepStatus.SKIPPED },
    });

    expect(result).toEqual({
      step1: {
        status: StepStatus.NOT_STARTED,
        result: undefined,
        error: undefined,
        history: [
          { status: StepStatus.SUCCESS, result: { id: '1' }, error: undefined },
        ],
      },
      step2: {
        status: StepStatus.NOT_STARTED,
        result: undefined,
        error: undefined,
        history: [
          { status: StepStatus.SKIPPED, result: undefined, error: undefined },
        ],
      },
    });
  });

  it('should append to the existing history', () => {
    const result = buildReset({
      step1: {
        status: StepStatus.FAILED,
        error: 'second failure',
        history: [{ status: StepStatus.FAILED, error: 'first failure' }],
      },
    });

    expect(result.step1.history).toEqual([
      { status: StepStatus.FAILED, error: 'first failure' },
      { status: StepStatus.FAILED, error: 'second failure', result: undefined },
    ]);
  });

  it('should not reset a step that no longer exists', () => {
    const result = buildReset({
      step1: { status: StepStatus.SUCCESS },
      step2: { status: StepStatus.SUCCESS },
      'deleted-step': { status: StepStatus.SUCCESS },
    });

    expect(Object.keys(result)).toEqual(['step1', 'step2']);
  });

  it('should build step infos that match the workflow run state schema', () => {
    const stepInfos = {
      step1: { status: StepStatus.SUCCESS },
      step2: { status: StepStatus.SUCCESS },
    };

    const persistedStepInfos = JSON.parse(
      JSON.stringify({ ...stepInfos, ...buildReset(stepInfos) }),
    );

    expect(
      workflowRunStateStepInfosSchema.safeParse(persistedStepInfos).success,
    ).toBe(true);
  });
});
