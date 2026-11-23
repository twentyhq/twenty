import { FieldMetadataType } from '@/types/FieldMetadataType';
import { getFieldMetadataValueType } from '@/utils/fieldMetadata/getFieldMetadataValueType';

describe('getFieldMetadataValueType', () => {
  it('should return the type of a field that is not a rollup', () => {
    expect(
      getFieldMetadataValueType({
        type: FieldMetadataType.TEXT,
        settings: null,
      }),
    ).toBe(FieldMetadataType.TEXT);
  });

  it.each([
    FieldMetadataType.NUMBER,
    FieldMetadataType.DATE,
    FieldMetadataType.DATE_TIME,
  ])('should return the %s result type of a rollup', (resultType) => {
    expect(
      getFieldMetadataValueType({
        type: FieldMetadataType.ROLLUP,
        settings: { resultType },
      }),
    ).toBe(resultType);
  });

  it('should read a rollup without a known result type as a number', () => {
    expect(
      getFieldMetadataValueType({
        type: FieldMetadataType.ROLLUP,
        settings: { resultType: FieldMetadataType.TEXT },
      }),
    ).toBe(FieldMetadataType.NUMBER);
  });
});
