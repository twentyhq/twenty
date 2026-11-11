import {
  type StepFilterGroup,
  type StepFilterWithPotentiallyDeprecatedOperand,
} from '@/types/StepFilters';
import { isDefined } from '@/utils/validation/isDefined';
import { type StepIfElseBranch } from '@/workflow/types/StepIfElseBranch';
import { computeWorkflowStepConditionFromFilter } from '@/workflow/utils/computeWorkflowStepConditionFromFilter';

const collectBranchFilterGroups = (
  groupId: string,
  stepFilterGroups: StepFilterGroup[],
): StepFilterGroup[] => {
  const group = stepFilterGroups.find(({ id }) => id === groupId);

  if (!isDefined(group)) {
    return [];
  }

  return [
    group,
    ...stepFilterGroups
      .filter(
        ({ parentStepFilterGroupId }) => parentStepFilterGroupId === groupId,
      )
      .flatMap((childGroup) =>
        collectBranchFilterGroups(childGroup.id, stepFilterGroups),
      ),
  ];
};

// Reads the same groups and filters as the legacy branch matcher
export const computeIfElseBranchConditionFromFilter = ({
  branch,
  stepFilterGroups,
  stepFilters,
}: {
  branch: StepIfElseBranch;
  stepFilterGroups: StepFilterGroup[];
  stepFilters: StepFilterWithPotentiallyDeprecatedOperand[];
}): string | undefined => {
  if (!isDefined(branch.filterGroupId)) {
    return undefined;
  }

  const branchFilterGroups = collectBranchFilterGroups(
    branch.filterGroupId,
    stepFilterGroups,
  );
  const branchFilterGroupIds = new Set(branchFilterGroups.map(({ id }) => id));

  return computeWorkflowStepConditionFromFilter({
    stepFilterGroups: branchFilterGroups,
    stepFilters: stepFilters.filter(({ stepFilterGroupId }) =>
      branchFilterGroupIds.has(stepFilterGroupId),
    ),
  });
};
