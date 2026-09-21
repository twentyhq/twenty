import { StepStatus } from 'twenty-shared/workflow';

import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';
import { workflowShouldKeepRunning } from 'src/modules/workflow/workflow-executor/utils/workflow-should-keep-running.util';

const ifElseStep = {
  id: 'ifElse',
  type: 'IF_ELSE',
  name: 'If/Else',
  nextStepIds: [],
  settings: {
    input: {
      branches: [
        { id: 'ifBranch', filterGroupId: 'fg', nextStepIds: ['ifChild'] },
        { id: 'elseBranch', nextStepIds: ['elseChild'] },
      ],
      stepFilterGroups: [],
      stepFilters: [],
    },
  },
} as unknown as WorkflowAction;

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

    it('if/else step with a not started selected branch child exists', () => {
      const steps = [
        ifElseStep,
        { id: 'ifChild' } as WorkflowAction,
        { id: 'elseChild' } as WorkflowAction,
      ];

      const stepInfos = {
        ifElse: {
          status: StepStatus.SUCCESS,
          result: { matchingBranchId: 'ifBranch' },
        },
        ifChild: { status: StepStatus.NOT_STARTED },
        elseChild: { status: StepStatus.NOT_STARTED },
      };

      expect(workflowShouldKeepRunning({ steps, stepInfos })).toBeTruthy();
    });

    it('skipped step with a not started child left to skip exists', () => {
      const steps = [
        { id: 'step-1', nextStepIds: ['step-2'] } as WorkflowAction,
        { id: 'step-2', nextStepIds: ['step-3'] } as WorkflowAction,
        { id: 'step-3' } as WorkflowAction,
      ];

      const stepInfos = {
        'step-1': { status: StepStatus.SKIPPED },
        'step-2': { status: StepStatus.SKIPPED },
        'step-3': { status: StepStatus.NOT_STARTED },
      };

      expect(workflowShouldKeepRunning({ steps, stepInfos })).toBeTruthy();
    });

    it('skipped branch still has to reach a merge step', () => {
      const steps = [
        ifElseStep,
        { id: 'ifChild', nextStepIds: ['merge'] } as WorkflowAction,
        { id: 'elseChild', nextStepIds: ['merge'] } as WorkflowAction,
        { id: 'merge' } as WorkflowAction,
      ];

      const stepInfos = {
        ifElse: {
          status: StepStatus.SUCCESS,
          result: { matchingBranchId: 'ifBranch' },
        },
        ifChild: { status: StepStatus.SUCCESS },
        elseChild: { status: StepStatus.NOT_STARTED },
        merge: { status: StepStatus.NOT_STARTED },
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

    it('if/else step whose branch children are all resolved', () => {
      const steps = [
        ifElseStep,
        { id: 'ifChild' } as WorkflowAction,
        { id: 'elseChild' } as WorkflowAction,
      ];

      const stepInfos = {
        ifElse: {
          status: StepStatus.SUCCESS,
          result: { matchingBranchId: 'ifBranch' },
        },
        ifChild: { status: StepStatus.SUCCESS },
        elseChild: { status: StepStatus.SKIPPED },
      };

      expect(workflowShouldKeepRunning({ steps, stepInfos })).toBeFalsy();
    });

    it('skipped step whose children are already skipped', () => {
      const steps = [
        { id: 'step-1', nextStepIds: ['step-2'] } as WorkflowAction,
        { id: 'step-2' } as WorkflowAction,
      ];

      const stepInfos = {
        'step-1': { status: StepStatus.SKIPPED },
        'step-2': { status: StepStatus.SKIPPED },
      };

      expect(workflowShouldKeepRunning({ steps, stepInfos })).toBeFalsy();
    });
  });
});
