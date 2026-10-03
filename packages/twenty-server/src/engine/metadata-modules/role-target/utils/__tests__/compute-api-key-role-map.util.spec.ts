import { computeApiKeyRoleMap } from 'src/engine/metadata-modules/role-target/utils/compute-api-key-role-map.util';

describe('computeApiKeyRoleMap', () => {
  it('maps each api key to the role it is assigned', () => {
    expect(
      computeApiKeyRoleMap({
        flatRoleTargetMaps: {
          byUniversalIdentifier: {
            'first-api-key-target': {
              apiKeyId: 'api-key-1',
              roleId: 'api-role',
            },
            'second-api-key-target': {
              apiKeyId: 'api-key-2',
              roleId: 'admin-role',
            },
          },
        },
      }),
    ).toEqual({
      'api-key-1': 'api-role',
      'api-key-2': 'admin-role',
    });
  });

  it('ignores role targets assigned to user workspaces or agents', () => {
    expect(
      computeApiKeyRoleMap({
        flatRoleTargetMaps: {
          byUniversalIdentifier: {
            'member-target': { apiKeyId: null, roleId: 'member-role' },
            'missing-target': undefined,
          },
        },
      }),
    ).toEqual({});
  });
});
