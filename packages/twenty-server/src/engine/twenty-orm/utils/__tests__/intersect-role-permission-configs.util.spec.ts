import { intersectRolePermissionConfigs } from 'src/engine/twenty-orm/utils/intersect-role-permission-configs.util';

describe('intersectRolePermissionConfigs', () => {
  it('returns undefined when neither side restricts', () => {
    expect(
      intersectRolePermissionConfigs(undefined, undefined),
    ).toBeUndefined();
  });

  it('treats undefined as neutral', () => {
    const config = { intersectionOf: { userWorkspace: 'member-role-id' } };

    expect(intersectRolePermissionConfigs(undefined, config)).toEqual(config);
    expect(intersectRolePermissionConfigs(config, undefined)).toEqual(config);
  });

  it('treats bypass as neutral', () => {
    const config = { intersectionOf: { apiKey: 'api-key-role-id' } };
    const bypass = { shouldBypassPermissionChecks: true } as const;

    expect(intersectRolePermissionConfigs(bypass, config)).toEqual(config);
    expect(intersectRolePermissionConfigs(config, bypass)).toEqual(config);
    expect(intersectRolePermissionConfigs(bypass, bypass)).toEqual(bypass);
    expect(intersectRolePermissionConfigs(bypass, undefined)).toEqual(bypass);
  });

  it('merges restrictions from different sources', () => {
    expect(
      intersectRolePermissionConfigs(
        { intersectionOf: { userWorkspace: 'member-role-id' } },
        { intersectionOf: { application: 'application-role-id' } },
      ),
    ).toEqual({
      intersectionOf: {
        userWorkspace: 'member-role-id',
        application: 'application-role-id',
      },
    });
  });

  it('keeps a role both sides give the same source', () => {
    expect(
      intersectRolePermissionConfigs(
        { intersectionOf: { agent: 'agent-role-id' } },
        { intersectionOf: { agent: 'agent-role-id' } },
      ),
    ).toEqual({ intersectionOf: { agent: 'agent-role-id' } });
  });

  it('denies a source given two different roles', () => {
    expect(
      intersectRolePermissionConfigs(
        { intersectionOf: { userWorkspace: 'member-role-id' } },
        { intersectionOf: { userWorkspace: 'other-member-role-id' } },
      ),
    ).toEqual({ intersectionOf: { userWorkspace: null } });
  });

  it('keeps a missing role whatever the other side holds', () => {
    expect(
      intersectRolePermissionConfigs(
        { intersectionOf: { agent: null } },
        { intersectionOf: { agent: 'agent-role-id' } },
      ),
    ).toEqual({ intersectionOf: { agent: null } });
    expect(
      intersectRolePermissionConfigs(
        { intersectionOf: { agent: 'agent-role-id' } },
        { intersectionOf: { agent: null } },
      ),
    ).toEqual({ intersectionOf: { agent: null } });
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
