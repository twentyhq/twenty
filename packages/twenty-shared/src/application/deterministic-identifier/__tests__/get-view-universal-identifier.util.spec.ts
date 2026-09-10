import { getViewUniversalIdentifier } from '@/application/deterministic-identifier/get-view-universal-identifier.util';

const APP = '11111111-1111-4111-8111-111111111111';
const OBJECT = '22222222-2222-4222-8222-222222222222';

describe('getViewUniversalIdentifier', () => {
  it('derives a deterministic id from the view name within its object', () => {
    expect(
      getViewUniversalIdentifier({
        applicationUniversalIdentifier: APP,
        objectUniversalIdentifier: OBJECT,
        name: 'My View',
      }),
    ).toBe('125140c3-eca9-560d-9020-dad4ac1ebab6');
  });
});
