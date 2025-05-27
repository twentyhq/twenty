import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
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
    const mockObjectMetadata = {
      icon: 'test-icon',
      labelSingular: 'Test Object',
      description: 'Test Description',
      nameSingular: 'testObject',
    } as ObjectMetadataEntity;

    const result = generateFakeObjectRecord(mockObjectMetadata);

    expect(result).toEqual({
      object: {
        isLeaf: true,
        icon: 'test-icon',
        label: 'Test Object',
        value: 'Test Description',
        nameSingular: 'testObject',
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
    const mockObjectMetadata = {
      icon: 'test-icon',
      labelSingular: 'Test Object',
      description: 'Test Description',
      nameSingular: 'testObject',
    } as ObjectMetadataEntity;

    generateFakeObjectRecord(mockObjectMetadata);

    expect(generateObjectRecordFields).toHaveBeenCalledWith(mockObjectMetadata);
  });
});
