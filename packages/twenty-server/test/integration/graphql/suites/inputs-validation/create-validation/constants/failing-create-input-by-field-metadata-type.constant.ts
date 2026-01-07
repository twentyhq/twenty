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
        textField: {},
      },
    },
    {
      input: {
        textField: [],
      },
    },
    {
      input: {
        textField: true,
      },
    },
    {
      input: {
        textField: 1,
      },
    },
  ],
  [FieldMetadataType.NUMBER]: [
    {
      input: {
        numberField: {},
      },
    },
    {
      input: {
        numberField: [],
      },
    },
    {
      input: {
        numberField: true,
      },
    },
    {
      input: {
        numberField: 'string',
      },
    },
  ],
  [FieldMetadataType.UUID]: [
    {
      input: {
        uuidField: {},
      },
    },
    {
      input: {
        uuidField: [],
      },
    },
    {
      input: {
        uuidField: true,
      },
    },
    {
      input: {
        uuidField: 1,
      },
    },
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
        selectField: {},
      },
    },
    {
      input: {
        selectField: [],
      },
    },
    {
      input: {
        selectField: true,
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
        manyToOneRelationFieldId: {},
      },
    },
    {
      input: {
        manyToOneRelationFieldId: [],
      },
    },
    {
      input: {
        manyToOneRelationFieldId: true,
      },
    },
    {
      input: {
        manyToOneRelationFieldId: 1,
      },
    },
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
    {
      input: {
        ratingField: {},
      },
    },
    {
      input: {
        ratingField: [],
      },
    },
    {
      input: {
        ratingField: true,
      },
    },
    {
      input: {
        ratingField: 1,
      },
    },
  ],
  [FieldMetadataType.MULTI_SELECT]: [
    {
      input: {
        multiSelectField: 'not-a-select-option',
      },
    },
    {
      input: {
        multiSelectField: {},
      },
    },
    {
      input: {
        multiSelectField: true,
      },
    },
    {
      input: {
        multiSelectField: 1,
      },
    },
  ],
  [FieldMetadataType.DATE]: [
    {
      input: {
        dateField: 'malformed-date',
      },
    },
    {
      input: {
        dateField: {},
      },
    },
    {
      input: {
        dateField: [],
      },
    },
    {
      input: {
        dateField: true,
      },
    },
    {
      input: {
        dateField: 1,
      },
    },
  ],
  [FieldMetadataType.DATE_TIME]: [
    {
      input: {
        dateTimeField: 'malformed-date',
      },
    },
    {
      input: {
        dateTimeField: {},
      },
    },
    {
      input: {
        dateTimeField: [],
      },
    },
    {
      input: {
        dateTimeField: true,
      },
    },
    {
      input: {
        dateTimeField: 1,
      },
    },
  ],
  [FieldMetadataType.BOOLEAN]: [
    {
      input: {
        booleanField: null,
      },
    },
    {
      input: {
        booleanField: {},
      },
    },
    {
      input: {
        booleanField: [],
      },
    },
    {
      input: {
        booleanField: 'string',
      },
    },
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
};
