import {
  StepStatus,
  workflowRunStateStepInfosSchema,
  type WorkflowRunStepInfo,
} from 'twenty-shared/workflow';

import { buildLoopStepInfosReset } from 'src/modules/workflow/workflow-executor/workflow-actions/iterator/utils/build-loop-step-infos-reset.util';

describe('buildLoopStepInfosReset', () => {
  it('should reset the step and archive its outcome in history', () => {
    const stepInfos: Record<string, WorkflowRunStepInfo> = {
      step1: { status: StepStatus.SUCCESS, result: { id: '1' } },
    };

    const result = buildLoopStepInfosReset({
      stepIdsToReset: ['step1'],
      stepInfos,
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
    });
  });

  it('should append to the existing history', () => {
    const stepInfos: Record<string, WorkflowRunStepInfo> = {
      step1: {
        status: StepStatus.FAILED,
        error: 'second failure',
        history: [{ status: StepStatus.FAILED, error: 'first failure' }],
      },
    };

    const result = buildLoopStepInfosReset({
      stepIdsToReset: ['step1'],
      stepInfos,
    });

    expect(result.step1.history).toEqual([
      { status: StepStatus.FAILED, error: 'first failure' },
      { status: StepStatus.FAILED, error: 'second failure', result: undefined },
    ]);
  });

  it('should skip step ids that have no step info', () => {
    const stepInfos: Record<string, WorkflowRunStepInfo> = {
      step1: { status: StepStatus.SUCCESS },
    };

    const result = buildLoopStepInfosReset({
      stepIdsToReset: ['step1', 'unknown-step'],
      stepInfos,
    });

    expect(Object.keys(result)).toEqual(['step1']);
  });

  it('should build step infos that match the workflow run state schema', () => {
    const stepInfos: Record<string, WorkflowRunStepInfo> = {
      step1: { status: StepStatus.SUCCESS },
    };

    const result = buildLoopStepInfosReset({
      stepIdsToReset: ['step1', 'unknown-step'],
      stepInfos,
    });

    const persistedStepInfos = JSON.parse(
      JSON.stringify({ ...stepInfos, ...result }),
    );

    expect(
      workflowRunStateStepInfosSchema.safeParse(persistedStepInfos).success,
    ).toBe(true);
  });
});
