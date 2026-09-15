import { getSearchFieldUniversalIdentifier } from '@/application/deterministic-identifier/get-search-field-universal-identifier.util';

const APP = '11111111-1111-4111-8111-111111111111';
const FIELD = '33333333-3333-4333-8333-333333333333';

describe('getSearchFieldUniversalIdentifier', () => {
  it('derives a deterministic id from the field it makes searchable', () => {
    expect(
      getSearchFieldUniversalIdentifier({
        applicationUniversalIdentifier: APP,
        fieldMetadataUniversalIdentifier: FIELD,
      }),
    ).toBe('db4e5b93-15b6-5c83-a0b3-6c031e0ca072');
  });
});
