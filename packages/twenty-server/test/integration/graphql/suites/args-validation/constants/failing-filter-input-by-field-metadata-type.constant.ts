import { type FieldMetadataTypeToTest } from 'test/integration/graphql/suites/args-validation/types/field-metadata-type-to-test';
import { FieldMetadataType } from 'twenty-shared/types';

import { type CompositeFieldMetadataType } from 'src/engine/metadata-modules/workspace-migration/factories/composite-column-action.factory';

export const failingFilterInputByFieldMetadataType: {
  [K in Exclude<FieldMetadataTypeToTest, CompositeFieldMetadataType>]: {
    gqlFilterInput: any;
    restFilterInput?: any;
    gqlErrorMessage: string;
    restErrorMessage?: string;
  }[];
} = {
  [FieldMetadataType.RELATION]: [
    {
      gqlFilterInput: {
        manyToOneRelationField: {
          eq: '6dd71a46-68fe-4420-82b3-0d5b00ad2642',
        },
      },
      gqlErrorMessage: 'is not defined by type',
      // TODO - fix this, should be failing
      // restFilterInput:
      //   'manyToOneRelationField[eq]=6dd71a46-68fe-4420-82b3-0d5b00ad2642',
    },
    {
      gqlFilterInput: {
        manyToOneRelationFieldId: {
          eq: 'invalid-uuid',
        },
      },
      gqlErrorMessage: 'Invalid UUID',
      // TODO - fix this, should be failing
      // restFilterInput: 'manyToOneRelationFieldId[eq]=invalid-uuid',
    },
    {
      gqlFilterInput: {
        oneToManyRelationField: {
          eq: '6dd71a46-68fe-4420-82b3-0d5b00ad2642',
        },
      },
      gqlErrorMessage: 'is not defined by type',
      // TODO - fix this, should be failing
      // restFilterInput:
      //   'oneToManyRelationFieldId[eq]=6dd71a46-68fe-4420-82b3-0d5b00ad2642',
    },
    {
      gqlFilterInput: {
        oneToManyRelationFieldId: {
          eq: 'invalid-uuid',
        },
      },
      gqlErrorMessage: 'is not defined by type',
      // TODO - fix this, should be failing
      // restFilterInput:
      //   'oneToManyRelationFieldId[eq]=invalid-uuid',
    },
  ],
  [FieldMetadataType.UUID]: [
    {
      gqlFilterInput: { uuidField: { eq: 'invalid-uuid' } },
      gqlErrorMessage: 'Invalid UUID',
      // TODO - fix this, should be failing
      // restFilterInput: 'uuidField[eq]=invalid-uuid',
    },
    {
      gqlFilterInput: { uuidField: { eq: undefined } },
      gqlErrorMessage:
        'undefined is not iterable (cannot read property Symbol(Symbol.iterator))',
      // TODO - fix this, should be failing
      // restFilterInput: 'uuidField[eq]=undefined',
    },
    {
      gqlFilterInput: { uuidField: { eq: 2 } },
      gqlErrorMessage: 'UUID must be a string',
      // TODO - fix this, should be failing
      // restFilterInput: 'uuidField[eq]=2',
    },
    {
      gqlFilterInput: { uuidField: { eq: {} } },
      gqlErrorMessage: 'UUID must be a string',
      // TODO - fix this, should be failing
      // restFilterInput: 'uuidField[eq]={}',
    },
    {
      gqlFilterInput: { uuidField: { eq: [] } },
      gqlErrorMessage: 'UUID must be a string',
      // TODO - fix this, should be failing
      // restFilterInput: 'uuidField[eq]=[]',
    },
    {
      gqlFilterInput: { uuidField: { eq: true } },
      gqlErrorMessage: 'UUID must be a string',
      // TODO - fix this, should be failing
      // restFilterInput: 'uuidField[eq]=true',
    },
    {
      gqlFilterInput: { uuidField: { eq: '2025-01-01' } },
      gqlErrorMessage: 'Invalid UUID',
      // TODO - fix this, should be failing
      // restFilterInput: 'uuidField[eq]=2025-01-01',
    },
  ],
  [FieldMetadataType.TEXT]: [
    {
      gqlFilterInput: { textField: { eq: undefined } },
      gqlErrorMessage:
        'undefined is not iterable (cannot read property Symbol(Symbol.iterator))',
    },
    {
      gqlFilterInput: { textField: { eq: 2 } },
      gqlErrorMessage: 'String cannot represent a non string value: 2',
    },
    {
      gqlFilterInput: { textField: { eq: {} } },
      gqlErrorMessage: 'String cannot represent a non string value: {}',
    },
    {
      gqlFilterInput: { textField: { eq: [] } },
      gqlErrorMessage: 'String cannot represent a non string value: []',
    },
    {
      gqlFilterInput: { textField: { eq: true } },
      gqlErrorMessage: 'String cannot represent a non string value: true',
    },
    {
      gqlFilterInput: {
        textField: { regex: 'test' },
      },
      gqlErrorMessage: 'Operator "regex" is not supported',
      // TODO - fix this, should be failing
      // restFilterInput: 'textField[regex]=test',
    },
    {
      gqlFilterInput: {
        textField: { iregex: 'test' },
      },
      gqlErrorMessage: 'Operator "iregex" is not supported',
      // TODO - fix this, should be failing
      // restFilterInput: 'textField[iregex]=test',
    },
  ],
  [FieldMetadataType.DATE_TIME]: [
    {
      gqlFilterInput: { dateTimeField: { eq: 'not-a-date-time' } },
      gqlErrorMessage:
        'invalid input syntax for type timestamp with time zone: "0NaN-NaN-NaNTNaN:NaN:NaN.NaN+NaN:NaN"',
      restFilterInput: 'dateTimeField[eq]=not-a-date-time',
    },
    {
      gqlFilterInput: { dateTimeField: { eq: {} } },
      gqlErrorMessage:
        'invalid input syntax for type timestamp with time zone: "0NaN-NaN-NaNTNaN:NaN:NaN.NaN+NaN:NaN"',
    },
    {
      gqlFilterInput: { dateTimeField: { eq: [] } },
      gqlErrorMessage:
        'invalid input syntax for type timestamp with time zone: "0NaN-NaN-NaNTNaN:NaN:NaN.NaN+NaN:NaN"',
    },
    // TODO - fix this, should throw an error
    // {
    //   gqlFilterInput: { dateTimeField: { eq: true } },
    //   gqlErrorMessage:
    //     'invalid input syntax for type timestamp with time zone: "0NaN-NaN-NaNTNaN:NaN:NaN.NaN+NaN:NaN"',
    // },
  ],
  [FieldMetadataType.DATE]: [
    {
      gqlFilterInput: { dateField: { eq: 'not-a-date' } },
      gqlErrorMessage:
        'invalid input syntax for type date: "0NaN-NaN-NaNTNaN:NaN:NaN.NaN+NaN:NaN"',
    },
    {
      gqlFilterInput: { dateField: { eq: {} } },
      gqlErrorMessage:
        'invalid input syntax for type date: "0NaN-NaN-NaNTNaN:NaN:NaN.NaN+NaN:NaN"',
    },
    {
      gqlFilterInput: { dateField: { eq: [] } },
      gqlErrorMessage:
        'invalid input syntax for type date: "0NaN-NaN-NaNTNaN:NaN:NaN.NaN+NaN:NaN"',
    },
  ],
  [FieldMetadataType.BOOLEAN]: [
    {
      gqlFilterInput: { booleanField: { eq: 'not-a-boolean' } },
      gqlErrorMessage:
        'Boolean cannot represent a non boolean value: "not-a-boolean"',
    },
    {
      gqlFilterInput: { booleanField: { eq: [] } },
      gqlErrorMessage: 'Boolean cannot represent a non boolean value: []',
    },
    {
      gqlFilterInput: { booleanField: { eq: 2 } },
      gqlErrorMessage: 'Boolean cannot represent a non boolean value: 2',
    },
    // TODO - fix this, should throw an error
    // {
    //   gqlFilterInput: { booleanField: { eq: null } },
    //   gqlErrorMessage: 'Boolean cannot represent a non boolean value: null',
    // },
  ],
  [FieldMetadataType.NUMBER]: [
    {
      gqlFilterInput: { numberField: { eq: 'not-a-number' } },
      gqlErrorMessage:
        'Float cannot represent non numeric value: "not-a-number"',
    },
    {
      gqlFilterInput: { numberField: { eq: {} } },
      gqlErrorMessage: 'Float cannot represent non numeric value: {}',
    },
    {
      gqlFilterInput: { numberField: { eq: [] } },
      gqlErrorMessage: 'Float cannot represent non numeric value: []',
    },
    {
      gqlFilterInput: { numberField: { eq: true } },
      gqlErrorMessage: 'Float cannot represent non numeric value: true',
    },
    // TODO - ensure it should throw
    // {
    //   gqlFilterInput: { numberField: { eq: null } },
    //   gqlErrorMessage: 'Float cannot represent non numeric value: null',
    // },
  ],
  [FieldMetadataType.RATING]: [
    {
      gqlFilterInput: { ratingField: { eq: 'not-a-rating' } },
      gqlErrorMessage: 'Value "not-a-rating" does not exist in ',
    },
    {
      gqlFilterInput: { ratingField: { eq: {} } },
      gqlErrorMessage: 'cannot represent non-string value: {}.',
    },
    {
      gqlFilterInput: { ratingField: { eq: [] } },
      gqlErrorMessage: 'cannot represent non-string value: [].',
    },
    {
      gqlFilterInput: { ratingField: { eq: true } },
      gqlErrorMessage: 'cannot represent non-string value: true.',
    },
    {
      gqlFilterInput: { ratingField: { eq: 2 } },
      gqlErrorMessage: 'cannot represent non-string value: 2.',
    },
    // TODO - ensure it should throw
    // {
    //   gqlFilterInput: { ratingField: { eq: null } },
    //   gqlErrorMessage: 'cannot represent non-string value: null.',
    // },
  ],
  [FieldMetadataType.SELECT]: [
    {
      gqlFilterInput: { selectField: { eq: 'not-a-select' } },
      gqlErrorMessage:
        'Value "not-a-select" does not exist in "TestObjectSelectFieldEnum" enum.',
    },
    {
      gqlFilterInput: { selectField: { eq: {} } },
      gqlErrorMessage: 'cannot represent non-string value: {}.',
    },
    {
      gqlFilterInput: { selectField: { eq: [] } },
      gqlErrorMessage: 'cannot represent non-string value: [].',
    },
    {
      gqlFilterInput: { selectField: { eq: true } },
      gqlErrorMessage: 'cannot represent non-string value: true.',
    },
    // TODO - ensure it should throw
    // {
    //   gqlFilterInput: { selectField: { eq: null } },
    //   gqlErrorMessage: 'cannot represent non-string value: null.',
    // },
  ],
  [FieldMetadataType.MULTI_SELECT]: [
    {
      gqlFilterInput: { multiSelectField: { eq: 'not-a-multi-select' } },
      gqlErrorMessage:
        'Value "not-a-multi-select" does not exist in "TestObjectMultiSelectFieldEnum" enum.',
    },
    {
      gqlFilterInput: { multiSelectField: { eq: {} } },
      gqlErrorMessage: 'cannot represent non-string value: {}.',
    },
    {
      gqlFilterInput: { multiSelectField: { eq: [] } },
      gqlErrorMessage: 'cannot represent non-string value: [].',
    },
    {
      gqlFilterInput: { multiSelectField: { eq: true } },
      gqlErrorMessage: 'cannot represent non-string value: true.',
    },
    {
      gqlFilterInput: { multiSelectField: { eq: 2 } },
      gqlErrorMessage: 'cannot represent non-string value: 2.',
    },
    // TODO - ensure it should throw
    // {
    //   gqlFilterInput: { multiSelectField: { eq: null } },
    //   gqlErrorMessage: 'cannot represent non-string value: null.',
    // },
  ],
  [FieldMetadataType.RAW_JSON]: [
    // TODO - ensure it should throw
    // {
    //   gqlFilterInput: { rawJsonField: { like: 'not-a-raw-json' } },
    //   gqlErrorMessage: 'cannot represent non-string value: "not-a-raw-json".',
    // },
    {
      gqlFilterInput: { rawJsonField: { like: {} } },
      gqlErrorMessage: 'cannot represent a non string value',
    },
    {
      gqlFilterInput: { rawJsonField: { like: [] } },
      gqlErrorMessage: 'cannot represent a non string value',
    },
    {
      gqlFilterInput: { rawJsonField: { like: true } },
      gqlErrorMessage: 'cannot represent a non string value',
    },
    {
      gqlFilterInput: { rawJsonField: { like: 2 } },
      gqlErrorMessage: 'cannot represent a non string value',
    },
    // TODO - ensure it should throw
    // {
    //   gqlFilterInput: { rawJsonField: { like: null } },
    //   gqlErrorMessage: 'cannot represent non-string value: null.',
    // },
  ],
  [FieldMetadataType.ARRAY]: [
    {
      gqlFilterInput: { arrayField: { containsIlike: {} } },
      gqlErrorMessage: 'cannot represent a non string value',
    },
    {
      gqlFilterInput: { arrayField: { containsIlike: [] } },
      gqlErrorMessage: 'cannot represent a non string value',
    },
    {
      gqlFilterInput: { arrayField: { containsIlike: true } },
      gqlErrorMessage: 'cannot represent a non string value',
    },
    {
      gqlFilterInput: { arrayField: { containsIlike: 2 } },
      gqlErrorMessage: 'cannot represent a non string value',
    },
    // TODO - ensure it should throw
    // {
    //   gqlFilterInput: { arrayField: { containsIlike: null } },
    //   gqlErrorMessage: 'cannot represent a non string value',
    // },
  ],
};
