/* @license Enterprise */

import {
  RecordFilterGroupLogicalOperator,
  RowLevelPermissionPredicateGroupLogicalOperator,
  type CompositeFieldSubFieldName,
  type RecordGqlOperationFilter,
  type RowLevelPermissionPredicate,
  type RowLevelPermissionPredicateValue,
  type RowLevelRecordsPermissions,
} from 'twenty-shared/types';
import {
  convertViewFilterValueToString,
  getFilterOperandsForFilterableFieldType,
  getFilterTypeFromFieldType,
  isDefined,
  mapRLSOperandToRecordFilterOperand,
  type RecordFilter,
} from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { UNSATISFIABLE_RECORD_FILTER } from 'src/engine/permissions/internal/rls/constants/unsatisfiable-record-filter.constant';
import { type RowLevelPermissionMemberFieldValues } from 'src/engine/permissions/internal/rls/types/row-level-permission-member-field-values.type';
import { pruneUnsatisfiableRecordFilters } from 'src/engine/permissions/internal/rls/utils/prune-unsatisfiable-record-filters.util';
import { resolveMemberFieldValuesPredicateValue } from 'src/engine/permissions/internal/rls/utils/resolve-member-field-values-predicate-value.util';
import { validatePredicateValueCompatibility } from 'src/engine/permissions/internal/rls/utils/validate-predicate-value-compatibility.util';
import {
  PermissionsException,
  PermissionsExceptionCode,
} from 'src/engine/permissions/permissions.exception';
import { computeRecordGqlOperationFilterFromFlatMaps } from 'src/engine/utils/compute-record-gql-operation-filter-from-flat-maps.util';

export type RowLevelPermissionRule = Pick<
  RowLevelRecordsPermissions,
  'predicates' | 'predicateGroups'
>;

type BuildRecordFilterForRoleArgs = {
  rowLevelPermissionRule: RowLevelPermissionRule | null | undefined;
  memberFieldValues: RowLevelPermissionMemberFieldValues;
  currentWorkspaceMemberId?: string;
  flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>;
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  isRelationHopEnabled: boolean;
};

const findFieldMetadataOrThrow = ({
  fieldMetadataId,
  predicateId,
  flatFieldMetadataMaps,
  errorMessage,
}: {
  fieldMetadataId: string;
  predicateId: string;
  flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>;
  errorMessage: string;
}): OrmFlatFieldMetadata => {
  const fieldMetadata = findFlatEntityByIdInFlatEntityMaps({
    flatEntityId: fieldMetadataId,
    flatEntityMaps: flatFieldMetadataMaps,
  });

  if (!isDefined(fieldMetadata)) {
    throw new PermissionsException(
      `${errorMessage} for row level predicate ${predicateId}`,
      PermissionsExceptionCode.FIELD_METADATA_NOT_FOUND,
    );
  }

  return fieldMetadata;
};

// null when the member does not carry a value that fits the target field
const resolveMemberBoundPredicateValue = ({
  predicate,
  targetFieldMetadata,
  memberFieldValues,
  flatFieldMetadataMaps,
}: {
  predicate: RowLevelPermissionPredicate & {
    workspaceMemberFieldMetadataId: string;
  };
  targetFieldMetadata: OrmFlatFieldMetadata;
  memberFieldValues: RowLevelPermissionMemberFieldValues;
  flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>;
}): RowLevelPermissionPredicateValue | null => {
  const workspaceMemberFieldMetadata = findFieldMetadataOrThrow({
    fieldMetadataId: predicate.workspaceMemberFieldMetadataId,
    predicateId: predicate.id,
    flatFieldMetadataMaps,
    errorMessage: 'Workspace member field metadata not found',
  });
  const value = resolveMemberFieldValuesPredicateValue({
    memberFieldValues,
    predicate,
    workspaceMemberFieldMetadata,
  });

  if (!isDefined(value)) {
    return null;
  }

  return validatePredicateValueCompatibility({
    workspaceMemberFieldMetadata,
    targetFieldMetadata,
    predicateValue: value,
  })
    ? value
    : null;
};

