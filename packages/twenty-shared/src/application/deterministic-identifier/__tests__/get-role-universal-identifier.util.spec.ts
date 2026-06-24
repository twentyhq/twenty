import { getRoleUniversalIdentifier } from '@/application/deterministic-identifier/get-role-universal-identifier.util';

const APP = '11111111-1111-4111-8111-111111111111';

describe('getRoleUniversalIdentifier', () => {
  it('derives a deterministic id from the role label within its application', () => {
    expect(
      getRoleUniversalIdentifier({
        applicationUniversalIdentifier: APP,
        label: 'Admin',
      }),
    ).toBe('135023fe-0587-5897-ad22-ce2ee8ab91a0');
  });
});
