import {
  type StepFilter,
  type StepFilterGroup,
  StepLogicalOperator,
  ViewFilterOperand,
} from 'twenty-shared/types';

import { evaluateStepFilters } from 'src/modules/workflow/workflow-executor/workflow-actions/filter/utils/evaluate-step-filters.util';

describe('evaluateStepFilters', () => {
  // Mirrors how a database event trigger exposes the record to its filter.
  const context = {
    trigger: {
      properties: {
        after: {
          createdBy: { source: 'EMAIL' },
          name: 'Acme',
        },
      },
    },
  };

  const group: StepFilterGroup = {
    id: 'group-1',
    logicalOperator: StepLogicalOperator.AND,
  };

  const sourceFilter = (operand: ViewFilterOperand): StepFilter => ({
    id: 'filter-1',
    type: 'ACTOR',
    operand,
    value: JSON.stringify(['EMAIL']),
    stepOutputKey: '{{trigger.properties.after.createdBy.source}}',
    stepFilterGroupId: group.id,
    compositeFieldSubFieldName: 'source',
  });

  it('returns true when there are no filters', () => {
    expect(
      evaluateStepFilters({
        stepFilters: [],
        stepFilterGroups: [],
        context,
      }),
    ).toBe(true);
  });

  it('resolves operands from the context and matches the record', () => {
    expect(
      evaluateStepFilters({
        stepFilterGroups: [group],
        stepFilters: [sourceFilter(ViewFilterOperand.IS)],
        context,
      }),
    ).toBe(true);
  });

  it('returns false when the record source is excluded (IS_NOT)', () => {
    expect(
      evaluateStepFilters({
        stepFilterGroups: [group],
        stepFilters: [sourceFilter(ViewFilterOperand.IS_NOT)],
        context,
      }),
    ).toBe(false);
  });

  it('returns true when a different source is excluded (IS_NOT)', () => {
    const calendarFilter: StepFilter = {
      ...sourceFilter(ViewFilterOperand.IS_NOT),
      value: JSON.stringify(['CALENDAR']),
    };

    expect(
      evaluateStepFilters({
        stepFilterGroups: [group],
        stepFilters: [calendarFilter],
        context,
      }),
    ).toBe(true);
  });
});
