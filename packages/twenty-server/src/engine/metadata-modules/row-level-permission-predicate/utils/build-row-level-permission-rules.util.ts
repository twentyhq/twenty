/* @license Enterprise */

import { getRowLevelPermissionRuleUniversalIdentifier } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import { type UniversalFlatRowLevelPermissionPredicateGroup } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-row-level-permission-predicate-group.type';
import { type UniversalFlatRowLevelPermissionPredicate } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-row-level-permission-predicate.type';
import { type UniversalFlatRowLevelPermissionRule } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-row-level-permission-rule.type';

type RuleOwnedEntity = {
  universalIdentifier: string;
  applicationUniversalIdentifier: string;
  roleUniversalIdentifier: string;
  objectMetadataUniversalIdentifier: string;
};

export type RowLevelPermissionRules = {
  rules: UniversalFlatRowLevelPermissionRule[];
  ruleUniversalIdentifierByPredicateGroupUniversalIdentifier: Map<
    string,
    string
  >;
  ruleUniversalIdentifierByPredicateUniversalIdentifier: Map<string, string>;
};

// A rule is a root predicate group, or the predicates of a role and object that sit in no group
export const buildRowLevelPermissionRules = ({
  predicateGroups,
  predicates,
  now,
}: {
  predicateGroups: (RuleOwnedEntity &
    Pick<
      UniversalFlatRowLevelPermissionPredicateGroup,
      'parentRowLevelPermissionPredicateGroupUniversalIdentifier'
    >)[];
  predicates: (RuleOwnedEntity &
    Pick<
      UniversalFlatRowLevelPermissionPredicate,
      'rowLevelPermissionPredicateGroupUniversalIdentifier'
    >)[];
  now: string;
}): RowLevelPermissionRules => {
  const ruleByUniversalIdentifier = new Map<
    string,
    UniversalFlatRowLevelPermissionRule
  >();

  const findOrCreateRuleUniversalIdentifier = ({
    owner,
    rootRowLevelPermissionPredicateGroupUniversalIdentifier,
  }: {
    owner: RuleOwnedEntity;
    rootRowLevelPermissionPredicateGroupUniversalIdentifier: string | null;
  }): string => {
    const universalIdentifier = getRowLevelPermissionRuleUniversalIdentifier({
      applicationUniversalIdentifier: owner.applicationUniversalIdentifier,
      roleUniversalIdentifier: owner.roleUniversalIdentifier,
      objectMetadataUniversalIdentifier:
        owner.objectMetadataUniversalIdentifier,
      rootRowLevelPermissionPredicateGroupUniversalIdentifier,
    });

    if (!ruleByUniversalIdentifier.has(universalIdentifier)) {
      ruleByUniversalIdentifier.set(universalIdentifier, {
        universalIdentifier,
        applicationUniversalIdentifier: owner.applicationUniversalIdentifier,
        roleUniversalIdentifier: owner.roleUniversalIdentifier,
        objectMetadataUniversalIdentifier:
          owner.objectMetadataUniversalIdentifier,
        canReadRecords: false,
        canCreateRecords: false,
        canUpdateRecords: false,
        canSoftDeleteRecords: false,
        canDestroyRecords: false,
        createdAt: now,
        updatedAt: now,
      });
    }

    return universalIdentifier;
  };

  const predicateGroupByUniversalIdentifier = new Map(
    predicateGroups.map((predicateGroup) => [
      predicateGroup.universalIdentifier,
      predicateGroup,
    ]),
  );

  const findRootPredicateGroup = (
    predicateGroupUniversalIdentifier: string,
  ) => {
    const visitedUniversalIdentifiers = new Set<string>();
    let predicateGroup = predicateGroupByUniversalIdentifier.get(
      predicateGroupUniversalIdentifier,
    );

    while (
      isDefined(
        predicateGroup?.parentRowLevelPermissionPredicateGroupUniversalIdentifier,
      ) &&
      !visitedUniversalIdentifiers.has(predicateGroup.universalIdentifier)
    ) {
      visitedUniversalIdentifiers.add(predicateGroup.universalIdentifier);
      predicateGroup = predicateGroupByUniversalIdentifier.get(
        predicateGroup.parentRowLevelPermissionPredicateGroupUniversalIdentifier,
      );
    }

    return predicateGroup;
  };

  const ruleUniversalIdentifierByPredicateGroupUniversalIdentifier = new Map<
    string,
    string
  >();

  for (const predicateGroup of predicateGroups) {
    const rootPredicateGroup =
      findRootPredicateGroup(predicateGroup.universalIdentifier) ??
      predicateGroup;

    ruleUniversalIdentifierByPredicateGroupUniversalIdentifier.set(
      predicateGroup.universalIdentifier,
      findOrCreateRuleUniversalIdentifier({
        owner: rootPredicateGroup,
        rootRowLevelPermissionPredicateGroupUniversalIdentifier:
          rootPredicateGroup.universalIdentifier,
      }),
    );
  }

  const ruleUniversalIdentifierByPredicateUniversalIdentifier = new Map<
    string,
    string
  >();

  for (const predicate of predicates) {
    const ruleUniversalIdentifier = isDefined(
      predicate.rowLevelPermissionPredicateGroupUniversalIdentifier,
    )
      ? ruleUniversalIdentifierByPredicateGroupUniversalIdentifier.get(
          predicate.rowLevelPermissionPredicateGroupUniversalIdentifier,
        )
      : findOrCreateRuleUniversalIdentifier({
          owner: predicate,
          rootRowLevelPermissionPredicateGroupUniversalIdentifier: null,
        });

    if (isDefined(ruleUniversalIdentifier)) {
      ruleUniversalIdentifierByPredicateUniversalIdentifier.set(
        predicate.universalIdentifier,
        ruleUniversalIdentifier,
      );
    }
  }

  return {
    rules: [...ruleByUniversalIdentifier.values()],
    ruleUniversalIdentifierByPredicateGroupUniversalIdentifier,
    ruleUniversalIdentifierByPredicateUniversalIdentifier,
  };
};
