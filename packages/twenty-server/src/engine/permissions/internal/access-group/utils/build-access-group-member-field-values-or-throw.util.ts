/* @license Enterprise */

import {
  type RowLevelPermissionPredicate,
  RowLevelPermissionPredicateOperand,
  type RowLevelPermissionPredicateValue,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import {
  PermissionsException,
  PermissionsExceptionCode,
} from 'src/engine/permissions/permissions.exception';
import { type RowLevelPermissionWorkspaceMember } from 'src/engine/permissions/internal/rls/types/row-level-permission-workspace-member.type';
import { type RowLevelPermissionMemberFieldValues } from 'src/engine/permissions/internal/rls/types/row-level-permission-member-field-values.type';
import { buildMemberFieldKey } from 'src/engine/permissions/internal/rls/utils/build-member-field-key.util';
import { resolveWorkspaceMemberPredicateValue } from 'src/engine/permissions/internal/rls/utils/resolve-workspace-member-predicate-value.util';

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

const resolveMemberFieldValuesOrThrow = ({
  predicate,
  workspaceMember,
  flatFieldMetadataMaps,
  canSplit,
}: {
  predicate: RowLevelPermissionPredicate;
  workspaceMember: RowLevelPermissionWorkspaceMember;
  flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>;
  canSplit: boolean;
}): RowLevelPermissionPredicateValue[] => {
  const workspaceMemberFieldMetadata = findFlatEntityByIdInFlatEntityMaps({
    flatEntityId: predicate.workspaceMemberFieldMetadataId ?? '',
    flatEntityMaps: flatFieldMetadataMaps,
  });

  if (!isDefined(workspaceMemberFieldMetadata)) {
    throw new PermissionsException(
      `Workspace member field metadata not found for row level predicate ${predicate.id}`,
      PermissionsExceptionCode.FIELD_METADATA_NOT_FOUND,
    );
  }

  const value = resolveWorkspaceMemberPredicateValue({
    workspaceMember,
    workspaceMemberFieldMetadata,
    workspaceMemberSubFieldName: predicate.workspaceMemberSubFieldName ?? null,
  });

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
}): RowLevelPermissionMemberFieldValues[] => {
  let combinations: RowLevelPermissionMemberFieldValues[] = [{}];

  for (const predicate of workspaceMemberBoundPredicates) {
    const memberFieldKey = buildMemberFieldKey(predicate);

    if (memberFieldKey in combinations[0]) {
      continue;
    }

    const memberFieldValues = resolveMemberFieldValuesOrThrow({
      predicate,
      workspaceMember,
      flatFieldMetadataMaps,
      canSplit: canSplitMemberFieldValues({
        memberFieldKey,
        workspaceMemberBoundPredicates,
      }),
    });

    combinations = combinations.flatMap((combination) =>
      memberFieldValues.map((memberFieldValue) => ({
        ...combination,
        [memberFieldKey]: memberFieldValue,
      })),
    );
  }

  return combinations;
};
