import { getPermissionFlagUniversalIdentifier } from '@/application/deterministic-identifier/get-permission-flag-universal-identifier.util';

const APP = '11111111-1111-4111-8111-111111111111';

describe('getPermissionFlagUniversalIdentifier', () => {
  it('derives a deterministic id from the flag key within its application', () => {
    expect(
      getPermissionFlagUniversalIdentifier({
        ownerApplicationUniversalIdentifier: APP,
        key: 'WORKFLOWS',
      }),
    ).toBe('e9f8bad8-54da-51f7-b7d7-77ed600a589d');
  });
});
