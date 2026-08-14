import { StepStatus, type WorkflowRunStepInfos } from 'twenty-shared/workflow';

import { WorkflowRunStatus } from 'src/modules/workflow/common/standard-objects/workflow-run.workspace-entity';
import { shouldExecuteStep } from 'src/modules/workflow/workflow-executor/utils/should-execute-step.util';
import { shouldFailSafely } from 'src/modules/workflow/workflow-executor/utils/should-fail-safely.util';
import { shouldSkipStepExecution } from 'src/modules/workflow/workflow-executor/utils/should-skip-step-execution.util';
import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

const step = (id: string, nextStepIds: string[], type = 'RECORD_UPDATE') =>
  ({
    id,
    type,
    name: id,
    nextStepIds,
    settings: { input: {} },
  }) as unknown as WorkflowAction;

const ifElse = (id: string, ifNext: string[], elseNext: string[]) =>
  ({
    id,
    type: 'IF_ELSE',
    name: id,
    nextStepIds: [],
    settings: {
      input: {
        branches: [
          { id: `${id}-if`, filterGroupId: `${id}-fg`, nextStepIds: ifNext },
          { id: `${id}-else`, nextStepIds: elseNext },
        ],
        stepFilterGroups: [],
        stepFilters: [],
      },
    },
  }) as unknown as WorkflowAction;

const decide = (
  target: WorkflowAction,
  steps: WorkflowAction[],
  stepInfos: WorkflowRunStepInfos,
) => {
  if (
    shouldExecuteStep({
      step: target,
      steps,
      stepInfos,
      workflowRunStatus: WorkflowRunStatus.RUNNING,
    })
  ) {
    return 'execute';
  }

  if (shouldFailSafely({ step: target, steps, stepInfos })) {
    return 'failSafely';
  }

  return shouldSkipStepExecution({ step: target, steps, stepInfos })
    ? 'skip'
    : 'wait';
};

const tookIf = (id: string) => ({
  status: StepStatus.SUCCESS,
  result: { matchingBranchId: `${id}-if` },
});
const tookElse = (id: string) => ({
  status: StepStatus.SUCCESS,
  result: { matchingBranchId: `${id}-else` },
});

describe('if/else branch cut', () => {
  describe('issue #24060: both branches converge on the else root', () => {
    const steps = [
      ifElse('A', ['stepA'], ['merge']),
      step('stepA', ['merge']),
      step('merge', []),
    ];
    const merge = steps[2];

    it('should wait while the taken branch has not reached it yet', () => {
      expect(
        decide(merge, steps, {
          A: tookIf('A'),
          stepA: { status: StepStatus.NOT_STARTED },
        }),
      ).toBe('wait');
    });

    it('should execute once the taken branch reaches it', () => {
      expect(
        decide(merge, steps, {
          A: tookIf('A'),
          stepA: { status: StepStatus.SUCCESS },
        }),
      ).toBe('execute');
    });

    it('should execute when the else branch is the one taken', () => {
      expect(
        decide(merge, steps, {
          A: tookElse('A'),
          stepA: { status: StepStatus.SKIPPED },
        }),
      ).toBe('execute');
    });
  });

  describe('a filter on the taken branch stops the path', () => {
    const steps = [
      ifElse('A', ['filter'], ['merge']),
      step('filter', ['merge'], 'FILTER'),
      step('merge', []),
    ];
    const merge = steps[2];

    it('should skip the merge when the filter did not match', () => {
      expect(
        decide(merge, steps, {
          A: tookIf('A'),
          filter: { status: StepStatus.STOPPED },
        }),
      ).toBe('skip');
    });

    it('should execute the merge when the filter matched', () => {
      expect(
        decide(merge, steps, {
          A: tookIf('A'),
          filter: { status: StepStatus.SUCCESS },
        }),
      ).toBe('execute');
    });
  });

  describe('nested if/else on the taken branch', () => {
    // A.if -> B; B.if -> step1; B.else -> step2 -> merge; A.else -> merge
    const steps = [
      ifElse('A', ['B'], ['merge']),
      ifElse('B', ['step1'], ['step2']),
      step('step1', []),
      step('step2', ['merge']),
      step('merge', []),
    ];
    const merge = steps[4];

    it('should skip the merge when the inner branch that reaches it was not taken', () => {
      expect(
        decide(merge, steps, {
          A: tookIf('A'),
          B: tookIf('B'),
          step1: { status: StepStatus.SUCCESS },
          step2: { status: StepStatus.SKIPPED },
        }),
      ).toBe('skip');
    });

    it('should fail the merge safely when the branch that reaches it failed safely', () => {
      expect(
        decide(merge, steps, {
          A: tookIf('A'),
          B: tookElse('B'),
          step1: { status: StepStatus.SKIPPED },
          step2: { status: StepStatus.FAILED_SAFELY },
        }),
      ).toBe('failSafely');
    });

    it('should execute the merge when the inner branch that reaches it was taken', () => {
      expect(
        decide(merge, steps, {
          A: tookIf('A'),
          B: tookElse('B'),
          step1: { status: StepStatus.SKIPPED },
          step2: { status: StepStatus.SUCCESS },
        }),
      ).toBe('execute');
    });
  });

  describe('branch roots', () => {
    const steps = [
      ifElse('A', ['ifStep'], ['elseStep']),
      step('ifStep', []),
      step('elseStep', []),
    ];

    it('should execute the taken root and skip the other', () => {
      const stepInfos = { A: tookIf('A') };

      expect(decide(steps[1], steps, stepInfos)).toBe('execute');
      expect(decide(steps[2], steps, stepInfos)).toBe('skip');
    });

    it('should fail both roots safely when the if/else failed safely', () => {
      const stepInfos = { A: { status: StepStatus.FAILED_SAFELY } };

      expect(decide(steps[1], steps, stepInfos)).toBe('failSafely');
      expect(decide(steps[2], steps, stepInfos)).toBe('failSafely');
    });

    it('should skip both roots when the if/else itself was skipped', () => {
      const stepInfos = { A: { status: StepStatus.SKIPPED } };

      expect(decide(steps[1], steps, stepInfos)).toBe('skip');
      expect(decide(steps[2], steps, stepInfos)).toBe('skip');
    });
  });

  describe('a diamond that does not involve a branch cut', () => {
    const steps = [
      step('root', ['filter', 'b']),
      step('filter', ['merge'], 'FILTER'),
      step('b', ['merge']),
      step('merge', []),
    ];

    it('should still execute when one path filtered out and another succeeded', () => {
      expect(
        decide(steps[3], steps, {
          root: { status: StepStatus.SUCCESS },
          filter: { status: StepStatus.STOPPED },
          b: { status: StepStatus.SUCCESS },
        }),
      ).toBe('execute');
    });
  });
});
