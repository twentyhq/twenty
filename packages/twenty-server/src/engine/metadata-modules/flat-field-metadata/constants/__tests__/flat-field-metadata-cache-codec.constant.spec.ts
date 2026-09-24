import { FLAT_FIELD_METADATA_SHORT_CODE_BY_KEY } from 'src/engine/metadata-modules/flat-field-metadata/constants/flat-field-metadata-cache-codec.constant';

describe('FLAT_FIELD_METADATA_SHORT_CODE_BY_KEY', () => {
  it('should give every key its own short code', () => {
    const shortCodes = Object.values(FLAT_FIELD_METADATA_SHORT_CODE_BY_KEY);

    expect(new Set(shortCodes).size).toBe(shortCodes.length);
  });
});
