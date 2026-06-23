import { getIndexUniversalIdentifier } from '@/application/deterministic-identifier/get-index-universal-identifier.util';

const APP = '11111111-1111-4111-8111-111111111111';
const OBJECT = '22222222-2222-4222-8222-222222222222';

describe('getIndexUniversalIdentifier', () => {
  it('derives a deterministic id from the generated index name within its object', () => {
    expect(
      getIndexUniversalIdentifier({
        ownerApplicationUniversalIdentifier: APP,
        objectUniversalIdentifier: OBJECT,
        name: 'IDX_abc',
      }),
    ).toBe('f3668ea9-452b-514f-905f-07375db25906');
  });
});
