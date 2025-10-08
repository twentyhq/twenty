import { FieldMetadataType, type PartialFieldMetadataItem } from '@/types';
import { turnAnyFieldFilterIntoRecordGqlFilter } from '@/utils/filter/turnAnyFieldFilterIntoRecordGqlFilter';
import { filterSelectOptionsOfFieldMetadataItem } from '@/utils/filter/utils/filterSelectOptionsOfFieldMetadataItem';

const baseFieldMetadataItem: PartialFieldMetadataItem = {
  id: 'base-field-metadata-item-id',
  label: 'Test',
  name: 'test',
  type: FieldMetadataType.TEXT,
};

const textFieldMetadataItem: PartialFieldMetadataItem = {
  ...baseFieldMetadataItem,
  id: 'text-field-id',
  name: 'textField',
};

const addressFieldMetadataItem: PartialFieldMetadataItem = {
  ...baseFieldMetadataItem,
  id: 'address-field-id',
  type: FieldMetadataType.ADDRESS,
  name: 'addressField',
};

const linksFieldMetadataItem: PartialFieldMetadataItem = {
  ...baseFieldMetadataItem,
  id: 'links-field-id',
  type: FieldMetadataType.LINKS,
  name: 'linksField',
};

const fullNameFieldMetadataItem: PartialFieldMetadataItem = {
  ...baseFieldMetadataItem,
  id: 'full-name-field-id',
  type: FieldMetadataType.FULL_NAME,
  name: 'fullNameField',
};

const arrayFieldMetadataItem: PartialFieldMetadataItem = {
  ...baseFieldMetadataItem,
  id: 'array-field-id',
  type: FieldMetadataType.ARRAY,
  name: 'arrayField',
};

const emailsFieldMetadataItem: PartialFieldMetadataItem = {
  ...baseFieldMetadataItem,
  id: 'emails-field-id',
  type: FieldMetadataType.EMAILS,
  name: 'emailsField',
};

const phonesFieldMetadataItem: PartialFieldMetadataItem = {
  ...baseFieldMetadataItem,
  id: 'phones-field-id',
  type: FieldMetadataType.PHONES,
  name: 'phonesField',
};

const numberFieldMetadataItem: PartialFieldMetadataItem = {
  ...baseFieldMetadataItem,
  id: 'number-field-id',
  type: FieldMetadataType.NUMBER,
  name: 'numberField',
};

const currencyFieldMetadataItem: PartialFieldMetadataItem = {
  ...baseFieldMetadataItem,
  id: 'currency-field-id',
  type: FieldMetadataType.CURRENCY,
  name: 'currencyField',
};

const selectFieldMetadataItem: PartialFieldMetadataItem = {
  ...baseFieldMetadataItem,
  id: 'select-field-id',
  type: FieldMetadataType.SELECT,
  name: 'selectField',
  options: [
    {
      id: '1',
      label: 'blue',
      position: 1,
      value: 'BLUE',
    },
    {
      id: '2',
      label: 'red',
      position: 2,
      value: 'RED',
    },
  ],
};

const multiSelectFieldMetadataItem: PartialFieldMetadataItem = {
  ...baseFieldMetadataItem,
  id: 'multi-select-field-id',
  type: FieldMetadataType.MULTI_SELECT,
  name: 'multiSelect',
  options: [
    {
      id: '1',
      label: 'blue',
      position: 1,
      value: 'BLUE',
    },
    {
      id: '2',
      label: 'red',
      position: 2,
      value: 'RED',
    },
  ],
};

const mockObjectMetadataItem = {
  id: 'mock-object-metadata-item',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  indexMetadatas: [],
  isActive: true,
  isCustom: true,
  isLabelSyncedWithName: true,
  isRemote: false,
  isSearchable: true,
  isSystem: false,
  isUIReadOnly: false,
  labelIdentifierFieldMetadataId: 'mock-id',
  labelPlural: 'Tests',
  labelSingular: 'Test',
  nameSingular: 'test',
  namePlural: 'tests',
  fields: [],
  readableFields: [],
  updatableFields: [],
};

const mockObjectMetadataItemWithAllFields = {
  ...mockObjectMetadataItem,
  fields: [
    textFieldMetadataItem,
    addressFieldMetadataItem,
    linksFieldMetadataItem,
    fullNameFieldMetadataItem,
    arrayFieldMetadataItem,
    emailsFieldMetadataItem,
    phonesFieldMetadataItem,
    numberFieldMetadataItem,
    currencyFieldMetadataItem,
    selectFieldMetadataItem,
    multiSelectFieldMetadataItem,
  ],
};

