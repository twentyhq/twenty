import { StepLogicalOperator, type StepFilterGroup } from 'twenty-shared/types';
import { type StepIfElseBranch } from 'twenty-shared/workflow';

import {
  WorkflowStepExecutorException,
  WorkflowStepExecutorExceptionCode,
} from 'src/modules/workflow/workflow-executor/exceptions/workflow-step-executor.exception';
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
      context: {},
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
      context: {},
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
        context: {},
      }),
    ).toThrow(
      expect.objectContaining({
        code: WorkflowStepExecutorExceptionCode.INVALID_STEP_INPUT,
      }),
    );
  });

  it('should throw for a dangling branch even when an earlier branch already matches', () => {
    const branches: StepIfElseBranch[] = [
      { id: 'branch-match', filterGroupId: 'real-group', nextStepIds: [] },
      {
        id: 'branch-dangling',
        filterGroupId: 'group-id-not-in-stepFilterGroups',
        nextStepIds: [],
      },
    ];

    expect(() =>
      findMatchingBranch({
        branches,
        stepFilterGroups: [realGroup],
        resolvedFilters: [matchingFilter('real-group', true)],
        context: {},
      }),
    ).toThrow(
      expect.objectContaining({
        code: WorkflowStepExecutorExceptionCode.INVALID_STEP_INPUT,
      }),
    );
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
        context: {},
      }),
    ).toThrow(WorkflowStepExecutorException);
  });

  describe('with branch conditions', () => {
    const context = { 'step-1': { amount: 1200 } };

    it('should evaluate a branch condition instead of its filters', () => {
      const branches: StepIfElseBranch[] = [
        {
          id: 'branch-condition',
          filterGroupId: 'real-group',
          condition: '{{step-1.amount}} > 1000',
          nextStepIds: [],
        },
        { id: 'branch-else', nextStepIds: [] },
      ];

      const matched = findMatchingBranch({
        branches,
        stepFilterGroups: [realGroup],
        resolvedFilters: [matchingFilter('real-group', false)],
        context,
      });

      expect(matched.id).toBe('branch-condition');
    });

    it('should move on to the next branch when the condition is false', () => {
      const branches: StepIfElseBranch[] = [
        {
          id: 'branch-condition',
          filterGroupId: 'real-group',
          condition: '{{step-1.amount}} > 5000',
          nextStepIds: [],
        },
        { id: 'branch-filter', filterGroupId: 'other-group', nextStepIds: [] },
        { id: 'branch-else', nextStepIds: [] },
      ];

      const matched = findMatchingBranch({
        branches,
        stepFilterGroups: [
          realGroup,
          { id: 'other-group', logicalOperator: StepLogicalOperator.AND },
        ],
        resolvedFilters: [matchingFilter('other-group', true)],
        context,
      });

      expect(matched.id).toBe('branch-filter');
    });

    it('should fail the step when a condition cannot be evaluated', () => {
      const branches: StepIfElseBranch[] = [
        {
          id: 'branch-condition',
          filterGroupId: 'real-group',
          condition: '{{step-1.amount}}',
          nextStepIds: [],
        },
        { id: 'branch-else', nextStepIds: [] },
      ];

      expect(() =>
        findMatchingBranch({
          branches,
          stepFilterGroups: [realGroup],
          resolvedFilters: [],
          context,
        }),
      ).toThrow(
        expect.objectContaining({
          code: WorkflowStepExecutorExceptionCode.INVALID_STEP_INPUT,
        }),
      );
    });
  });
});
