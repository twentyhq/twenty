import { validateFlatFieldMetadataNameReadByFormulas } from 'src/engine/metadata-modules/flat-field-metadata/validators/utils/validate-flat-field-metadata-name-read-by-formulas.util';

const UNIVERSAL_FLAT_FIELD_METADATA_MAPS = {
  byUniversalIdentifier: {
    'total-uid': {
      universalSettings: {
        formula: {
          expression: 'price * quantity',
          bindings: { price: 'price-uid', quantity: 'quantity-uid' },
        },
      },
    },
    'price-uid': { universalSettings: null },
  },
};

const validate = ({
  universalIdentifier,
  name,
}: {
  universalIdentifier: string;
  name: string;
}) =>
  validateFlatFieldMetadataNameReadByFormulas({
    universalIdentifier,
    name,
    universalFlatFieldMetadataMaps: UNIVERSAL_FLAT_FIELD_METADATA_MAPS,
  });

describe('validateFlatFieldMetadataNameReadByFormulas', () => {
  it('should refuse a reserved name for a field a formula reads', () => {
    expect(validate({ universalIdentifier: 'price-uid', name: 'now' })).toEqual(
      [expect.objectContaining({ value: 'now' })],
    );
  });

  it('should accept a reserved name for a field no formula reads', () => {
    expect(validate({ universalIdentifier: 'name-uid', name: 'now' })).toEqual(
      [],
    );
  });

  it('should accept a plain name for a field a formula reads', () => {
    expect(
      validate({ universalIdentifier: 'price-uid', name: 'unitPrice' }),
    ).toEqual([]);
  });
});
