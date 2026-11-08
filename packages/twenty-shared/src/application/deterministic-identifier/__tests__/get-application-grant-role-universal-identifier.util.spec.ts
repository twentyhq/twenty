import { getApplicationGrantRoleUniversalIdentifier } from '@/application/deterministic-identifier/get-application-grant-role-universal-identifier.util';
import { getRoleUniversalIdentifier } from '@/application/deterministic-identifier/get-role-universal-identifier.util';

const APP = '11111111-1111-4111-8111-111111111111';
const OTHER_APP = '22222222-2222-4222-8222-222222222222';

describe('getApplicationGrantRoleUniversalIdentifier', () => {
  it('derives one grant role id per application', () => {
    const grantRoleUniversalIdentifier =
      getApplicationGrantRoleUniversalIdentifier({
        grantedApplicationUniversalIdentifier: APP,
      });

    expect(grantRoleUniversalIdentifier).toBe(
      getApplicationGrantRoleUniversalIdentifier({
        grantedApplicationUniversalIdentifier: APP,
      }),
    );
    expect(grantRoleUniversalIdentifier).not.toBe(
      getApplicationGrantRoleUniversalIdentifier({
        grantedApplicationUniversalIdentifier: OTHER_APP,
      }),
    );
  });

  it('does not collide with a role the application declares', () => {
    expect(
      getApplicationGrantRoleUniversalIdentifier({
        grantedApplicationUniversalIdentifier: APP,
      }),
    ).not.toBe(
      getRoleUniversalIdentifier({
        applicationUniversalIdentifier: APP,
        label: 'APPLICATION_GRANT',
      }),
    );
  });
});
