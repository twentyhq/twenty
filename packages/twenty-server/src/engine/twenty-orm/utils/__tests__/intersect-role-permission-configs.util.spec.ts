import { intersectRolePermissionConfigs } from 'src/engine/twenty-orm/utils/intersect-role-permission-configs.util';

describe('intersectRolePermissionConfigs', () => {
  it('returns undefined when neither side restricts', () => {
    expect(
      intersectRolePermissionConfigs(undefined, undefined),
    ).toBeUndefined();
  });

  it('treats undefined as neutral', () => {
    const config = {
      intersectionOf: { userWorkspaceRoleId: 'member-role-id' },
    };

    expect(intersectRolePermissionConfigs(undefined, config)).toEqual(config);
    expect(intersectRolePermissionConfigs(config, undefined)).toEqual(config);
  });

  it('treats bypass as neutral', () => {
    const config = { intersectionOf: { apiKeyRoleId: 'api-key-role-id' } };
    const bypass = { shouldBypassPermissionChecks: true } as const;

    expect(intersectRolePermissionConfigs(bypass, config)).toEqual(config);
    expect(intersectRolePermissionConfigs(config, bypass)).toEqual(config);
    expect(intersectRolePermissionConfigs(bypass, bypass)).toEqual(bypass);
    expect(intersectRolePermissionConfigs(bypass, undefined)).toEqual(bypass);
  });

  it('merges restrictions from different sources', () => {
    expect(
      intersectRolePermissionConfigs(
        { intersectionOf: { userWorkspaceRoleId: 'member-role-id' } },
        { intersectionOf: { applicationRoleId: 'application-role-id' } },
      ),
    ).toEqual({
      intersectionOf: {
        userWorkspaceRoleId: 'member-role-id',
        applicationRoleId: 'application-role-id',
      },
    });
  });

  it('keeps a role both sides give the same source', () => {
    expect(
      intersectRolePermissionConfigs(
        { intersectionOf: { agentRoleId: 'agent-role-id' } },
        { intersectionOf: { agentRoleId: 'agent-role-id' } },
      ),
    ).toEqual({ intersectionOf: { agentRoleId: 'agent-role-id' } });
  });

  it('denies a source given two different roles', () => {
    expect(
      intersectRolePermissionConfigs(
        { intersectionOf: { userWorkspaceRoleId: 'member-role-id' } },
        { intersectionOf: { userWorkspaceRoleId: 'other-member-role-id' } },
      ),
    ).toEqual({ intersectionOf: { userWorkspaceRoleId: null } });
  });

  it('keeps a missing role whatever the other side holds', () => {
    expect(
      intersectRolePermissionConfigs(
        { intersectionOf: { agentRoleId: null } },
        { intersectionOf: { agentRoleId: 'agent-role-id' } },
      ),
    ).toEqual({ intersectionOf: { agentRoleId: null } });
    expect(
      intersectRolePermissionConfigs(
        { intersectionOf: { agentRoleId: 'agent-role-id' } },
        { intersectionOf: { agentRoleId: null } },
      ),
    ).toEqual({ intersectionOf: { agentRoleId: null } });
  });

  it('keeps an empty intersection empty', () => {
    expect(
      intersectRolePermissionConfigs(
        { intersectionOf: {} },
        { shouldBypassPermissionChecks: true },
      ),
    ).toEqual({ intersectionOf: {} });
  });
});
