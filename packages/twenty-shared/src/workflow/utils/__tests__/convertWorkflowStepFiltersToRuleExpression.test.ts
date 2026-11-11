import {
  type StepFilterGroup,
  StepLogicalOperator,
  type StepFilterWithPotentiallyDeprecatedOperand,
} from '@/types/StepFilters';
import { ViewFilterOperand } from '@/types/ViewFilterOperand';
import { convertStepFiltersToRuleExpression } from '@/workflow/utils/convertStepFiltersToRuleExpression';
import { convertWorkflowStepFiltersToRuleExpression } from '@/workflow/utils/convertWorkflowStepFiltersToRuleExpression';

const ROOT_GROUP: StepFilterGroup = {
  id: 'root',
  logicalOperator: StepLogicalOperator.AND,
};

const buildStepFilter = (
  stepFilter: Partial<StepFilterWithPotentiallyDeprecatedOperand>,
): StepFilterWithPotentiallyDeprecatedOperand => ({
  id: 'filter',
  type: 'TEXT',
  operand: ViewFilterOperand.IS,
  value: 'Acme',
  stepOutputKey: '{{step-1.name}}',
  stepFilterGroupId: ROOT_GROUP.id,
  ...stepFilter,
});

const convert = (
  stepFilter: Partial<StepFilterWithPotentiallyDeprecatedOperand>,
) =>
  convertWorkflowStepFiltersToRuleExpression({
    stepFilterGroups: [ROOT_GROUP],
    stepFilters: [buildStepFilter(stepFilter)],
  });

describe('convertWorkflowStepFiltersToRuleExpression', () => {
  it('should write step outputs as variable tokens', () => {
    expect(convert({})).toEqual({
      isConvertible: true,
      expression: "{{step-1.name}} == 'Acme'",
    });
    expect(
      convert({
        type: 'NUMBER',
        operand: ViewFilterOperand.GREATER_THAN_OR_EQUAL,
        value: '10',
        stepOutputKey: '{{step-1.employees}}',
      }),
    ).toEqual({
      isConvertible: true,
      expression: '{{step-1.employees}} >= 10',
    });
  });

  it('should keep trigger paths as variables rather than record fields', () => {
    expect(
      convert({ stepOutputKey: '{{trigger.properties.before.name}}' }),
    ).toEqual({
      isConvertible: true,
      expression: "{{trigger.properties.before.name}} == 'Acme'",
    });
  });

  it('should read the id of a full relation record', () => {
    expect(
      convert({
        type: 'RELATION',
        isFullRecord: true,
        value: 'record-id',
        stepOutputKey: '{{step-1.company}}',
      }),
    ).toEqual({
      isConvertible: true,
      expression: "{{step-1.company.id}} == 'record-id'",
    });
  });

  it('should keep the legacy filter for a comparison with another variable', () => {
    expect(convert({ value: '{{step-2.name}}' })).toMatchObject({
      isConvertible: false,
    });
  });

  it('should keep the legacy filter for keys it cannot write as a plain path', () => {
    expect(
      convert({ stepOutputKey: '{{step-1.[key with space]}}' }),
    ).toMatchObject({ isConvertible: false });
    expect(convert({ stepOutputKey: '{{step-1.null}}' })).toMatchObject({
      isConvertible: false,
    });
    expect(convert({ stepOutputKey: 'Hello {{step-1.name}}' })).toMatchObject({
      isConvertible: false,
    });
    expect(convert({ stepOutputKey: '{{step-1}}' })).toMatchObject({
      isConvertible: false,
    });
  });

  it('should keep the legacy filter for types the legacy evaluator compares loosely', () => {
    expect(convert({ type: 'unknown' })).toMatchObject({
      isConvertible: false,
    });
  });

  it('should leave trigger conversion reading the record', () => {
    expect(
      convertStepFiltersToRuleExpression({
        stepFilterGroups: [ROOT_GROUP],
        stepFilters: [
          buildStepFilter({
            stepOutputKey: '{{trigger.properties.before.name}}',
          }),
        ],
        databaseEventAction: 'updated',
      }),
    ).toEqual({ isConvertible: true, expression: "previous.name == 'Acme'" });
  });
});
