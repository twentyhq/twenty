import { getFieldMetadataFormulaBindings } from '@/utils/formula/getFieldMetadataFormulaBindings';

describe('getFieldMetadataFormulaBindings', () => {
  it('should return the bindings stored with a formula', () => {
    expect(
      getFieldMetadataFormulaBindings({
        formula: { expression: 'price', bindings: { price: 'price-uid' } },
      }),
    ).toEqual({ price: 'price-uid' });
  });

  it.each([null, {}, { expression: 'price' }])(
    'should return nothing for a formula without bindings: %j',
    (formula) => {
      expect(getFieldMetadataFormulaBindings({ formula })).toBeUndefined();
    },
  );
});
