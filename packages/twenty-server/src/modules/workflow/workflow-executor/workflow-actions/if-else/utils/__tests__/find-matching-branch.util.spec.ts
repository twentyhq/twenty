import {
  findMatchingBranch,
  type ResolvedFilter,
} from 'src/modules/workflow/workflow-executor/workflow-actions/if-else/utils/find-matching-branch.util';
import { type StepFilterGroup } from 'twenty-shared/types';
import { type StepIfElseBranch } from 'twenty-shared/workflow';

describe('findMatchingBranch', () => {
  const stepFilterGroups: StepFilterGroup[] = [
    {
      id: 'real-group',
      logicalOperator: 'AND',
    },
  ];

  it('should match branch when filter conditions evaluate to true', () => {
    const branches: StepIfElseBranch[] = [
      {
        id: 'branch-A',
        filterGroupId: 'real-group',
        nextStepIds: ['step-a'],
      },
      {
        id: 'branch-else',
        filterGroupId: undefined,
        nextStepIds: ['step-else'],
      },
    ];

    const resolvedFilters: ResolvedFilter[] = [
      {
        id: 'f1',
        stepFilterGroupId: 'real-group',
        type: 'TEXT',
        operand: 'IS',
        rightOperand: 'value',
        leftOperand: 'value',
      },
    ];

    const result = findMatchingBranch({
      branches,
      stepFilterGroups,
      resolvedFilters,
    });

    expect(result.id).toBe('branch-A');
  });

  it('should skip branch with dangling filterGroupId and fall through to else branch', () => {
    const branches: StepIfElseBranch[] = [
      {
        id: 'branch-dangling',
        filterGroupId: 'dangling-group-id',
        nextStepIds: ['wrong-step'],
      },
      {
        id: 'branch-else',
        filterGroupId: undefined,
        nextStepIds: ['correct-step'],
      },
    ];

    const resolvedFilters: ResolvedFilter[] = [];

    const result = findMatchingBranch({
      branches,
      stepFilterGroups,
      resolvedFilters,
    });

    expect(result.id).toBe('branch-else');
  });

  it('should skip branch with dangling filterGroupId and select subsequent matching valid branch', () => {
    const branches: StepIfElseBranch[] = [
      {
        id: 'branch-dangling',
        filterGroupId: 'non-existent-group',
        nextStepIds: ['wrong-step'],
      },
      {
        id: 'branch-valid',
        filterGroupId: 'real-group',
        nextStepIds: ['correct-step'],
      },
    ];

    const resolvedFilters: ResolvedFilter[] = [
      {
        id: 'f1',
        stepFilterGroupId: 'real-group',
        type: 'TEXT',
        operand: 'IS',
        rightOperand: 'hello',
        leftOperand: 'hello',
      },
    ];

    const result = findMatchingBranch({
      branches,
      stepFilterGroups,
      resolvedFilters,
    });

    expect(result.id).toBe('branch-valid');
  });
});
