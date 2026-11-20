/* @license Enterprise */

import { isNonEmptyString } from '@sniptt/guards';
import {
  FieldMetadataType,
  type RecordGqlOperationFilter,
  type RowLevelPermissionPredicate,
  type RowLevelPermissionPredicateGroup,
  RowLevelPermissionPredicateGroupLogicalOperator,
  RowLevelPermissionPredicateOperand,
  type RowLevelRecordsPermissions,
} from 'twenty-shared/types';
import { isDefined, isPlainObject } from 'twenty-shared/utils';

import { isCompositeFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/utils/is-composite-field-metadata-type.util';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { resolveFlatFieldMetadataOptions } from 'src/engine/metadata-modules/flat-field-metadata-option/utils/resolve-flat-field-metadata-options.util';
import { buildFieldMapsFromFlatObjectMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/build-field-maps-from-flat-object-metadata.util';
import { isMorphOrRelationFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-morph-or-relation-flat-field-metadata.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import {
  type AccessGroupFamily,
  type AccessGroupFamilyKey,
} from 'src/engine/permissions/internal/access-group/types/access-group-family.type';
import { type RecordAccessGroupSQLConditionMetadataMaps } from 'src/engine/permissions/internal/access-group/types/record-access-group-sql-condition-metadata-maps.type';
import { buildMemberFieldKey } from 'src/engine/permissions/internal/rls/utils/build-member-field-key.util';
import { buildRecordFilterForRule } from 'src/engine/permissions/internal/rls/utils/build-rls-record-filter.util';
import { findRelationJoinColumnsOrThrow } from 'src/engine/permissions/internal/rls/utils/find-relation-join-columns-or-throw.util';
import { isRlsRelationHopEnabled } from 'src/engine/permissions/internal/rls/utils/is-rls-relation-hop-enabled.util';
import { resolveFilterKeyFieldMetadata } from 'src/engine/record-filter/utils/resolve-filter-key-field-metadata.util';

const PROBE_UUID = '00000000-0000-4000-8000-00000000f00d';
const PROBE_TEXT = 'access-group-family-probe';

const isAtRootConjunction = ({
  predicate,
  predicateGroups,
}: {
  predicate: Pick<
    RowLevelPermissionPredicate,
    'rowLevelPermissionPredicateGroupId'
  >;
  predicateGroups: Pick<
    RowLevelPermissionPredicateGroup,
    'id' | 'logicalOperator' | 'parentRowLevelPermissionPredicateGroupId'
  >[];
}): boolean => {
  let groupId = predicate.rowLevelPermissionPredicateGroupId ?? null;

  while (isDefined(groupId)) {
    const predicateGroup = predicateGroups.find(({ id }) => id === groupId);

    if (
      !isDefined(predicateGroup) ||
      predicateGroup.logicalOperator !==
        RowLevelPermissionPredicateGroupLogicalOperator.AND
    ) {
      return false;
    }

    groupId = predicateGroup.parentRowLevelPermissionPredicateGroupId ?? null;
  }

  return true;
};

const findProbeValue = ({
  predicate,
  metadataMaps,
}: {
  predicate: Pick<RowLevelPermissionPredicate, 'fieldMetadataId'>;
  metadataMaps: RecordAccessGroupSQLConditionMetadataMaps;
}): string | null => {
  const fieldMetadata = findFlatEntityByIdInFlatEntityMaps({
    flatEntityId: predicate.fieldMetadataId,
    flatEntityMaps: metadataMaps.flatFieldMetadataMaps,
  });

  switch (fieldMetadata?.type) {
    case FieldMetadataType.UUID:
    case FieldMetadataType.RELATION:
      return PROBE_UUID;
    case FieldMetadataType.TEXT:
      return PROBE_TEXT;
    case FieldMetadataType.SELECT:
      return (
        resolveFlatFieldMetadataOptions({
          flatFieldMetadata: fieldMetadata,
          flatFieldMetadataOptionMaps: metadataMaps.flatFieldMetadataOptionMaps,
        })?.[0]?.value ?? null
      );
    default:
      return null;
  }
};

const isEqualityToProbe = ({
  operatorFilter,
  probeValue,
}: {
  operatorFilter: unknown;
  probeValue: string;
}): boolean => {
  if (!isPlainObject(operatorFilter)) {
    return false;
  }

  const operators = Object.keys(operatorFilter);

  if (operators.length !== 1) {
    return false;
  }

  const operatorValue = operatorFilter[operators[0]];

  if (operators[0] === 'eq') {
    return operatorValue === probeValue;
  }

  return (
    operators[0] === 'in' &&
    Array.isArray(operatorValue) &&
    operatorValue.length === 1 &&
    operatorValue[0] === probeValue
  );
};

const findScalarColumnName = ({
  filterKey,
  flatObjectMetadata,
  metadataMaps,
}: {
  filterKey: string;
  flatObjectMetadata: FlatObjectMetadata;
  metadataMaps: RecordAccessGroupSQLConditionMetadataMaps;
}): string | null => {
  const { fieldMetadata, isReferencedByFieldName } =
    resolveFilterKeyFieldMetadata({
      filterKey,
      ...buildFieldMapsFromFlatObjectMetadata(
        metadataMaps.flatFieldMetadataMaps,
        flatObjectMetadata,
      ),
      flatFieldMetadataMaps: metadataMaps.flatFieldMetadataMaps,
    });

  if (
    !isDefined(fieldMetadata) ||
    isCompositeFieldMetadataType(fieldMetadata.type) ||
    (isReferencedByFieldName &&
      isMorphOrRelationFlatFieldMetadata(fieldMetadata))
  ) {
    return null;
  }

  return filterKey;
};

// The key's lookup is only equivalent to the rule when the predicate renders as one equality on a column
const resolveFamilyKeyFromProbeFilter = ({
  probeFilter,
  probeValue,
  memberFieldKey,
  flatObjectMetadata,
  metadataMaps,
}: {
  probeFilter: RecordGqlOperationFilter;
  probeValue: string;
  memberFieldKey: string;
  flatObjectMetadata: FlatObjectMetadata;
  metadataMaps: RecordAccessGroupSQLConditionMetadataMaps;
}): AccessGroupFamilyKey | null => {
  const filterEntries = Object.entries(probeFilter);

  if (filterEntries.length !== 1) {
    return null;
  }

  const [[filterKey, filterValue]] = filterEntries;

  if (isEqualityToProbe({ operatorFilter: filterValue, probeValue })) {
    const columnName = findScalarColumnName({
      filterKey,
      flatObjectMetadata,
      metadataMaps,
    });

    return isDefined(columnName)
      ? { memberFieldKey, columnName, relationHop: null }
      : null;
  }

  const { fieldMetadata: relationFieldMetadata, isReferencedByFieldName } =
    resolveFilterKeyFieldMetadata({
      filterKey,
      ...buildFieldMapsFromFlatObjectMetadata(
        metadataMaps.flatFieldMetadataMaps,
        flatObjectMetadata,
      ),
      flatFieldMetadataMaps: metadataMaps.flatFieldMetadataMaps,
    });

  if (
    !isDefined(relationFieldMetadata) ||
    !isReferencedByFieldName ||
    relationFieldMetadata.type !== FieldMetadataType.RELATION ||
    !isPlainObject(filterValue)
  ) {
    return null;
  }

  const targetFlatObjectMetadata = findFlatEntityByIdInFlatEntityMaps({
    flatEntityId: relationFieldMetadata.relationTargetObjectMetadataId ?? '',
    flatEntityMaps: metadataMaps.flatObjectMetadataMaps,
  });
  const targetFilterKeys = Object.keys(filterValue);

  if (
    !isDefined(targetFlatObjectMetadata) ||
    targetFilterKeys.length !== 1 ||
    !isEqualityToProbe({
      operatorFilter: filterValue[targetFilterKeys[0]],
      probeValue,
    })
  ) {
    return null;
  }

  const columnName = findScalarColumnName({
    filterKey: targetFilterKeys[0],
    flatObjectMetadata: targetFlatObjectMetadata,
    metadataMaps,
  });

  if (!isDefined(columnName)) {
    return null;
  }

  return {
    memberFieldKey,
    columnName,
    relationHop: {
      targetFlatObjectMetadata,
      ...findRelationJoinColumnsOrThrow({
        relationFieldMetadata,
        flatFieldMetadataMaps: metadataMaps.flatFieldMetadataMaps,
      }),
    },
  };
};

const findFamilyKey = ({
  predicate,
  rule,
  flatObjectMetadata,
  metadataMaps,
}: {
  predicate: RowLevelPermissionPredicate;
  rule: RowLevelRecordsPermissions;
  flatObjectMetadata: FlatObjectMetadata;
  metadataMaps: RecordAccessGroupSQLConditionMetadataMaps;
}): AccessGroupFamilyKey | null => {
  if (
    !isDefined(predicate.workspaceMemberFieldMetadataId) ||
    predicate.operand !== RowLevelPermissionPredicateOperand.IS ||
    !isAtRootConjunction({
      predicate,
      predicateGroups: rule.predicateGroups,
    })
  ) {
    return null;
  }

  const memberFieldKey = buildMemberFieldKey(predicate);
  const isOnlyPredicateReadingKey =
    rule.predicates.filter(
      (rulePredicate) =>
        isDefined(rulePredicate.workspaceMemberFieldMetadataId) &&
        buildMemberFieldKey(rulePredicate) === memberFieldKey,
    ).length === 1;
  const probeValue = findProbeValue({ predicate, metadataMaps });

  if (!isOnlyPredicateReadingKey || !isNonEmptyString(probeValue)) {
    return null;
  }

  const probeFilter = buildRecordFilterForRule({
    rowLevelPermissionRule: {
      predicates: [{ ...predicate, rowLevelPermissionPredicateGroupId: null }],
      predicateGroups: [],
    },
    memberFieldValues: { [memberFieldKey]: probeValue },
    flatFieldMetadataMaps: metadataMaps.flatFieldMetadataMaps,
    flatFieldMetadataOptionMaps: metadataMaps.flatFieldMetadataOptionMaps,
    flatObjectMetadataMaps: metadataMaps.flatObjectMetadataMaps,
    isRelationHopEnabled: isRlsRelationHopEnabled(metadataMaps.featureFlagsMap),
  });

  if (!isDefined(probeFilter)) {
    return null;
  }

  return resolveFamilyKeyFromProbeFilter({
    probeFilter,
    probeValue,
    memberFieldKey,
    flatObjectMetadata,
    metadataMaps,
  });
};

export const findAccessGroupFamilies = ({
  flatObjectMetadata,
  metadataMaps,
}: {
  flatObjectMetadata: FlatObjectMetadata;
  metadataMaps: RecordAccessGroupSQLConditionMetadataMaps;
}): AccessGroupFamily[] =>
  Object.entries(metadataMaps.rolesPermissions).flatMap(
    ([roleId, { objects }]) =>
      (
        objects[flatObjectMetadata.id]?.rowLevelRecordsPermissions ?? []
      ).flatMap((rule) => {
        const keyByPredicateId = new Map(
          rule.predicates.map((predicate) => [
            predicate.id,
            findFamilyKey({
              predicate,
              rule,
              flatObjectMetadata,
              metadataMaps,
            }),
          ]),
        );
        const keys = [...keyByPredicateId.values()].filter(isDefined);

        if (keys.length === 0) {
          return [];
        }

        return [
          {
            roleId,
            objectMetadataId: flatObjectMetadata.id,
            ruleId: rule.ruleId,
            keys,
            residualRule: {
              predicates: rule.predicates.filter(
                ({ id }) => !isDefined(keyByPredicateId.get(id)),
              ),
              predicateGroups: rule.predicateGroups,
            },
          },
        ];
      }),
  );
