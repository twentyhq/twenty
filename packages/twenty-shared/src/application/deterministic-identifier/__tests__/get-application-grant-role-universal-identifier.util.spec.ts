import { getApplicationGrantRoleUniversalIdentifier } from '@/application/deterministic-identifier/get-application-grant-role-universal-identifier.util';
import { getRoleUniversalIdentifier } from '@/application/deterministic-identifier/get-role-universal-identifier.util';

const APP = '11111111-1111-4111-8111-111111111111';
const OTHER_APP = '22222222-2222-4222-8222-222222222222';
const WORKSPACE_CUSTOM_APP = '33333333-3333-4333-8333-333333333333';
const OTHER_WORKSPACE_CUSTOM_APP = '44444444-4444-4444-8444-444444444444';

const getGrant = (
  grantedApplicationUniversalIdentifier: string,
  workspaceCustomApplicationUniversalIdentifier = WORKSPACE_CUSTOM_APP,
) =>
  getApplicationGrantRoleUniversalIdentifier({
    grantedApplicationUniversalIdentifier,
    workspaceCustomApplicationUniversalIdentifier,
  });

describe('getApplicationGrantRoleUniversalIdentifier', () => {
  it('derives one grant role id per application', () => {
    expect(getGrant(APP)).toBe(getGrant(APP));
    expect(getGrant(APP)).not.toBe(getGrant(OTHER_APP));
  });

  it('derives a different grant role id per workspace custom application', () => {
    expect(getGrant(APP)).not.toBe(getGrant(APP, OTHER_WORKSPACE_CUSTOM_APP));
  });

  it('does not collide with a role the workspace custom application declares', () => {
    expect(getGrant(APP)).not.toBe(
      getRoleUniversalIdentifier({
        applicationUniversalIdentifier: WORKSPACE_CUSTOM_APP,
        label: 'APPLICATION_GRANT',
      }),
    );
  });
});
