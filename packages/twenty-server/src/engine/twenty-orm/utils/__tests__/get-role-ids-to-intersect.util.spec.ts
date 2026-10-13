import { getRoleIdsToIntersect } from 'src/engine/twenty-orm/utils/get-role-ids-to-intersect.util';

describe('getRoleIdsToIntersect', () => {
  it('returns the role of a single source', () => {
    expect(getRoleIdsToIntersect({ apiKeyRoleId: 'api-key-role-id' })).toEqual([
      'api-key-role-id',
    ]);
  });

  it('returns every restricting role once, the agent role first', () => {
    expect(
      getRoleIdsToIntersect({
        applicationRoleId: 'application-role-id',
        userWorkspaceRoleId: 'member-role-id',
        agentRoleId: 'agent-role-id',
      }),
    ).toEqual(['agent-role-id', 'member-role-id', 'application-role-id']);
  });

  it('returns a role shared by several sources once', () => {
    expect(
      getRoleIdsToIntersect({
        userWorkspaceRoleId: 'shared-role-id',
        applicationRoleId: 'shared-role-id',
      }),
    ).toEqual(['shared-role-id']);
  });

  it('ignores a source without a key', () => {
    expect(
      getRoleIdsToIntersect({
        userWorkspaceRoleId: 'member-role-id',
        applicationRoleId: undefined,
      }),
    ).toEqual(['member-role-id']);
  });

  it('denies when an actor takes part without a role, whatever the others hold', () => {
    expect(
      getRoleIdsToIntersect({
        agentRoleId: null,
        userWorkspaceRoleId: 'member-role-id',
        applicationRoleId: 'application-role-id',
      }),
    ).toBeNull();
  });

  const OTHER_SOURCES_WITH_ROLES = {
    agentRoleId: 'agent-role-id',
    userWorkspaceRoleId: 'member-role-id',
    apiKeyRoleId: 'api-key-role-id',
    applicationRoleId: 'application-role-id',
  } as const;

  const buildCombinations = (
    sources: (keyof typeof OTHER_SOURCES_WITH_ROLES)[],
  ): Record<string, string>[] =>
    sources.reduce<Record<string, string>[]>(
      (combinations, source) => [
        ...combinations,
        ...combinations.map((combination) => ({
          ...combination,
          [source]: OTHER_SOURCES_WITH_ROLES[source],
        })),
      ],
      [{}],
    );

  it.each(['userWorkspaceRoleId', 'apiKeyRoleId', 'agentRoleId'] as const)(
    'denies a %s without a role in every combination',
    (sourceWithoutRole) => {
      const otherSources = (
        Object.keys(
          OTHER_SOURCES_WITH_ROLES,
        ) as (keyof typeof OTHER_SOURCES_WITH_ROLES)[]
      ).filter((source) => source !== sourceWithoutRole);

      for (const combination of buildCombinations(otherSources)) {
        expect(
          getRoleIdsToIntersect({
            ...combination,
            [sourceWithoutRole]: null,
          }),
        ).toBeNull();
      }
    },
  );

  it('denies when no source restricts', () => {
    expect(getRoleIdsToIntersect({})).toBeNull();
  });
});
