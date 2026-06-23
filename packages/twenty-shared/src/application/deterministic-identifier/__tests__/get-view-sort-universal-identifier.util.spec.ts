import { getViewSortUniversalIdentifier } from '@/application/deterministic-identifier/get-view-sort-universal-identifier.util';

const APP = '11111111-1111-4111-8111-111111111111';
const VIEW = '44444444-4444-4444-8444-444444444444';
const FIELD = '33333333-3333-4333-8333-333333333333';

describe('getViewSortUniversalIdentifier', () => {
  it('derives a deterministic id from the field it sorts within its view', () => {
    expect(
      getViewSortUniversalIdentifier({
        ownerApplicationUniversalIdentifier: APP,
        viewUniversalIdentifier: VIEW,
        fieldMetadataUniversalIdentifier: FIELD,
      }),
    ).toBe('e6e591ad-8a29-553b-9a6b-eaaa74667661');
  });
});
