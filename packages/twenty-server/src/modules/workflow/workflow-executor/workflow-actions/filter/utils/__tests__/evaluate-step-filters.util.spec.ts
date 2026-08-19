import {
  type StepFilter,
  type StepFilterGroup,
  StepLogicalOperator,
  ViewFilterOperand,
} from 'twenty-shared/types';

import { evaluateStepFilters } from 'src/modules/workflow/workflow-executor/workflow-actions/filter/utils/evaluate-step-filters.util';

describe('evaluateStepFilters', () => {
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

  it('matches and has no unresolved value when there are no filters', () => {
    expect(
      evaluateStepFilters({
        stepFilters: [],
        stepFilterGroups: [],
        context,
      }),
    ).toEqual({
      matchesFilter: true,
      hasUnresolvedFilterValue: false,
    });
  });

  it('resolves operands from the context and matches the record', () => {
    expect(
      evaluateStepFilters({
        stepFilterGroups: [group],
        stepFilters: [sourceFilter(ViewFilterOperand.IS)],
        context,
      }),
    ).toEqual({
      matchesFilter: true,
      hasUnresolvedFilterValue: false,
    });
  });

  it('returns no match when the record source is excluded (IS_NOT)', () => {
    expect(
      evaluateStepFilters({
        stepFilterGroups: [group],
        stepFilters: [sourceFilter(ViewFilterOperand.IS_NOT)],
        context,
      }),
    ).toEqual({
      matchesFilter: false,
      hasUnresolvedFilterValue: false,
    });
  });

  it('matches when a different source is excluded (IS_NOT)', () => {
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
    ).toEqual({
      matchesFilter: true,
      hasUnresolvedFilterValue: false,
    });
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
    ).toEqual({
      matchesFilter: true,
      hasUnresolvedFilterValue: false,
    });
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
    ).toEqual({
      matchesFilter: true,
      hasUnresolvedFilterValue: false,
    });
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
    ).toEqual({
      matchesFilter: false,
      hasUnresolvedFilterValue: false,
    });
  });

  it('reports an unresolved filter value when the value variable cannot be resolved', () => {
    const filter: StepFilter = {
      id: 'filter-unresolved',
      type: 'TEXT',
      operand: ViewFilterOperand.IS,
      value: '{{trigger.properties.after.missingValue}}',
      stepOutputKey: '{{trigger.properties.after.name}}',
      stepFilterGroupId: group.id,
    };

    expect(
      evaluateStepFilters({
        stepFilterGroups: [group],
        stepFilters: [filter],
        context,
      }),
    ).toEqual({
      matchesFilter: false,
      hasUnresolvedFilterValue: true,
    });
  });

  it('does not report an unresolved value for IS_EMPTY/IS_NOT_EMPTY operands', () => {
    const filter: StepFilter = {
      id: 'filter-empty-check',
      type: 'TEXT',
      operand: ViewFilterOperand.IS_EMPTY,
      value: '{{trigger.properties.after.missingValue}}',
      stepOutputKey: '{{trigger.properties.after.name}}',
      stepFilterGroupId: group.id,
    };

    expect(
      evaluateStepFilters({
        stepFilterGroups: [group],
        stepFilters: [filter],
        context,
      }),
    ).toEqual({
      matchesFilter: false,
      hasUnresolvedFilterValue: false,
    });
  });
});