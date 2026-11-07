import { FieldMetadataType } from '@/types/FieldMetadataType';
import { computeStepFilterType } from '@/workflow/utils/computeStepFilterType';

describe('computeStepFilterType', () => {
  it('should use the field type over the variable type', () => {
    expect(
      computeStepFilterType({
        fieldMetadataType: FieldMetadataType.DATE_TIME,
        variableType: 'string',
      }),
    ).toBe(FieldMetadataType.DATE_TIME);
  });

  it('should compare a morph relation as a relation', () => {
    expect(
      computeStepFilterType({
        fieldMetadataType: FieldMetadataType.MORPH_RELATION,
      }),
    ).toBe(FieldMetadataType.RELATION);
  });

  it('should use the variable type when the filter has no field', () => {
    expect(computeStepFilterType({ variableType: 'number' })).toBe('number');
  });

  it('should be unknown when nothing declares a type', () => {
    expect(computeStepFilterType({})).toBe('unknown');
  });
});
