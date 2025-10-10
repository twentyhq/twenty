import { type FieldMetadataTypesToTestForCreateInputValidation } from 'test/integration/graphql/suites/inputs-validation/types/field-metadata-type-to-test';
import { TEST_TARGET_OBJECT_RECORD_ID_FIELD_VALUE } from 'test/integration/graphql/suites/inputs-validation/utils/setup-test-objects-with-all-field-types.util';
import { FieldMetadataType } from 'twenty-shared/types';

export const successfulCreateInputByFieldMetadataType: {
  [K in FieldMetadataTypesToTestForCreateInputValidation]: {
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
        return Object.keys(record.rawJsonField).length === 0;
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
        arrayField: [],
      },
      validateInput: (record: Record<string, any>) => {
        return record.arrayField.length === 0;
      },
    },
    {
      input: {
        arrayField: null,
      },
      validateInput: (record: Record<string, any>) => {
        return record.arrayField === null;
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
        return record.multiSelectField.length === 0;
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
          addressLat: 1,
          addressLng: 1,
        },
      },
      validateInput: (record: Record<string, any>) => {
        return (
          record.addressField.addressPostcode === 'address postcode' &&
          record.addressField.addressStreet1 === 'address street 1' &&
          record.addressField.addressStreet2 === 'address street 2' &&
          record.addressField.addressCity === 'address city' &&
          record.addressField.addressState === 'address state' &&
          record.addressField.addressCountry === 'address country' &&
          record.addressField.addressLat === 1 &&
          record.addressField.addressLng === 1
        );
      },
    },
  ],
};