export const buildRecordFilterForRole = ({
  rowLevelPermissionRule,
  memberFieldValues,
  currentWorkspaceMemberId,
  flatFieldMetadataMaps,
  flatObjectMetadataMaps,
  isRelationHopEnabled,
}: BuildRecordFilterForRoleArgs): RecordGqlOperationFilter | null => {
  if (
    !isDefined(rowLevelPermissionRule) ||
    rowLevelPermissionRule.predicates.length === 0
  ) {
    return null;
  }

  const recordFilters: RecordFilter[] = [];
  const unsatisfiableRecordFilterIds = new Set<string>();

  for (const predicate of rowLevelPermissionRule.predicates) {
    const fieldMetadata = findFieldMetadataOrThrow({
      fieldMetadataId: predicate.fieldMetadataId,
      predicateId: predicate.id,
      flatFieldMetadataMaps,
      errorMessage: 'Field metadata not found',
    });

    const relationFieldMetadataId = isRelationHopEnabled
      ? predicate.relationFieldMetadataId
      : undefined;

    // Dropping a predicate it cannot evaluate would lift the restriction, so it becomes a never-matching branch
    if (
      isDefined(predicate.relationFieldMetadataId) &&
      !isDefined(relationFieldMetadataId)
    ) {
      unsatisfiableRecordFilterIds.add(predicate.id);
    }

    const { workspaceMemberFieldMetadataId } = predicate;
    let predicateValue: RowLevelPermissionPredicateValue = predicate.value;

    if (isDefined(workspaceMemberFieldMetadataId)) {
      const memberBoundValue = resolveMemberBoundPredicateValue({
        predicate: { ...predicate, workspaceMemberFieldMetadataId },
        targetFieldMetadata: fieldMetadata,
        memberFieldValues,
        flatFieldMetadataMaps,
      });

      if (!isDefined(memberBoundValue)) {
        unsatisfiableRecordFilterIds.add(predicate.id);
      }

      predicateValue = memberBoundValue ?? predicate.value;
    }

    const subFieldName = predicate.subFieldName as
      | CompositeFieldSubFieldName
      | undefined;
    const operand = mapRLSOperandToRecordFilterOperand(predicate.operand);
    const allowedOperands = getFilterOperandsForFilterableFieldType({
      filterType: getFilterTypeFromFieldType(fieldMetadata.type),
      subFieldName,
    });

    if (!allowedOperands.includes(operand)) {
      throw new PermissionsException(
        `Operand ${operand} is not supported for field ${fieldMetadata.name} of type ${fieldMetadata.type} in row-level permission predicate ${predicate.id}`,
        PermissionsExceptionCode.INVALID_ARG,
      );
    }

    recordFilters.push({
      id: predicate.id,
      fieldMetadataId: relationFieldMetadataId ?? predicate.fieldMetadataId,
      relationTargetFieldMetadataId: isDefined(relationFieldMetadataId)
        ? predicate.fieldMetadataId
        : undefined,
      value: convertViewFilterValueToString(predicateValue),
      operand,
      recordFilterGroupId: predicate.rowLevelPermissionPredicateGroupId,
      subFieldName,
    });
  }

  const prunedRecordFilters = pruneUnsatisfiableRecordFilters({
    recordFilters,
    recordFilterGroups: rowLevelPermissionRule.predicateGroups.map(
      (predicateGroup) => ({
        id: predicateGroup.id,
        logicalOperator:
          predicateGroup.logicalOperator ===
          RowLevelPermissionPredicateGroupLogicalOperator.OR
            ? RecordFilterGroupLogicalOperator.OR
            : RecordFilterGroupLogicalOperator.AND,
        parentRecordFilterGroupId:
          predicateGroup.parentRowLevelPermissionPredicateGroupId,
      }),
    ),
    unsatisfiableRecordFilterIds,
  });

  if (!isDefined(prunedRecordFilters)) {
    return UNSATISFIABLE_RECORD_FILTER;
  }

  return computeRecordGqlOperationFilterFromFlatMaps({
    ...prunedRecordFilters,
    flatFieldMetadataMaps,
    flatObjectMetadataMaps,
    filterValueDependencies: { currentWorkspaceMemberId },
  });
};

// Roles compile separately, then AND: compilation honours only the first parentless group, so merging would widen access
export const buildRowLevelPermissionRecordFilter = ({
  rowLevelPermissionRules,
  ...buildRecordFilterForRoleArgs
}: Omit<BuildRecordFilterForRoleArgs, 'rowLevelPermissionRule'> & {
  rowLevelPermissionRules: (RowLevelPermissionRule | null | undefined)[];
}): RecordGqlOperationFilter | null => {
  const recordFilters = rowLevelPermissionRules
    .map((rowLevelPermissionRule) =>
      buildRecordFilterForRole({
        ...buildRecordFilterForRoleArgs,
        rowLevelPermissionRule,
      }),
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
