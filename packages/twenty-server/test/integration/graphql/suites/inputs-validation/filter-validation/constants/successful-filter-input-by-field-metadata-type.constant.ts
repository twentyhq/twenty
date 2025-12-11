import { type FieldMetadataTypesToTestForFilterInputValidation } from 'test/integration/graphql/suites/inputs-validation/types/field-metadata-type-to-test';
import {
  joinColumnNameForManyToOneMorphRelationField1,
  TEST_TARGET_OBJECT_RECORD_ID,
  TEST_UUID_FIELD_VALUE,
} from 'test/integration/graphql/suites/inputs-validation/utils/setup-test-objects-with-all-field-types.util';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

export const successfulFilterInputByFieldMetadataType: {
  [K in FieldMetadataTypesToTestForFilterInputValidation]: {
    gqlFilterInput: any;
    restFilterInput: string;
    validateFilter: (record: Record<string, any>) => boolean;
  }[];
} = {
  [FieldMetadataType.RELATION]: [
    {
      gqlFilterInput: {
        manyToOneRelationFieldId: {
          neq: '00000000-0000-4000-8000-000000000000',
        },
      },
      restFilterInput: `manyToOneRelationFieldId[neq]:"00000000-0000-4000-8000-000000000000"`,
      validateFilter: (record: Record<string, any>) => {
        return (
          record.manyToOneRelationFieldId !==
          '00000000-0000-4000-8000-000000000000'
        );
      },
    },
    {
      gqlFilterInput: {
        manyToOneRelationFieldId: {
          eq: TEST_TARGET_OBJECT_RECORD_ID,
        },
      },
      restFilterInput: `manyToOneRelationFieldId[eq]:"${TEST_TARGET_OBJECT_RECORD_ID}"`,
      validateFilter: (record: Record<string, any>) => {
        return record.manyToOneRelationFieldId === TEST_TARGET_OBJECT_RECORD_ID;
      },
    },
    // TODO - fix this, should be returning or not be allowed
    // {
    //   gqlFilterInput: {
    //     manyToOneRelationFieldId: {
    //       eq: null,
    //     },
    //   },
    //   restFilterInput: 'manyToOneRelationFieldId[eq]=null',
    //   validateFilter: (record: Record<string, any>) => {
    //     return record.manyToOneRelationField === null;
    //   },
    // },
    {
      gqlFilterInput: {
        manyToOneRelationFieldId: {
          gt: '00000000-0000-4000-8000-000000000000',
        },
      },
      restFilterInput:
        'manyToOneRelationFieldId[gt]:"00000000-0000-4000-8000-000000000000"',
      validateFilter: (record: Record<string, any>) => {
        return (
          record.manyToOneRelationFieldId >
          '00000000-0000-4000-8000-000000000000'
        );
      },
    },
    {
      gqlFilterInput: {
        manyToOneRelationFieldId: {
          gte: '00000000-0000-4000-8000-000000000000',
        },
      },
      restFilterInput: `manyToOneRelationFieldId[gte]:"00000000-0000-4000-8000-000000000000"`,
      validateFilter: (record: Record<string, any>) => {
        return (
          record.manyToOneRelationFieldId >=
          '00000000-0000-4000-8000-000000000000'
        );
      },
    },
    {
      gqlFilterInput: {
        manyToOneRelationFieldId: {
          lt: 'ffffffff-ffff-4fff-bfff-ffffffffffff',
        },
      },
      restFilterInput: `manyToOneRelationFieldId[lt]:"ffffffff-ffff-4fff-bfff-ffffffffffff"`,
      validateFilter: (record: Record<string, any>) => {
        return (
          record.manyToOneRelationFieldId <
          'ffffffff-ffff-4fff-bfff-ffffffffffff'
        );
      },
    },
    {
      gqlFilterInput: {
        manyToOneRelationFieldId: {
          lte: 'ffffffff-ffff-4fff-bfff-ffffffffffff',
        },
      },
      restFilterInput: `manyToOneRelationFieldId[lte]:"ffffffff-ffff-4fff-bfff-ffffffffffff"`,
      validateFilter: (record: Record<string, any>) => {
        return (
          record.manyToOneRelationFieldId <=
          'ffffffff-ffff-4fff-bfff-ffffffffffff'
        );
      },
    },
    {
      gqlFilterInput: {
        manyToOneRelationFieldId: {
          in: [TEST_TARGET_OBJECT_RECORD_ID],
        },
      },
      restFilterInput: `manyToOneRelationFieldId[in]:["${TEST_TARGET_OBJECT_RECORD_ID}"]`,
      validateFilter: (record: Record<string, any>) => {
        return record.manyToOneRelationFieldId === TEST_TARGET_OBJECT_RECORD_ID;
      },
    },
    {
      gqlFilterInput: {
        manyToOneRelationFieldId: { is: 'NULL' },
      },
      restFilterInput: 'manyToOneRelationFieldId[is]:NULL',
      validateFilter: (record: Record<string, any>) => {
        return record.manyToOneRelationFieldId === null;
      },
    },
    {
      gqlFilterInput: {
        manyToOneRelationFieldId: { is: 'NOT_NULL' },
      },
      restFilterInput: 'manyToOneRelationFieldId[is]:"NOT_NULL"',
      validateFilter: (record: Record<string, any>) => {
        return isDefined(record.manyToOneRelationFieldId);
      },
    },
  ],
  [FieldMetadataType.MORPH_RELATION]: [
    {
      gqlFilterInput: {
        [joinColumnNameForManyToOneMorphRelationField1]: {
          neq: '00000000-0000-4000-8000-000000000000',
        },
      },
      restFilterInput: `${joinColumnNameForManyToOneMorphRelationField1}[neq]:"00000000-0000-4000-8000-000000000000"`,
      validateFilter: (record: Record<string, any>) => {
        return (
          record[joinColumnNameForManyToOneMorphRelationField1] !==
          '00000000-0000-4000-8000-000000000000'
        );
      },
    },
    {
      gqlFilterInput: {
        [joinColumnNameForManyToOneMorphRelationField1]: {
          eq: TEST_TARGET_OBJECT_RECORD_ID,
        },
      },
      restFilterInput: `${joinColumnNameForManyToOneMorphRelationField1}[eq]:"${TEST_TARGET_OBJECT_RECORD_ID}"`,
      validateFilter: (record: Record<string, any>) => {
        return (
          record[joinColumnNameForManyToOneMorphRelationField1] ===
          TEST_TARGET_OBJECT_RECORD_ID
        );
      },
    },
    {
      gqlFilterInput: {
        [joinColumnNameForManyToOneMorphRelationField1]: {
          gt: '00000000-0000-4000-8000-000000000000',
        },
      },
      restFilterInput: `${joinColumnNameForManyToOneMorphRelationField1}[gt]:"00000000-0000-4000-8000-000000000000"`,
      validateFilter: (record: Record<string, any>) => {
        // Morph relation join column is a UUID stored as string
        return (
          record[joinColumnNameForManyToOneMorphRelationField1] >
          '00000000-0000-4000-8000-000000000000'
        );
      },
    },
    {
      gqlFilterInput: {
        [joinColumnNameForManyToOneMorphRelationField1]: {
          gte: '00000000-0000-4000-8000-000000000000',
        },
      },
      restFilterInput: `${joinColumnNameForManyToOneMorphRelationField1}[gte]:"00000000-0000-4000-8000-000000000000"`,
      validateFilter: (record: Record<string, any>) => {
        return (
          record[joinColumnNameForManyToOneMorphRelationField1] >=
          '00000000-0000-4000-8000-000000000000'
        );
      },
    },
    {
      gqlFilterInput: {
        [joinColumnNameForManyToOneMorphRelationField1]: {
          lt: 'ffffffff-ffff-4fff-bfff-ffffffffffff',
        },
      },
      restFilterInput: `${joinColumnNameForManyToOneMorphRelationField1}[lt]:"ffffffff-ffff-4fff-bfff-ffffffffffff"`,
      validateFilter: (record: Record<string, any>) => {
        return (
          record[joinColumnNameForManyToOneMorphRelationField1] <
          'ffffffff-ffff-4fff-bfff-ffffffffffff'
        );
      },
    },
    {
      gqlFilterInput: {
        [joinColumnNameForManyToOneMorphRelationField1]: {
          lte: 'ffffffff-ffff-4fff-bfff-ffffffffffff',
        },
      },
      restFilterInput: `${joinColumnNameForManyToOneMorphRelationField1}[lte]:"ffffffff-ffff-4fff-bfff-ffffffffffff"`,
      validateFilter: (record: Record<string, any>) => {
        return (
          record[joinColumnNameForManyToOneMorphRelationField1] <=
          'ffffffff-ffff-4fff-bfff-ffffffffffff'
        );
      },
    },
    {
      gqlFilterInput: {
        [joinColumnNameForManyToOneMorphRelationField1]: {
          in: [TEST_TARGET_OBJECT_RECORD_ID],
        },
      },
      restFilterInput: `${joinColumnNameForManyToOneMorphRelationField1}[in]:["${TEST_TARGET_OBJECT_RECORD_ID}"]`,
      validateFilter: (record: Record<string, any>) => {
        return (
          record[joinColumnNameForManyToOneMorphRelationField1] ===
          TEST_TARGET_OBJECT_RECORD_ID
        );
      },
    },
    {
      gqlFilterInput: {
        [joinColumnNameForManyToOneMorphRelationField1]: { is: 'NULL' },
      },
      restFilterInput: `${joinColumnNameForManyToOneMorphRelationField1}[is]:NULL`,
      validateFilter: (record: Record<string, any>) => {
        return record[joinColumnNameForManyToOneMorphRelationField1] === null;
      },
    },
    {
      gqlFilterInput: {
        [joinColumnNameForManyToOneMorphRelationField1]: { is: 'NOT_NULL' },
      },
      restFilterInput: `${joinColumnNameForManyToOneMorphRelationField1}[is]:"NOT_NULL"`,
      validateFilter: (record: Record<string, any>) => {
        return isDefined(record[joinColumnNameForManyToOneMorphRelationField1]);
      },
    },
  ],
  [FieldMetadataType.UUID]: [
    {
      gqlFilterInput: {
        uuidField: { neq: '00000000-0000-4000-8000-000000000000' },
      },
      restFilterInput: `uuidField[neq]:"00000000-0000-4000-8000-000000000000"`,
      validateFilter: (record: Record<string, any>) => {
        return record.uuidField !== '00000000-0000-4000-8000-000000000000';
      },
    },
    {
      gqlFilterInput: {
        uuidField: { eq: TEST_UUID_FIELD_VALUE },
      },
      restFilterInput: `uuidField[eq]:"${TEST_UUID_FIELD_VALUE}"`,
      validateFilter: (record: Record<string, any>) => {
        return record.uuidField === TEST_UUID_FIELD_VALUE;
      },
    },
    // TODO - fix this, should be returning or not be allowed
    // {
    //   gqlFilterInput: { uuidField: { eq: null } },
    //   restFilterInput: 'uuidField[eq]=null',
    //   validateFilter: (record: Record<string, any>) => {
    //     return record.uuidField === null;
    //   },
    // },
    {
      gqlFilterInput: {
        uuidField: { gt: '00000000-0000-4000-8000-000000000000' },
      },
      restFilterInput: `uuidField[gt]:"00000000-0000-4000-8000-000000000000"`,
      validateFilter: (record: Record<string, any>) => {
        return record.uuidField > '00000000-0000-4000-8000-000000000000';
      },
    },
    {
      gqlFilterInput: {
        uuidField: { gte: '00000000-0000-4000-8000-000000000000' },
      },
      restFilterInput: `uuidField[gte]:"00000000-0000-4000-8000-000000000000"`,
      validateFilter: (record: Record<string, any>) => {
        return record.uuidField >= '00000000-0000-4000-8000-000000000000';
      },
    },
    {
      gqlFilterInput: {
        uuidField: { lt: 'ffffffff-ffff-4fff-bfff-ffffffffffff' },
      },
      restFilterInput: `uuidField[lt]:"ffffffff-ffff-4fff-bfff-ffffffffffff"`,
      validateFilter: (record: Record<string, any>) => {
        return record.uuidField < 'ffffffff-ffff-4fff-bfff-ffffffffffff';
      },
    },
    {
      gqlFilterInput: {
        uuidField: { lte: 'ffffffff-ffff-4fff-bfff-ffffffffffff' },
      },
      restFilterInput: `uuidField[lte]:"ffffffff-ffff-4fff-bfff-ffffffffffff"`,
      validateFilter: (record: Record<string, any>) => {
        return record.uuidField <= 'ffffffff-ffff-4fff-bfff-ffffffffffff';
      },
    },
    {
      gqlFilterInput: {
        uuidField: { in: [TEST_UUID_FIELD_VALUE] },
      },
      restFilterInput: `uuidField[in]:["${TEST_UUID_FIELD_VALUE}"]`,
      validateFilter: (record: Record<string, any>) => {
        return record.uuidField === TEST_UUID_FIELD_VALUE;
      },
    },
    {
      gqlFilterInput: { uuidField: { is: 'NULL' } },
      restFilterInput: 'uuidField[is]:NULL',
      validateFilter: (record: Record<string, any>) => {
        return record.uuidField === null;
      },
    },
    {
      gqlFilterInput: { uuidField: { is: 'NOT_NULL' } },
      restFilterInput: 'uuidField[is]:"NOT_NULL"',
      validateFilter: (record: Record<string, any>) => {
        return isDefined(record.uuidField);
      },
    },
  ],
  [FieldMetadataType.TEXT]: [
    {
      gqlFilterInput: { textField: { neq: 'neqtest' } },
      restFilterInput: 'textField[neq]:"neqtest"',
      validateFilter: (record: Record<string, any>) => {
        return record.textField !== 'neqtest';
      },
    },
    {
      gqlFilterInput: { textField: { eq: 'test' } },
      restFilterInput: 'textField[eq]:"test"',
      validateFilter: (record: Record<string, any>) => {
        return record.textField === 'test';
      },
    },
    // TODO - fix this ? not working
    // {
    //   gqlFilterInput: { textField: { eq: null } },
    //   restFilterInput: 'textField[eq]:"null"',
    //   validateFilter: (record: Record<string, any>) => {
    //     return record.textField === '';
    //   },
    // },
    {
      gqlFilterInput: { textField: { gt: 'tess' } },
      restFilterInput: 'textField[gt]:"tess"',
      validateFilter: (record: Record<string, any>) => {
        return record.textField > 'tess';
      },
    },
    {
      gqlFilterInput: { textField: { gte: 'tess' } },
      restFilterInput: 'textField[gte]:"tess"',
      validateFilter: (record: Record<string, any>) => {
        return record.textField >= 'tess';
      },
    },
    {
      gqlFilterInput: { textField: { lt: 'tesu' } },
      restFilterInput: 'textField[lt]:"tesu"',
      validateFilter: (record: Record<string, any>) => {
        return record.textField < 'tesu';
      },
    },
    {
      gqlFilterInput: { textField: { lte: 'tesu' } },
      restFilterInput: 'textField[lte]:"tesu"',
      validateFilter: (record: Record<string, any>) => {
        return record.textField <= 'tesu';
      },
    },
    {
      gqlFilterInput: { textField: { in: ['test'] } },
      restFilterInput: 'textField[in]:["test"]',
      validateFilter: (record: Record<string, any>) => {
        return record.textField === 'test';
      },
    },
    // TODO - fix this ? not working
    // {
    //   gqlFilterInput: { textField: { is: 'NULL' } },
    //   restFilterInput: 'textField[is]:"NULL"',
    //   validateFilter: (record: Record<string, any>) => {
    //     return record.textField === '';
    //   },
    // },
    {
      gqlFilterInput: { textField: { is: 'NOT_NULL' } },
      restFilterInput: 'textField[is]:"NOT_NULL"',
      validateFilter: (record: Record<string, any>) => {
        return isDefined(record.textField);
      },
    },
    // TODO - fix this ? not working
    // {
    //   gqlFilterInput: { textField: { startsWith: 'tes' } },
    //   restFilterInput: 'textField[startsWith]:"tes"',
    //   validateFilter: (record: Record<string, any>) => {
    //     return record.textField.startsWith('tes');
    //   },
    // },
    {
      gqlFilterInput: { textField: { like: '%es%' } },
      restFilterInput: 'textField[like]:"%es%"',
      validateFilter: (record: Record<string, any>) => {
        return record.textField.includes('es');
      },
    },
    {
      gqlFilterInput: { textField: { ilike: '%ES%' } },
      restFilterInput: 'textField[ilike]:"%ES%"',
      validateFilter: (record: Record<string, any>) => {
        return record.textField.toLowerCase().includes('es');
      },
    },
    //TODO - regex, iregex not working ? to remove from gql schema ?
    // {
    //   gqlFilterInput: { textField: { regex: '^test$' } },
    //   restFilterInput: 'textField[regex]:"^test$"',
    //   validateFilter: (record: Record<string, any>) => {
    //     return record.textField.includes('test');
    //   },
    // },
    // {
    //   gqlFilterInput: { textField: { iregex: '^test$' } },
    //   restFilterInput: 'textField[iregex]:"^test$"',
    //   validateFilter: (record: Record<string, any>) => {
    //     return record.textField.toLowerCase().includes('test');
    //   },
    // },
  ],
  [FieldMetadataType.PHONES]: [
    {
      gqlFilterInput: {
        phonesField: { primaryPhoneNumber: { eq: '1234567890' } },
      },
      restFilterInput: 'phonesField.primaryPhoneNumber[eq]:"1234567890"',
      validateFilter: (record: Record<string, any>) => {
        return record.phonesField.primaryPhoneNumber === '1234567890';
      },
    },
    {
      gqlFilterInput: {
        phonesField: { primaryPhoneCallingCode: { is: 'NOT_NULL' } },
      },
      restFilterInput: 'phonesField.primaryPhoneCallingCode[is]:"NOT_NULL"',
      validateFilter: (record: Record<string, any>) => {
        return record.phonesField.primaryPhoneCallingCode !== null;
      },
    },
    {
      gqlFilterInput: {
        phonesField: {
          additionalPhones: {
            is: 'NOT_NULL',
          },
        },
      },
      restFilterInput: 'phonesField.additionalPhones[is]:"NOT_NULL"',
      validateFilter: (record: Record<string, any>) => {
        return record.phonesField.additionalPhones !== null;
      },
    },
    {
      gqlFilterInput: {
        phonesField: { primaryPhoneCountryCode: { like: 'FR' } },
      },
      restFilterInput: 'phonesField.primaryPhoneCountryCode[like]:"FR"',
      validateFilter: (record: Record<string, any>) => {
        return record.phonesField.primaryPhoneCountryCode.includes('FR');
      },
    },
    // TODO - should be allowed ? two conditions simultaneously
    // {
    //   gqlFilterInput: {
    //     phonesField: {
    //       primaryPhoneCountryCode: { is: 'NULL' },
    //       primaryPhoneCallingCode: { is: 'NULL' },
    //     },
    //   },
    //   restFilterInput:
    //     'phonesField[primaryPhoneCountryCode][is]=NULL&phonesField[primaryPhoneCallingCode][is]=NULL',
    // },
  ],
  [FieldMetadataType.EMAILS]: [
    {
      gqlFilterInput: {
        emailsField: { primaryEmail: { eq: 'test@test.com' } },
      },
      restFilterInput: 'emailsField.primaryEmail[eq]:"test@test.com"',
      validateFilter: (record: Record<string, any>) => {
        return record.emailsField.primaryEmail === 'test@test.com';
      },
    },
    {
      gqlFilterInput: {
        emailsField: { additionalEmails: { is: 'NOT_NULL' } },
      },
      restFilterInput: 'emailsField.additionalEmails[is]:"NOT_NULL"',
      validateFilter: (record: Record<string, any>) => {
        return record.emailsField.additionalEmails !== null;
      },
    },
  ],
  [FieldMetadataType.DATE_TIME]: [
    // TODO - fix this ? not working
    // {
    //   gqlFilterInput: { dateTimeField: { eq: '2025-01-01T00:00:00Z' } },
    //   restFilterInput: 'dateTimeField[eq]=2025-01-01T00:00:00Z',
    //   validateFilter: (record: Record<string, any>) => {
    //     return record.dateTimeField === '2025-01-01T00:00:00Z';
    //   },
    // },
    {
      gqlFilterInput: { dateTimeField: { gt: '2005-01-01T00:00:00Z' } },
      restFilterInput: 'dateTimeField[gt]:"2005-01-01T00:00:00Z"',
      validateFilter: (record: Record<string, any>) => {
        return record.dateTimeField > '2005-01-01T00:00:00Z';
      },
    },
    {
      gqlFilterInput: { dateTimeField: { gte: '2005-01-01T00:00:00Z' } },
      restFilterInput: 'dateTimeField[gte]:"2005-01-01T00:00:00Z"',
      validateFilter: (record: Record<string, any>) => {
        return record.dateTimeField >= '2005-01-01T00:00:00Z';
      },
    },
    // TODO - fix this ? not working
    // {
    //   gqlFilterInput: { dateTimeField: { in: ['2025-01-01T00:00:00Z'] } },
    //   restFilterInput: 'dateTimeField[in]=2025-01-01T00:00:00Z',
    //   validateFilter: (record: Record<string, any>) => {
    //     return record.dateTimeField === '2025-01-01T00:00:00Z';
    //   },
    // },
    {
      gqlFilterInput: { dateTimeField: { lt: '2125-01-01T00:00:00Z' } },
      restFilterInput: 'dateTimeField[lt]:"2125-01-01T00:00:00Z"',
      validateFilter: (record: Record<string, any>) => {
        return record.dateTimeField < '2125-01-01T00:00:00Z';
      },
    },
    {
      gqlFilterInput: { dateTimeField: { lte: '2125-01-01T00:00:00Z' } },
      restFilterInput: 'dateTimeField[lte]:"2125-01-01T00:00:00Z"',
      validateFilter: (record: Record<string, any>) => {
        return record.dateTimeField <= '2125-01-01T00:00:00Z';
      },
    },
    {
      gqlFilterInput: { dateTimeField: { neq: '2005-01-01T00:00:00Z' } },
      restFilterInput: 'dateTimeField[neq]:"2005-01-01T00:00:00Z"',
      validateFilter: (record: Record<string, any>) => {
        return record.dateTimeField !== '2005-01-01T00:00:00Z';
      },
    },
    {
      gqlFilterInput: { dateTimeField: { is: 'NOT_NULL' } },
      restFilterInput: 'dateTimeField[is]:"NOT_NULL"',
      validateFilter: (record: Record<string, any>) => {
        return isDefined(record.dateTimeField);
      },
    },
    // {
    //   gqlFilterInput: { dateTimeField: { is: 'NULL' } },
    //   // TODO - fix this ? not working
    //   // restFilterInput: 'dateTimeField[is]:"NULL"',
    //   validateFilter: (record: Record<string, any>) => {
    //     return record.dateTimeField === null;
    //   },
    // },
    // TODO - fix this, should be returning or not be allowed
    // {
    //   gqlFilterInput: { dateTimeField: { eq: null } },
    //   restFilterInput: 'dateTimeField[eq]=null',
    //   validateFilter: (record: Record<string, any>) => {
    //     return record.dateTimeField === null;
    //   },
    // },
    // TODO - why float are allowed ?
    // {
    //   gqlFilterInput: { dateTimeField: { eq: 2 } },
    //   restFilterInput: 'dateTimeField[eq]=2',
    //   validateFilter: (record: Record<string, any>) => {
    //     return record.dateTimeField === 2;
    //   },
    // },
  ],
  [FieldMetadataType.DATE]: [
    // TODO - fix this ? not working
    // {
    //   gqlFilterInput: { dateField: { eq: '2025-01-01' } },
    //   restFilterInput: 'dateField[eq]=2025-01-01',
    //   validateFilter: (record: Record<string, any>) => {
    //     return record.dateField === '2025-01-01';
    //   },
    // },
    {
      gqlFilterInput: { dateField: { neq: '2005-01-01' } },
      restFilterInput: 'dateField[neq]:"2005-01-01"',
      validateFilter: (record: Record<string, any>) => {
        return record.dateField !== '2005-01-01';
      },
    },
    {
      gqlFilterInput: { dateField: { gt: '2005-01-01' } },
      restFilterInput: 'dateField[gt]:"2005-01-01"',
      validateFilter: (record: Record<string, any>) => {
        return record.dateField > '2005-01-01';
      },
    },
    {
      gqlFilterInput: { dateField: { gte: '2005-01-01' } },
      restFilterInput: 'dateField[gte]:"2005-01-01"',
      validateFilter: (record: Record<string, any>) => {
        return record.dateField >= '2005-01-01';
      },
    },
    // TODO - fix this ? not working
    // {
    //   gqlFilterInput: { dateField: { in: ['2025-01-01'] } },
    //   restFilterInput: 'dateField[in]=2025-01-01',
    //   validateFilter: (record: Record<string, any>) => {
    //     return record.dateField === '2025-01-01';
    //   },
    // },
    {
      gqlFilterInput: { dateField: { lt: '2125-01-01' } },
      restFilterInput: 'dateField[lt]:"2125-01-01"',
      validateFilter: (record: Record<string, any>) => {
        return record.dateField < '2125-01-01';
      },
    },
    {
      gqlFilterInput: { dateField: { lte: '2125-01-01' } },
      restFilterInput: 'dateField[lte]:"2125-01-01"',
      validateFilter: (record: Record<string, any>) => {
        return record.dateField <= '2125-01-01';
      },
    },
    {
      gqlFilterInput: { dateField: { is: 'NOT_NULL' } },
      restFilterInput: 'dateField[is]:"NOT_NULL"',
      validateFilter: (record: Record<string, any>) => {
        return isDefined(record.dateField);
      },
    },
    {
      gqlFilterInput: { dateField: { is: 'NULL' } },
      restFilterInput: 'dateField[is]:NULL',
      validateFilter: (record: Record<string, any>) => {
        return record.dateField === null;
      },
    },
    // TODO - fix this, should be returning or not be allowed
    // {
    //   gqlFilterInput: { dateField: { eq: null } },
    //   restFilterInput: 'dateField[eq]=null',
    //   validateFilter: (record: Record<string, any>) => {
    //     return record.dateField === null;
    //   },
    // },
    // TODO - why float are allowed ?
    // {
    //   gqlFilterInput: { dateField: { eq: 2 } },
    //   restFilterInput: 'dateField[eq]=2',
    //   validateFilter: (record: Record<string, any>) => {
    //     return record.dateField === 2;
    //   },
    // },
  ],
  [FieldMetadataType.BOOLEAN]: [
    // {
    //   gqlFilterInput: { booleanField: { eq: true } },
    //   // TODO - fix this ? not working
    //   // restFilterInput: 'booleanField[eq]:"true"',
    //   validateFilter: (record: Record<string, any>) => {
    //     return record.booleanField === true;
    //   },
    // },
    {
      gqlFilterInput: { booleanField: { is: 'NULL' } },
      restFilterInput: 'booleanField[is]:NULL',
      validateFilter: (record: Record<string, any>) => {
        return record.booleanField === null;
      },
    },
    {
      gqlFilterInput: { booleanField: { is: 'NOT_NULL' } },
      restFilterInput: 'booleanField[is]:"NOT_NULL"',
      validateFilter: (record: Record<string, any>) => {
        return isDefined(record.booleanField);
      },
    },
  ],
  [FieldMetadataType.NUMBER]: [
    {
      gqlFilterInput: { numberField: { eq: 1 } },
      restFilterInput: 'numberField[eq]:1',
      validateFilter: (record: Record<string, any>) => {
        return record.numberField === 1;
      },
    },
    {
      gqlFilterInput: { numberField: { gt: 0 } },
      restFilterInput: 'numberField[gt]:0',
      validateFilter: (record: Record<string, any>) => {
        return record.numberField > 0;
      },
    },
    {
      gqlFilterInput: { numberField: { gte: 0 } },
      restFilterInput: 'numberField[gte]:0',
      validateFilter: (record: Record<string, any>) => {
        return record.numberField >= 0;
      },
    },
    {
      gqlFilterInput: { numberField: { lt: 2 } },
      restFilterInput: 'numberField[lt]:2',
      validateFilter: (record: Record<string, any>) => {
        return record.numberField < 2;
      },
    },
    {
      gqlFilterInput: { numberField: { lte: 1 } },
      restFilterInput: 'numberField[lte]:1',
      validateFilter: (record: Record<string, any>) => {
        return record.numberField <= 1;
      },
    },
    {
      gqlFilterInput: { numberField: { neq: 2 } },
      restFilterInput: 'numberField[neq]:2',
      validateFilter: (record: Record<string, any>) => {
        return record.numberField !== 2;
      },
    },
    {
      gqlFilterInput: { numberField: { is: 'NULL' } },
      restFilterInput: 'numberField[is]:NULL',
      validateFilter: (record: Record<string, any>) => {
        return record.numberField === null;
      },
    },
    {
      gqlFilterInput: { numberField: { is: 'NOT_NULL' } },
      restFilterInput: 'numberField[is]:"NOT_NULL"',
      validateFilter: (record: Record<string, any>) => {
        return isDefined(record.numberField);
      },
    },
  ],
  [FieldMetadataType.LINKS]: [
    {
      gqlFilterInput: {
        linksField: { primaryLinkUrl: { eq: 'twenty.com' } },
      },
      restFilterInput: 'linksField.primaryLinkUrl[eq]:"twenty.com"',
      validateFilter: (record: Record<string, any>) => {
        return record.linksField.primaryLinkUrl === 'twenty.com';
      },
    },
    {
      gqlFilterInput: {
        linksField: {
          primaryLinkLabel: { eq: 'twenty - #1 Open source CRM' },
        },
      },
      restFilterInput:
        'linksField.primaryLinkLabel[eq]:"twenty - #1 Open source CRM"',
      validateFilter: (record: Record<string, any>) => {
        return (
          record.linksField.primaryLinkLabel === 'twenty - #1 Open source CRM'
        );
      },
    },
    {
      gqlFilterInput: { linksField: { secondaryLinks: { like: '%twenty%' } } },
      restFilterInput: 'linksField.secondaryLinks[like]:"%twenty%"',
      validateFilter: (record: Record<string, any>) => {
        return JSON.stringify(record.linksField.secondaryLinks).includes(
          'twenty',
        );
      },
    },
  ],
  [FieldMetadataType.CURRENCY]: [
    {
      gqlFilterInput: {
        currencyField: { amountMicros: { eq: 1000000 } },
      },
      restFilterInput: 'currencyField.amountMicros[eq]:1000000',
      validateFilter: (record: Record<string, any>) => {
        return Number(record.currencyField.amountMicros) === 1000000;
      },
    },
    {
      gqlFilterInput: { currencyField: { currencyCode: { eq: 'USD' } } },
      restFilterInput: 'currencyField.currencyCode[eq]:"USD"',
      validateFilter: (record: Record<string, any>) => {
        return record.currencyField.currencyCode === 'USD';
      },
    },
  ],
  [FieldMetadataType.FULL_NAME]: [
    {
      gqlFilterInput: { fullNameField: { firstName: { eq: 'John' } } },
      restFilterInput: 'fullNameField.firstName[eq]:"John"',
      validateFilter: (record: Record<string, any>) => {
        return record.fullNameField.firstName === 'John';
      },
    },
    {
      gqlFilterInput: { fullNameField: { lastName: { eq: 'Doe' } } },
      restFilterInput: 'fullNameField.lastName[eq]:"Doe"',
      validateFilter: (record: Record<string, any>) => {
        return record.fullNameField.lastName === 'Doe';
      },
    },
  ],
  [FieldMetadataType.RATING]: [
    {
      gqlFilterInput: { ratingField: { eq: 'RATING_5' } },
      restFilterInput: 'ratingField[eq]:"RATING_5"',
      validateFilter: (record: Record<string, any>) => {
        return record.ratingField === 'RATING_5';
      },
    },
    {
      gqlFilterInput: { ratingField: { neq: 'RATING_3' } },
      restFilterInput: 'ratingField[neq]:"RATING_3"',
      validateFilter: (record: Record<string, any>) => {
        return record.ratingField !== 'RATING_3';
      },
    },
    {
      gqlFilterInput: { ratingField: { is: 'NULL' } },
      restFilterInput: 'ratingField[is]:NULL',
      validateFilter: (record: Record<string, any>) => {
        return record.ratingField === null;
      },
    },
    {
      gqlFilterInput: { ratingField: { in: ['RATING_5', 'RATING_4'] } },
      restFilterInput: 'ratingField[in]:["RATING_5","RATING_4"]',
      validateFilter: (record: Record<string, any>) => {
        return ['RATING_5', 'RATING_4'].includes(record.ratingField);
      },
    },
    {
      gqlFilterInput: { ratingField: { is: 'NOT_NULL' } },
      restFilterInput: 'ratingField[is]:"NOT_NULL"',
      validateFilter: (record: Record<string, any>) => {
        return isDefined(record.ratingField);
      },
    },
    // TODO - fix this, should be ok
    // {
    //   gqlFilterInput: { ratingField: { isEmptyArray: true } },
    //   restFilterInput: 'ratingField[isEmptyArray]=true',
    // },
  ],
  [FieldMetadataType.SELECT]: [
    {
      gqlFilterInput: { selectField: { in: ['OPTION_1'] } },
      restFilterInput: 'selectField[in]:[OPTION_1]',
      validateFilter: (record: Record<string, any>) => {
        return ['OPTION_1'].includes(record.selectField);
      },
    },
    {
      gqlFilterInput: { selectField: { is: 'NULL' } },
      restFilterInput: 'selectField[is]:NULL',
      validateFilter: (record: Record<string, any>) => {
        return record.selectField === null;
      },
    },
    {
      gqlFilterInput: { selectField: { is: 'NOT_NULL' } },
      restFilterInput: 'selectField[is]:NOT_NULL',
      validateFilter: (record: Record<string, any>) => {
        return isDefined(record.selectField);
      },
    },
  ],
  [FieldMetadataType.MULTI_SELECT]: [
    {
      gqlFilterInput: { multiSelectField: { containsAny: ['OPTION_1'] } },
      restFilterInput: 'multiSelectField[containsAny]:[OPTION_1]',
      validateFilter: (record: Record<string, any>) => {
        return record.multiSelectField.includes('OPTION_1');
      },
    },
    {
      gqlFilterInput: { multiSelectField: { is: 'NULL' } },
      restFilterInput: 'multiSelectField[is]:NULL',
      validateFilter: (record: Record<string, any>) => {
        return (
          Array.isArray(record.multiSelectField) &&
          record.multiSelectField.length === 0
        );
      },
    },
    {
      gqlFilterInput: { multiSelectField: { is: 'NOT_NULL' } },
      restFilterInput: 'multiSelectField[is]:NOT_NULL',
      validateFilter: (record: Record<string, any>) => {
        return isDefined(record.multiSelectField);
      },
    },
    //TODO - null and empty array should be equivalent
    // {
    //   gqlFilterInput: { multiSelectField: { isEmptyArray: true } },
    //   restFilterInput: 'multiSelectField[isEmptyArray]=true',
    //   validateFilter: (record: Record<string, any>) => {
    //     return record.multiSelectField.length === 0;
    //   },
    // },
  ],
  [FieldMetadataType.ADDRESS]: [
    {
      gqlFilterInput: {
        addressField: { addressStreet1: { eq: 'address street 1' } },
      },
      restFilterInput: 'addressField.addressStreet1[eq]:"address street 1"',
      validateFilter: (record: Record<string, any>) => {
        return record.addressField.addressStreet1 === 'address street 1';
      },
    },
    {
      gqlFilterInput: {
        addressField: { addressStreet2: { eq: 'address street 2' } },
      },
      restFilterInput: 'addressField.addressStreet2[eq]:"address street 2"',
      validateFilter: (record: Record<string, any>) => {
        return record.addressField.addressStreet2 === 'address street 2';
      },
    },
    {
      gqlFilterInput: {
        addressField: { addressStreet2: { is: 'NOT_NULL' } },
      },
      restFilterInput: 'addressField.addressStreet2[is]:"NOT_NULL"',
      validateFilter: (record: Record<string, any>) => {
        return isDefined(record.addressField.addressStreet2);
      },
    },
    {
      gqlFilterInput: {
        addressField: { addressCity: { eq: 'address city' } },
      },
      restFilterInput: 'addressField.addressCity[eq]:"address city"',
      validateFilter: (record: Record<string, any>) => {
        return record.addressField.addressCity === 'address city';
      },
    },
    {
      gqlFilterInput: {
        addressField: { addressState: { eq: 'address state' } },
      },
      restFilterInput: 'addressField.addressState[eq]:"address state"',
      validateFilter: (record: Record<string, any>) => {
        return record.addressField.addressState === 'address state';
      },
    },
    {
      gqlFilterInput: {
        addressField: { addressCountry: { eq: 'address country' } },
      },
      restFilterInput: 'addressField.addressCountry[eq]:"address country"',
      validateFilter: (record: Record<string, any>) => {
        return record.addressField.addressCountry === 'address country';
      },
    },
    {
      gqlFilterInput: {
        addressField: { addressPostcode: { eq: 'address postcode' } },
      },
      restFilterInput: 'addressField.addressPostcode[eq]:"address postcode"',
      validateFilter: (record: Record<string, any>) => {
        return record.addressField.addressPostcode === 'address postcode';
      },
    },
  ],
  [FieldMetadataType.RAW_JSON]: [
    {
      gqlFilterInput: { rawJsonField: { is: 'NULL' } },
      restFilterInput: 'rawJsonField[is]:NULL',
      validateFilter: (record: Record<string, any>) => {
        return record.rawJsonField === null;
      },
    },
    {
      gqlFilterInput: { rawJsonField: { is: 'NOT_NULL' } },
      restFilterInput: 'rawJsonField[is]:"NOT_NULL"',
      validateFilter: (record: Record<string, any>) => {
        return isDefined(record.rawJsonField);
      },
    },
    {
      gqlFilterInput: { rawJsonField: { like: '%test%' } },
      restFilterInput: 'rawJsonField[like]:"%test%"',
      validateFilter: (record: Record<string, any>) => {
        return JSON.stringify(record.rawJsonField).includes('test');
      },
    },
  ],
  [FieldMetadataType.ARRAY]: [
    // {
    //   gqlFilterInput: { arrayField: { containsIlike: 'test' } },
    //   // TODO - fix this ? not existing for rest
    //   // restFilterInput: 'arrayField[containsIlike]:"test"',
    //   validateFilter: (record: Record<string, any>) => {
    //     return JSON.stringify(record.arrayField).includes('test');
    //   },
    // },
    {
      gqlFilterInput: { arrayField: { is: 'NULL' } },
      restFilterInput: 'arrayField[is]:NULL',
      validateFilter: (record: Record<string, any>) => {
        return (
          Array.isArray(record.arrayField) && record.arrayField.length === 0
        );
      },
    },
    //TODO - null and empty array should be equivalent
    // {
    //   gqlFilterInput: { arrayField: { isEmptyArray: true } },
    //   restFilterInput: 'arrayField[isEmptyArray]=true',
    //   validateFilter: (record: Record<string, any>) => {
    //     return record.arrayField.length === 0;
    //   },
    // },
  ],
};
