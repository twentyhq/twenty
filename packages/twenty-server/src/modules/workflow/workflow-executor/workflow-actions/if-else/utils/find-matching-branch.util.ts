import { type StepFilter, type StepFilterGroup } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { type StepIfElseBranch } from 'twenty-shared/workflow';

import {
  WorkflowStepExecutorException,
  WorkflowStepExecutorExceptionCode,
} from 'src/modules/workflow/workflow-executor/exceptions/workflow-step-executor.exception';
import { evaluateFilterConditions } from 'src/modules/workflow/workflow-executor/workflow-actions/filter/utils/evaluate-filter-conditions.util';

export type ResolvedFilter = Omit<StepFilter, 'value' | 'stepOutputKey'> & {
  rightOperand: unknown;
  leftOperand: unknown;
};

const collectAllDescendantGroups = (
  rootGroupId: string,
  allGroups: StepFilterGroup[],
  collectedGroups: Set<StepFilterGroup> = new Set(),
): Set<StepFilterGroup> => {
  const rootGroup = allGroups.find((group) => group.id === rootGroupId);

  if (!rootGroup) {
    return collectedGroups;
  }

  collectedGroups.add(rootGroup);

  const childGroups = allGroups.filter(
    (group) => group.parentStepFilterGroupId === rootGroupId,
  );

  for (const childGroup of childGroups) {
    collectAllDescendantGroups(childGroup.id, allGroups, collectedGroups);
  }

  return collectedGroups;
};

export const findMatchingBranch = ({
  branches,
  stepFilterGroups,
  resolvedFilters,
}: {
  branches: StepIfElseBranch[];
  stepFilterGroups: StepFilterGroup[];
  resolvedFilters: ResolvedFilter[];
}): StepIfElseBranch => {
  console.log('=== DEBUG findMatchingBranch ===');
  console.log('Branches:', JSON.stringify(branches, null, 2));
  console.log('StepFilterGroups:', JSON.stringify(stepFilterGroups, null, 2));
  console.log('ResolvedFilters:', JSON.stringify(resolvedFilters, null, 2));

  // First, try to find a matching IF/ELSE-IF branch (branches with filterGroupId)
  for (const branch of branches) {
    if (!isDefined(branch.filterGroupId)) {
      // Skip ELSE branch for now - we'll check it after all IF/ELSE-IF branches
      console.log(
        `Skipping branch ${branch.id} - no filterGroupId (ELSE branch)`,
      );
      continue;
    }

    console.log(
      `Checking branch ${branch.id} with filterGroupId ${branch.filterGroupId}`,
    );

    const branchFilterGroups = Array.from(
      collectAllDescendantGroups(branch.filterGroupId, stepFilterGroups),
    );

    console.log(
      `Branch ${branch.id} filterGroups:`,
      JSON.stringify(branchFilterGroups, null, 2),
    );

    const branchFilterGroupIds = new Set(branchFilterGroups.map((g) => g.id));
    const branchFilters = resolvedFilters.filter((filter) =>
      branchFilterGroupIds.has(filter.stepFilterGroupId),
    );

    console.log(
      `Branch ${branch.id} filters:`,
      JSON.stringify(branchFilters, null, 2),
    );
    console.log(
      `Branch ${branch.id} filterGroupIds:`,
      Array.from(branchFilterGroupIds),
    );

    const matches = evaluateFilterConditions({
      filterGroups: branchFilterGroups,
      filters: branchFilters,
    });

    console.log(`Branch ${branch.id} matches:`, matches);

    if (matches) {
      console.log(`Returning matching branch ${branch.id}`);
      console.log('================================');

      return branch;
    }
  }

  // If no IF/ELSE-IF branch matched, find the ELSE branch (branch without filterGroupId)
  const elseBranch = branches.find(
    (branch) => !isDefined(branch.filterGroupId),
  );

  if (!isDefined(elseBranch)) {
    throw new WorkflowStepExecutorException(
      'No matching branch found in if-else action',
      WorkflowStepExecutorExceptionCode.INTERNAL_ERROR,
    );
  }

  console.log(`No IF branch matched, returning ELSE branch ${elseBranch.id}`);
  console.log('================================');

  return elseBranch;
};
