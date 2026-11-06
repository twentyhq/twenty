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
  computeStepFilterTypeOrThrow,
  type StepFilterVariableSource,
} from 'src/modules/workflow/workflow-executor/utils/compute-step-filter-type-or-throw.util';

const flatFieldMetadataMaps = addFlatEntityToFlatEntityMapsOrThrow({
  flatEntity: getFlatFieldMetadataMock({
    id: 'close-date-field',
    universalIdentifier: 'close-date-field',
    objectMetadataId: 'opportunity-object-id',
    type: FieldMetadataType.DATE_TIME,
  }),
  flatEntityMaps: createEmptyFlatEntityMaps(),
});

const buildStepFilter = (overrides: Partial<StepFilter>): StepFilter => ({
  id: 'filter',
  stepOutputKey: '{{trigger.properties.after.closeDate}}',
  operand: ViewFilterOperand.IS,
  value: '',
  stepFilterGroupId: 'group',
  ...overrides,
});

const HTTP_STEP: StepFilterVariableSource = {
  id: 'http-step',
  type: 'HTTP_REQUEST',
  outputSchema: {
    total: { isLeaf: true, type: 'number', label: 'total', value: 3 },
  },
};

const computeType = (stepFilter: StepFilter) =>
  computeStepFilterTypeOrThrow({
    stepFilter,
    flatFieldMetadataMaps,
    variableSources: [HTTP_STEP],
  });

describe('computeStepFilterTypeOrThrow', () => {
  it('should compare a filter on a field as that field', () => {
    expect(
      computeType(buildStepFilter({ fieldMetadataId: 'close-date-field' })),
    ).toBe(FieldMetadataType.DATE_TIME);
  });

  it('should throw when the filtered field no longer exists', () => {
    expect(() =>
      computeType(buildStepFilter({ fieldMetadataId: 'deleted-field' })),
    ).toThrow(WorkflowStepExecutorException);
  });

  it('should compare a variable as the output schema of its step declares it', () => {
    expect(
      computeType(buildStepFilter({ stepOutputKey: '{{http-step.total}}' })),
    ).toBe('number');
  });

  it('should be unknown when the step declares no such variable or none is chosen yet', () => {
    expect(
      computeType(buildStepFilter({ stepOutputKey: '{{http-step.missing}}' })),
    ).toBe('unknown');
    expect(computeType(buildStepFilter({ stepOutputKey: '' }))).toBe('unknown');
  });

  it('should throw when the variable reads a step that does not exist', () => {
    expect(() =>
      computeType(buildStepFilter({ stepOutputKey: '{{deleted-step.total}}' })),
    ).toThrow(WorkflowStepExecutorException);
  });
});
