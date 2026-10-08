import { getIndexFieldUniversalIdentifier } from '@/application/deterministic-identifier/get-index-field-universal-identifier.util';

const APP = '11111111-1111-4111-8111-111111111111';
const INDEX = '33333333-3333-4333-8333-333333333333';
const FIELD = '55555555-5555-4555-8555-555555555555';

describe('getIndexFieldUniversalIdentifier', () => {
  it('derives a deterministic id from the field and sub-field within its index', () => {
    expect(
      getIndexFieldUniversalIdentifier({
        applicationUniversalIdentifier: APP,
        indexUniversalIdentifier: INDEX,
        fieldUniversalIdentifier: FIELD,
        subFieldName: 'addressCity',
      }),
    ).toBe('221a0c4c-6e1a-5f2f-9f78-6fda4027e1f4');
  });

  it('treats a missing sub-field like an empty one', () => {
    expect(
      getIndexFieldUniversalIdentifier({
        applicationUniversalIdentifier: APP,
        indexUniversalIdentifier: INDEX,
        fieldUniversalIdentifier: FIELD,
        subFieldName: null,
      }),
    ).toBe(
      getIndexFieldUniversalIdentifier({
        applicationUniversalIdentifier: APP,
        indexUniversalIdentifier: INDEX,
        fieldUniversalIdentifier: FIELD,
      }),
    );
  });
});
