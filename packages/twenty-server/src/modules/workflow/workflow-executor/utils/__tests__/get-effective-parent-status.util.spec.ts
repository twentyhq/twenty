import { StepStatus, type WorkflowRunStepInfos } from 'twenty-shared/workflow';

import { getEffectiveParentStatus } from 'src/modules/workflow/workflow-executor/utils/get-effective-parent-status.util';
import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

const recordStep = {
  id: 'parent',
  type: 'RECORD_UPDATE',
  name: 'parent',
  nextStepIds: ['child'],
  settings: { input: {} },
} as unknown as WorkflowAction;

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

describe('getEffectiveParentStatus', () => {
  it('should return the raw status for a non if/else parent', () => {
    const stepInfos: WorkflowRunStepInfos = {
      parent: { status: StepStatus.SUCCESS },
    };

    expect(
      getEffectiveParentStatus({
        parentStep: recordStep,
        childStepId: 'child',
        stepInfos,
      }),
    ).toBe(StepStatus.SUCCESS);
  });

  it('should return the raw status for the child on the branch that was taken', () => {
    const stepInfos: WorkflowRunStepInfos = {
      ifElse: {
        status: StepStatus.SUCCESS,
        result: { matchingBranchId: 'ifBranch' },
      },
    };

    expect(
      getEffectiveParentStatus({
        parentStep: ifElseStep,
        childStepId: 'ifChild',
        stepInfos,
      }),
    ).toBe(StepStatus.SUCCESS);
  });

  it('should read as SKIPPED for the child on a branch that was not taken', () => {
    const stepInfos: WorkflowRunStepInfos = {
      ifElse: {
        status: StepStatus.SUCCESS,
        result: { matchingBranchId: 'ifBranch' },
      },
    };

    expect(
      getEffectiveParentStatus({
        parentStep: ifElseStep,
        childStepId: 'elseChild',
        stepInfos,
      }),
    ).toBe(StepStatus.SKIPPED);
  });

  it('should return the raw status when the if/else has no matching branch (skipped/failed itself)', () => {
    const stepInfos: WorkflowRunStepInfos = {
      ifElse: { status: StepStatus.SKIPPED },
    };

    expect(
      getEffectiveParentStatus({
        parentStep: ifElseStep,
        childStepId: 'ifChild',
        stepInfos,
      }),
    ).toBe(StepStatus.SKIPPED);
  });

  it('should propagate FAILED_SAFELY to the child on the taken branch', () => {
    const stepInfos: WorkflowRunStepInfos = {
      ifElse: {
        status: StepStatus.FAILED_SAFELY,
        result: { matchingBranchId: 'ifBranch' },
      },
    };

    expect(
      getEffectiveParentStatus({
        parentStep: ifElseStep,
        childStepId: 'ifChild',
        stepInfos,
      }),
    ).toBe(StepStatus.FAILED_SAFELY);
  });

  it('should return undefined when the parent has no status yet', () => {
    expect(
      getEffectiveParentStatus({
        parentStep: ifElseStep,
        childStepId: 'ifChild',
        stepInfos: {},
      }),
    ).toBeUndefined();
  });
});
