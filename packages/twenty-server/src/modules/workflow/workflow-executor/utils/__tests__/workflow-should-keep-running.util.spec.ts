import { StepStatus, type WorkflowRunStepInfos } from 'twenty-shared/workflow';

import {
  createMockCodeStep,
  createMockIfElseStep,
} from 'src/modules/workflow/workflow-executor/utils/create-mock-workflow-steps.util';
import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';
import { workflowShouldKeepRunning } from 'src/modules/workflow/workflow-executor/utils/workflow-should-keep-running.util';

const IF_BRANCH = { id: 'if-branch', nextStepIds: ['if-child'] };
const ELSE_BRANCH = { id: 'else-branch', nextStepIds: ['else-child'] };

const buildIfElseSteps = () => [
  createMockIfElseStep('if-else', [IF_BRANCH, ELSE_BRANCH]),
  createMockCodeStep('if-child', ['merge']),
  createMockCodeStep('else-child', ['merge']),
  createMockCodeStep('merge'),
];

describe('workflowShouldKeepRunning', () => {
  describe('should return true if', () => {
    it('running or pending step exists', () => {
      for (const testStatus of [StepStatus.PENDING, StepStatus.RUNNING]) {
        const steps = [
          {
            id: 'step-1',
          } as WorkflowAction,
        ];

        const stepInfos = { 'step-1': { status: testStatus } };

        expect(workflowShouldKeepRunning({ steps, stepInfos })).toBeTruthy();
      }
    });

    it('success step with not started executable children exists', () => {
      const steps = [
        {
          id: 'step-1',
          nextStepIds: ['step-2'],
        } as WorkflowAction,
        {
          id: 'step-2',
        } as WorkflowAction,
      ];

      const stepInfos = {
        'step-1': { status: StepStatus.SUCCESS },
        'step-2': { status: StepStatus.NOT_STARTED },
      };

      expect(workflowShouldKeepRunning({ steps, stepInfos })).toBeTruthy();
    });

    it('if/else succeeded and the child of the matching branch has not started', () => {
      const stepInfos: WorkflowRunStepInfos = {
        'if-else': {
          status: StepStatus.SUCCESS,
          result: { matchingBranchId: IF_BRANCH.id },
        },
        'if-child': { status: StepStatus.NOT_STARTED },
        'else-child': { status: StepStatus.NOT_STARTED },
        merge: { status: StepStatus.NOT_STARTED },
      };

      expect(
        workflowShouldKeepRunning({ steps: buildIfElseSteps(), stepInfos }),
      ).toBeTruthy();
    });

    it('if/else succeeded and the child of the branch that was not taken still has to be skipped', () => {
      const stepInfos: WorkflowRunStepInfos = {
        'if-else': {
          status: StepStatus.SUCCESS,
          result: { matchingBranchId: IF_BRANCH.id },
        },
        'if-child': { status: StepStatus.SUCCESS },
        'else-child': { status: StepStatus.NOT_STARTED },
        merge: { status: StepStatus.NOT_STARTED },
      };

      expect(
        workflowShouldKeepRunning({ steps: buildIfElseSteps(), stepInfos }),
      ).toBeTruthy();
    });

    it('skipped step has a not started child left to skip', () => {
      const steps = [
        createMockCodeStep('step-1', ['step-2']),
        createMockCodeStep('step-2', ['step-3']),
        createMockCodeStep('step-3'),
      ];

      const stepInfos: WorkflowRunStepInfos = {
        'step-1': { status: StepStatus.SKIPPED },
        'step-2': { status: StepStatus.SKIPPED },
        'step-3': { status: StepStatus.NOT_STARTED },
      };

      expect(workflowShouldKeepRunning({ steps, stepInfos })).toBeTruthy();
    });

    it('fail-safely step has a not started child left to fail safely', () => {
      const steps = [
        createMockCodeStep('step-1', ['step-2']),
        createMockCodeStep('step-2'),
      ];

      const stepInfos: WorkflowRunStepInfos = {
        'step-1': { status: StepStatus.FAILED_SAFELY },
        'step-2': { status: StepStatus.NOT_STARTED },
      };

      expect(workflowShouldKeepRunning({ steps, stepInfos })).toBeTruthy();
    });

    it('stopped step has a not started child left to skip', () => {
      const steps = [
        createMockCodeStep('step-1', ['step-2']),
        createMockCodeStep('step-2'),
      ];

      const stepInfos: WorkflowRunStepInfos = {
        'step-1': { status: StepStatus.STOPPED, result: {} },
        'step-2': { status: StepStatus.NOT_STARTED },
      };

      expect(workflowShouldKeepRunning({ steps, stepInfos })).toBeTruthy();
    });
  });

  describe('should return false', () => {
    it('workflow run only have success steps', () => {
      const steps = [
        {
          id: 'step-1',
        } as WorkflowAction,
      ];

      const stepInfos = { 'step-1': { status: StepStatus.SUCCESS } };

      expect(workflowShouldKeepRunning({ steps, stepInfos })).toBeFalsy();
    });

    it('success step with not executable not started children exists', () => {
      const steps = [
        {
          id: 'step-1',
          nextStepIds: ['step-3'],
        } as WorkflowAction,
        {
          id: 'step-2',
          nextStepIds: ['step-3'],
        } as WorkflowAction,
        {
          id: 'step-3',
        } as WorkflowAction,
      ];

      const stepInfos = {
        'step-1': { status: StepStatus.SUCCESS },
        'step-2': { status: StepStatus.FAILED },
        'step-3': { status: StepStatus.NOT_STARTED },
      };

      expect(workflowShouldKeepRunning({ steps, stepInfos })).toBeFalsy();
    });

    it('every branch of an if/else has been propagated down to the merge', () => {
      const stepInfos: WorkflowRunStepInfos = {
        'if-else': {
          status: StepStatus.SUCCESS,
          result: { matchingBranchId: IF_BRANCH.id },
        },
        'if-child': { status: StepStatus.SUCCESS },
        'else-child': { status: StepStatus.SKIPPED },
        merge: { status: StepStatus.SUCCESS },
      };

      expect(
        workflowShouldKeepRunning({ steps: buildIfElseSteps(), stepInfos }),
      ).toBeFalsy();
    });

    it('a not started step has no parent the executor is done with', () => {
      const steps = [
        createMockCodeStep('step-1', ['step-2']),
        createMockCodeStep('step-2', ['step-3']),
        createMockCodeStep('step-3'),
      ];

      const stepInfos: WorkflowRunStepInfos = {
        'step-1': { status: StepStatus.FAILED, error: 'boom' },
        'step-2': { status: StepStatus.NOT_STARTED },
        'step-3': { status: StepStatus.NOT_STARTED },
      };

      expect(workflowShouldKeepRunning({ steps, stepInfos })).toBeFalsy();
    });

    it('an unreachable step without any parent does not keep the run alive', () => {
      const steps = [
        createMockCodeStep('step-1'),
        createMockCodeStep('orphan-step'),
      ];

      const stepInfos: WorkflowRunStepInfos = {
        'step-1': { status: StepStatus.SUCCESS },
        'orphan-step': { status: StepStatus.NOT_STARTED },
      };

      expect(workflowShouldKeepRunning({ steps, stepInfos })).toBeFalsy();
    });
  });
});
