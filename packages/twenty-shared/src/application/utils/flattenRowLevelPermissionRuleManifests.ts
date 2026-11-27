import {
  type RowLevelPermissionRuleManifest,
  type RowLevelPermissionRulePredicateGroupManifest,
  type RowLevelPermissionRulePredicateManifest,
} from '@/application/roleManifestType';

export type RowLevelPermissionRuleLink = {
  rowLevelPermissionRuleUniversalIdentifier: string;
};

export type FlattenedRowLevelPermissionPredicateGroupManifest = Omit<
  RowLevelPermissionRulePredicateGroupManifest,
  'predicates' | 'predicateGroups'
> &
  RowLevelPermissionRuleLink & {
    objectUniversalIdentifier: string;
    parentPredicateGroupUniversalIdentifier?: string | null;
  };

export type FlattenedRowLevelPermissionPredicateManifest =
  RowLevelPermissionRulePredicateManifest &
    RowLevelPermissionRuleLink & {
      objectUniversalIdentifier: string;
      predicateGroupUniversalIdentifier?: string | null;
    };

export type FlattenedRowLevelPermissionRuleManifests = {
  predicateGroups: FlattenedRowLevelPermissionPredicateGroupManifest[];
  predicates: FlattenedRowLevelPermissionPredicateManifest[];
};

export const flattenRowLevelPermissionRuleManifests = ({
  rules,
}: {
  rules: Pick<
    RowLevelPermissionRuleManifest,
    | 'universalIdentifier'
    | 'objectUniversalIdentifier'
    | 'predicates'
    | 'predicateGroups'
  >[];
}): FlattenedRowLevelPermissionRuleManifests => {
  const flattened: FlattenedRowLevelPermissionRuleManifests = {
    predicateGroups: [],
    predicates: [],
  };

  for (const rule of rules) {
    const owner = {
      objectUniversalIdentifier: rule.objectUniversalIdentifier,
      rowLevelPermissionRuleUniversalIdentifier: rule.universalIdentifier,
    };

    const flattenChildren = ({
      predicates = [],
      predicateGroups = [],
      parentPredicateGroupUniversalIdentifier,
    }: {
      predicates?: RowLevelPermissionRulePredicateManifest[];
      predicateGroups?: RowLevelPermissionRulePredicateGroupManifest[];
      parentPredicateGroupUniversalIdentifier: string | null;
    }): void => {
      for (const predicate of predicates) {
        flattened.predicates.push({
          ...predicate,
          ...owner,
          predicateGroupUniversalIdentifier:
            parentPredicateGroupUniversalIdentifier,
        });
      }

      for (const {
        predicates: childPredicates,
        predicateGroups: childPredicateGroups,
        ...predicateGroup
      } of predicateGroups) {
        flattened.predicateGroups.push({
          ...predicateGroup,
          ...owner,
          parentPredicateGroupUniversalIdentifier,
        });
        flattenChildren({
          predicates: childPredicates,
          predicateGroups: childPredicateGroups,
          parentPredicateGroupUniversalIdentifier:
            predicateGroup.universalIdentifier,
        });
      }
    };

    flattenChildren({
      predicates: rule.predicates,
      predicateGroups: rule.predicateGroups,
      parentPredicateGroupUniversalIdentifier: null,
    });
  }

  return flattened;
};
