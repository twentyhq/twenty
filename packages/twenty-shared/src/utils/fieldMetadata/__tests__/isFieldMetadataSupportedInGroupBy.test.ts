import { FieldMetadataType } from '@/types';
import { isFieldMetadataSupportedInGroupBy } from '@/utils/fieldMetadata/isFieldMetadataSupportedInGroupBy';

describe('isFieldMetadataSupportedInGroupBy', () => {
  it('returns false for field types not supported in groupBy', () => {
    expect(
      isFieldMetadataSupportedInGroupBy({
        type: FieldMetadataType.RAW_JSON,
        name: 'rawJsonField',
        isSystem: false,
      }),
    ).toBe(false);
    expect(
      isFieldMetadataSupportedInGroupBy({
        type: FieldMetadataType.TS_VECTOR,
        name: 'tsVectorField',
        isSystem: false,
      }),
    ).toBe(false);
    expect(
      isFieldMetadataSupportedInGroupBy({
        type: FieldMetadataType.FILES,
        name: 'filesField',
        isSystem: false,
      }),
    ).toBe(false);
    expect(
      isFieldMetadataSupportedInGroupBy({
        type: FieldMetadataType.POSITION,
        name: 'position',
        isSystem: false,
      }),
    ).toBe(false);
    // Morph (polymorphic) relations can't be grouped by a single column
    expect(
      isFieldMetadataSupportedInGroupBy({
        type: FieldMetadataType.MORPH_RELATION,
        name: 'polymorphicHelper',
        isSystem: false,
      }),
    ).toBe(false);
  });

  it('returns true for regular field types', () => {
    expect(
      isFieldMetadataSupportedInGroupBy({
        type: FieldMetadataType.SELECT,
        name: 'stage',
        isSystem: false,
      }),
    ).toBe(true);
  });

  it('returns false for internal field names', () => {
    expect(
      isFieldMetadataSupportedInGroupBy({
        type: FieldMetadataType.TEXT,
        name: 'id',
        isSystem: false,
      }),
    ).toBe(false);
    expect(
      isFieldMetadataSupportedInGroupBy({
        type: FieldMetadataType.DATE_TIME,
        name: 'deletedAt',
        isSystem: false,
      }),
    ).toBe(false);
  });

  it('returns false for system fields', () => {
    expect(
      isFieldMetadataSupportedInGroupBy({
        type: FieldMetadataType.TEXT,
        name: 'customSystemField',
        isSystem: true,
      }),
    ).toBe(false);
  });

  it('returns true for createdAt and updatedAt even when system', () => {
    expect(
      isFieldMetadataSupportedInGroupBy({
        type: FieldMetadataType.DATE_TIME,
        name: 'createdAt',
        isSystem: true,
      }),
    ).toBe(true);
    expect(
      isFieldMetadataSupportedInGroupBy({
        type: FieldMetadataType.DATE_TIME,
        name: 'updatedAt',
        isSystem: true,
      }),
    ).toBe(true);
  });
});
