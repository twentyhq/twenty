import { type FieldMetadataFormula } from '@/types/FieldMetadataFormula';
import { getFieldMetadataFormulaBindings } from '@/utils/formula/getFieldMetadataFormulaBindings';

describe('getFieldMetadataFormulaBindings', () => {
  it('should return the bindings stored with a formula', () => {
    const formula: FieldMetadataFormula = {
      expression: 'price',
      bindings: { price: 'price-uid' },
    };

    expect(getFieldMetadataFormulaBindings({ formula })).toEqual({
      price: 'price-uid',
    });
  });

  it.each<FieldMetadataFormula | null>([null, { expression: 'price' }])(
    'should return nothing for a formula without bindings: %j',
    (formula) => {
      expect(getFieldMetadataFormulaBindings({ formula })).toBeUndefined();
    },
  );
});
