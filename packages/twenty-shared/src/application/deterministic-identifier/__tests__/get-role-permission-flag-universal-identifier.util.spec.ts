import { getRolePermissionFlagUniversalIdentifier } from '@/application/deterministic-identifier/get-role-permission-flag-universal-identifier.util';

const APP = '11111111-1111-4111-8111-111111111111';
const ROLE = '55555555-5555-4555-8555-555555555555';
const PERMISSION_FLAG = '99999999-9999-4999-8999-999999999999';

describe('getRolePermissionFlagUniversalIdentifier', () => {
  it('derives a deterministic id from the permission flag within its role', () => {
    expect(
      getRolePermissionFlagUniversalIdentifier({
        applicationUniversalIdentifier: APP,
        roleUniversalIdentifier: ROLE,
        permissionFlagUniversalIdentifier: PERMISSION_FLAG,
      }),
    ).toBe('e1b994dc-25c7-5363-82b3-ac77b697ef6b');
  });
});
