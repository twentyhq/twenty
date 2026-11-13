/* @license Enterprise */

import { isNonEmptyArray, isString } from '@sniptt/guards';
import {
  FieldMetadataType,
  RowLevelPermissionPredicateGroupLogicalOperator,
  type CompositeFieldSubFieldName,
  type RecordGqlOperationFilter,
  type RowLevelPermissionPredicate,
  type RowLevelPermissionPredicateGroup,
  type RowLevelPermissionPredicateValue,
  type RowLevelRecordsPermissions,
} from 'twenty-shared/types';
import {
  convertViewFilterValueToString,
  getFilterOperandsForFilterableFieldType,
  getFilterTypeFromFieldType,
  getFilterValueValidationIssue,
  isDefined,
  isFilterValueExpectedAsArray,
  isRecordFilterOperandExpectingValue,
  isRecordFilterValueValid,
  isWorkspaceMemberFieldCompatibleWithRlsPredicate,
  mapRLSOperandToRecordFilterOperand,
} from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import {
  type FlatFieldMetadataOptionMapsForOptions,
  resolveFlatFieldMetadataOptions,
} from 'src/engine/metadata-modules/flat-field-metadata-option/utils/resolve-flat-field-metadata-options.util';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { UNSATISFIABLE_RECORD_FILTER } from 'src/engine/permissions/internal/rls/constants/unsatisfiable-record-filter.constant';
import { type RlsMemberFieldValues } from 'src/engine/permissions/internal/rls/types/rls-member-field-values.type';
import { buildMemberFieldKey } from 'src/engine/permissions/internal/rls/utils/build-member-field-key.util';
import {
  PermissionsException,
  PermissionsExceptionCode,
} from 'src/engine/permissions/permissions.exception';
import { computeRecordGqlOperationFilterFromFlatMaps } from 'src/engine/utils/compute-record-gql-operation-filter-from-flat-maps.util';

export type RlsRule = Pick<
  RowLevelRecordsPermissions,
  'predicates' | 'predicateGroups'
>;

type BuildRecordFilterForRuleArgs = {
  rowLevelPermissionRule: RlsRule | null | undefined;
  memberFieldValues: RlsMemberFieldValues;
  currentWorkspaceMemberId?: string;
  flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>;
  flatFieldMetadataOptionMaps: FlatFieldMetadataOptionMapsForOptions;
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  isRelationHopEnabled: boolean;
};

const ENUM_FIELD_TYPES: FieldMetadataType[] = [
  FieldMetadataType.SELECT,
  FieldMetadataType.MULTI_SELECT,
];

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

// A select column rejects values that are not one of its options
const keepTargetFieldOptions = ({
  value,
  targetFieldMetadata,
  flatFieldMetadataOptionMaps,
}: {
  value: RowLevelPermissionPredicateValue;
  targetFieldMetadata: OrmFlatFieldMetadata;
  flatFieldMetadataOptionMaps: FlatFieldMetadataOptionMapsForOptions;
}): RowLevelPermissionPredicateValue => {
  const optionValues = new Set(
    (
      resolveFlatFieldMetadataOptions({
        flatFieldMetadata: targetFieldMetadata,
        flatFieldMetadataOptionMaps,
      }) ?? []
    ).map((option) => option.value),
  );

  if (
    !ENUM_FIELD_TYPES.includes(targetFieldMetadata.type) ||
    optionValues.size === 0
  ) {
    return value;
  }

  if (!Array.isArray(value)) {
    return optionValues.has(String(value)) ? value : null;
  }

  const keptValues = value.filter((item) => optionValues.has(String(item)));

  return isNonEmptyArray(keptValues) ? keptValues : null;
};

