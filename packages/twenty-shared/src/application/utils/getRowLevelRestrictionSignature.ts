import {
  type RoleManifest,
  type RowLevelPermissionPredicateGroupManifest,
  type RowLevelPermissionPredicateManifest,
} from '@/application/roleManifestType';
import { isPlainObject } from '@/utils/typeguard/isPlainObject';
import { isDefined } from '@/utils/validation/isDefined';

const stringifyWithSortedKeys = (value: unknown): string =>
  JSON.stringify(value, (_key, nestedValue) =>
    isPlainObject(nestedValue)
      ? Object.fromEntries(
          Object.entries(nestedValue).sort(([leftKey], [rightKey]) =>
            leftKey.localeCompare(rightKey),
          ),
        )
      : nestedValue,
  );

const getPredicateSignature = (
  predicate: RowLevelPermissionPredicateManifest,
): string =>
  stringifyWithSortedKeys({
    fieldUniversalIdentifier: predicate.fieldUniversalIdentifier,
    subFieldName: predicate.subFieldName ?? null,
    operand: predicate.operand,
    value: predicate.value ?? null,
    workspaceMemberFieldUniversalIdentifier:
      predicate.workspaceMemberFieldUniversalIdentifier ?? null,
    workspaceMemberSubFieldName: predicate.workspaceMemberSubFieldName ?? null,
  });

export const getRowLevelRestrictionSignature = ({
  role,
  objectUniversalIdentifier,
}: {
  role: RoleManifest;
  objectUniversalIdentifier: string;
}): string | undefined => {
  const predicates = (role.rowLevelPermissionPredicates ?? []).filter(
    (predicate) =>
      predicate.objectUniversalIdentifier === objectUniversalIdentifier,
  );

  if (predicates.length === 0) {
    return undefined;
  }

  const groups = (role.rowLevelPermissionPredicateGroups ?? []).filter(
    (group) => group.objectUniversalIdentifier === objectUniversalIdentifier,
  );
  const groupsByUniversalIdentifier = new Map(
    groups.map((group) => [group.universalIdentifier, group]),
  );

  const getGroupUniversalIdentifierIfKnown = (
    groupUniversalIdentifier: string | null | undefined,
  ): string | null =>
    isDefined(groupUniversalIdentifier) &&
    groupsByUniversalIdentifier.has(groupUniversalIdentifier)
      ? groupUniversalIdentifier
      : null;

  const reachesRoot = (
    group: RowLevelPermissionPredicateGroupManifest,
  ): boolean => {
    const visitedGroupUniversalIdentifiers = new Set([
      group.universalIdentifier,
    ]);
    let parentGroupUniversalIdentifier = getGroupUniversalIdentifierIfKnown(
      group.parentPredicateGroupUniversalIdentifier,
    );

    while (isDefined(parentGroupUniversalIdentifier)) {
      if (
        visitedGroupUniversalIdentifiers.has(parentGroupUniversalIdentifier)
      ) {
        return false;
      }

      visitedGroupUniversalIdentifiers.add(parentGroupUniversalIdentifier);
      parentGroupUniversalIdentifier = getGroupUniversalIdentifierIfKnown(
        groupsByUniversalIdentifier.get(parentGroupUniversalIdentifier)
          ?.parentPredicateGroupUniversalIdentifier,
      );
    }

    return true;
  };

  const parentGroupUniversalIdentifierByGroupUniversalIdentifier = new Map(
    groups.map((group) => [
      group.universalIdentifier,
      reachesRoot(group)
        ? getGroupUniversalIdentifierIfKnown(
            group.parentPredicateGroupUniversalIdentifier,
          )
        : null,
    ]),
  );

  const getChildSignatures = (
    parentGroupUniversalIdentifier: string | null,
  ): string[] =>
    [
      ...predicates
        .filter(
          (predicate) =>
            getGroupUniversalIdentifierIfKnown(
              predicate.predicateGroupUniversalIdentifier,
            ) === parentGroupUniversalIdentifier,
        )
        .map(getPredicateSignature),
      ...groups
        .filter(
          (group) =>
            parentGroupUniversalIdentifierByGroupUniversalIdentifier.get(
              group.universalIdentifier,
            ) === parentGroupUniversalIdentifier,
        )
        .map((group) => ({
          logicalOperator: group.logicalOperator,
          children: getChildSignatures(group.universalIdentifier),
        }))
        .filter(({ children }) => children.length > 0)
        .map((groupSignature) => stringifyWithSortedKeys(groupSignature)),
    ].sort();

  return stringifyWithSortedKeys(getChildSignatures(null));
};
