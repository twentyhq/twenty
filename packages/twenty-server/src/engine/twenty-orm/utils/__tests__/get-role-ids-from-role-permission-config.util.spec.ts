import { getRoleIdsFromRolePermissionConfig } from 'src/engine/twenty-orm/utils/get-role-ids-from-role-permission-config.util';

describe('getRoleIdsFromRolePermissionConfig', () => {
  it('returns the roles to intersect', () => {
    expect(
      getRoleIdsFromRolePermissionConfig({
        intersectionOf: {
          userWorkspaceRoleId: 'member-role-id',
          agentRoleId: 'agent-role-id',
        },
      }),
    ).toEqual(['agent-role-id', 'member-role-id']);
  });

  it('returns no role ids for a config that denies', () => {
    expect(
      getRoleIdsFromRolePermissionConfig({
        intersectionOf: {
          userWorkspaceRoleId: 'member-role-id',
          agentRoleId: null,
        },
      }),
    ).toEqual([]);
  });

  it('returns no role ids for a bypass config', () => {
    expect(
      getRoleIdsFromRolePermissionConfig({
        shouldBypassPermissionChecks: true,
      }),
    ).toEqual([]);
  });
});
