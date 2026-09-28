import {
  StepStatus,
  workflowRunStateStepInfosSchema,
  type WorkflowRunStepInfo,
} from 'twenty-shared/workflow';

import { buildStepInfosReset } from 'src/modules/workflow/workflow-executor/utils/build-step-infos-reset.util';

describe('buildStepInfosReset', () => {
  it('should reset every given step and archive its outcome in history', () => {
    const stepInfos: Record<string, WorkflowRunStepInfo> = {
      step1: { status: StepStatus.SUCCESS, result: { id: '1' } },
      step2: { status: StepStatus.SKIPPED },
    };

    const result = buildStepInfosReset({
      stepIds: ['step1', 'step2'],
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

  it('should move the conversation to history so the next iteration starts without it', () => {
    const result = buildStepInfosReset({
      stepIds: ['agentStep'],
      stepInfos: {
        agentStep: { status: StepStatus.SUCCESS, threadId: 'thread-1' },
      },
    });

    expect(result.agentStep).toHaveProperty('threadId', undefined);
    expect(result.agentStep.history).toEqual([
      expect.objectContaining({ threadId: 'thread-1' }),
    ]);
  });

  it('should leave out steps that were not given', () => {
    const result = buildStepInfosReset({
      stepIds: ['step1'],
      stepInfos: {
        step1: { status: StepStatus.SUCCESS },
        step2: { status: StepStatus.SUCCESS },
      },
    });

    expect(Object.keys(result)).toEqual(['step1']);
  });

  it('should append to the existing history', () => {
    const result = buildStepInfosReset({
      stepIds: ['step1'],
      stepInfos: {
        step1: {
          status: StepStatus.FAILED,
          error: 'second failure',
          history: [{ status: StepStatus.FAILED, error: 'first failure' }],
        },
      },
    });

    expect(result.step1.history).toEqual([
      { status: StepStatus.FAILED, error: 'first failure' },
      { status: StepStatus.FAILED, error: 'second failure', result: undefined },
    ]);
  });

  it('should skip step ids that have no step info', () => {
    const result = buildStepInfosReset({
      stepIds: ['step1', 'unknown-step'],
      stepInfos: { step1: { status: StepStatus.SUCCESS } },
    });

    expect(Object.keys(result)).toEqual(['step1']);
  });

  it('should build step infos that match the workflow run state schema', () => {
    const stepInfos = { step1: { status: StepStatus.SUCCESS } };

    const persistedStepInfos = JSON.parse(
      JSON.stringify({
        ...stepInfos,
        ...buildStepInfosReset({
          stepIds: ['step1', 'unknown-step'],
          stepInfos,
        }),
      }),
    );

    expect(
      workflowRunStateStepInfosSchema.safeParse(persistedStepInfos).success,
    ).toBe(true);
  });
});
