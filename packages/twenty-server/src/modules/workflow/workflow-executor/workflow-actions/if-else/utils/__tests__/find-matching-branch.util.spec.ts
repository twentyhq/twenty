import { StepLogicalOperator, type StepFilterGroup } from 'twenty-shared/types';
import { type StepIfElseBranch } from 'twenty-shared/workflow';

import { WorkflowStepExecutorException } from 'src/modules/workflow/workflow-executor/exceptions/workflow-step-executor.exception';
import {
  findMatchingBranch,
  type ResolvedFilter,
} from 'src/modules/workflow/workflow-executor/workflow-actions/if-else/utils/find-matching-branch.util';

describe('findMatchingBranch', () => {
  const realGroup: StepFilterGroup = {
    id: 'real-group',
    logicalOperator: StepLogicalOperator.AND,
  };

  const matchingFilter = (
    stepFilterGroupId: string,
    matches: boolean,
  ): ResolvedFilter =>
    ({
      id: 'filter-1',
      type: 'TEXT',
      operand: 'IS',
      stepFilterGroupId,
      rightOperand: 'expected-value',
      leftOperand: matches ? 'expected-value' : 'something-else',
    }) as ResolvedFilter;

  it('should return the branch whose filter condition evaluates to true', () => {
    const branches: StepIfElseBranch[] = [
      { id: 'branch-a', filterGroupId: 'real-group', nextStepIds: [] },
    ];

    const matched = findMatchingBranch({
      branches,
      stepFilterGroups: [realGroup],
      resolvedFilters: [matchingFilter('real-group', true)],
    });

    expect(matched.id).toBe('branch-a');
  });

  it('should return the trailing else branch when no conditional branch matches', () => {
    const branches: StepIfElseBranch[] = [
      { id: 'branch-a', filterGroupId: 'real-group', nextStepIds: [] },
      { id: 'branch-else', nextStepIds: [] },
    ];

    const matched = findMatchingBranch({
      branches,
      stepFilterGroups: [realGroup],
      resolvedFilters: [matchingFilter('real-group', false)],
    });

    expect(matched.id).toBe('branch-else');
  });

  it('should throw INVALID_STEP_INPUT instead of silently matching a branch whose filterGroupId does not resolve to any stepFilterGroup', () => {
    const branches: StepIfElseBranch[] = [
      {
        id: 'branch-dangling',
        filterGroupId: 'group-id-not-in-stepFilterGroups',
        nextStepIds: [],
      },
      { id: 'branch-real', filterGroupId: 'real-group', nextStepIds: [] },
    ];

    expect(() =>
      findMatchingBranch({
        branches,
        stepFilterGroups: [realGroup],
        resolvedFilters: [matchingFilter('real-group', false)],
      }),
    ).toThrow(WorkflowStepExecutorException);
  });

  it('should throw when no branch matches and there is no else branch', () => {
    const branches: StepIfElseBranch[] = [
      { id: 'branch-a', filterGroupId: 'real-group', nextStepIds: [] },
    ];

    expect(() =>
      findMatchingBranch({
        branches,
        stepFilterGroups: [realGroup],
        resolvedFilters: [matchingFilter('real-group', false)],
      }),
    ).toThrow(WorkflowStepExecutorException);
  });
});
