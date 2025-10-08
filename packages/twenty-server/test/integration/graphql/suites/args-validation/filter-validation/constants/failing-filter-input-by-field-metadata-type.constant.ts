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
      restFilterInput:
        'manyToOneRelationField[eq]:"6dd71a46-68fe-4420-82b3-0d5b00ad2642"',
      restErrorMessage: "'manyToOneRelationField' does not exist",
    },
    {
      gqlFilterInput: {
        manyToOneRelationFieldId: {
          eq: 'invalid-uuid',
        },
      },
      gqlErrorMessage: 'Invalid UUID',
      restFilterInput: 'manyToOneRelationFieldId[eq]:"invalid-uuid"',
      restErrorMessage: 'invalid input syntax for type uuid',
    },
    {
      gqlFilterInput: {
        oneToManyRelationField: {
          eq: '6dd71a46-68fe-4420-82b3-0d5b00ad2642',
        },
      },
      gqlErrorMessage: 'is not defined by type',
      restFilterInput:
        'oneToManyRelationFieldId[eq]:"6dd71a46-68fe-4420-82b3-0d5b00ad2642"',
      restErrorMessage: "'oneToManyRelationFieldId' does not exist",
    },
    {
      gqlFilterInput: {
        oneToManyRelationFieldId: {
          eq: 'invalid-uuid',
        },
      },
      gqlErrorMessage: 'is not defined by type',
      restErrorMessage: "'oneToManyRelationFieldId' does not exist",
    },
  ],
  [FieldMetadataType.UUID]: [
    {
      gqlFilterInput: { uuidField: { eq: 'invalid-uuid' } },
      gqlErrorMessage: 'Invalid UUID',
      restFilterInput: 'uuidField[eq]:"invalid-uuid"',
      restErrorMessage: 'invalid input syntax for type uuid',
    },
    {
      gqlFilterInput: { uuidField: { eq: undefined } },
      gqlErrorMessage:
        'undefined is not iterable (cannot read property Symbol(Symbol.iterator))',
      restFilterInput: 'uuidField[eq]:"undefined"',
      restErrorMessage: 'invalid input syntax for type uuid',
    },
    {
      gqlFilterInput: { uuidField: { eq: 2 } },
      gqlErrorMessage: 'UUID must be a string',
      restFilterInput: 'uuidField[eq]:2',
      restErrorMessage: 'invalid input syntax for type uuid',
    },
    {
      gqlFilterInput: { uuidField: { eq: {} } },
      gqlErrorMessage: 'UUID must be a string',
      restFilterInput: 'uuidField[eq]:"{}"',
      restErrorMessage: 'invalid input syntax for type uuid',
    },
    {
      gqlFilterInput: { uuidField: { eq: [] } },
      gqlErrorMessage: 'UUID must be a string',
      restFilterInput: 'uuidField[eq]:"[]"',
      restErrorMessage: 'invalid input syntax for type uuid',
    },
    {
      gqlFilterInput: { uuidField: { eq: true } },
      gqlErrorMessage: 'UUID must be a string',
      restFilterInput: 'uuidField[eq]:"true"',
      restErrorMessage: 'invalid input syntax for type uuid',
    },
    {
      gqlFilterInput: { uuidField: { eq: '2025-01-01' } },
      gqlErrorMessage: 'Invalid UUID',
      restFilterInput: 'uuidField[eq]:"2025-01-01"',
      restErrorMessage: 'invalid input syntax for type uuid',
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
      restFilterInput: 'textField[regex]:test',
      restErrorMessage: 'comparator regex not in',
    },
    {
      gqlFilterInput: {
        textField: { iregex: 'test' },
      },
      gqlErrorMessage: 'Operator "iregex" is not supported',
      restFilterInput: 'textField[iregex]:test',
      restErrorMessage: 'comparator iregex not in',
    },
  ],
  [FieldMetadataType.DATE_TIME]: [
    {
      gqlFilterInput: { dateTimeField: { eq: 'not-a-date-time' } },
      gqlErrorMessage:
        'invalid input syntax for type timestamp with time zone: "0NaN-NaN-NaNTNaN:NaN:NaN.NaN+NaN:NaN"',
      restFilterInput: 'dateTimeField[eq]:"not-a-date-time"',
      restErrorMessage:
        'invalid input syntax for type timestamp with time zone',
    },
    {
      gqlFilterInput: { dateTimeField: { eq: {} } },
      gqlErrorMessage:
        'invalid input syntax for type timestamp with time zone: "0NaN-NaN-NaNTNaN:NaN:NaN.NaN+NaN:NaN"',
      restFilterInput: 'dateTimeField[eq]:"{}"',
      restErrorMessage:
        'invalid input syntax for type timestamp with time zone',
    },
    {
      gqlFilterInput: { dateTimeField: { eq: [] } },
      gqlErrorMessage:
        'invalid input syntax for type timestamp with time zone: "0NaN-NaN-NaNTNaN:NaN:NaN.NaN+NaN:NaN"',
      restFilterInput: 'dateTimeField[eq]:"[]"',
      restErrorMessage:
        'invalid input syntax for type timestamp with time zone',
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
      restFilterInput: 'dateField[eq]:"{}"',
      restErrorMessage: 'invalid input syntax for type date',
    },
    {
      gqlFilterInput: { dateField: { eq: {} } },
      gqlErrorMessage:
        'invalid input syntax for type date: "0NaN-NaN-NaNTNaN:NaN:NaN.NaN+NaN:NaN"',
      restFilterInput: 'dateField[eq]:"{}"',
      restErrorMessage: 'invalid input syntax for type date',
    },
    {
      gqlFilterInput: { dateField: { eq: [] } },
      gqlErrorMessage:
        'invalid input syntax for type date: "0NaN-NaN-NaNTNaN:NaN:NaN.NaN+NaN:NaN"',
      restFilterInput: 'dateField[eq]:"[]"',
      restErrorMessage: 'invalid input syntax for type date',
    },
  ],
  [FieldMetadataType.BOOLEAN]: [
    {
      gqlFilterInput: { booleanField: { eq: 'not-a-boolean' } },
      gqlErrorMessage:
        'Boolean cannot represent a non boolean value: "not-a-boolean"',
      // TODO - fix this, should throw an error
      // restFilterInput: 'booleanField[eq]:"not-a-boolean"',
      // restErrorMessage: 'invalid input syntax for type boolean',
    },
    {
      gqlFilterInput: { booleanField: { eq: [] } },
      gqlErrorMessage: 'Boolean cannot represent a non boolean value: []',
      // TODO - fix this, should throw an error
      // restFilterInput: 'booleanField[eq]:"[]"',
      // restErrorMessage: 'invalid input syntax for type boolean',
    },
    {
      gqlFilterInput: { booleanField: { eq: 2 } },
      gqlErrorMessage: 'Boolean cannot represent a non boolean value: 2',
      // TODO - fix this, should throw an error
      // restFilterInput: 'booleanField[eq]:2',
      // restErrorMessage: 'invalid input syntax for type boolean',
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
      // TODO - fix this, should throw an error
      // restFilterInput: 'numberField[eq]:"not-a-number"',
      // restErrorMessage: 'invalid input syntax for type float',
    },
    {
      gqlFilterInput: { numberField: { eq: {} } },
      gqlErrorMessage: 'Float cannot represent non numeric value: {}',
      // TODO - fix this, should throw an error
      // restFilterInput: 'numberField[eq]:"{}"',
      // restErrorMessage: 'invalid input syntax for type float',
    },
    {
      gqlFilterInput: { numberField: { eq: [] } },
      gqlErrorMessage: 'Float cannot represent non numeric value: []',
      // TODO - fix this, should throw an error
      // restFilterInput: 'numberField[eq]:"[]"',
      // restErrorMessage: 'invalid input syntax for type float',
    },
    {
      gqlFilterInput: { numberField: { eq: true } },
      gqlErrorMessage: 'Float cannot represent non numeric value: true',
      // TODO - fix this, should throw an error
      // restFilterInput: 'numberField[eq]:"true"',
      // restErrorMessage: 'invalid input syntax for type float',
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
      restFilterInput: 'ratingField[eq]:"not-a-rating"',
      restErrorMessage: 'invalid input value for enum',
    },
    {
      gqlFilterInput: { ratingField: { eq: {} } },
      gqlErrorMessage: 'cannot represent non-string value: {}.',
      restFilterInput: 'ratingField[eq]:"{}"',
      restErrorMessage: 'invalid input value for enum',
    },
    {
      gqlFilterInput: { ratingField: { eq: [] } },
      gqlErrorMessage: 'cannot represent non-string value: [].',
      restFilterInput: 'ratingField[eq]:"[]"',
      restErrorMessage: 'invalid input value for enum',
    },
    {
      gqlFilterInput: { ratingField: { eq: true } },
      gqlErrorMessage: 'cannot represent non-string value: true.',
      restFilterInput: 'ratingField[eq]:"true"',
      restErrorMessage: 'invalid input value for enum',
    },
    {
      gqlFilterInput: { ratingField: { eq: 2 } },
      gqlErrorMessage: 'cannot represent non-string value: 2.',
      restFilterInput: 'ratingField[eq]:2',
      restErrorMessage: 'invalid input value for enum',
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
      restFilterInput: 'selectField[eq]:"not-a-select"',
      restErrorMessage: "not available in 'selectField'",
    },
    {
      gqlFilterInput: { selectField: { eq: {} } },
      gqlErrorMessage: 'cannot represent non-string value: {}.',
      restFilterInput: 'selectField[eq]:"{}"',
      restErrorMessage: "not available in 'selectField'",
    },
    {
      gqlFilterInput: { selectField: { eq: [] } },
      gqlErrorMessage: 'cannot represent non-string value: [].',
      restFilterInput: 'selectField[eq]:"[]"',
      restErrorMessage: "not available in 'selectField'",
    },
    {
      gqlFilterInput: { selectField: { eq: true } },
      gqlErrorMessage: 'cannot represent non-string value: true.',
      restFilterInput: 'selectField[eq]:"true"',
      restErrorMessage: "not available in 'selectField'",
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
      restFilterInput: 'multiSelectField[eq]:"not-a-multi-select"',
      restErrorMessage: "not available in 'multiSelectField'",
    },
    {
      gqlFilterInput: { multiSelectField: { eq: {} } },
      gqlErrorMessage: 'cannot represent non-string value: {}.',
      restFilterInput: 'multiSelectField[eq]:"{}"',
      restErrorMessage: "not available in 'multiSelectField'",
    },
    {
      gqlFilterInput: { multiSelectField: { eq: [] } },
      gqlErrorMessage: 'cannot represent non-string value: [].',
      restFilterInput: 'multiSelectField[eq]:"[]"',
      restErrorMessage: "not available in 'multiSelectField'",
    },
    {
      gqlFilterInput: { multiSelectField: { eq: true } },
      gqlErrorMessage: 'cannot represent non-string value: true.',
      restFilterInput: 'multiSelectField[eq]:"true"',
      restErrorMessage: "not available in 'multiSelectField'",
    },
    {
      gqlFilterInput: { multiSelectField: { eq: 2 } },
      gqlErrorMessage: 'cannot represent non-string value: 2.',
      restFilterInput: 'multiSelectField[eq]:2',
      restErrorMessage: "enum value '2' not available in 'multiSelectField' ",
    },
    // TODO - ensure it should throw
    // {
    //   gqlFilterInput: { multiSelectField: { eq: null } },
    //   gqlErrorMessage: 'cannot represent non-string value: null.',
    // },
  ],
  [FieldMetadataType.RAW_JSON]: [
    {
      gqlFilterInput: { rawJsonField: { like: {} } },
      gqlErrorMessage: 'cannot represent a non string value',
      // TODO - fix this ?  for rest
      // restFilterInput: 'rawJsonField[like]:"{}"',
      // restErrorMessage: 'cannot represent a non string value',
    },
    {
      gqlFilterInput: { rawJsonField: { like: [] } },
      gqlErrorMessage: 'cannot represent a non string value',
      // TODO - fix this ?  for rest
      // restFilterInput: 'rawJsonField[like]:"[]"',
      // restErrorMessage: 'cannot represent a non string value',
    },
    {
      gqlFilterInput: { rawJsonField: { like: true } },
      gqlErrorMessage: 'cannot represent a non string value',
      // TODO - fix this ?  for rest
      // restFilterInput: 'rawJsonField[like]:"true"',
      // restErrorMessage: 'cannot represent a non string value',
    },
    {
      gqlFilterInput: { rawJsonField: { like: 2 } },
      gqlErrorMessage: 'cannot represent a non string value',
      // TODO - fix this ?  for rest
      // restFilterInput: 'rawJsonField[like]:2',
      // restErrorMessage: 'cannot represent a non string value',
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
      // TODO - fix this ? containsIlike not existing for rest
      // restFilterInput: 'arrayField[containsIlike]:"{}"',
      // restErrorMessage: '',
    },
    {
      gqlFilterInput: { arrayField: { containsIlike: [] } },
      gqlErrorMessage: 'cannot represent a non string value',
      // TODO - fix this ? containsIlike not existing for rest
      // restFilterInput: 'arrayField[containsIlike]:"[]"',
      // restErrorMessage: '',
    },
    {
      gqlFilterInput: { arrayField: { containsIlike: true } },
      gqlErrorMessage: 'cannot represent a non string value',
      // TODO - fix this ? containsIlike not existing for rest
      // restFilterInput: 'arrayField[containsIlike]:"true"',
      // restErrorMessage: '',
    },
    {
      gqlFilterInput: { arrayField: { containsIlike: 2 } },
      gqlErrorMessage: 'cannot represent a non string value',
      // TODO - fix this ? containsIlike not existing for rest
      // restFilterInput: 'arrayField[containsIlike]:2',
      // restErrorMessage: '',
    },
    // TODO - ensure it should throw
    // {
    //   gqlFilterInput: { arrayField: { containsIlike: null } },
    //   gqlErrorMessage: 'cannot represent a non string value',
    // },
  ],
};
