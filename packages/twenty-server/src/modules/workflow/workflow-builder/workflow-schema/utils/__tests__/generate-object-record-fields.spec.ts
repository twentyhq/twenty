import { FieldMetadataType } from 'twenty-shared/types';

import { mockCompanyObjectMetadataInfo } from 'src/engine/core-modules/__mocks__/mockObjectMetadataItemsWithFieldMaps';
import { generateFakeRecordField } from 'src/modules/workflow/workflow-builder/workflow-schema/utils/generate-fake-record-field';
import { generateObjectRecordFields } from 'src/modules/workflow/workflow-builder/workflow-schema/utils/generate-object-record-fields';
import { shouldGenerateFieldFakeValue } from 'src/modules/workflow/workflow-builder/workflow-schema/utils/should-generate-field-fake-value';

jest.mock(
  'src/modules/workflow/workflow-builder/workflow-schema/utils/generate-fake-record-field',
);
jest.mock(
  'src/modules/workflow/workflow-builder/workflow-schema/utils/should-generate-field-fake-value',
);

describe('generateObjectRecordFields', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should generate fields for valid fields only', () => {
    (shouldGenerateFieldFakeValue as jest.Mock).mockImplementation(
      (field) => field.type !== FieldMetadataType.RELATION,
    );

    (generateFakeRecordField as jest.Mock).mockImplementation(
      ({ type, label, icon }) => ({
        type,
        label,
        icon,
        value: `mock-${type}`,
      }),
    );

    const result = generateObjectRecordFields({
      objectMetadataInfo: mockCompanyObjectMetadataInfo,
    });

    expect(result).toEqual({
      domainName: {
        icon: 'test-field-icon',
        label: 'Domain Name',
        type: 'LINKS',
        value: 'mock-LINKS',
      },
      name: {
        icon: 'test-field-icon',
        label: 'Name',
        type: 'TEXT',
        value: 'mock-TEXT',
      },
    });

    expect(shouldGenerateFieldFakeValue).toHaveBeenCalledTimes(2);
    expect(generateFakeRecordField).toHaveBeenCalledTimes(2);
  });

  it('should return empty object when no valid fields', () => {
    (shouldGenerateFieldFakeValue as jest.Mock).mockReturnValue(false);

    const result = generateObjectRecordFields({
      objectMetadataInfo: mockCompanyObjectMetadataInfo,
    });

    expect(result).toEqual({});
    expect(shouldGenerateFieldFakeValue).toHaveBeenCalledTimes(2);
    expect(generateFakeRecordField).not.toHaveBeenCalled();
  });
});
