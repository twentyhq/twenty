import { mockCompanyObjectMetadataInfo } from 'src/engine/core-modules/__mocks__/mockObjectMetadataItemsWithFieldMaps';
import { generateFakeObjectRecord } from 'src/modules/workflow/workflow-builder/workflow-schema/utils/generate-fake-object-record';
import { generateObjectRecordFields } from 'src/modules/workflow/workflow-builder/workflow-schema/utils/generate-object-record-fields';

jest.mock(
  'src/modules/workflow/workflow-builder/workflow-schema/utils/generate-object-record-fields',
  () => ({
    generateObjectRecordFields: jest.fn().mockReturnValue({
      field1: { type: 'TEXT', value: 'test' },
      field2: { type: 'NUMBER', value: 123 },
    }),
  }),
);

describe('generateFakeObjectRecord', () => {
  it('should generate a record with correct object metadata', () => {
    const result = generateFakeObjectRecord({
      objectMetadataInfo: mockCompanyObjectMetadataInfo,
    });

    expect(result).toEqual({
      object: {
        isLeaf: true,
        icon: 'test-company-icon',
        label: 'Company',
        value: 'A company',
        fieldIdName: 'id',
        objectMetadataId: '20202020-c03c-45d6-a4b0-04afe1357c5c',
      },
      fields: {
        field1: { type: 'TEXT', value: 'test' },
        field2: { type: 'NUMBER', value: 123 },
      },
      _outputSchemaType: 'RECORD',
    });
  });

  it('should call generateObjectRecordFields with the object metadata', () => {
    generateFakeObjectRecord({
      objectMetadataInfo: mockCompanyObjectMetadataInfo,
    });

    expect(generateObjectRecordFields).toHaveBeenCalledWith({
      objectMetadataInfo: mockCompanyObjectMetadataInfo,
    });
  });
});
