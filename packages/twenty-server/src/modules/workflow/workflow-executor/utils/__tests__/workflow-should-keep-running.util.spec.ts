import { StepStatus } from 'twenty-shared/workflow';

import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';
import { workflowShouldKeepRunning } from 'src/modules/workflow/workflow-executor/utils/workflow-should-keep-running.util';

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
  });
});
