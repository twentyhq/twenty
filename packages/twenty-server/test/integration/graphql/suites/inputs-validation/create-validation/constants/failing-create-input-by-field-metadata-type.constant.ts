import { type FieldMetadataTypesToTestForCreateInputValidation } from 'test/integration/graphql/suites/inputs-validation/types/field-metadata-type-to-test';
import { FieldMetadataType } from 'twenty-shared/types';

export const failingCreateInputByFieldMetadataType: {
  [K in FieldMetadataTypesToTestForCreateInputValidation]: {
    input: any;
    gqlErrorMessage: string;
    restErrorMessage: string;
  }[];
} = {
  [FieldMetadataType.TEXT]: [
    {
      input: {
        textField: null,
      },
      gqlErrorMessage: 'violates not-null constraint',
      restErrorMessage: 'violates not-null constraint',
    },
    // {
    //   input: {
    //     textField: {},
    //   },
    //   gqlErrorMessage: 'cannot represent a non string value',
    //   //TODO - to fix, should throw
    //   restErrorMessage: '',
    // },
    // {
    //   input: {
    //     textField: [],
    //   },
    //   gqlErrorMessage: 'cannot represent a non string value',
    //   //TODO - to fix, should throw
    //   restErrorMessage: '',
    // },
    // {
    //   input: {
    //     textField: true,
    //   },
    //   gqlErrorMessage: 'cannot represent a non string value',
    //   //TODO - to fix, should throw
    //   restErrorMessage: '',
    // },
    // {
    //   input: {
    //     textField: 1,
    //   },
    //   gqlErrorMessage: 'cannot represent a non string value',
    //   //TODO - to fix, should throw
    // restErrorMessage: '',
    // },
  ],
  [FieldMetadataType.NUMBER]: [
    {
      input: {
        textField: null,
      },
      gqlErrorMessage: 'violates not-null constraint',
      restErrorMessage: 'violates not-null constraint',
    },
    // {
    //   input: {
    //     textField: {},
    //   },
    //   gqlErrorMessage: 'cannot represent a non string value',
    //   //TODO - to fix, should throw
    //   restErrorMessage: '',
    // },
    // {
    //   input: {
    //     textField: [],
    //   },
    //   gqlErrorMessage: 'cannot represent a non string value',
    //   //TODO - to fix, should throw
    //   restErrorMessage: '',
    // },
    // {
    //   input: {
    //     textField: true,
    //   },
    //   gqlErrorMessage: 'cannot represent a non string value',
    //   //TODO - to fix, should throw
    //   restErrorMessage: '',
    // },
    // {
    //   input: {
    //     textField: 'string',
    //   },
    //   gqlErrorMessage: 'cannot represent a non string value',
    //   // TODO - to fix, should throw
    //   restErrorMessage: '',
    // },
  ],
  [FieldMetadataType.UUID]: [
    {
      input: {
        uuidField: {},
      },
      gqlErrorMessage: 'UUID must be a string',
      restErrorMessage: 'invalid input syntax for type uuid',
    },
    {
      input: {
        uuidField: [],
      },
      gqlErrorMessage: 'UUID must be a string',
      restErrorMessage: 'invalid input syntax for type uuid',
    },
    {
      input: {
        uuidField: true,
      },
      gqlErrorMessage: 'UUID must be a string',
      restErrorMessage: 'invalid input syntax for type uuid',
    },
    {
      input: {
        uuidField: 1,
      },
      gqlErrorMessage: 'UUID must be a string',
      restErrorMessage: 'invalid input syntax for type uuid',
    },
    {
      input: {
        uuidField: 'non-uuid',
      },
      gqlErrorMessage: 'Invalid UUID',
      restErrorMessage: 'invalid input syntax for type uuid',
    },
  ],
  [FieldMetadataType.SELECT]: [
    {
      input: {
        selectField: 'not-a-select-option',
      },
      gqlErrorMessage: 'Enum',
      restErrorMessage: 'invalid input value for enum',
    },
    {
      input: {
        selectField: {},
      },
      gqlErrorMessage: 'Enum',
      restErrorMessage: 'invalid input value for enum',
    },
    {
      input: {
        selectField: [],
      },
      gqlErrorMessage: 'Enum',
      restErrorMessage: 'invalid input value for enum',
    },
    {
      input: {
        selectField: true,
      },
      gqlErrorMessage: 'Enum',
      restErrorMessage: 'invalid input value for enum',
    },
    {
      input: {
        selectField: 1,
      },
      gqlErrorMessage: 'Enum',
      restErrorMessage: 'invalid input value for enum',
    },
  ],
  [FieldMetadataType.RELATION]: [
    // {
    //   input: {
    //     manyToOneRelationFieldId: {},
    //   },
    //   gqlErrorMessage: 'ID cannot represent',
    //   //TODO - to fix, should throw
    //   restErrorMessage: 'invalid input syntax for type uuid',
    // },
    // {
    //   input: {
    //     manyToOneRelationFieldId: [],
    //   },
    //   gqlErrorMessage: 'ID cannot represent',
    //   //TODO - to fix, should throw
    //   restErrorMessage: 'invalid input syntax for type uuid',
    // },
    {
      input: {
        manyToOneRelationFieldId: true,
      },
      gqlErrorMessage: 'ID cannot represent',
      restErrorMessage: 'invalid input syntax for type uuid',
    },
    {
      input: {
        manyToOneRelationFieldId: 1,
      },
      gqlErrorMessage: 'invalid input syntax for type uuid',
      restErrorMessage: 'invalid input syntax for type uuid',
    },
    {
      input: {
        manyToOneRelationFieldId: 'non-uuid',
      },
      gqlErrorMessage: 'invalid input syntax for type uuid',
      restErrorMessage: 'invalid input syntax for type uuid',
    },
    // {
    //   input: {
    //     manyToOneRelationField: 'not-existing-field',
    //   },
    //   gqlErrorMessage: 'be an object',
    //   //TODO - to fix, should throw
    //   restErrorMessage: 'invalid input syntax for type uuid',
    // },
    {
      input: {
        oneToManyRelationFieldId: 'not-existing-field',
      },
      gqlErrorMessage: 'not defined',
      restErrorMessage: 'missing in object metadata',
    },
  ],
  [FieldMetadataType.RAW_JSON]: [
    {
      input: {
        rawJsonField: 'not-a-json',
      },
      gqlErrorMessage: 'Unexpected token',
      restErrorMessage: 'Unexpected token',
    },
    // //TODO - to fix, should throw
    // {
    //   input: {
    //     rawJsonField: true,
    //   },
    //   gqlErrorMessage: '',
    //   restErrorMessage: '',
    // },
    // //TODO - to fix, should throw
    // {
    //   input: {
    //     rawJsonField: 1,
    //   },
    //   gqlErrorMessage: '',
    //   restErrorMessage: '',
    // },
  ],
  [FieldMetadataType.ARRAY]: [
    // //TODO - to fix, should throw
    // {
    //   input: {
    //     arrayField: 'not-an-array',
    //   },
    //   gqlErrorMessage: 'Unexpected token',
    //   restErrorMessage: 'Unexpected token',
    // },
    {
      input: {
        arrayField: true,
      },
      gqlErrorMessage: 'String cannot represent a non string value',
      restErrorMessage: 'malformed array literal',
    },
    {
      input: {
        arrayField: 1,
      },
      gqlErrorMessage: 'String cannot represent a non string value',
      restErrorMessage: 'malformed array literal',
    },
  ],
  [FieldMetadataType.RATING]: [
    {
      input: {
        ratingField: 'not-a-rating',
      },
      gqlErrorMessage: 'Enum',
      restErrorMessage: 'invalid input value for enum',
    },
    {
      input: {
        ratingField: {},
      },
      gqlErrorMessage: 'Enum',
      restErrorMessage: 'invalid input value for enum',
    },
    {
      input: {
        ratingField: [],
      },
      gqlErrorMessage: 'Enum',
      restErrorMessage: 'invalid input value for enum',
    },
    {
      input: {
        ratingField: true,
      },
      gqlErrorMessage: 'Enum',
      restErrorMessage: 'invalid input value for enum',
    },
    {
      input: {
        ratingField: 1,
      },
      gqlErrorMessage: 'Enum',
      restErrorMessage: 'invalid input value for enum',
    },
  ],
  [FieldMetadataType.MULTI_SELECT]: [
    {
      input: {
        multiSelectField: 'not-a-select-option',
      },
      gqlErrorMessage: 'Enum',
      restErrorMessage: 'malformed array literal',
    },
    // {
    //   input: {
    //     multiSelectField: {},
    //   },
    //   gqlErrorMessage: 'Enum',
    //   //TODO - to fix, should throw
    //   restErrorMessage: '',
    // },
    {
      input: {
        multiSelectField: true,
      },
      gqlErrorMessage: 'Enum',
      restErrorMessage: 'malformed array literal',
    },
    {
      input: {
        multiSelectField: 1,
      },
      gqlErrorMessage: 'Enum',
      restErrorMessage: 'malformed array literal',
    },
  ],
  [FieldMetadataType.DATE]: [
    {
      input: {
        dateField: 'malformed-date',
      },
      gqlErrorMessage: 'invalid input syntax for type date',
      restErrorMessage: 'invalid input syntax for type date',
    },
    {
      input: {
        dateField: {},
      },
      gqlErrorMessage: 'invalid input syntax for type date',
      restErrorMessage: 'invalid input syntax for type date',
    },
    {
      input: {
        dateField: [],
      },
      gqlErrorMessage: 'invalid input syntax for type date',
      restErrorMessage: 'invalid input syntax for type date',
    },
    {
      input: {
        dateField: true,
      },
      gqlErrorMessage: 'invalid input syntax for type date',
      restErrorMessage: 'invalid input syntax for type date',
    },
    {
      input: {
        dateField: 1,
      },
      gqlErrorMessage: 'invalid input syntax for type date',
      restErrorMessage: 'invalid input syntax for type date',
    },
  ],
  [FieldMetadataType.DATE_TIME]: [
    {
      input: {
        dateTimeField: 'malformed-date',
      },
      gqlErrorMessage: 'invalid input syntax for type timestamp with time zone',
      restErrorMessage:
        'invalid input syntax for type timestamp with time zone',
    },
    {
      input: {
        dateTimeField: {},
      },
      gqlErrorMessage: 'invalid input syntax for type timestamp with time zone',
      restErrorMessage:
        'invalid input syntax for type timestamp with time zone',
    },
    {
      input: {
        dateTimeField: [],
      },
      gqlErrorMessage: 'invalid input syntax for type timestamp with time zone',
      restErrorMessage:
        'invalid input syntax for type timestamp with time zone',
    },
    {
      input: {
        dateTimeField: true,
      },
      gqlErrorMessage: 'invalid input syntax for type timestamp with time zone',
      restErrorMessage:
        'invalid input syntax for type timestamp with time zone',
    },
    {
      input: {
        dateTimeField: 1,
      },
      gqlErrorMessage: 'invalid input syntax for type timestamp with time zone',
      restErrorMessage:
        'invalid input syntax for type timestamp with time zone',
    },
  ],
  [FieldMetadataType.BOOLEAN]: [
    {
      input: {
        textField: null,
      },
      gqlErrorMessage: 'violates not-null constraint',
      restErrorMessage: 'violates not-null constraint',
    },
    // {
    //   input: {
    //     textField: {},
    //   },
    //   gqlErrorMessage: 'cannot represent a non string value',
    //   //TODO - to fix, should throw
    //   restErrorMessage: '',
    // },
    // {
    //   input: {
    //     textField: [],
    //   },
    //   gqlErrorMessage: 'cannot represent a non string value',
    //   //TODO - to fix, should throw
    //   restErrorMessage: '',
    // },
    // {
    //   input: {
    //     textField: 'string',
    //   },
    //   //TODO - to fix, should throw
    //   gqlErrorMessage: 'cannot represent a non string value',
    //   //TODO - to fix, should throw
    //   restErrorMessage: '',
    // },
    // {
    //   input: {
    //     textField: 1,
    //   },
    //   gqlErrorMessage: 'cannot represent a non string value',
    //   //TODO - to fix, should throw
    //   restErrorMessage: '',
    // },
  ],
  [FieldMetadataType.ADDRESS]: [
    {
      input: {
        addressField: null,
      },
      gqlErrorMessage: 'violates not-null constraint',
      restErrorMessage: 'Cannot convert undefined or null to object',
    },
  ],
  [FieldMetadataType.CURRENCY]: [
    {
      input: {
        currencyField: null,
      },
      gqlErrorMessage: 'violates not-null constraint',
      restErrorMessage: 'violates not-null constraint',
    },
  ],
  [FieldMetadataType.EMAILS]: [
    {
      input: {
        emailsField: null,
      },
      gqlErrorMessage: 'violates not-null constraint',
      restErrorMessage: 'violates not-null constraint',
    },
  ],
  [FieldMetadataType.PHONES]: [
    {
      input: {
        phonesField: null,
      },
      gqlErrorMessage: 'violates not-null constraint',
      restErrorMessage: 'violates not-null constraint',
    },
  ],
  [FieldMetadataType.FULL_NAME]: [
    {
      input: {
        fullNameField: null,
      },
      gqlErrorMessage: 'violates not-null constraint',
      restErrorMessage: 'violates not-null constraint',
    },
  ],
  [FieldMetadataType.LINKS]: [
    {
      input: {
        linksField: null,
      },
      gqlErrorMessage: 'violates not-null constraint',
      restErrorMessage: 'violates not-null constraint',
    },
  ],
  [FieldMetadataType.RICH_TEXT]: [
    {
      input: {
        richTextField: null,
      },
      gqlErrorMessage: 'violates not-null constraint',
      restErrorMessage: 'violates not-null constraint',
    },
  ],
  [FieldMetadataType.RICH_TEXT_V2]: [
    {
      input: {
        richTextV2Field: null,
      },
      gqlErrorMessage: 'violates not-null constraint',
      restErrorMessage: 'violates not-null constraint',
    },
  ],
  [FieldMetadataType.ACTOR]: [
    {
      input: {
        actorField: null,
      },
      gqlErrorMessage: 'violates not-null constraint',
      restErrorMessage: 'violates not-null constraint',
    },
  ],
};
