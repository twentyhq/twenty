import { FieldMetadataType } from 'twenty-shared/types';

import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { generateFakeField } from 'src/modules/workflow/workflow-builder/workflow-schema/utils/generate-fake-field';
import { generateObjectRecordFields } from 'src/modules/workflow/workflow-builder/workflow-schema/utils/generate-object-record-fields';
import { shouldGenerateFieldFakeValue } from 'src/modules/workflow/workflow-builder/workflow-schema/utils/should-generate-field-fake-value';

jest.mock(
  'src/modules/workflow/workflow-builder/workflow-schema/utils/generate-fake-field',
);
jest.mock(
  'src/modules/workflow/workflow-builder/workflow-schema/utils/should-generate-field-fake-value',
);

describe('generateObjectRecordFields', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should generate fields for valid fields only', () => {
    const mockFields = [
      {
        name: 'field1',
        type: FieldMetadataType.TEXT,
        label: 'Field 1',
        icon: 'icon1',
        isSystem: false,
        isActive: true,
      },
      {
        name: 'field2',
        type: FieldMetadataType.RELATION,
        label: 'Field 2',
        icon: 'icon2',
        isSystem: false,
        isActive: true,
      },
      {
        name: 'field3',
        type: FieldMetadataType.NUMBER,
        label: 'Field 3',
        icon: 'icon3',
        isSystem: false,
        isActive: true,
      },
    ];

    const mockObjectMetadata = {
      fields: mockFields,
    } as ObjectMetadataEntity;

    (shouldGenerateFieldFakeValue as jest.Mock).mockImplementation(
      (field) => field.type !== FieldMetadataType.RELATION,
    );

    (generateFakeField as jest.Mock).mockImplementation(
      ({ type, label, icon }) => ({
        type,
        label,
        icon,
        value: `mock-${type}`,
      }),
    );

    const result = generateObjectRecordFields(mockObjectMetadata);

    expect(result).toEqual({
      field1: {
        type: FieldMetadataType.TEXT,
        label: 'Field 1',
        icon: 'icon1',
        value: 'mock-TEXT',
      },
      field3: {
        type: FieldMetadataType.NUMBER,
        label: 'Field 3',
        icon: 'icon3',
        value: 'mock-NUMBER',
      },
    });

    expect(shouldGenerateFieldFakeValue).toHaveBeenCalledTimes(3);
    expect(generateFakeField).toHaveBeenCalledTimes(2);
  });

  it('should return empty object when no valid fields', () => {
    const mockFields = [
      {
        name: 'field1',
        type: FieldMetadataType.RELATION,
        label: 'Field 1',
        icon: 'icon1',
        isSystem: false,
        isActive: true,
      },
    ];

    const mockObjectMetadata = {
      fields: mockFields,
    } as ObjectMetadataEntity;

    (shouldGenerateFieldFakeValue as jest.Mock).mockReturnValue(false);

    const result = generateObjectRecordFields(mockObjectMetadata);

    expect(result).toEqual({});
    expect(shouldGenerateFieldFakeValue).toHaveBeenCalledTimes(1);
    expect(generateFakeField).not.toHaveBeenCalled();
  });
});
