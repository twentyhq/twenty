import { FieldMetadataType } from 'twenty-shared/types';

import { mockObjectMetadataItemsWithFieldMaps } from 'src/engine/core-modules/__mocks__/mockObjectMetadataItemsWithFieldMaps';
import { generateFakeFormResponse } from 'src/modules/workflow/workflow-builder/workflow-schema/utils/generate-fake-form-response';
import { FormFieldMetadata } from 'src/modules/workflow/workflow-executor/workflow-actions/form/types/workflow-form-action-settings.type';

const companyMockObjectMetadataItem = mockObjectMetadataItemsWithFieldMaps.find(
  (item) => item.nameSingular === 'company',
)!;

describe('generateFakeFormResponse', () => {
  it('should generate fake responses for a form schema', async () => {
    const schema: FormFieldMetadata[] = [
      {
        id: '96939213-49ac-4dee-949d-56e6c7be98e6',
        name: 'name',
        type: FieldMetadataType.TEXT,
        label: 'Name',
      },
      {
        id: '96939213-49ac-4dee-949d-56e6c7be98e7',
        name: 'age',
        type: FieldMetadataType.NUMBER,
        label: 'Age',
      },
      {
        id: '96939213-49ac-4dee-949d-56e6c7be98e8',
        name: 'company',
        type: 'RECORD',
        label: 'Company',
        settings: {
          objectName: 'company',
        },
      },
      {
        id: '96939213-49ac-4dee-949d-56e6c7be98e9',
        name: 'date',
        type: FieldMetadataType.DATE,
        label: 'Date',
        placeholder: 'mm/dd/yyyy',
      },
    ];

    const mockObjectMetadataMaps = {
      byId: {
        [companyMockObjectMetadataItem.id]: companyMockObjectMetadataItem,
      },
      idByNameSingular: {
        [companyMockObjectMetadataItem.nameSingular]:
          companyMockObjectMetadataItem.id,
      },
    };

    const result = await generateFakeFormResponse({
      formMetadata: schema,
      objectMetadataMaps: mockObjectMetadataMaps,
    });

    expect(result).toEqual({
      name: {
        isLeaf: true,
        label: 'Name',
        type: FieldMetadataType.TEXT,
        value: 'My text',
        icon: undefined,
      },
      age: {
        isLeaf: true,
        label: 'Age',
        type: FieldMetadataType.NUMBER,
        value: 20,
        icon: undefined,
      },
      company: {
        isLeaf: false,
        label: 'Company',
        value: {
          _outputSchemaType: 'RECORD',
          fields: {},
          object: {
            isLeaf: true,
            label: 'Company',
            fieldIdName: 'id',
            icon: 'test-company-icon',
            nameSingular: 'company',
            value: 'A company',
          },
        },
      },
      date: {
        isLeaf: true,
        label: 'Date',
        type: FieldMetadataType.DATE,
        value: 'mm/dd/yyyy',
        icon: undefined,
      },
    });
  });
});
