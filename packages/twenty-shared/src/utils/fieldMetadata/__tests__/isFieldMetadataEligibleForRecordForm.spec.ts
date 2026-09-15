import { FieldMetadataType, RelationType } from '@/types';
import { isFieldMetadataEligibleForRecordForm } from '@/utils/fieldMetadata/isFieldMetadataEligibleForRecordForm';

const ELIGIBLE_TEXT_FIELD = {
  fieldName: 'name',
  fieldType: FieldMetadataType.TEXT,
  isActive: true,
  isSystem: false,
  isUIEditable: true,
};

describe('isFieldMetadataEligibleForRecordForm', () => {
  it('accepts an editable text field', () => {
    expect(isFieldMetadataEligibleForRecordForm(ELIGIBLE_TEXT_FIELD)).toBe(
      true,
    );
  });

  it.each([
    ['inactive', { isActive: false }],
    ['system', { isSystem: true }],
    ['not UI editable', { isUIEditable: false }],
  ])('rejects a %s field', (_label, overrides) => {
    expect(
      isFieldMetadataEligibleForRecordForm({
        ...ELIGIBLE_TEXT_FIELD,
        ...overrides,
      }),
    ).toBe(false);
  });

  it('rejects the id field', () => {
    expect(
      isFieldMetadataEligibleForRecordForm({
        ...ELIGIBLE_TEXT_FIELD,
        fieldName: 'id',
        fieldType: FieldMetadataType.UUID,
      }),
    ).toBe(false);
  });

  it.each([
    FieldMetadataType.TS_VECTOR,
    FieldMetadataType.POSITION,
    FieldMetadataType.ACTOR,
    FieldMetadataType.RATING,
    FieldMetadataType.FILES,
    FieldMetadataType.NUMERIC,
  ])('rejects the unsupported type %s', (fieldType) => {
    expect(
      isFieldMetadataEligibleForRecordForm({
        ...ELIGIBLE_TEXT_FIELD,
        fieldType,
      }),
    ).toBe(false);
  });

  it('accepts a many to one relation', () => {
    expect(
      isFieldMetadataEligibleForRecordForm({
        ...ELIGIBLE_TEXT_FIELD,
        fieldType: FieldMetadataType.RELATION,
        relationType: RelationType.MANY_TO_ONE,
      }),
    ).toBe(true);
  });

  it('rejects a one to many relation', () => {
    expect(
      isFieldMetadataEligibleForRecordForm({
        ...ELIGIBLE_TEXT_FIELD,
        fieldType: FieldMetadataType.RELATION,
        relationType: RelationType.ONE_TO_MANY,
      }),
    ).toBe(false);
  });

  it('rejects a relation with no relation type', () => {
    expect(
      isFieldMetadataEligibleForRecordForm({
        ...ELIGIBLE_TEXT_FIELD,
        fieldType: FieldMetadataType.MORPH_RELATION,
        relationType: null,
      }),
    ).toBe(false);
  });
});
