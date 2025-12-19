import { type FieldMetadataTypesToTestForCreateInputValidation } from 'test/integration/graphql/suites/inputs-validation/types/field-metadata-type-to-test';
import {
  joinColumnNameForManyToOneMorphRelationField1,
  TEST_TARGET_OBJECT_RECORD_ID_FIELD_VALUE,
} from 'test/integration/graphql/suites/inputs-validation/utils/setup-test-objects-with-all-field-types.util';
import { FieldMetadataType } from 'twenty-shared/types';

export const successfulCreateInputByFieldMetadataType: {
  [K in Exclude<
    FieldMetadataTypesToTestForCreateInputValidation,
    FieldMetadataType.RICH_TEXT
  >]: {
    input: any;
    validateInput: (record: Record<string, any>) => boolean;
  }[];
} = {
  [FieldMetadataType.TEXT]: [
    {
      input: {
        textField: 'test',
      },
      validateInput: (record: Record<string, any>) => {
        return record.textField === 'test';
      },
    },
    {
      input: {
        textField: '',
      },
      validateInput: (record: Record<string, any>) => {
        return record.textField === '';
      },
    },
  ],
  [FieldMetadataType.NUMBER]: [
    {
      input: {
        numberField: 1,
      },
      validateInput: (record: Record<string, any>) => {
        return record.numberField === 1;
      },
    },
    {
      input: {
        numberField: null,
      },
      validateInput: (record: Record<string, any>) => {
        return record.numberField === null;
      },
    },
    {
      input: {
        numberField: 0,
      },
      validateInput: (record: Record<string, any>) => {
        return record.numberField === 0;
      },
    },
    {
      input: {
        numberField: -1.1,
      },
      validateInput: (record: Record<string, any>) => {
        return record.numberField === -1.1;
      },
    },
  ],
  [FieldMetadataType.UUID]: [
    {
      input: {
        uuidField: '00000000-0000-4000-8000-000000000000',
      },
      validateInput: (record: Record<string, any>) => {
        return record.uuidField === '00000000-0000-4000-8000-000000000000';
      },
    },
    {
      input: {
        uuidField: null,
      },
      validateInput: (record: Record<string, any>) => {
        return record.uuidField === null;
      },
    },
  ],
  [FieldMetadataType.SELECT]: [
    {
      input: {
        selectField: 'OPTION_1',
      },
      validateInput: (record: Record<string, any>) => {
        return record.selectField === 'OPTION_1';
      },
    },
    {
      input: {
        selectField: null,
      },
      validateInput: (record: Record<string, any>) => {
        return record.selectField === null;
      },
    },
  ],
  [FieldMetadataType.RELATION]: [
    {
      input: {
        manyToOneRelationFieldId: TEST_TARGET_OBJECT_RECORD_ID_FIELD_VALUE,
      },
      validateInput: (record: Record<string, any>) => {
        return (
          record.manyToOneRelationFieldId ===
          TEST_TARGET_OBJECT_RECORD_ID_FIELD_VALUE
        );
      },
    },
    {
      input: {
        manyToOneRelationFieldId: null,
      },
      validateInput: (record: Record<string, any>) => {
        return record.manyToOneRelationFieldId === null;
      },
    },
  ],
  [FieldMetadataType.MORPH_RELATION]: [
    {
      input: {
        [joinColumnNameForManyToOneMorphRelationField1]:
          TEST_TARGET_OBJECT_RECORD_ID_FIELD_VALUE,
      },
      validateInput: (record: Record<string, any>) => {
        return (
          record[joinColumnNameForManyToOneMorphRelationField1] ===
          TEST_TARGET_OBJECT_RECORD_ID_FIELD_VALUE
        );
      },
    },
    {
      input: {
        [joinColumnNameForManyToOneMorphRelationField1]: null,
      },
      validateInput: (record: Record<string, any>) => {
        return record[joinColumnNameForManyToOneMorphRelationField1] === null;
      },
    },
  ],
  [FieldMetadataType.RAW_JSON]: [
    {
      input: {
        rawJsonField: { key: 'value' },
      },
      validateInput: (record: Record<string, any>) => {
        return record.rawJsonField.key === 'value';
      },
    },
    {
      input: {
        rawJsonField: {},
      },
      validateInput: (record: Record<string, any>) => {
        return record.rawJsonField === null;
      },
    },
    {
      input: {
        rawJsonField: null,
      },
      validateInput: (record: Record<string, any>) => {
        return record.rawJsonField === null;
      },
    },
    {
      input: {
        rawJsonField: '{"key": "value"}',
      },
      validateInput: (record: Record<string, any>) => {
        return record.rawJsonField.key === 'value';
      },
    },
  ],
  [FieldMetadataType.ARRAY]: [
    {
      input: {
        arrayField: ['item1', 'item2'],
      },
      validateInput: (record: Record<string, any>) => {
        return (
          record.arrayField.length === 2 &&
          record.arrayField.includes('item1') &&
          record.arrayField.includes('item2')
        );
      },
    },
    {
      input: {
        arrayField: 'item1',
      },
      validateInput: (record: Record<string, any>) => {
        return (
          record.arrayField.length === 1 && record.arrayField.includes('item1')
        );
      },
    },
    {
      input: {
        arrayField: [],
      },
      validateInput: (record: Record<string, any>) => {
        return (
          Array.isArray(record.arrayField) && record.arrayField.length === 0
        );
      },
    },
    {
      input: {
        arrayField: null,
      },
      validateInput: (record: Record<string, any>) => {
        return (
          Array.isArray(record.arrayField) && record.arrayField.length === 0
        );
      },
    },
  ],
  [FieldMetadataType.RATING]: [
    {
      input: {
        ratingField: 'RATING_2',
      },
      validateInput: (record: Record<string, any>) => {
        return record.ratingField === 'RATING_2';
      },
    },
    {
      input: {
        ratingField: null,
      },
      validateInput: (record: Record<string, any>) => {
        return record.ratingField === null;
      },
    },
  ],
  [FieldMetadataType.MULTI_SELECT]: [
    {
      input: {
        multiSelectField: ['OPTION_1'],
      },
      validateInput: (record: Record<string, any>) => {
        return (
          record.multiSelectField.includes('OPTION_1') &&
          record.multiSelectField.length === 1
        );
      },
    },
    {
      input: {
        multiSelectField: [],
      },
      validateInput: (record: Record<string, any>) => {
        return (
          Array.isArray(record.multiSelectField) &&
          record.multiSelectField.length === 0
        );
      },
    },
    {
      input: {
        multiSelectField: null,
      },
      validateInput: (record: Record<string, any>) => {
        return (
          Array.isArray(record.multiSelectField) &&
          record.multiSelectField.length === 0
        );
      },
    },
  ],
  [FieldMetadataType.DATE]: [
    {
      input: {
        dateField: '2025-01-13',
      },
      validateInput: (record: Record<string, any>) => {
        return new Date(record.dateField).toDateString() === 'Mon Jan 13 2025';
      },
    },
    {
      input: {
        dateField: null,
      },
      validateInput: (record: Record<string, any>) => {
        return record.dateField === null;
      },
    },
  ],
  [FieldMetadataType.DATE_TIME]: [
    {
      input: {
        dateTimeField: '2025-01-13 00:00:00',
      },
      validateInput: (record: Record<string, any>) => {
        const date = new Date(record.dateTimeField);

        return (
          date.toDateString() === 'Mon Jan 13 2025' &&
          date.getMinutes() === 0 &&
          date.getSeconds() === 0
        );
      },
    },
    {
      input: {
        dateTimeField: null,
      },
      validateInput: (record: Record<string, any>) => {
        return record.dateTimeField === null;
      },
    },
  ],
  [FieldMetadataType.BOOLEAN]: [
    {
      input: {
        booleanField: null,
      },
      validateInput: (record: Record<string, any>) => {
        return record.booleanField === null;
      },
    },
    {
      input: {
        booleanField: false,
      },
      validateInput: (record: Record<string, any>) => {
        return record.booleanField === false;
      },
    },
    {
      input: {
        booleanField: true,
      },
      validateInput: (record: Record<string, any>) => {
        return record.booleanField === true;
      },
    },
  ],
  [FieldMetadataType.ADDRESS]: [
    {
      input: {
        addressField: {
          addressPostcode: 'address postcode',
          addressStreet1: 'address street 1',
          addressStreet2: 'address street 2',
          addressCity: 'address city',
          addressState: 'address state',
          addressCountry: 'address country',
        },
      },
      validateInput: (record: Record<string, any>) => {
        return (
          record.addressField.addressPostcode === 'address postcode' &&
          record.addressField.addressStreet1 === 'address street 1' &&
          record.addressField.addressStreet2 === 'address street 2' &&
          record.addressField.addressCity === 'address city' &&
          record.addressField.addressState === 'address state' &&
          record.addressField.addressCountry === 'address country'
        );
      },
    },
  ],
  [FieldMetadataType.CURRENCY]: [
    {
      input: {
        currencyField: { amountMicros: 1000000, currencyCode: 'USD' },
      },
      validateInput: (record: Record<string, any>) => {
        return (
          Number(record.currencyField.amountMicros) === 1000000 &&
          record.currencyField.currencyCode === 'USD'
        );
      },
    },
  ],
  [FieldMetadataType.EMAILS]: [
    {
      input: {
        emailsField: {
          primaryEmail: 'test@test.com',
          additionalEmails: ['test2@test.com'],
        },
      },
      validateInput: (record: Record<string, any>) => {
        return (
          record.emailsField.primaryEmail === 'test@test.com' &&
          record.emailsField.additionalEmails.length === 1 &&
          record.emailsField.additionalEmails[0] === 'test2@test.com'
        );
      },
    },
  ],
  [FieldMetadataType.PHONES]: [
    {
      input: {
        phonesField: {
          primaryPhoneNumber: '1234567890',
          primaryPhoneCountryCode: 'FR',
          primaryPhoneCallingCode: '+33',
          additionalPhones: [
            { number: '1234567890', callingCode: '+33', countryCode: 'FR' },
          ],
        },
      },
      validateInput: (record: Record<string, any>) => {
        return (
          record.phonesField.primaryPhoneNumber === '1234567890' &&
          record.phonesField.primaryPhoneCountryCode === 'FR' &&
          record.phonesField.primaryPhoneCallingCode === '+33' &&
          record.phonesField.additionalPhones.length === 1 &&
          record.phonesField.additionalPhones[0].number === '1234567890' &&
          record.phonesField.additionalPhones[0].callingCode === '+33' &&
          record.phonesField.additionalPhones[0].countryCode === 'FR'
        );
      },
    },
  ],
  [FieldMetadataType.FULL_NAME]: [
    {
      input: {
        fullNameField: {
          firstName: 'John',
          lastName: 'Doe',
        },
      },
      validateInput: (record: Record<string, any>) => {
        return (
          record.fullNameField.firstName === 'John' &&
          record.fullNameField.lastName === 'Doe'
        );
      },
    },
  ],
  [FieldMetadataType.LINKS]: [
    {
      input: {
        linksField: {
          primaryLinkUrl: 'https://twenty.com',
          primaryLinkLabel: '#1 Open source CRM',
          secondaryLinks: [{ url: 'twenty.com', label: '#1 Open source CRM' }],
        },
      },
      validateInput: (record: Record<string, any>) => {
        return (
          record.linksField.primaryLinkUrl === 'https://twenty.com' &&
          record.linksField.primaryLinkLabel === '#1 Open source CRM' &&
          record.linksField.secondaryLinks.length === 1 &&
          record.linksField.secondaryLinks[0].url === 'twenty.com' &&
          record.linksField.secondaryLinks[0].label === '#1 Open source CRM'
        );
      },
    },
  ],
  [FieldMetadataType.RICH_TEXT_V2]: [
    {
      input: {
        richTextV2Field: {
          blocknote: 'test',
          markdown: 'test',
        },
      },
      validateInput: (record: Record<string, any>) => {
        return (
          record.richTextV2Field.blocknote === 'test' &&
          record.richTextV2Field.markdown === 'test'
        );
      },
    },
  ],
  [FieldMetadataType.POSITION]: [
    {
      input: {
        position: 1000,
      },
      validateInput: (record: Record<string, any>) => {
        return record.position === 1000;
      },
    },
    {
      input: {
        position: 'last',
      },
      validateInput: (record: Record<string, any>) => {
        return record.position > 1000;
      },
    },
    {
      input: {
        position: 'first',
      },
      validateInput: (record: Record<string, any>) => {
        return record.position < 1000;
      },
    },
    {
      input: {
        position: undefined,
      },
      validateInput: (record: Record<string, any>) => {
        return typeof record.position === 'number';
      },
    },
  ],
};
