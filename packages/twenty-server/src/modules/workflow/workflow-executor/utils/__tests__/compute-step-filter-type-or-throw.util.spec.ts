import {
  FieldMetadataType,
  type StepFilter,
  ViewFilterOperand,
} from 'twenty-shared/types';

import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { WorkflowStepExecutorException } from 'src/modules/workflow/workflow-executor/exceptions/workflow-step-executor.exception';
import {
  buildStepFilterVariableSources,
  computeStepFilterTypeOrThrow,
  type StepFilterVariableSource,
} from 'src/modules/workflow/workflow-executor/utils/compute-step-filter-type-or-throw.util';

const flatFieldMetadataMaps = [
  { id: 'close-date-field', type: FieldMetadataType.DATE_TIME },
].reduce(
  (flatEntityMaps, { id, type }) =>
    addFlatEntityToFlatEntityMapsOrThrow({
      flatEntity: getFlatFieldMetadataMock({
        id,
        universalIdentifier: id,
        objectMetadataId: 'opportunity-object-id',
        type,
      }),
      flatEntityMaps,
    }),
  createEmptyFlatEntityMaps(),
);

const buildStepFilter = (overrides: Partial<StepFilter>): StepFilter => ({
  id: 'filter',
  stepOutputKey: '{{trigger.properties.after.closeDate}}',
  operand: ViewFilterOperand.IS,
  value: '',
  stepFilterGroupId: 'group',
  ...overrides,
});

const computeType = (
  stepFilter: StepFilter,
  variableSources: StepFilterVariableSource[] = [],
) =>
  computeStepFilterTypeOrThrow({
    stepFilter,
    flatFieldMetadataMaps,
    variableSources,
  });

const HTTP_STEP: StepFilterVariableSource = {
  id: 'http-step',
  type: 'HTTP_REQUEST',
  settings: {
    outputSchema: {
      total: { isLeaf: true, type: 'number', label: 'total', value: 3 },
    },
  },
};

describe('computeStepFilterTypeOrThrow', () => {
  it('should compare a filter on a field as that field, whatever type it was sent with', () => {
    expect(
      computeType({
        ...buildStepFilter({ fieldMetadataId: 'close-date-field' }),
        type: 'TEXT',
      } as StepFilter),
    ).toBe(FieldMetadataType.DATE_TIME);
  });

  it('should throw when the filtered field no longer exists', () => {
    expect(() =>
      computeType(buildStepFilter({ fieldMetadataId: 'deleted-field' })),
    ).toThrow(WorkflowStepExecutorException);
  });

  it('should compare a variable as the output schema of its step declares it', () => {
    expect(
      computeType(buildStepFilter({ stepOutputKey: '{{http-step.total}}' }), [
        HTTP_STEP,
      ]),
    ).toBe('number');
  });

  it('should use the expected output schema of a step that has no computed one', () => {
    expect(
      computeType(buildStepFilter({ stepOutputKey: '{{function-step.ok}}' }), [
        {
          id: 'function-step',
          type: 'LOGIC_FUNCTION',
          settings: { outputSchema: {}, expectedOutputSchema: { ok: true } },
        },
      ]),
    ).toBe('boolean');
  });

  it('should find trigger variables among the sources built for a run', () => {
    expect(
      computeType(
        buildStepFilter({ stepOutputKey: '{{trigger.amount}}' }),
        buildStepFilterVariableSources({
          trigger: {
            type: 'WEBHOOK',
            settings: {
              outputSchema: {
                amount: {
                  isLeaf: true,
                  type: 'number',
                  label: 'amount',
                  value: 1,
                },
              },
            },
          },
          steps: [],
        }),
      ),
    ).toBe('number');
  });

  it('should be unknown when no step declares the variable', () => {
    expect(
      computeType(buildStepFilter({ stepOutputKey: '{{http-step.missing}}' }), [
        HTTP_STEP,
      ]),
    ).toBe('unknown');
    expect(computeType(buildStepFilter({ stepOutputKey: '' }))).toBe('unknown');
  });
});
