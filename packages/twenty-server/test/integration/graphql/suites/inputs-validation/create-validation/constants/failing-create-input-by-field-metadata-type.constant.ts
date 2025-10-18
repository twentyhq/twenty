import { type FieldMetadataTypesToTestForCreateInputValidation } from 'test/integration/graphql/suites/inputs-validation/types/field-metadata-type-to-test';
import { FieldMetadataType } from 'twenty-shared/types';

import { type CompositeFieldMetadataType } from 'src/engine/metadata-modules/workspace-migration/factories/composite-column-action.factory';

export const failingCreateInputByFieldMetadataType: {
  [K in Exclude<
    FieldMetadataTypesToTestForCreateInputValidation,
    | CompositeFieldMetadataType
    | FieldMetadataType.NUMBER
    | FieldMetadataType.BOOLEAN
  >]: {
    input: any;
  }[];
} = {
  [FieldMetadataType.TEXT]: [
    {
      input: {
        textField: null,
      },
    },
    // {
    //   input: {
    //     textField: {},
    //   },
    //   //TODO - rest api to fix, should throw
    // },
    // {
    //   input: {
    //     textField: [],
    //   },
    //   //TODO - rest api to fix, should throw
    // },
    // {
    //   input: {
    //     textField: true,
    //   },
    //   //TODO - rest api to fix, should throw
    // },
    // {
    //   input: {
    //     textField: 1,
    //   },
    //   //TODO - rest api to fix, should throw
    // },
  ],
  // [FieldMetadataType.NUMBER]: [
  //   {
  //     input: {
  //       numberField: {},
  //     },
  //     //TODO - rest api to fix, should throw
  //   },
  //   {
  //     input: {
  //       numberField: [],
  //     },
  //     //TODO - rest api to fix, should throw
  //   },
  //   {
  //     input: {
  //       numberField: true,
  //     },
  //     //TODO - rest api to fix, should throw
  //   },
  //   {
  //     input: {
  //       numberField: 'string',
  //     },
  //     // TODO - rest api to fix, should throw
  //   },
  // ],
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
    // {
    //   input: {
    //     manyToOneRelationFieldId: {},
    //   },
    //   //TODO - rest api to fix, should throw
    // },
    // {
    //   input: {
    //     manyToOneRelationFieldId: [],
    //   },
    //   //TODO - rest api to fix, should throw
    // },
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
    // {
    //   input: {
    //     manyToOneRelationField: 'not-existing-field',
    //   },
    //   //TODO - rest api to fix, should throw
    // },
    {
      input: {
        oneToManyRelationFieldId: 'not-existing-field',
      },
    },
  ],
  [FieldMetadataType.RAW_JSON]: [
    {
      input: {
        rawJsonField: 'not-a-json',
      },
    },
    // //TODO - to fix, should throw
    // {
    //   input: {
    //     rawJsonField: true,
    //   },
    // },
    // //TODO - to fix, should throw
    // {
    //   input: {
    //     rawJsonField: 1,
    //   },
    // },
  ],
  [FieldMetadataType.ARRAY]: [
    // //TODO - to fix, should throw
    // {
    //   input: {
    //     arrayField: 'not-an-array',
    //   },
    // },
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
    // {
    //   input: {
    //     multiSelectField: {},
    //   },
    //   //TODO - rest api to fix, should throw
    // },
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
  // [FieldMetadataType.BOOLEAN]: [
  //   // {
  //   //   input: {
  //   //     booleanField: null,
  //   //   },
  //   // },
  //   // {
  //   //   input: {
  //   //     booleanField: {},
  //   //   },
  //   //   //TODO - rest api to fix, should throw
  //   // },
  //   // {
  //   //   input: {
  //   //     booleanField: [],
  //   //   },
  //   //   gqlErrorMessage: 'cannot represent a non string value',
  //   //   //TODO - rest api to fix, should throw
  //   //   restErrorMessage: '',
  //   // },
  //   // {
  //   //   input: {
  //   //     booleanField: 'string',
  //   //   },
  //   //   //TODO - rest api to fix, should throw
  //   // },
  //   // {
  //   //   input: {
  //   //     booleanField: 1,
  //   //   },
  //   //   //TODO - rest api to fix, should throw
  //   // },
  // ],
  [FieldMetadataType.RICH_TEXT]: [
    {
      input: {
        richTextField: 'test',
      },
    },
  ],
  // [FieldMetadataType.ADDRESS]: [
  //   // {
  //   //   input: {
  //   //     addressField: null,
  //   //   },
  //   //   //TODO - rest api to fix, should throw
  //   // },
  //   // {
  //   //   input: {
  //   //     addressField: 'not-an-address',
  //   //   },
  //   //   //TODO - rest api to fix, should throw
  //   // },
  // ],
  // [FieldMetadataType.CURRENCY]: [
  //   // {
  //   //   input: {
  //   //     currencyField: null,
  //   //   },
  //   //   //TODO - rest api to fix, should throw
  //   // },
  // ],
  // [FieldMetadataType.EMAILS]: [
  //   // {
  //   //   input: {
  //   //     emailsField: null,
  //   //   },
  //   //   //TODO - rest api to fix, should throw
  //   // },
  // ],
  // [FieldMetadataType.PHONES]: [
  //   // {
  //   //   input: {
  //   //     phonesField: null,
  //   //   },
  //   //   //TODO - rest api to fix, should throw
  //   // },
  // ],
  // [FieldMetadataType.FULL_NAME]: [
  //   // {
  //   //   input: {
  //   //     fullNameField: null,
  //   //   },
  //   //   //TODO - rest api to fix, should throw
  //   // },
  // ],
  // [FieldMetadataType.LINKS]: [
  //   // {
  //   //   input: {
  //   //     linksField: null,
  //   //   },
  //   //   //TODO - rest api to fix, should throw
  //   // },
  // ],
  // [FieldMetadataType.RICH_TEXT_V2]: [
  //   // {
  //   //   input: {
  //   //     richTextV2Field: null,
  //   //   },
  //   //   //TODO - rest api to fix, should throw
  //   // },
  // ],
  // [FieldMetadataType.ACTOR]: [
  //   // {
  //   //   input: {
  //   //     actorField: null,
  //   //   },
  //   //   //TODO - rest api to fix, should throw
  //   // },
  // ],
};
