import { getRoleIdsToIntersect } from 'src/engine/twenty-orm/utils/get-role-ids-to-intersect.util';

describe('getRoleIdsToIntersect', () => {
  it('returns the role of a single source', () => {
    expect(getRoleIdsToIntersect({ apiKey: 'api-key-role-id' })).toEqual([
      'api-key-role-id',
    ]);
  });

  it('returns every restricting role once, the agent role first', () => {
    expect(
      getRoleIdsToIntersect({
        application: 'application-role-id',
        userWorkspace: 'member-role-id',
        agent: 'agent-role-id',
      }),
    ).toEqual(['agent-role-id', 'member-role-id', 'application-role-id']);
  });

  it('returns a role shared by several sources once', () => {
    expect(
      getRoleIdsToIntersect({
        userWorkspace: 'shared-role-id',
        application: 'shared-role-id',
      }),
    ).toEqual(['shared-role-id']);
  });

  it('ignores a source without a key', () => {
    expect(
      getRoleIdsToIntersect({
        userWorkspace: 'member-role-id',
        application: undefined,
      }),
    ).toEqual(['member-role-id']);
  });

  it('denies when an actor takes part without a role, whatever the others hold', () => {
    expect(
      getRoleIdsToIntersect({
        agent: null,
        userWorkspace: 'member-role-id',
        application: 'application-role-id',
      }),
    ).toBeNull();
  });

  const OTHER_SOURCES_WITH_ROLES = {
    agent: 'agent-role-id',
    userWorkspace: 'member-role-id',
    apiKey: 'api-key-role-id',
    application: 'application-role-id',
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

  it.each(['userWorkspace', 'apiKey', 'agent'] as const)(
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
