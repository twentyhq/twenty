import {
  type StepFilterGroup,
  StepLogicalOperator,
  type StepFilterWithPotentiallyDeprecatedOperand,
} from '@/types/StepFilters';
import { ViewFilterOperand } from '@/types/ViewFilterOperand';
import { computeIfElseBranchConditionFromFilter } from '@/workflow/utils/computeIfElseBranchConditionFromFilter';
import { computeWorkflowStepConditionFromFilter } from '@/workflow/utils/computeWorkflowStepConditionFromFilter';

const STEP_FILTER_GROUPS: StepFilterGroup[] = [
  { id: 'if', logicalOperator: StepLogicalOperator.AND },
  {
    id: 'if-any',
    logicalOperator: StepLogicalOperator.OR,
    parentStepFilterGroupId: 'if',
  },
  { id: 'else-if', logicalOperator: StepLogicalOperator.AND },
];

const buildStepFilter = (
  id: string,
  stepFilterGroupId: string,
  value: string,
  type = 'TEXT',
): StepFilterWithPotentiallyDeprecatedOperand => ({
  id,
  type,
  operand: ViewFilterOperand.IS,
  value,
  stepOutputKey: `{{step-1.${id}}}`,
  stepFilterGroupId,
});

const STEP_FILTERS = [
  buildStepFilter('name', 'if', 'Acme'),
  buildStepFilter('city', 'if-any', 'Paris'),
  buildStepFilter('country', 'if-any', 'France'),
  buildStepFilter('payload', 'else-if', '{}', 'RAW_JSON'),
];

describe('computeIfElseBranchConditionFromFilter', () => {
  it("should convert the branch's group and its child groups only", () => {
    expect(
      computeIfElseBranchConditionFromFilter({
        branch: { id: 'branch', filterGroupId: 'if', nextStepIds: [] },
        stepFilterGroups: STEP_FILTER_GROUPS,
        stepFilters: STEP_FILTERS,
      }),
    ).toBe(
      "{{step-1.name}} == 'Acme' and ({{step-1.city}} == 'Paris' or {{step-1.country}} == 'France')",
    );
  });

  it('should have no condition for the else branch or filters that do not convert', () => {
    expect(
      computeIfElseBranchConditionFromFilter({
        branch: { id: 'else', nextStepIds: [] },
        stepFilterGroups: STEP_FILTER_GROUPS,
        stepFilters: STEP_FILTERS,
      }),
    ).toBeUndefined();
    expect(
      computeIfElseBranchConditionFromFilter({
        branch: { id: 'branch', filterGroupId: 'else-if', nextStepIds: [] },
        stepFilterGroups: STEP_FILTER_GROUPS,
        stepFilters: STEP_FILTERS,
      }),
    ).toBeUndefined();
  });
});

describe('computeWorkflowStepConditionFromFilter', () => {
  it('should have no condition without filters', () => {
    expect(
      computeWorkflowStepConditionFromFilter({
        stepFilterGroups: STEP_FILTER_GROUPS,
        stepFilters: [],
      }),
    ).toBeUndefined();
  });
});
