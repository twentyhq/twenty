/* @license Enterprise */

import {
  FieldMetadataType,
  type RecordGqlOperationFilter,
  type RowLevelPermissionPredicate,
} from 'twenty-shared/types';
import { isDefined, isPlainObject } from 'twenty-shared/utils';

import { isCompositeFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/utils/is-composite-field-metadata-type.util';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { resolveFlatFieldMetadataOptions } from 'src/engine/metadata-modules/flat-field-metadata-option/utils/resolve-flat-field-metadata-options.util';
import { buildFieldMapsFromFlatObjectMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/build-field-maps-from-flat-object-metadata.util';
import { isMorphOrRelationFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-morph-or-relation-flat-field-metadata.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type AccessGroupValueLookupKey } from 'src/engine/permissions/internal/access-group/types/access-group-value-lookup-key.type';
import { type RecordAccessGroupSQLConditionMetadataMaps } from 'src/engine/permissions/internal/access-group/types/record-access-group-sql-condition-metadata-maps.type';
import { buildRecordFilterForRule } from 'src/engine/permissions/internal/rls/utils/build-rls-record-filter.util';
import { findRelationJoinColumnsOrThrow } from 'src/engine/permissions/internal/rls/utils/find-relation-join-columns-or-throw.util';
import { isRlsRelationHopEnabled } from 'src/engine/permissions/internal/rls/utils/is-rls-relation-hop-enabled.util';
import {
  PermissionsException,
  PermissionsExceptionCode,
} from 'src/engine/permissions/permissions.exception';
import { resolveFilterKeyFieldMetadata } from 'src/engine/record-filter/utils/resolve-filter-key-field-metadata.util';

const PROBE_UUID = '00000000-0000-4000-8000-00000000f00d';
const PROBE_TEXT = 'access-group-value-lookup-probe';

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

const resolveKeyFromProbeFilter = ({
  probeFilter,
  probeValue,
  memberFieldKey,
  flatObjectMetadata,
  metadataMaps,
}: {
  probeFilter: RecordGqlOperationFilter;
  probeValue: string;
  memberFieldKey: string | null;
  flatObjectMetadata: FlatObjectMetadata;
  metadataMaps: RecordAccessGroupSQLConditionMetadataMaps;
}): AccessGroupValueLookupKey | null => {
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

    if (!isDefined(columnName)) {
      return null;
    }

    return { memberFieldKey, columnName, relationHop: null };
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

  if (!isDefined(relationFieldMetadata.relationTargetObjectMetadataId)) {
    throw new PermissionsException(
      `Relation field ${relationFieldMetadata.id} has no target object`,
      PermissionsExceptionCode.RLS_PREDICATE_FIELD_NOT_FOUND,
    );
  }

  const targetFlatObjectMetadata = findFlatEntityByIdInFlatEntityMapsOrThrow({
    flatEntityId: relationFieldMetadata.relationTargetObjectMetadataId,
    flatEntityMaps: metadataMaps.flatObjectMetadataMaps,
  });
  const targetFilterKeys = Object.keys(filterValue);

  if (
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

export const resolveAccessGroupValueLookupKey = ({
  predicate,
  memberFieldKey,
  flatObjectMetadata,
  metadataMaps,
}: {
  predicate: RowLevelPermissionPredicate;
  memberFieldKey: string | null;
  flatObjectMetadata: FlatObjectMetadata;
  metadataMaps: RecordAccessGroupSQLConditionMetadataMaps;
}): AccessGroupValueLookupKey | null => {
  const probeValue = findProbeValue({ predicate, metadataMaps });

  if (!isDefined(probeValue)) {
    return null;
  }

  const probeFilter = buildRecordFilterForRule({
    rowLevelPermissionRule: {
      predicates: [
        {
          ...predicate,
          rowLevelPermissionPredicateGroupId: null,
          value: isDefined(memberFieldKey) ? predicate.value : [probeValue],
        },
      ],
      predicateGroups: [],
    },
    memberFieldValues: isDefined(memberFieldKey)
      ? { [memberFieldKey]: probeValue }
      : {},
    flatFieldMetadataMaps: metadataMaps.flatFieldMetadataMaps,
    flatFieldMetadataOptionMaps: metadataMaps.flatFieldMetadataOptionMaps,
    flatObjectMetadataMaps: metadataMaps.flatObjectMetadataMaps,
    isRelationHopEnabled: isRlsRelationHopEnabled(metadataMaps.featureFlagsMap),
  });

  if (!isDefined(probeFilter)) {
    return null;
  }

  return resolveKeyFromProbeFilter({
    probeFilter,
    probeValue,
    memberFieldKey,
    flatObjectMetadata,
    metadataMaps,
  });
};
