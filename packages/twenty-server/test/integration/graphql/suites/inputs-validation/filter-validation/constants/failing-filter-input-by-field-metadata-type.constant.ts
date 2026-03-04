import { type FieldMetadataTypesToTestForFilterInputValidation } from 'test/integration/graphql/suites/inputs-validation/types/field-metadata-type-to-test';
import { joinColumnNameForManyToOneMorphRelationField1 } from 'test/integration/graphql/suites/inputs-validation/utils/setup-test-objects-with-all-field-types.util';
import { FieldMetadataType } from 'twenty-shared/types';

import { type CompositeFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/types/composite-field-metadata-type.type';

export const failingFilterInputByFieldMetadataType: {
  [K in Exclude<
    FieldMetadataTypesToTestForFilterInputValidation,
    CompositeFieldMetadataType
  >]: {
    gqlFilterInput: any;
    restFilterInput: string;
  }[];
} = {
  [FieldMetadataType.RELATION]: [
    {
      gqlFilterInput: {
        manyToOneRelationField: {
          eq: '6dd71a46-68fe-4420-82b3-0d5b00ad2642',
        },
      },
      restFilterInput:
        'manyToOneRelationField[eq]:"6dd71a46-68fe-4420-82b3-0d5b00ad2642"',
    },
    {
      gqlFilterInput: {
        manyToOneRelationFieldId: {
          eq: 'invalid-uuid',
        },
      },
      restFilterInput: 'manyToOneRelationFieldId[eq]:"invalid-uuid"',
    },
    {
      gqlFilterInput: {
        oneToManyRelationField: {
          eq: '6dd71a46-68fe-4420-82b3-0d5b00ad2642',
        },
      },
      restFilterInput:
        'oneToManyRelationFieldId[eq]:"6dd71a46-68fe-4420-82b3-0d5b00ad2642"',
    },
    {
      gqlFilterInput: {
        oneToManyRelationFieldId: {
          eq: 'invalid-uuid',
        },
      },
      restFilterInput: 'oneToManyRelationFieldId[eq]:"invalid-uuid"',
    },
  ],
  [FieldMetadataType.MORPH_RELATION]: [
    {
      gqlFilterInput: {
        [joinColumnNameForManyToOneMorphRelationField1]: { eq: 'invalid-uuid' },
      },
      restFilterInput: `${joinColumnNameForManyToOneMorphRelationField1}[eq]:"invalid-uuid"`,
    },
    {
      gqlFilterInput: {
        [joinColumnNameForManyToOneMorphRelationField1.replace('Id', '')]: {
          eq: '6dd71a46-68fe-4420-82b3-0d5b00ad2642',
        },
      },
      restFilterInput: `${[joinColumnNameForManyToOneMorphRelationField1.replace('Id', '')]}[eq]:"6dd71a46-68fe-4420-82b3-0d5b00ad2642"`,
    },
  ],
  [FieldMetadataType.UUID]: [
    {
      gqlFilterInput: { uuidField: { eq: 'invalid-uuid' } },
      restFilterInput: 'uuidField[eq]:"invalid-uuid"',
    },
    {
      gqlFilterInput: { uuidField: { eq: 2 } },
      restFilterInput: 'uuidField[eq]:2',
    },
    {
      gqlFilterInput: { uuidField: { eq: {} } },
      restFilterInput: 'uuidField[eq]:"{}"',
    },
    {
      gqlFilterInput: { uuidField: { eq: [] } },
      restFilterInput: 'uuidField[eq]:"[]"',
    },
    {
      gqlFilterInput: { uuidField: { eq: true } },
      restFilterInput: 'uuidField[eq]:"true"',
    },
    {
      gqlFilterInput: { uuidField: { eq: '2025-01-01' } },
      restFilterInput: 'uuidField[eq]:"2025-01-01"',
    },
  ],
  [FieldMetadataType.TEXT]: [
    {
      gqlFilterInput: { textField: { regex: '^test$' } },
      restFilterInput: 'textField[regex]:"^test$"',
    },
    {
      gqlFilterInput: { textField: { iregex: '^test$' } },
      restFilterInput: 'textField[iregex]:"^test$"',
    },
  ],
  [FieldMetadataType.DATE_TIME]: [
    {
      gqlFilterInput: { dateTimeField: { eq: 'not-a-date-time' } },
      restFilterInput: 'dateTimeField[eq]:"not-a-date-time"',
    },
    {
      gqlFilterInput: { dateTimeField: { eq: {} } },
      restFilterInput: 'dateTimeField[eq]:"{}"',
    },
    {
      gqlFilterInput: { dateTimeField: { eq: [] } },
      restFilterInput: 'dateTimeField[eq]:"[]"',
    },
    {
      gqlFilterInput: { dateTimeField: { eq: true } },
      restFilterInput: 'dateTimeField[eq]:"true"',
    },
  ],
  [FieldMetadataType.DATE]: [
    {
      gqlFilterInput: { dateField: { eq: 'not-a-date' } },
      restFilterInput: 'dateField[eq]:"not-a-date"',
    },
    {
      gqlFilterInput: { dateField: { eq: {} } },
      restFilterInput: 'dateField[eq]:"{}"',
    },
    {
      gqlFilterInput: { dateField: { eq: [] } },
      restFilterInput: 'dateField[eq]:"[]"',
    },
  ],
  [FieldMetadataType.BOOLEAN]: [
    {
      gqlFilterInput: { booleanField: { eq: 'not-a-boolean' } },
      restFilterInput: 'booleanField[eq]:"not-a-boolean"',
    },
    {
      gqlFilterInput: { booleanField: { eq: [] } },
      restFilterInput: 'booleanField[eq]:"[]"',
    },
    {
      gqlFilterInput: { booleanField: { eq: 2 } },
      restFilterInput: 'booleanField[eq]:2',
    },
  ],
  [FieldMetadataType.NUMBER]: [
    {
      gqlFilterInput: { numberField: { eq: 'not-a-number' } },
      restFilterInput: 'numberField[eq]:"not-a-number"',
    },
    {
      gqlFilterInput: { numberField: { eq: {} } },
      restFilterInput: 'numberField[eq]:"{}"',
    },
    {
      gqlFilterInput: { numberField: { eq: [] } },
      restFilterInput: 'numberField[eq]:"[]"',
    },
    {
      gqlFilterInput: { numberField: { eq: true } },
      restFilterInput: 'numberField[eq]:"true"',
    },
  ],
  [FieldMetadataType.RATING]: [
    {
      gqlFilterInput: { ratingField: { eq: 'not-a-rating' } },
      restFilterInput: 'ratingField[eq]:"not-a-rating"',
    },
    {
      gqlFilterInput: { ratingField: { eq: {} } },
      restFilterInput: 'ratingField[eq]:"{}"',
    },
    {
      gqlFilterInput: { ratingField: { eq: [] } },
      restFilterInput: 'ratingField[eq]:"[]"',
    },
    {
      gqlFilterInput: { ratingField: { eq: true } },
      restFilterInput: 'ratingField[eq]:"true"',
    },
    {
      gqlFilterInput: { ratingField: { eq: 2 } },
      restFilterInput: 'ratingField[eq]:2',
    },
  ],
  [FieldMetadataType.SELECT]: [
    {
      gqlFilterInput: { selectField: { eq: 'not-a-select' } },
      restFilterInput: 'selectField[eq]:"not-a-select"',
    },
    {
      gqlFilterInput: { selectField: { eq: {} } },
      restFilterInput: 'selectField[eq]:"{}"',
    },
    {
      gqlFilterInput: { selectField: { eq: [] } },
      restFilterInput: 'selectField[eq]:"[]"',
    },
    {
      gqlFilterInput: { selectField: { eq: true } },
      restFilterInput: 'selectField[eq]:"true"',
    },
  ],
  [FieldMetadataType.MULTI_SELECT]: [
    {
      gqlFilterInput: { multiSelectField: { eq: 'not-a-multi-select' } },
      restFilterInput: 'multiSelectField[eq]:"not-a-multi-select"',
    },
    {
      gqlFilterInput: { multiSelectField: { neq: 'test' } },
      restFilterInput: 'multiSelectField[neq]:"test"',
    },
    {
      gqlFilterInput: { multiSelectField: { in: ['test'] } },
      restFilterInput: 'multiSelectField[in]:["test"]',
    },
  ],
  [FieldMetadataType.RAW_JSON]: [
    {
      gqlFilterInput: { rawJsonField: { like: {} } },
      restFilterInput: '',
    },
    {
      gqlFilterInput: { rawJsonField: { like: [] } },
      restFilterInput: '',
    },
    {
      gqlFilterInput: { rawJsonField: { like: true } },
      restFilterInput: '',
    },
    {
      gqlFilterInput: { rawJsonField: { like: 2 } },
      restFilterInput: '',
    },
  ],
  [FieldMetadataType.ARRAY]: [
    {
      gqlFilterInput: { arrayField: { containsIlike: {} } },
      restFilterInput: 'arrayField[containsAny]:"{}"',
    },
    {
      gqlFilterInput: { arrayField: { containsIlike: [] } },
      restFilterInput: 'arrayField[containsAny]:"[]"',
    },
    {
      gqlFilterInput: { arrayField: { containsIlike: true } },
      restFilterInput: 'arrayField[containsAny]:"true"',
    },
    {
      gqlFilterInput: { arrayField: { containsIlike: 2 } },
      restFilterInput: 'arrayField[containsAny]:2',
    },
  ],
  [FieldMetadataType.FILES]: [
    {
      gqlFilterInput: { filesField: { containsIlike: {} } },
      restFilterInput: 'filesField[containsAny]:"{}"',
    },
    {
      gqlFilterInput: { filesField: { containsIlike: [] } },
      restFilterInput: 'filesField[containsAny]:"[]"',
    },
    {
      gqlFilterInput: { filesField: { containsIlike: true } },
      restFilterInput: 'filesField[containsAny]:"true"',
    },
    {
      gqlFilterInput: { filesField: { containsIlike: 2 } },
      restFilterInput: 'filesField[containsAny]:2',
    },
  ],
};