const buildPredicateRecordFilter = ({
  predicate,
  memberFieldValues,
  currentWorkspaceMemberId,
  flatFieldMetadataMaps,
  flatFieldMetadataOptionMaps,
  flatObjectMetadataMaps,
  isRelationHopEnabled,
}: Omit<BuildRecordFilterForRuleArgs, 'rowLevelPermissionRule'> & {
  predicate: RowLevelPermissionPredicate;
}): RecordGqlOperationFilter | undefined => {
  const fieldMetadata = findFieldMetadataOrThrow({
    fieldMetadataId: predicate.fieldMetadataId,
    predicateId: predicate.id,
    flatFieldMetadataMaps,
    errorMessage: 'Field metadata not found',
  });
  const subFieldName = predicate.subFieldName as
    | CompositeFieldSubFieldName
    | undefined;
  const operand = mapRLSOperandToRecordFilterOperand(predicate.operand);
  const filterType = getFilterTypeFromFieldType(fieldMetadata.type);
  const allowedOperands = getFilterOperandsForFilterableFieldType({
    filterType,
    subFieldName,
  });

  if (!allowedOperands.includes(operand)) {
    throw new PermissionsException(
      `Operand ${operand} is not supported for field ${fieldMetadata.name} of type ${fieldMetadata.type} in row-level permission predicate ${predicate.id}`,
      PermissionsExceptionCode.INVALID_ARG,
    );
  }

  if (isDefined(predicate.relationFieldMetadataId) && !isRelationHopEnabled) {
    return UNSATISFIABLE_RECORD_FILTER;
  }

  let predicateValue = predicate.value;
  const workspaceMemberFieldMetadata = isDefined(
    predicate.workspaceMemberFieldMetadataId,
  )
    ? findFieldMetadataOrThrow({
        fieldMetadataId: predicate.workspaceMemberFieldMetadataId,
        predicateId: predicate.id,
        flatFieldMetadataMaps,
        errorMessage: 'Workspace member field metadata not found',
      })
    : undefined;

  if (isDefined(workspaceMemberFieldMetadata)) {
    predicateValue = keepTargetFieldOptions({
      value: memberFieldValues[buildMemberFieldKey(predicate)] ?? null,
      targetFieldMetadata: fieldMetadata,
      flatFieldMetadataOptionMaps,
    });

    // Without the member's value the predicate matches nothing rather than being dropped
    if (
      !isDefined(predicateValue) ||
      (Array.isArray(predicateValue) && !isNonEmptyArray(predicateValue))
    ) {
      return UNSATISFIABLE_RECORD_FILTER;
    }
  }

  const buildValueRecordFilter = (
    value: RowLevelPermissionPredicateValue,
  ): RecordGqlOperationFilter | undefined => {
    const recordFilter = computeRecordGqlOperationFilterFromFlatMaps({
      recordFilters: [
        {
          fieldMetadataId:
            predicate.relationFieldMetadataId ?? predicate.fieldMetadataId,
          relationTargetFieldMetadataId: isDefined(
            predicate.relationFieldMetadataId,
          )
            ? predicate.fieldMetadataId
            : undefined,
          value: convertViewFilterValueToString(value),
          operand,
          subFieldName,
        },
      ],
      recordFilterGroups: [],
      flatFieldMetadataMaps,
      flatObjectMetadataMaps,
      filterValueDependencies: { currentWorkspaceMemberId },
    });

    return Object.keys(recordFilter).length > 0 ? recordFilter : undefined;
  };

  if (!isDefined(workspaceMemberFieldMetadata)) {
    return buildValueRecordFilter(predicateValue);
  }

  if (!isRecordFilterOperandExpectingValue(operand)) {
    return buildValueRecordFilter(predicateValue);
  }

  if (
    !isWorkspaceMemberFieldCompatibleWithRlsPredicate({
      fieldType: fieldMetadata.type,
      subFieldName,
      workspaceMemberFieldType: workspaceMemberFieldMetadata.type,
      workspaceMemberSubFieldName: predicate.workspaceMemberSubFieldName,
    })
  ) {
    return UNSATISFIABLE_RECORD_FILTER;
  }

  if (isFilterValueExpectedAsArray({ filterType, operand, subFieldName })) {
    return buildValueRecordFilter(
      isString(predicateValue) ? [predicateValue] : predicateValue,
    );
  }

  // A member value the filter would drop or misread must not widen the rule
  if (
    !isRecordFilterValueValid({
      operand,
      value: convertViewFilterValueToString(predicateValue),
    }) ||
    isDefined(
      getFilterValueValidationIssue({
        fieldType: fieldMetadata.type,
        operand,
        subFieldName,
        value: predicateValue,
      }),
    )
  ) {
    return UNSATISFIABLE_RECORD_FILTER;
  }

  return buildValueRecordFilter(predicateValue);
};

