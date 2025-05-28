import { FieldMetadataType } from 'twenty-shared/types';

import { generateFakeField } from 'src/modules/workflow/workflow-builder/workflow-schema/utils/generate-fake-field';
import { generateObjectRecordFields } from 'src/modules/workflow/workflow-builder/workflow-schema/utils/generate-object-record-fields';
import { shouldGenerateFieldFakeValue } from 'src/modules/workflow/workflow-builder/workflow-schema/utils/should-generate-field-fake-value';
import { mockObjectMetadataItemsWithFieldMaps } from 'src/engine/core-modules/__mocks__/mockObjectMetadataItemsWithFieldMaps';

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

  const companyMockObjectMetadataItem =
    mockObjectMetadataItemsWithFieldMaps.find(
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

  it('should generate fields for valid fields only', () => {
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

    const result = generateObjectRecordFields({ objectMetadataInfo });

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
    expect(generateFakeField).toHaveBeenCalledTimes(2);
  });

  it('should return empty object when no valid fields', () => {
    (shouldGenerateFieldFakeValue as jest.Mock).mockReturnValue(false);

    const result = generateObjectRecordFields({ objectMetadataInfo });

    expect(result).toEqual({});
    expect(shouldGenerateFieldFakeValue).toHaveBeenCalledTimes(2);
    expect(generateFakeField).not.toHaveBeenCalled();
  });
});
