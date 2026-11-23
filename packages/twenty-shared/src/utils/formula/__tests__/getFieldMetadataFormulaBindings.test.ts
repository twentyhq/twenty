import { getFieldMetadataFormulaBindings } from '@/utils/formula/getFieldMetadataFormulaBindings';

describe('getFieldMetadataFormulaBindings', () => {
  it('should return the bindings stored with a formula', () => {
    expect(
      getFieldMetadataFormulaBindings({
        settings: {
          formula: { expression: 'price', bindings: { price: 'price-uid' } },
        },
      }),
    ).toEqual({ price: 'price-uid' });
  });

  it.each([
    null,
    'text',
    {},
    { formula: null },
    { formula: { expression: 'price' } },
  ])('should return nothing for settings without bindings: %j', (settings) => {
    expect(getFieldMetadataFormulaBindings({ settings })).toBeUndefined();
  });
});
