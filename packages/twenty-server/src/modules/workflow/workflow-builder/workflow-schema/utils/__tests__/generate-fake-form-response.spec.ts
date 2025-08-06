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
      age: {
        isLeaf: true,
        label: 'Age',
        type: 'NUMBER',
        value: 20,
      },
      company: {
        isLeaf: false,
        label: 'Company',
        value: {
          _outputSchemaType: 'RECORD',
          fields: {
            domainName: {
              fieldMetadataId: 'domainNameFieldMetadataId',
              icon: 'test-field-icon',
              isLeaf: false,
              label: 'Domain Name',
              type: 'LINKS',
              value: {
                primaryLinkLabel: {
                  fieldMetadataId: 'domainNameFieldMetadataId',
                  isCompositeSubField: true,
                  isLeaf: true,
                  label: 'Primary Link Label',
                  type: 'TEXT',
                  value: 'My text',
                },
                primaryLinkUrl: {
                  fieldMetadataId: 'domainNameFieldMetadataId',
                  isCompositeSubField: true,
                  isLeaf: true,
                  label: 'Primary Link Url',
                  type: 'TEXT',
                  value: 'My text',
                },
                secondaryLinks: {
                  fieldMetadataId: 'domainNameFieldMetadataId',
                  isCompositeSubField: true,
                  isLeaf: true,
                  label: 'Secondary Links',
                  type: 'RAW_JSON',
                  value: null,
                },
              },
            },
            name: {
              fieldMetadataId: 'nameFieldMetadataId',
              icon: 'test-field-icon',
              isLeaf: true,
              label: 'Name',
              type: 'TEXT',
              value: 'My text',
            },
          },
          object: {
            fieldIdName: 'id',
            icon: 'test-company-icon',
            isLeaf: true,
            label: 'Company',
            nameSingular: 'company',
            objectMetadataId: '20202020-c03c-45d6-a4b0-04afe1357c5c',
            value: 'A company',
          },
        },
      },
      date: {
        isLeaf: true,
        label: 'Date',
        type: 'DATE',
        value: 'mm/dd/yyyy',
      },
      name: {
        isLeaf: true,
        label: 'Name',
        type: 'TEXT',
        value: 'My text',
      },
    });
  });
});
