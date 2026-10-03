import { computeUserWorkspaceRoleMap } from 'src/engine/metadata-modules/role-target/utils/compute-user-workspace-role-map.util';

describe('computeUserWorkspaceRoleMap', () => {
  it('maps each user workspace to the role it is assigned', () => {
    expect(
      computeUserWorkspaceRoleMap({
        flatRoleTargetMaps: {
          byUniversalIdentifier: {
            'member-target': {
              userWorkspaceId: 'user-workspace-1',
              roleId: 'member-role',
            },
            'admin-target': {
              userWorkspaceId: 'user-workspace-2',
              roleId: 'admin-role',
            },
          },
        },
      }),
    ).toEqual({
      'user-workspace-1': 'member-role',
      'user-workspace-2': 'admin-role',
    });
  });

  it('ignores role targets assigned to api keys or agents', () => {
    expect(
      computeUserWorkspaceRoleMap({
        flatRoleTargetMaps: {
          byUniversalIdentifier: {
            'api-key-target': { userWorkspaceId: null, roleId: 'api-role' },
            'missing-target': undefined,
          },
        },
      }),
    ).toEqual({});
  });
});
