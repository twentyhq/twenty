import { FieldMetadataType } from '@/types';
import { isFieldMetadataTypeWritable } from '@/utils/fieldMetadata/isFieldMetadataTypeWritable';

describe('isFieldMetadataTypeWritable', () => {
  it('should refuse computed field types', () => {
    expect(isFieldMetadataTypeWritable(FieldMetadataType.ROLLUP)).toBe(false);
    expect(isFieldMetadataTypeWritable(FieldMetadataType.TS_VECTOR)).toBe(
      false,
    );
  });

  it('should accept stored field types', () => {
    expect(isFieldMetadataTypeWritable(FieldMetadataType.NUMBER)).toBe(true);
    expect(isFieldMetadataTypeWritable(FieldMetadataType.RELATION)).toBe(true);
  });
});
