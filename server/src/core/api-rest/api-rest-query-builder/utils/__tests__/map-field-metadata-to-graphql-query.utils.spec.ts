import { mapFieldMetadataToGraphqlQuery } from 'src/core/api-rest/api-rest-query-builder/utils/map-field-metadata-to-graphql-query.utils';
import {
  fieldCurrency,
  fieldLink,
  fieldNumber,
  fieldString,
  objectMetadataItem,
} from 'src/core/api-rest/api-rest-query-builder/utils/__tests__/utils';

describe('mapFieldMetadataToGraphqlQuery', () => {
  it('should map properly', () => {
    expect(
      mapFieldMetadataToGraphqlQuery(objectMetadataItem, fieldNumber),
    ).toEqual('fieldNumber');
    expect(
      mapFieldMetadataToGraphqlQuery(objectMetadataItem, fieldString),
    ).toEqual('fieldString');
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
