import { FieldMetadataType } from '@/types';
import { isFieldMetadataSupportedInGroupBy } from '@/utils/fieldMetadata/isFieldMetadataSupportedInGroupBy';

describe('isFieldMetadataSupportedInGroupBy', () => {
  it('returns false for non-groupable field types', () => {
    expect(
      isFieldMetadataSupportedInGroupBy({
        type: FieldMetadataType.RAW_JSON,
      }),
    ).toBe(false);
    expect(
      isFieldMetadataSupportedInGroupBy({
        type: FieldMetadataType.TS_VECTOR,
      }),
    ).toBe(false);
    expect(
      isFieldMetadataSupportedInGroupBy({
        type: FieldMetadataType.FILES,
      }),
    ).toBe(false);
    expect(
      isFieldMetadataSupportedInGroupBy({
        type: FieldMetadataType.POSITION,
      }),
    ).toBe(false);
  });

  it('returns true for regular field types', () => {
    expect(
      isFieldMetadataSupportedInGroupBy({
        type: FieldMetadataType.SELECT,
      }),
    ).toBe(true);
  });

  it('returns false for internal field names', () => {
    expect(
      isFieldMetadataSupportedInGroupBy({
        type: FieldMetadataType.TEXT,
      }),
    ).toBe(false);
    expect(
      isFieldMetadataSupportedInGroupBy({
        type: FieldMetadataType.ACTOR,
      }),
    ).toBe(false);
  });

  it('returns false for system fields', () => {
    expect(
      isFieldMetadataSupportedInGroupBy({
        type: FieldMetadataType.TEXT,
      }),
    ).toBe(false);
  });

  it('returns true for createdAt and updatedAt even when system', () => {
    expect(
      isFieldMetadataSupportedInGroupBy({
        type: FieldMetadataType.DATE_TIME,
      }),
    ).toBe(true);
    expect(
      isFieldMetadataSupportedInGroupBy({
        type: FieldMetadataType.DATE_TIME,
      }),
    ).toBe(true);
  });
});
