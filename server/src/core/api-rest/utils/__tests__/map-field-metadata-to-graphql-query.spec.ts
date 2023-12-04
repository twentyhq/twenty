import { mapFieldMetadataToGraphqlQuery } from 'src/core/api-rest/utils/map-field-metadata-to-graphql-query.utils';

describe('mapFieldMetadataToGraphqlQuery', () => {
  const fieldNumber = {
    name: 'fieldNumber',
    type: 'NUMBER',
    targetColumnMap: { value: 'fieldNumber' },
  };
  const fieldString = {
    name: 'fieldString',
    type: 'TEXT',
    targetColumnMap: { value: 'fieldString' },
  };
  const fieldLink = {
    name: 'fieldLink',
    type: 'LINK',
    targetColumnMap: { label: 'fieldLinkLabel', url: 'fieldLinkUrl' },
  };
  const fieldCurrency = {
    name: 'fieldCurrency',
    type: 'CURRENCY',
    targetColumnMap: {
      amountMicros: 'fieldCurrencyAmountMicros',
      currencyCode: 'fieldCurrencyCurrencyCode',
    },
  };
  const objectMetadataItem = {
    fields: [fieldNumber, fieldString, fieldLink],
  };
  it('should map properly', () => {
    expect(
      mapFieldMetadataToGraphqlQuery(objectMetadataItem, fieldNumber),
    ).toEqual('fieldNumber');
    expect(mapFieldMetadataToGraphqlQuery(objectMetadataItem, fieldLink))
      .toEqual(`
      fieldLink
      {
        label
        url
      }
    `);
    expect(mapFieldMetadataToGraphqlQuery(objectMetadataItem, fieldCurrency))
      .toEqual(`
      fieldCurrency
      {
        amountMicros
        currencyCode
      }
    `);
  });
});
