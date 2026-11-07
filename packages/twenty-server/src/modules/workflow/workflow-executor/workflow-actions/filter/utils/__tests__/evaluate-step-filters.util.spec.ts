import {
  FieldMetadataType,
  type StepFilter,
  type StepFilterGroup,
  StepLogicalOperator,
  ViewFilterOperand,
} from 'twenty-shared/types';

import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type StepFilterVariableSource } from 'src/modules/workflow/workflow-executor/utils/compute-step-filter-type-or-throw.util';
import { evaluateStepFilters as evaluateStepFiltersWithMetadata } from 'src/modules/workflow/workflow-executor/workflow-actions/filter/utils/evaluate-step-filters.util';

const CREATED_BY_FIELD_ID = 'created-by-field-id';

const flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata> =
  addFlatEntityToFlatEntityMapsOrThrow({
    flatEntity: getFlatFieldMetadataMock({
      id: CREATED_BY_FIELD_ID,
      universalIdentifier: CREATED_BY_FIELD_ID,
      objectMetadataId: 'person-object-id',
      type: FieldMetadataType.ACTOR,
      name: 'createdBy',
    }),
    flatEntityMaps: createEmptyFlatEntityMaps(),
  });

const evaluateStepFilters = ({
  variableSources = [
    { id: 'trigger', type: 'DATABASE_EVENT', outputSchema: {} },
  ],
  ...args
}: Omit<
  Parameters<typeof evaluateStepFiltersWithMetadata>[0],
  'flatFieldMetadataMaps' | 'variableSources'
> & { variableSources?: StepFilterVariableSource[] }) =>
  evaluateStepFiltersWithMetadata({
    ...args,
    flatFieldMetadataMaps,
    variableSources,
  });

describe('evaluateStepFilters', () => {
  const context = {
    trigger: {
      properties: {
        after: {
          createdBy: { source: 'EMAIL' },
          name: 'Acme',
          companyId: null,
          jobTitle: '',
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
    operand,
    value: JSON.stringify(['EMAIL']),
    stepOutputKey: '{{trigger.properties.after.createdBy.source}}',
    stepFilterGroupId: group.id,
    compositeFieldSubFieldName: 'source',
    fieldMetadataId: CREATED_BY_FIELD_ID,
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
  const companyFilter = (
    operand: ViewFilterOperand,
    stepOutputKey: string,
  ): StepFilter => ({
    id: 'filter-company',
    operand,
    value: '{{trigger.properties.after.companyId}}',
    stepOutputKey,
    stepFilterGroupId: group.id,
  });

  it('matches an empty field when the filter variable resolves to null', () => {
    expect(
      evaluateStepFilters({
        stepFilterGroups: [group],
        stepFilters: [
          companyFilter(
            ViewFilterOperand.IS,
            '{{trigger.properties.after.jobTitle}}',
          ),
        ],
        context,
      }),
    ).toBe(true);
  });

  it('does not match a field that has a value when the filter variable resolves to null', () => {
    expect(
      evaluateStepFilters({
        stepFilterGroups: [group],
        stepFilters: [
          companyFilter(
            ViewFilterOperand.IS,
            '{{trigger.properties.after.name}}',
          ),
        ],
        context,
      }),
    ).toBe(false);
  });

  it('inverts that for IS_NOT when the filter variable resolves to null', () => {
    expect(
      evaluateStepFilters({
        stepFilterGroups: [group],
        stepFilters: [
          companyFilter(
            ViewFilterOperand.IS_NOT,
            '{{trigger.properties.after.name}}',
          ),
        ],
        context,
      }),
    ).toBe(true);
  });

  it('leaves a filter the user never filled in alone, so an empty field is not treated as a match', () => {
    expect(
      evaluateStepFilters({
        stepFilterGroups: [group],
        stepFilters: [
          {
            ...companyFilter(
              ViewFilterOperand.IS,
              '{{trigger.properties.after.companyId}}',
            ),
            value: '',
          },
        ],
        context,
      }),
    ).toBe(false);
  });

  it('compares a variable as the output schema of its step declares it', () => {
    const isPersonalFilter: StepFilter = {
      id: 'filter-is-personal',
      operand: ViewFilterOperand.IS,
      value: 'false',
      stepOutputKey: '{{code-step.isPersonal}}',
      stepFilterGroupId: group.id,
    };

    expect(
      evaluateStepFilters({
        stepFilterGroups: [group],
        stepFilters: [isPersonalFilter],
        context: { 'code-step': { isPersonal: false } },
        variableSources: [
          {
            id: 'code-step',
            type: 'CODE',
            outputSchema: {
              isPersonal: {
                isLeaf: true,
                type: 'boolean',
                label: 'isPersonal',
                value: true,
              },
            },
          },
        ],
      }),
    ).toBe(true);
  });
});
