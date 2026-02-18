import { type FieldMetadataTypesToTestForCreateInputValidation } from 'test/integration/graphql/suites/inputs-validation/types/field-metadata-type-to-test';
import { joinColumnNameForManyToOneMorphRelationField1 } from 'test/integration/graphql/suites/inputs-validation/utils/setup-test-objects-with-all-field-types.util';
import { FieldMetadataType } from 'twenty-shared/types';

export const failingCreateInputByFieldMetadataType: {
  [K in FieldMetadataTypesToTestForCreateInputValidation]: {
    input: any;
  }[];
} = {
  [FieldMetadataType.TEXT]: [
    {
      input: {
        textField: 1,
      },
    },
  ],
  [FieldMetadataType.NUMBER]: [
    {
      input: {
        numberField: 'string',
      },
    },
  ],
  [FieldMetadataType.UUID]: [
    {
      input: {
        uuidField: 'non-uuid',
      },
    },
  ],
  [FieldMetadataType.SELECT]: [
    {
      input: {
        selectField: 'not-a-select-option',
      },
    },
    {
      input: {
        selectField: 1,
      },
    },
  ],
  [FieldMetadataType.RELATION]: [
    {
      input: {
        manyToOneRelationFieldId: 'non-uuid',
      },
    },
    {
      input: {
        oneToOneRelationField: 'not-existing-field',
      },
    },
    {
      input: {
        oneToManyRelationFieldId: 'not-existing-field',
      },
    },
  ],
  [FieldMetadataType.RAW_JSON]: [
    {
      input: {
        rawJsonField: 'not-a-stringified-json',
      },
    },
  ],
  [FieldMetadataType.ARRAY]: [
    {
      input: {
        arrayField: true,
      },
    },
    {
      input: {
        arrayField: 1,
      },
    },
  ],
  [FieldMetadataType.MORPH_RELATION]: [
    {
      input: {
        [joinColumnNameForManyToOneMorphRelationField1]: 'not-a-morph-relation',
      },
    },
    {
      input: {
        [joinColumnNameForManyToOneMorphRelationField1]: {},
      },
    },
    {
      input: {
        [joinColumnNameForManyToOneMorphRelationField1]: [],
      },
    },
    {
      input: {
        [joinColumnNameForManyToOneMorphRelationField1]: true,
      },
    },
    {
      input: {
        [joinColumnNameForManyToOneMorphRelationField1]: 1,
      },
    },
  ],
  [FieldMetadataType.RATING]: [
    {
      input: {
        ratingField: 'not-a-rating',
      },
    },
  ],
  [FieldMetadataType.MULTI_SELECT]: [
    {
      input: {
        multiSelectField: 'not-a-select-option',
      },
    },
  ],
  [FieldMetadataType.DATE]: [
    {
      input: {
        dateField: 'malformed-date',
      },
    },
  ],
  [FieldMetadataType.DATE_TIME]: [
    {
      input: {
        dateTimeField: 'malformed-date-time',
      },
    },
  ],
  [FieldMetadataType.BOOLEAN]: [
    {
      input: {
        booleanField: 1,
      },
    },
  ],
  [FieldMetadataType.RICH_TEXT]: [
    {
      input: {
        richTextField: 'test',
      },
    },
  ],
  [FieldMetadataType.ADDRESS]: [
    {
      input: {
        addressField: 'not-an-address',
      },
    },
  ],
  [FieldMetadataType.CURRENCY]: [
    {
      input: {
        currencyField: 'not-a-currency',
      },
    },
  ],
  [FieldMetadataType.EMAILS]: [
    {
      input: {
        emailsField: 'not-an-email',
      },
    },
    {
      input: {
        emailsField: {
          primaryEmail: 'not-an-email',
        },
      },
    },
    {
      input: {
        emailsField: {
          additionalEmails: 'not-an-email',
        },
      },
    },
    {
      input: {
        emailsField: {
          additionalEmails: ['not-an-email'],
        },
      },
    },
    {
      input: {
        emailsField: {
          primaryEmail: 'email@email.com',
          additionalEmails: ['not-an-email'],
        },
      },
    },
    {
      input: {
        emailsField: {
          primaryEmail: 'not-an-email',
          additionalEmails: ['additional@email.com'],
        },
      },
    },
    {
      input: {
        emailsField: {
          additionalEmails: ['not-an-email', 'additional@email.com'],
        },
      },
    },
  ],
  [FieldMetadataType.PHONES]: [
    {
      input: {
        phonesField: 'not-a-phone',
      },
    },
  ],
  [FieldMetadataType.FULL_NAME]: [
    {
      input: {
        fullNameField: 'not-a-full-name',
      },
    },
  ],
  [FieldMetadataType.LINKS]: [
    {
      input: {
        linksField: 'not-a-link',
      },
    },
  ],
  [FieldMetadataType.RICH_TEXT_V2]: [
    {
      input: {
        richTextV2Field: 'not-a-rich-text',
      },
    },
  ],
  [FieldMetadataType.POSITION]: [
    {
      input: {
        position: 'not-a-position',
      },
    },
    {
      input: {
        position: NaN,
      },
    },
  ],
  [FieldMetadataType.FILES]: [
    {
      input: {
        filesField: 'not-an-addFiles-property',
      },
    },
    {
      input: {
        filesField: { addFiles: [{ invalidField: 'test' }] },
      },
    },
    {
      input: {
        filesField: {
          addFiles: [{ fileId: 'not-a-uuid', label: 'Document.pdf' }],
        },
      },
    },
    {
      input: {
        filesField: [
          {
            addFiles: [
              { fileId: '550e8400-e29b-41d4-a716-446655440000', label: 12345 },
            ],
          },
        ],
      },
    },
    {
      input: {
        filesField: {
          addFiles: [
            {
              fileId: '550e8400-e29b-41d4-a716-446655440000',
              label: 'Document.pdf',
              extension: 'not-allowed-in-input',
            },
          ],
        },
      },
    },
  ],
};
