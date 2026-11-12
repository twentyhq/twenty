import {
  type RowLevelPermissionPredicateGroupManifest,
  type RowLevelPermissionPredicateManifest,
  type RowLevelPermissionRuleManifest,
  type RowLevelPermissionRulePredicateGroupManifest,
  type RowLevelPermissionRulePredicateManifest,
} from '@/application/roleManifestType';
import { isDefined } from '@/utils/validation/isDefined';

type NullableRowLevelPermissionRuleLink = {
  rowLevelPermissionRuleUniversalIdentifier: string | null;
};

type FlatPredicateGroup = RowLevelPermissionPredicateGroupManifest &
  NullableRowLevelPermissionRuleLink;

type FlatPredicate = RowLevelPermissionPredicateManifest &
  NullableRowLevelPermissionRuleLink;

const withoutRuleLink = <TManifest extends NullableRowLevelPermissionRuleLink>({
  rowLevelPermissionRuleUniversalIdentifier: _ruleUniversalIdentifier,
  ...manifest
}: TManifest): Omit<TManifest, 'rowLevelPermissionRuleUniversalIdentifier'> =>
  manifest;

export const nestRowLevelPermissionRuleManifests = ({
  rules,
  predicateGroups,
  predicates,
}: {
  rules: Omit<
    RowLevelPermissionRuleManifest,
    'predicates' | 'predicateGroups'
  >[];
  predicateGroups: FlatPredicateGroup[];
  predicates: FlatPredicate[];
}): {
  rules: RowLevelPermissionRuleManifest[];
  predicateGroups: RowLevelPermissionPredicateGroupManifest[];
  predicates: RowLevelPermissionPredicateManifest[];
} => {
  const ruleUniversalIdentifiers = new Set(
    rules.map(({ universalIdentifier }) => universalIdentifier),
  );
  const isInRule = ({
    rowLevelPermissionRuleUniversalIdentifier,
  }: NullableRowLevelPermissionRuleLink): boolean =>
    isDefined(rowLevelPermissionRuleUniversalIdentifier) &&
    ruleUniversalIdentifiers.has(rowLevelPermissionRuleUniversalIdentifier);

  const predicateGroupsInRules = predicateGroups.filter(isInRule);
  const predicatesInRules = predicates.filter(isInRule);
  const predicateGroupUniversalIdentifiersInRules = new Set(
    predicateGroupsInRules.map(
      ({ universalIdentifier }) => universalIdentifier,
    ),
  );
  const findParentUniversalIdentifier = (
    parentUniversalIdentifier: string | null | undefined,
  ): string | null =>
    isDefined(parentUniversalIdentifier) &&
    predicateGroupUniversalIdentifiersInRules.has(parentUniversalIdentifier)
      ? parentUniversalIdentifier
      : null;

  const nestChildren = ({
    ruleUniversalIdentifier,
    parentPredicateGroupUniversalIdentifier,
  }: {
    ruleUniversalIdentifier: string;
    parentPredicateGroupUniversalIdentifier: string | null;
  }): {
    predicates?: RowLevelPermissionRulePredicateManifest[];
    predicateGroups?: RowLevelPermissionRulePredicateGroupManifest[];
  } => {
    const childPredicates = predicatesInRules
      .filter(
        (predicate) =>
          predicate.rowLevelPermissionRuleUniversalIdentifier ===
            ruleUniversalIdentifier &&
          findParentUniversalIdentifier(
            predicate.predicateGroupUniversalIdentifier,
          ) === parentPredicateGroupUniversalIdentifier,
      )
      .map(
        ({
          objectUniversalIdentifier: _objectUniversalIdentifier,
          predicateGroupUniversalIdentifier: _predicateGroupUniversalIdentifier,
          rowLevelPermissionRuleUniversalIdentifier: _ruleUniversalIdentifier,
          ...predicate
        }) => predicate,
      );
    const childPredicateGroups = predicateGroupsInRules
      .filter(
        (predicateGroup) =>
          predicateGroup.rowLevelPermissionRuleUniversalIdentifier ===
            ruleUniversalIdentifier &&
          findParentUniversalIdentifier(
            predicateGroup.parentPredicateGroupUniversalIdentifier,
          ) === parentPredicateGroupUniversalIdentifier,
      )
      .map(
        ({
          objectUniversalIdentifier: _objectUniversalIdentifier,
          parentPredicateGroupUniversalIdentifier:
            _parentPredicateGroupUniversalIdentifier,
          rowLevelPermissionRuleUniversalIdentifier: _ruleUniversalIdentifier,
          ...predicateGroup
        }) => ({
          ...predicateGroup,
          ...nestChildren({
            ruleUniversalIdentifier,
            parentPredicateGroupUniversalIdentifier:
              predicateGroup.universalIdentifier,
          }),
        }),
      );

    return {
      ...(childPredicates.length > 0 ? { predicates: childPredicates } : {}),
      ...(childPredicateGroups.length > 0
        ? { predicateGroups: childPredicateGroups }
        : {}),
    };
  };

  return {
    rules: rules.map((rule) => ({
      ...rule,
      ...nestChildren({
        ruleUniversalIdentifier: rule.universalIdentifier,
        parentPredicateGroupUniversalIdentifier: null,
      }),
    })),
    predicateGroups: predicateGroups
      .filter((predicateGroup) => !isInRule(predicateGroup))
      .map(withoutRuleLink),
    predicates: predicates
      .filter((predicate) => !isInRule(predicate))
      .map(withoutRuleLink),
  };
};
