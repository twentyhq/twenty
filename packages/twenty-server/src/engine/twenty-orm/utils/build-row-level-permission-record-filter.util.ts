/* @license Enterprise */

import {
  RecordFilterGroupLogicalOperator,
  RowLevelPermissionPredicateGroupLogicalOperator,
  type CompositeFieldSubFieldName,
  type RecordGqlOperationFilter,
  type RowLevelPermissionPredicateValue,
} from 'twenty-shared/types';
import {
  computeRecordGqlOperationFilter,
  convertViewFilterValueToString,
  getFilterTypeFromFieldType,
  isDefined,
  type RecordFilter,
  type RecordFilterGroup,
} from 'twenty-shared/utils';

import { type UserWorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import {
  PermissionsException,
  PermissionsExceptionCode,
} from 'src/engine/metadata-modules/permissions/permissions.exception';
import { type FlatRowLevelPermissionPredicateGroupMaps } from 'src/engine/metadata-modules/row-level-permission-predicate/types/flat-row-level-permission-predicate-group-maps.type';
import { type FlatRowLevelPermissionPredicateMaps } from 'src/engine/metadata-modules/row-level-permission-predicate/types/flat-row-level-permission-predicate-maps.type';
import { type FlatRowLevelPermissionPredicate } from 'src/engine/metadata-modules/row-level-permission-predicate/types/flat-row-level-permission-predicate.type';
import { UNSATISFIABLE_RECORD_FILTER } from 'src/engine/twenty-orm/constants/unsatisfiable-record-filter.constant';
import { resolveWorkspaceMemberPredicateValue } from 'src/engine/twenty-orm/utils/resolve-workspace-member-predicate-value.util';
import { validatePredicateValueCompatibility } from 'src/engine/twenty-orm/utils/validate-predicate-value-compatibility.util';

type BuildRecordFilterForRoleArgs = {
  flatRowLevelPermissionPredicateMaps: FlatRowLevelPermissionPredicateMaps;
  flatRowLevelPermissionPredicateGroupMaps: FlatRowLevelPermissionPredicateGroupMaps;
  flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>;
  objectMetadata: FlatObjectMetadata;
  roleId: string;
  workspaceMember?: UserWorkspaceAuthContext['workspaceMember'];
};

const resolveWorkspaceMemberBoundPredicateValue = ({
  predicate,
  workspaceMemberFieldMetadataId,
  targetFieldMetadata,
  flatFieldMetadataMaps,
  workspaceMember,
}: {
  predicate: FlatRowLevelPermissionPredicate;
  workspaceMemberFieldMetadataId: string;
  targetFieldMetadata: OrmFlatFieldMetadata;
  flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>;
  workspaceMember: UserWorkspaceAuthContext['workspaceMember'] | undefined;
}): RowLevelPermissionPredicateValue | null => {
  const workspaceMemberFieldMetadata = findFlatEntityByIdInFlatEntityMaps({
    flatEntityId: workspaceMemberFieldMetadataId,
    flatEntityMaps: flatFieldMetadataMaps,
  });

  if (!isDefined(workspaceMemberFieldMetadata)) {
    throw new PermissionsException(
      `Workspace member field metadata not found for row level predicate ${predicate.id}`,
      PermissionsExceptionCode.FIELD_METADATA_NOT_FOUND,
    );
  }

  if (!isDefined(workspaceMember)) {
    return null;
  }

  const resolvedWorkspaceMemberValue = resolveWorkspaceMemberPredicateValue({
    workspaceMember,
    workspaceMemberFieldMetadata,
    workspaceMemberSubFieldName: predicate.workspaceMemberSubFieldName,
  });

  if (!isDefined(resolvedWorkspaceMemberValue)) {
    return null;
  }

  const isPredicateValueCompatible = validatePredicateValueCompatibility({
    workspaceMemberFieldMetadata,
    targetFieldMetadata,
    predicateValue: resolvedWorkspaceMemberValue,
  });

  return isPredicateValueCompatible ? resolvedWorkspaceMemberValue : null;
};

const buildRecordFilterForRole = ({
  flatRowLevelPermissionPredicateMaps,
  flatRowLevelPermissionPredicateGroupMaps,
  flatFieldMetadataMaps,
  objectMetadata,
  roleId,
  workspaceMember,
}: BuildRecordFilterForRoleArgs): RecordGqlOperationFilter | null => {
  const predicates = Object.values(
    flatRowLevelPermissionPredicateMaps.byUniversalIdentifier,
  )
    .filter(isDefined)
    .filter(
      (predicate) =>
        predicate.roleId === roleId &&
        predicate.objectMetadataId === objectMetadata.id &&
        !isDefined(predicate.deletedAt),
    );

  if (predicates.length === 0) {
    return null;
  }

  const recordFilters: RecordFilter[] = [];

  for (const predicate of predicates) {
    const fieldMetadata = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: predicate.fieldMetadataId,
      flatEntityMaps: flatFieldMetadataMaps,
    });

    if (!isDefined(fieldMetadata)) {
      throw new PermissionsException(
        `Field metadata not found for row level predicate ${predicate.id}`,
        PermissionsExceptionCode.FIELD_METADATA_NOT_FOUND,
      );
    }

    const workspaceMemberFieldMetadataId =
      predicate.workspaceMemberFieldMetadataId;
    let predicateValue: RowLevelPermissionPredicateValue = predicate.value;

    if (isDefined(workspaceMemberFieldMetadataId)) {
      const workspaceMemberBoundValue =
        resolveWorkspaceMemberBoundPredicateValue({
          predicate,
          workspaceMemberFieldMetadataId,
          targetFieldMetadata: fieldMetadata,
          flatFieldMetadataMaps,
          workspaceMember,
        });

      // A predicate bound to a workspace member value the acting principal does
      // not carry (no member, unset field, incompatible value) cannot be
      // satisfied. Dropping it would lift the restriction instead of applying it.
      if (!isDefined(workspaceMemberBoundValue)) {
        return UNSATISFIABLE_RECORD_FILTER;
      }

      predicateValue = workspaceMemberBoundValue;
    }

    const effectiveSubFieldName = predicate.subFieldName as
      | CompositeFieldSubFieldName
      | undefined;

    recordFilters.push({
      id: predicate.id,
      fieldMetadataId: predicate.fieldMetadataId,
      value: convertViewFilterValueToString(predicateValue),
      type: getFilterTypeFromFieldType(fieldMetadata.type),
      operand: predicate.operand as unknown as RecordFilter['operand'],
      recordFilterGroupId: predicate.rowLevelPermissionPredicateGroupId,
      subFieldName: effectiveSubFieldName,
    });
  }

  const relevantGroupIds = new Set<string>();

  for (const predicate of predicates) {
    if (isDefined(predicate.rowLevelPermissionPredicateGroupId)) {
      relevantGroupIds.add(predicate.rowLevelPermissionPredicateGroupId);

      let parentGroupId = findFlatEntityByIdInFlatEntityMaps({
        flatEntityId: predicate.rowLevelPermissionPredicateGroupId,
        flatEntityMaps: flatRowLevelPermissionPredicateGroupMaps,
      })?.parentRowLevelPermissionPredicateGroupId;

      while (isDefined(parentGroupId) && !relevantGroupIds.has(parentGroupId)) {
        relevantGroupIds.add(parentGroupId);
        parentGroupId = findFlatEntityByIdInFlatEntityMaps({
          flatEntityId: parentGroupId,
          flatEntityMaps: flatRowLevelPermissionPredicateGroupMaps,
        })?.parentRowLevelPermissionPredicateGroupId;
      }
    }
  }

  const recordFilterGroups: RecordFilterGroup[] = [...relevantGroupIds]
    .map((groupId) =>
      findFlatEntityByIdInFlatEntityMaps({
        flatEntityId: groupId,
        flatEntityMaps: flatRowLevelPermissionPredicateGroupMaps,
      }),
    )
    .filter(isDefined)
    .filter(
      (predicateGroup) =>
        predicateGroup.roleId === roleId &&
        !isDefined(predicateGroup.deletedAt),
    )
    .map((predicateGroup) => ({
      id: predicateGroup.id,
      logicalOperator:
        predicateGroup.logicalOperator ===
        RowLevelPermissionPredicateGroupLogicalOperator.OR
          ? RecordFilterGroupLogicalOperator.OR
          : RecordFilterGroupLogicalOperator.AND,
      parentRecordFilterGroupId:
        predicateGroup.parentRowLevelPermissionPredicateGroupId,
    }));

  return computeRecordGqlOperationFilter({
    recordFilters,
    recordFilterGroups,
    fieldMetadataItems: Object.values(
      flatFieldMetadataMaps.byUniversalIdentifier,
    ).filter(isDefined),
    filterValueDependencies: {
      currentWorkspaceMemberId: workspaceMember?.id,
    },
  });
};

type BuildRowLevelPermissionRecordFilterArgs = Omit<
  BuildRecordFilterForRoleArgs,
  'roleId'
> & {
  roleIds: string[];
};

// Each role compiles on its own and the results are ANDed. Merging the raw
// predicates first would be wrong: compilation honours only the first
// parentless group, so one role's restrictions would vanish and widen access.
export const buildRowLevelPermissionRecordFilter = ({
  roleIds,
  ...buildRecordFilterForRoleArgs
}: BuildRowLevelPermissionRecordFilterArgs): RecordGqlOperationFilter | null => {
  const recordFilters = roleIds
    .map((roleId) =>
      buildRecordFilterForRole({ ...buildRecordFilterForRoleArgs, roleId }),
    )
    .filter(isDefined)
    .filter((recordFilter) => Object.keys(recordFilter).length > 0);

  if (recordFilters.length === 0) {
    return null;
  }

  if (recordFilters.length === 1) {
    return recordFilters[0];
  }

  return { and: recordFilters };
};
