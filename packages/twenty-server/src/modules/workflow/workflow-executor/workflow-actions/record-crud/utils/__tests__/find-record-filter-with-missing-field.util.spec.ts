import { findRecordFilterWithMissingField } from 'src/modules/workflow/workflow-executor/workflow-actions/record-crud/utils/find-record-filter-with-missing-field.util';

const flatFieldMetadataMaps = {
  universalIdentifierById: {
    'name-field-id': 'name-field-universal-identifier',
    'company-field-id': 'company-field-universal-identifier',
    'company-name-field-id': 'company-name-field-universal-identifier',
  },
};

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
        flatFieldMetadataMaps,
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
        flatFieldMetadataMaps,
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
        flatFieldMetadataMaps,
      }),
    ).toBe(deletedTargetRecordFilter);
  });
});
