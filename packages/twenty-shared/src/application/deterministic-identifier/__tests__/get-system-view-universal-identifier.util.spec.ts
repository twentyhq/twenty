import { getSystemViewUniversalIdentifier } from '@/application/deterministic-identifier/get-system-view-universal-identifier.util';
import { ViewKey } from '@/types/ViewKey';

const APP = '11111111-1111-4111-8111-111111111111';
const OBJECT = '22222222-2222-4222-8222-222222222222';

describe('getSystemViewUniversalIdentifier', () => {
  it('derives a deterministic id from the stable INDEX view key within its object', () => {
    expect(
      getSystemViewUniversalIdentifier({
        applicationUniversalIdentifier: APP,
        objectUniversalIdentifier: OBJECT,
        viewKey: ViewKey.INDEX,
      }),
    ).toBe('3803a536-0158-554c-bfb4-e5492323e57f');
  });
});
