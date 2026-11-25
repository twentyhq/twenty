import { buildRowLevelPermissionRules } from 'src/engine/metadata-modules/row-level-permission-predicate/utils/build-row-level-permission-rules.util';

const OWNER = {
  applicationUniversalIdentifier: '20202020-0000-4000-8000-000000000001',
  roleUniversalIdentifier: 'role',
  objectMetadataUniversalIdentifier: 'company',
};
const NOW = '2026-11-10T00:00:00.000Z';

const buildPredicateGroup = (
  universalIdentifier: string,
  parentRowLevelPermissionPredicateGroupUniversalIdentifier:
    | string
    | null = null,
) => ({
  ...OWNER,
  universalIdentifier,
  parentRowLevelPermissionPredicateGroupUniversalIdentifier,
});

const buildPredicate = (
  universalIdentifier: string,
  rowLevelPermissionPredicateGroupUniversalIdentifier: string | null,
) => ({
  ...OWNER,
  universalIdentifier,
  rowLevelPermissionPredicateGroupUniversalIdentifier,
});

describe('buildRowLevelPermissionRules', () => {
  it('should make one rule per root group and link nested groups and predicates to it', () => {
    const {
      rules,
      ruleUniversalIdentifierByPredicateGroupUniversalIdentifier,
      ruleUniversalIdentifierByPredicateUniversalIdentifier,
    } = buildRowLevelPermissionRules({
      predicateGroups: [
        buildPredicateGroup('root-a'),
        buildPredicateGroup('nested-a', 'root-a'),
        buildPredicateGroup('root-b'),
      ],
      predicates: [
        buildPredicate('predicate-in-nested-a', 'nested-a'),
        buildPredicate('predicate-in-root-b', 'root-b'),
      ],
      now: NOW,
    });

    const ruleOfRootA =
      ruleUniversalIdentifierByPredicateGroupUniversalIdentifier.get('root-a');

    expect(rules).toHaveLength(2);
    expect(
      ruleUniversalIdentifierByPredicateGroupUniversalIdentifier.get(
        'nested-a',
      ),
    ).toBe(ruleOfRootA);
    expect(
      ruleUniversalIdentifierByPredicateUniversalIdentifier.get(
        'predicate-in-nested-a',
      ),
    ).toBe(ruleOfRootA);
    expect(
      ruleUniversalIdentifierByPredicateUniversalIdentifier.get(
        'predicate-in-root-b',
      ),
    ).toBe(
      ruleUniversalIdentifierByPredicateGroupUniversalIdentifier.get('root-b'),
    );
  });

  it('should put ungrouped predicates of a role and object in one rule of their own', () => {
    const { rules, ruleUniversalIdentifierByPredicateUniversalIdentifier } =
      buildRowLevelPermissionRules({
        predicateGroups: [],
        predicates: [
          buildPredicate('first-ungrouped', null),
          buildPredicate('second-ungrouped', null),
        ],
        now: NOW,
      });

    expect(rules).toHaveLength(1);
    expect(
      ruleUniversalIdentifierByPredicateUniversalIdentifier.get(
        'first-ungrouped',
      ),
    ).toBe(rules[0].universalIdentifier);
    expect(
      ruleUniversalIdentifierByPredicateUniversalIdentifier.get(
        'second-ungrouped',
      ),
    ).toBe(rules[0].universalIdentifier);
  });

  it('should give the same rule identifier on every build', () => {
    const build = () =>
      buildRowLevelPermissionRules({
        predicateGroups: [buildPredicateGroup('root-a')],
        predicates: [],
        now: NOW,
      }).rules[0].universalIdentifier;

    expect(build()).toBe(build());
  });
});
