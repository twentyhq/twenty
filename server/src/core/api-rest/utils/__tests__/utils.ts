export const fieldNumber = {
  name: 'fieldNumber',
  type: 'NUMBER',
  targetColumnMap: { value: 'fieldNumber' },
};

export const fieldString = {
  name: 'fieldString',
  type: 'TEXT',
  targetColumnMap: { value: 'fieldString' },
};

export const fieldLink = {
  name: 'fieldLink',
  type: 'LINK',
  targetColumnMap: { label: 'fieldLinkLabel', url: 'fieldLinkUrl' },
};

export const fieldCurrency = {
  name: 'fieldCurrency',
  type: 'CURRENCY',
  targetColumnMap: {
    amountMicros: 'fieldCurrencyAmountMicros',
    currencyCode: 'fieldCurrencyCurrencyCode',
  },
};

export const objectMetadataItem = {
  targetTableName: 'testingObject',
  fields: [fieldNumber, fieldString, fieldLink, fieldCurrency],
};