describe('turnAnyFieldFilterIntoRecordGqlFilter', () => {
  describe('TEXT field type', () => {
    it('should generate correct filter for text field', () => {
      const filterValue = 'test';

      const result = turnAnyFieldFilterIntoRecordGqlFilter({
        filterValue,
        fields: [textFieldMetadataItem],
      });

      expect(result.recordGqlOperationFilter.or).toContainEqual({
        [textFieldMetadataItem.name]: {
          ilike: `%${filterValue}%`,
        },
      });
    });
  });

  describe('ADDRESS field type', () => {
    it('should generate correct filter for address field', () => {
      const filterValue = 'New York';

      const result = turnAnyFieldFilterIntoRecordGqlFilter({
        filterValue,
        fields: [addressFieldMetadataItem],
      });

      expect(result.recordGqlOperationFilter.or).toContainEqual({
        or: [
          {
            [addressFieldMetadataItem.name]: {
              addressStreet1: {
                ilike: `%${filterValue}%`,
              },
            },
          },
          {
            [addressFieldMetadataItem.name]: {
              addressStreet2: {
                ilike: `%${filterValue}%`,
              },
            },
          },
          {
            [addressFieldMetadataItem.name]: {
              addressCity: {
                ilike: `%${filterValue}%`,
              },
            },
          },
          {
            [addressFieldMetadataItem.name]: {
              addressState: {
                ilike: `%${filterValue}%`,
              },
            },
          },
          {
            [addressFieldMetadataItem.name]: {
              addressCountry: {
                ilike: `%${filterValue}%`,
              },
            },
          },
          {
            [addressFieldMetadataItem.name]: {
              addressPostcode: {
                ilike: `%${filterValue}%`,
              },
            },
          },
        ],
      });
    });
  });

  describe('LINKS field type', () => {
    it('should generate correct filter for links field', () => {
      const filterValue = 'test';

      const result = turnAnyFieldFilterIntoRecordGqlFilter({
        filterValue,
        fields: [linksFieldMetadataItem],
      });

      expect(result.recordGqlOperationFilter.or).toContainEqual({
        or: [
          {
            [linksFieldMetadataItem.name]: {
              primaryLinkUrl: {
                ilike: `%${filterValue}%`,
              },
            },
          },
          {
            [linksFieldMetadataItem.name]: {
              primaryLinkLabel: {
                ilike: `%${filterValue}%`,
              },
            },
          },
          {
            [linksFieldMetadataItem.name]: {
              secondaryLinks: {
                like: `%${filterValue}%`,
              },
            },
          },
        ],
      });
    });
  });

  describe('FULL_NAME field type', () => {
    it('should generate correct filter for full name field', () => {
      const filterValue = 'test';

      const result = turnAnyFieldFilterIntoRecordGqlFilter({
        filterValue,
        fields: [fullNameFieldMetadataItem],
      });

      expect(result.recordGqlOperationFilter.or).toContainEqual({
        or: [
          {
            [fullNameFieldMetadataItem.name]: {
              firstName: {
                ilike: `%${filterValue}%`,
              },
            },
          },
          {
            [fullNameFieldMetadataItem.name]: {
              lastName: {
                ilike: `%${filterValue}%`,
              },
            },
          },
        ],
      });
    });
  });

  describe('ARRAY field type', () => {
    it('should generate correct filter for array field', () => {
      const filterValue = 'test';

      const result = turnAnyFieldFilterIntoRecordGqlFilter({
        filterValue,
        fields: [arrayFieldMetadataItem],
      });

      expect(result.recordGqlOperationFilter.or).toContainEqual({
        [arrayFieldMetadataItem.name]: {
          containsIlike: `%${filterValue}%`,
        },
      });
    });
  });

  describe('EMAILS field type', () => {
    it('should generate correct filter for emails field', () => {
      const filterValue = 'test';

      const result = turnAnyFieldFilterIntoRecordGqlFilter({
        filterValue,
        fields: [emailsFieldMetadataItem],
      });

      expect(result.recordGqlOperationFilter.or).toContainEqual({
        or: [
          {
            [emailsFieldMetadataItem.name]: {
              primaryEmail: {
                ilike: `%${filterValue}%`,
              },
            },
          },
          {
            [emailsFieldMetadataItem.name]: {
              additionalEmails: {
                like: `%${filterValue}%`,
              },
            },
          },
        ],
      });
    });
  });

  describe('PHONES field type', () => {
    it('should generate correct filter for phones field', () => {
      const filterValue = '123';

      const result = turnAnyFieldFilterIntoRecordGqlFilter({
        filterValue,
        fields: [phonesFieldMetadataItem],
      });

      expect(result.recordGqlOperationFilter.or).toContainEqual({
        or: [
          {
            [phonesFieldMetadataItem.name]: {
              primaryPhoneNumber: {
                ilike: `%${filterValue}%`,
              },
            },
          },
          {
            [phonesFieldMetadataItem.name]: {
              primaryPhoneCallingCode: {
                ilike: `%${filterValue}%`,
              },
            },
          },
          {
            [phonesFieldMetadataItem.name]: {
              additionalPhones: {
                like: `%${filterValue}%`,
              },
            },
          },
        ],
      });
    });
  });

  describe('NUMBER field type', () => {
    it('should generate correct filter for number field with numeric value', () => {
      const filterValue = '123.1';

      const result = turnAnyFieldFilterIntoRecordGqlFilter({
        filterValue,
        fields: [numberFieldMetadataItem],
      });

      expect(result.recordGqlOperationFilter.or).toContainEqual({
        [numberFieldMetadataItem.name]: {
          eq: 123.1,
        },
      });
    });

    it('should not generate filter for number field with non-numeric value', () => {
      const filterValue = 'not a number';

      const result = turnAnyFieldFilterIntoRecordGqlFilter({
        filterValue,
        fields: [numberFieldMetadataItem],
      });

      expect(result.recordGqlOperationFilter).toEqual({});
    });
  });

  describe('CURRENCY field type', () => {
    it('should generate correct filter for currency field with numeric value', () => {
      const filterValue = '123';

      const result = turnAnyFieldFilterIntoRecordGqlFilter({
        filterValue,
        fields: [currencyFieldMetadataItem],
      });

      expect(result.recordGqlOperationFilter.or).toContainEqual({
        [currencyFieldMetadataItem.name]: {
          amountMicros: {
            eq: 123000000,
          },
        },
      });
    });

    it('should generate correct filter for currency field with currency code', () => {
      const filterValue = 'USD';

      const result = turnAnyFieldFilterIntoRecordGqlFilter({
        filterValue,
        fields: [currencyFieldMetadataItem],
      });

      expect(
        (result.recordGqlOperationFilter.or as any)?.[0][
          currencyFieldMetadataItem.name
        ].currencyCode.in.includes(filterValue),
      ).toBe(true);
    });
  });

  describe('SELECT field type', () => {
    it('should generate correct filter for select field with matching option', () => {
      const filterValue = 'r';

      const result = turnAnyFieldFilterIntoRecordGqlFilter({
        filterValue,
        fields: [selectFieldMetadataItem],
      });

      const { foundCorrespondingSelectOptions: expectedOptions } =
        filterSelectOptionsOfFieldMetadataItem({
          fieldMetadataItem: selectFieldMetadataItem,
          filterValue,
        });

      expect(result.recordGqlOperationFilter.or).toContainEqual({
        [selectFieldMetadataItem.name]: {
          in: expectedOptions?.map((option) => option.value),
        },
      });
    });

    it('should not generate filter for select field with non-matching value', () => {
      const filterValue = 'not-found';

      const result = turnAnyFieldFilterIntoRecordGqlFilter({
        filterValue,
        fields: [selectFieldMetadataItem],
      });

      expect(result.recordGqlOperationFilter).toEqual({});
    });
  });

  describe('MULTI_SELECT field type', () => {
    it('should generate correct filter for multi-select field with matching option', () => {
      const filterValue = 'r';

      const result = turnAnyFieldFilterIntoRecordGqlFilter({
        filterValue,
        fields: [multiSelectFieldMetadataItem],
      });

      const { foundCorrespondingSelectOptions: expectedOptions } =
        filterSelectOptionsOfFieldMetadataItem({
          fieldMetadataItem: multiSelectFieldMetadataItem,
          filterValue,
        });

      expect(result.recordGqlOperationFilter.or).toContainEqual({
        [multiSelectFieldMetadataItem.name]: {
          containsAny: expectedOptions?.map((option) => option.value),
        },
      });
    });

    it('should not generate filter for multi-select field with non-matching value', () => {
      const filterValue = 'not-found';

      const result = turnAnyFieldFilterIntoRecordGqlFilter({
        filterValue,
        fields: [multiSelectFieldMetadataItem],
      });

      expect(result.recordGqlOperationFilter).toEqual({});
    });
  });

  describe('combined field filters', () => {
    it('should generate OR filter combining all matching field types', () => {
      const filterValue = 'a';

      const result = turnAnyFieldFilterIntoRecordGqlFilter({
        filterValue,
        fields: mockObjectMetadataItemWithAllFields.fields,
      });

      expect(result.recordGqlOperationFilter).toHaveProperty('or');
      expect(Array.isArray(result.recordGqlOperationFilter.or)).toBe(true);
      expect(
        (result.recordGqlOperationFilter.or as any[])?.length,
      ).toBeGreaterThan(0);
    });

    it('should handle empty filter value', () => {
      const filterValue = '';

      const result = turnAnyFieldFilterIntoRecordGqlFilter({
        filterValue,
        fields: mockObjectMetadataItemWithAllFields.fields,
      });

      expect(result.recordGqlOperationFilter).toEqual({});
    });

    it('should handle object with no fields', () => {
      const emptyObjectMetadata = {
        ...mockObjectMetadataItem,
        fields: [],
      };

      const result = turnAnyFieldFilterIntoRecordGqlFilter({
        filterValue: 'test',
        fields: emptyObjectMetadata.fields,
      });

      expect(result.recordGqlOperationFilter).toEqual({});
    });
  });
});
