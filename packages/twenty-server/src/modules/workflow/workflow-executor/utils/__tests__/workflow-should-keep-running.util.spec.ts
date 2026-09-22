import { StepStatus, WorkflowActionType } from 'twenty-shared/workflow';

import { workflowShouldKeepRunning } from 'src/modules/workflow/workflow-executor/utils/workflow-should-keep-running.util';
import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

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

    it('if-else step has not started executable children in taken branch', () => {
      const steps = [
        {
          id: 'step-if',
          type: WorkflowActionType.IF_ELSE,
          settings: {
            input: {
              branches: [
                { id: 'branch-1', nextStepIds: ['step-child-1'] },
                { id: 'branch-2', nextStepIds: ['step-child-2'] },
              ],
            },
          },
        } as unknown as WorkflowAction,
        {
          id: 'step-child-1',
        } as WorkflowAction,
        {
          id: 'step-child-2',
        } as WorkflowAction,
      ];

      const stepInfos = {
        'step-if': {
          status: StepStatus.SUCCESS,
          result: { matchingBranchId: 'branch-1' },
        },
        'step-child-1': { status: StepStatus.NOT_STARTED },
        'step-child-2': { status: StepStatus.NOT_STARTED },
      };

      expect(workflowShouldKeepRunning({ steps, stepInfos })).toBeTruthy();
    });

    it('skipped step has not started executable children along convergence', () => {
      const steps = [
        {
          id: 'step-skipped',
          nextStepIds: ['step-conv'],
        } as WorkflowAction,
        {
          id: 'step-succ',
          nextStepIds: ['step-conv'],
        } as WorkflowAction,
        {
          id: 'step-conv',
        } as WorkflowAction,
      ];

      const stepInfos = {
        'step-skipped': { status: StepStatus.SKIPPED },
        'step-succ': { status: StepStatus.SUCCESS },
        'step-conv': { status: StepStatus.NOT_STARTED },
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

    it('if-else step has untaken branch child only', () => {
      const steps = [
        {
          id: 'step-if',
          type: WorkflowActionType.IF_ELSE,
          settings: {
            input: {
              branches: [
                { id: 'branch-1', nextStepIds: ['step-child-1'] },
                { id: 'branch-2', nextStepIds: ['step-child-2'] },
              ],
            },
          },
        } as unknown as WorkflowAction,
        {
          id: 'step-child-1',
        } as WorkflowAction,
        {
          id: 'step-child-2',
        } as WorkflowAction,
      ];

      const stepInfos = {
        'step-if': {
          status: StepStatus.SUCCESS,
          result: { matchingBranchId: 'branch-1' },
        },
        'step-child-1': { status: StepStatus.SUCCESS },
        'step-child-2': { status: StepStatus.NOT_STARTED },
      };

      expect(workflowShouldKeepRunning({ steps, stepInfos })).toBeFalsy();
    });
  });
});
