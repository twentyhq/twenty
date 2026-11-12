/* @license Enterprise */

import {
  type RowLevelPermissionPredicate,
  RowLevelPermissionPredicateOperand,
  type RowLevelPermissionPredicateValue,
} from 'twenty-shared/types';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { type RowLevelPermissionMemberFieldValues } from 'src/engine/permissions/internal/rls/types/row-level-permission-member-field-values.type';
import { type RowLevelPermissionWorkspaceMember } from 'src/engine/permissions/internal/rls/types/row-level-permission-workspace-member.type';
import { buildMemberFieldKey } from 'src/engine/permissions/internal/rls/utils/build-member-field-key.util';
import { buildMemberFieldValuesOrThrow } from 'src/engine/permissions/internal/rls/utils/build-member-field-values-or-throw.util';

const ANY_OF_OPERANDS: RowLevelPermissionPredicateOperand[] = [
  RowLevelPermissionPredicateOperand.IS,
  RowLevelPermissionPredicateOperand.CONTAINS,
];

const canSplitMemberFieldValues = ({
  memberFieldKey,
  workspaceMemberBoundPredicates,
}: {
  memberFieldKey: string;
  workspaceMemberBoundPredicates: RowLevelPermissionPredicate[];
}): boolean => {
  const predicatesReadingKey = workspaceMemberBoundPredicates.filter(
    (predicate) => buildMemberFieldKey(predicate) === memberFieldKey,
  );

  return (
    predicatesReadingKey.length === 1 &&
    ANY_OF_OPERANDS.includes(predicatesReadingKey[0].operand)
  );
};

const splitMemberFieldValue = ({
  value,
  canSplit,
}: {
  value: RowLevelPermissionPredicateValue;
  canSplit: boolean;
}): RowLevelPermissionPredicateValue[] => {
  if (!Array.isArray(value)) {
    return [value];
  }

  if (!canSplit) {
    return [[...value].sort()];
  }

  return value.length > 0 ? value : [null];
};

export const buildAccessGroupMemberFieldValuesOrThrow = ({
  workspaceMemberBoundPredicates,
  workspaceMember,
  flatFieldMetadataMaps,
}: {
  workspaceMemberBoundPredicates: RowLevelPermissionPredicate[];
  workspaceMember: RowLevelPermissionWorkspaceMember;
  flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>;
}): RowLevelPermissionMemberFieldValues[] =>
  Object.entries(
    buildMemberFieldValuesOrThrow({
      workspaceMember,
      predicates: workspaceMemberBoundPredicates,
      flatFieldMetadataMaps,
    }),
  ).reduce<RowLevelPermissionMemberFieldValues[]>(
    (combinations, [memberFieldKey, value]) =>
      combinations.flatMap((combination) =>
        splitMemberFieldValue({
          value,
          canSplit: canSplitMemberFieldValues({
            memberFieldKey,
            workspaceMemberBoundPredicates,
          }),
        }).map((memberFieldValue) => ({
          ...combination,
          [memberFieldKey]: memberFieldValue,
        })),
      ),
    [{}],
  );