const combineRecordFilters = (
  recordFilters: RecordGqlOperationFilter[],
): RecordGqlOperationFilter => {
  if (recordFilters.length === 1) {
    return recordFilters[0];
  }

  return recordFilters.length === 0 ? {} : { and: recordFilters };
};

export const buildRecordFilterForRule = ({
  rowLevelPermissionRule,
  ...buildPredicateRecordFilterArgs
}: BuildRecordFilterForRuleArgs): RecordGqlOperationFilter | null => {
  if (
    !isDefined(rowLevelPermissionRule) ||
    rowLevelPermissionRule.predicates.length === 0
  ) {
    return null;
  }

  const { predicates, predicateGroups } = rowLevelPermissionRule;
  const recordFilterByPredicateId = new Map(
    predicates.map((predicate) => [
      predicate.id,
      buildPredicateRecordFilter({
        ...buildPredicateRecordFilterArgs,
        predicate,
      }),
    ]),
  );
  const findGroupRecordFilters = (
    groupId: string | null,
  ): RecordGqlOperationFilter[] =>
    predicates
      .filter(
        ({ rowLevelPermissionPredicateGroupId }) =>
          (rowLevelPermissionPredicateGroupId ?? null) === groupId,
      )
      .map(({ id }) => recordFilterByPredicateId.get(id))
      .filter(isDefined);

  const buildGroupRecordFilter = (
    predicateGroup: RowLevelPermissionPredicateGroup,
  ): RecordGqlOperationFilter | undefined => {
    const recordFilters = [
      ...findGroupRecordFilters(predicateGroup.id),
      ...predicateGroups
        .filter(
          ({ parentRowLevelPermissionPredicateGroupId }) =>
            parentRowLevelPermissionPredicateGroupId === predicateGroup.id,
        )
        .map(buildGroupRecordFilter)
        .filter(isDefined),
    ];

    if (recordFilters.length === 0) {
      return undefined;
    }

    return predicateGroup.logicalOperator ===
      RowLevelPermissionPredicateGroupLogicalOperator.OR
      ? { or: recordFilters }
      : { and: recordFilters };
  };

  return combineRecordFilters(
    [
      ...findGroupRecordFilters(null),
      ...predicateGroups
        .filter(
          ({ parentRowLevelPermissionPredicateGroupId }) =>
            !isDefined(parentRowLevelPermissionPredicateGroupId),
        )
        .map(buildGroupRecordFilter),
    ].filter(isDefined),
  );
};

export const buildRlsRecordFilter = ({
  rowLevelPermissionRules,
  ...buildRecordFilterForRuleArgs
}: Omit<BuildRecordFilterForRuleArgs, 'rowLevelPermissionRule'> & {
  rowLevelPermissionRules: RlsRule[];
}): RecordGqlOperationFilter => {
  const recordFilters = rowLevelPermissionRules
    .map((rowLevelPermissionRule) =>
      buildRecordFilterForRule({
        ...buildRecordFilterForRuleArgs,
        rowLevelPermissionRule,
      }),
    )
    .filter(isDefined);

  if (recordFilters.length === 0) {
    return UNSATISFIABLE_RECORD_FILTER;
  }

  return recordFilters.length === 1 ? recordFilters[0] : { or: recordFilters };
};
