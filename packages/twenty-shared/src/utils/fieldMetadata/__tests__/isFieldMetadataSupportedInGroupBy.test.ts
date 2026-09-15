import { FieldMetadataType, RelationType } from '@/types';
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

  it('returns false for ONE_TO_MANY relation fields', () => {
    // ONE_TO_MANY relations keep their foreign key on the target object, so
    // there is no column on this object to group by.
    expect(
      isFieldMetadataSupportedInGroupBy({
        type: FieldMetadataType.MORPH_RELATION,
        name: 'polymorphicHelperRockets',
        isSystem: false,
        relationType: RelationType.ONE_TO_MANY,
      }),
    ).toBe(false);
    expect(
      isFieldMetadataSupportedInGroupBy({
        type: FieldMetadataType.RELATION,
        name: 'opportunities',
        isSystem: false,
        relationType: RelationType.ONE_TO_MANY,
      }),
    ).toBe(false);
  });

  it('returns true for MANY_TO_ONE relation fields', () => {
    expect(
      isFieldMetadataSupportedInGroupBy({
        type: FieldMetadataType.MORPH_RELATION,
        name: 'polymorphicOwnerRocket',
        isSystem: false,
        relationType: RelationType.MANY_TO_ONE,
      }),
    ).toBe(true);
    expect(
      isFieldMetadataSupportedInGroupBy({
        type: FieldMetadataType.RELATION,
        name: 'company',
        isSystem: false,
        relationType: RelationType.MANY_TO_ONE,
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
