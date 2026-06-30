import { getObjectPermissionUniversalIdentifier } from '@/application/deterministic-identifier/get-object-permission-universal-identifier.util';

const APP = '11111111-1111-4111-8111-111111111111';
const ROLE = '55555555-5555-4555-8555-555555555555';
const OBJECT = '22222222-2222-4222-8222-222222222222';

describe('getObjectPermissionUniversalIdentifier', () => {
  it('derives a deterministic id from the object within its role', () => {
    expect(
      getObjectPermissionUniversalIdentifier({
        applicationUniversalIdentifier: APP,
        roleUniversalIdentifier: ROLE,
        objectUniversalIdentifier: OBJECT,
      }),
    ).toBe('8d78f0a2-6ad6-5ee1-a859-a33bddd42324');
  });
});
