import {
  type RoleManifest,
  type RowLevelPermissionPredicateGroupManifest,
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

const getGroupOperatorPath = ({
  groupsByUniversalIdentifier,
  predicateGroupUniversalIdentifier,
}: {
  groupsByUniversalIdentifier: Map<
    string,
    RowLevelPermissionPredicateGroupManifest
  >;
  predicateGroupUniversalIdentifier: string | null | undefined;
}): string[] => {
  const operatorPath: string[] = [];
  const visitedGroupUniversalIdentifiers = new Set<string>();
  let currentGroupUniversalIdentifier = predicateGroupUniversalIdentifier;

  while (
    isDefined(currentGroupUniversalIdentifier) &&
    !visitedGroupUniversalIdentifiers.has(currentGroupUniversalIdentifier)
  ) {
    visitedGroupUniversalIdentifiers.add(currentGroupUniversalIdentifier);

    const group = groupsByUniversalIdentifier.get(
      currentGroupUniversalIdentifier,
    );

    if (!isDefined(group)) {
      break;
    }

    operatorPath.push(group.logicalOperator);
    currentGroupUniversalIdentifier =
      group.parentPredicateGroupUniversalIdentifier;
  }

  return operatorPath;
};

export const getRowLevelRestrictionSignature = ({
  role,
  objectUniversalIdentifier,
}: {
  role: RoleManifest;
  objectUniversalIdentifier: string;
}): string[] => {
  const groupsByUniversalIdentifier = new Map(
    (role.rowLevelPermissionPredicateGroups ?? []).map((group) => [
      group.universalIdentifier,
      group,
    ]),
  );

  return (role.rowLevelPermissionPredicates ?? [])
    .filter(
      (predicate) =>
        predicate.objectUniversalIdentifier === objectUniversalIdentifier,
    )
    .map((predicate) =>
      stringifyWithSortedKeys({
        fieldUniversalIdentifier: predicate.fieldUniversalIdentifier,
        subFieldName: predicate.subFieldName ?? null,
        operand: predicate.operand,
        value: predicate.value ?? null,
        workspaceMemberFieldUniversalIdentifier:
          predicate.workspaceMemberFieldUniversalIdentifier ?? null,
        workspaceMemberSubFieldName:
          predicate.workspaceMemberSubFieldName ?? null,
        groupOperatorPath: getGroupOperatorPath({
          groupsByUniversalIdentifier,
          predicateGroupUniversalIdentifier:
            predicate.predicateGroupUniversalIdentifier,
        }),
      }),
    )
    .sort();
};
