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

  it('evaluates IS_NOT_EMPTY against a present field when no value is set', () => {
    const filter: StepFilter = {
      id: 'filter-present',
      type: 'TEXT',
      operand: ViewFilterOperand.IS_NOT_EMPTY,
      value: '',
      stepOutputKey: '{{trigger.properties.after.name}}',
      stepFilterGroupId: group.id,
    };

    expect(
      evaluateStepFilters({
        stepFilterGroups: [group],
        stepFilters: [filter],
        context,
      }),
    ).toBe(true);
  });

  it('resolves a missing field path to empty (IS_EMPTY is true)', () => {
    const filter: StepFilter = {
      id: 'filter-missing',
      type: 'TEXT',
      operand: ViewFilterOperand.IS_EMPTY,
      value: '',
      stepOutputKey: '{{trigger.properties.after.missingField}}',
      stepFilterGroupId: group.id,
    };

    expect(
      evaluateStepFilters({
        stepFilterGroups: [group],
        stepFilters: [filter],
        context,
      }),
    ).toBe(true);
  });

  it('applies implicit AND across flat filters without groups', () => {
    const nameContains: StepFilter = {
      id: 'name-contains',
      type: 'TEXT',
      operand: ViewFilterOperand.CONTAINS,
      value: 'Acme',
      stepOutputKey: '{{trigger.properties.after.name}}',
      stepFilterGroupId: 'unused',
    };
    const sourceIsCalendar: StepFilter = {
      ...sourceFilter(ViewFilterOperand.IS),
      value: JSON.stringify(['CALENDAR']),
      stepFilterGroupId: 'unused',
    };

    expect(
      evaluateStepFilters({
        stepFilterGroups: [],
        stepFilters: [nameContains, sourceIsCalendar],
        context,
      }),
    ).toBe(false);
  });
});
