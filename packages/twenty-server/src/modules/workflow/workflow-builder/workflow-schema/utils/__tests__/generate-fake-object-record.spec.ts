import { generateFakeObjectRecord } from 'src/modules/workflow/workflow-builder/workflow-schema/utils/generate-fake-object-record';
import { generateObjectRecordFields } from 'src/modules/workflow/workflow-builder/workflow-schema/utils/generate-object-record-fields';
import { mockObjectMetadataItemsWithFieldMaps } from 'src/engine/core-modules/__mocks__/mockObjectMetadataItemsWithFieldMaps';

jest.mock(
  'src/modules/workflow/workflow-builder/workflow-schema/utils/generate-object-record-fields',
  () => ({
    generateObjectRecordFields: jest.fn().mockReturnValue({
      field1: { type: 'TEXT', value: 'test' },
      field2: { type: 'NUMBER', value: 123 },
    }),
  }),
);

const companyMockObjectMetadataItem = mockObjectMetadataItemsWithFieldMaps.find(
  (item) => item.nameSingular === 'company',
)!;

const mockObjectMetadataMaps = {
  byId: {
    [companyMockObjectMetadataItem.id]: companyMockObjectMetadataItem,
  },
  idByNameSingular: {
    [companyMockObjectMetadataItem.nameSingular]:
      companyMockObjectMetadataItem.id,
  },
};

const objectMetadataInfo = {
  objectMetadataMaps: mockObjectMetadataMaps,
  objectMetadataItemWithFieldsMaps: companyMockObjectMetadataItem,
};

describe('generateFakeObjectRecord', () => {
  it('should generate a record with correct object metadata', () => {
    const result = generateFakeObjectRecord(objectMetadataInfo);

    expect(result).toEqual({
      object: {
        isLeaf: true,
        icon: 'test-company-icon',
        label: 'Company',
        value: 'A company',
        nameSingular: 'company',
        fieldIdName: 'id',
      },
      fields: {
        field1: { type: 'TEXT', value: 'test' },
        field2: { type: 'NUMBER', value: 123 },
      },
      _outputSchemaType: 'RECORD',
    });
  });

  it('should call generateObjectRecordFields with the object metadata', () => {
    generateFakeObjectRecord(objectMetadataInfo);

    expect(generateObjectRecordFields).toHaveBeenCalledWith({
      objectMetadataInfo,
    });
  });
});
