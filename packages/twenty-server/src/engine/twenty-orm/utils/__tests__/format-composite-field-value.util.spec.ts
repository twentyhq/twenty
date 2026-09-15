import { FieldMetadataType } from 'twenty-shared/types';

import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { formatCompositeFieldValue } from 'src/engine/twenty-orm/utils/format-composite-field-value.util';

describe('formatCompositeFieldValue', () => {
  const addressFieldMetadata = getFlatFieldMetadataMock({
    universalIdentifier: 'address',
    objectMetadataId: 'object-metadata-id',
    type: FieldMetadataType.ADDRESS,
  });

  const currencyFieldMetadata = getFlatFieldMetadataMock({
    universalIdentifier: 'amount',
    objectMetadataId: 'object-metadata-id',
    type: FieldMetadataType.CURRENCY,
  });

  it('should parse addressLat/addressLng returned as strings into numbers', () => {
    expect(
      formatCompositeFieldValue(
        '40.7532256',
        'addressLat',
        addressFieldMetadata,
      ),
    ).toBe(40.7532256);
    expect(
      formatCompositeFieldValue(
        '-73.99294600000002',
        'addressLng',
        addressFieldMetadata,
      ),
    ).toBe(-73.99294600000002);
  });

  it('should keep coordinates that are already numbers unchanged', () => {
    expect(
      formatCompositeFieldValue(40.7532256, 'addressLat', addressFieldMetadata),
    ).toBe(40.7532256);
  });

  it('should not coerce text address subfields that look numeric', () => {
    expect(
      formatCompositeFieldValue(
        '10001',
        'addressPostcode',
        addressFieldMetadata,
      ),
    ).toBe('10001');
  });

  it('should still parse currency amountMicros returned as a string', () => {
    expect(
      formatCompositeFieldValue(
        '5000000',
        'amountMicros',
        currencyFieldMetadata,
      ),
    ).toBe(5000000);
  });
});
