import { findRecordFilterWithMissingField } from 'src/modules/workflow/workflow-executor/workflow-actions/record-crud/utils/find-record-filter-with-missing-field.util';

const existingFieldMetadataIds = new Set([
  'name-field-id',
  'company-field-id',
  'company-name-field-id',
]);

describe('findRecordFilterWithMissingField', () => {
  it('should return undefined when every filtered field exists', () => {
    expect(
      findRecordFilterWithMissingField({
        recordFilters: [
          { fieldMetadataId: 'name-field-id' },
          {
            fieldMetadataId: 'company-field-id',
            relationTargetFieldMetadataId: 'company-name-field-id',
          },
        ],
        existingFieldMetadataIds,
      }),
    ).toBeUndefined();
  });

  it('should return the filter whose field no longer exists', () => {
    const deletedFieldRecordFilter = { fieldMetadataId: 'deleted-field-id' };

    expect(
      findRecordFilterWithMissingField({
        recordFilters: [
          { fieldMetadataId: 'name-field-id' },
          deletedFieldRecordFilter,
        ],
        existingFieldMetadataIds,
      }),
    ).toBe(deletedFieldRecordFilter);
  });

  it('should return the filter whose relation target field no longer exists', () => {
    const deletedTargetRecordFilter = {
      fieldMetadataId: 'company-field-id',
      relationTargetFieldMetadataId: 'deleted-field-id',
    };

    expect(
      findRecordFilterWithMissingField({
        recordFilters: [deletedTargetRecordFilter],
        existingFieldMetadataIds,
      }),
    ).toBe(deletedTargetRecordFilter);
  });
});
