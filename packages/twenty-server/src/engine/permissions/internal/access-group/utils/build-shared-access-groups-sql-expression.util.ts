/* @license Enterprise */

import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type RecordAccessGroupSQLConditionMetadataMaps } from 'src/engine/permissions/internal/access-group/types/record-access-group-sql-condition-metadata-maps.type';
import { type SharedPredicateWithValue } from 'src/engine/permissions/internal/access-group/utils/is-shared-predicate-with-value.util';
import { buildWorkspaceTableExpression } from 'src/engine/permissions/internal/record-permission-repository/utils/build-workspace-table-expression.util';
import { findRelationJoinColumnsOrThrow } from 'src/engine/permissions/internal/rls/utils/find-relation-join-columns-or-throw.util';
import { type SQLCondition } from 'src/engine/permissions/types/sql-condition.type';
import { computeObjectTargetTable } from 'src/engine/utils/compute-object-target-table.util';
import { escapeIdentifier } from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';

const VALUE_FIELD_METADATA_TYPES: FieldMetadataType[] = [
  FieldMetadataType.UUID,
  FieldMetadataType.TEXT,
];

// One condition per group would probe once per group and per record. Groups that differ only by the value of one
// column are read with a single lookup of that value instead, so the cost does not grow with the number of groups.
// undefined when the predicate is not a plain value of a column.
export const buildSharedAccessGroupsSQLExpression = ({
  sharedAccessGroups,
  flatObjectMetadata,
  tableAlias,
  metadataMaps,
  parameterSuffix,
}: {
  sharedAccessGroups: {
    compactId: number;
    sharedPredicate: SharedPredicateWithValue;
  }[];
  flatObjectMetadata: FlatObjectMetadata;
  tableAlias: string;
  metadataMaps: Pick<
    RecordAccessGroupSQLConditionMetadataMaps,
    'flatFieldMetadataMaps' | 'flatObjectMetadataMaps'
  >;
  parameterSuffix: string;
}): SQLCondition | undefined => {
  const [{ sharedPredicate }] = sharedAccessGroups;
  const valueFieldMetadata = findFlatEntityByIdInFlatEntityMaps({
    flatEntityId: sharedPredicate.fieldMetadataId,
    flatEntityMaps: metadataMaps.flatFieldMetadataMaps,
  });

  if (
    !isDefined(valueFieldMetadata) ||
    isDefined(sharedPredicate.subFieldName) ||
    !VALUE_FIELD_METADATA_TYPES.includes(valueFieldMetadata.type)
  ) {
    return undefined;
  }

  const valuesParameterName = `sharedAccessGroupValues_${parameterSuffix}`;
  const compactIdsParameterName = `sharedAccessGroupCompactIds_${parameterSuffix}`;
  const lookup = `unnest(CAST(:${valuesParameterName} AS text[]), CAST(:${compactIdsParameterName} AS integer[])) AS "sharedAccessGroup"("value", "compactId")`;
  const parameters = {
    [valuesParameterName]: sharedAccessGroups.map(
      ({ sharedPredicate: { value } }) => value,
    ),
    [compactIdsParameterName]: sharedAccessGroups.map(
      ({ compactId }) => compactId,
    ),
  };
  const quotedTableAlias = escapeIdentifier(tableAlias);
  const quotedValueColumn = escapeIdentifier(valueFieldMetadata.name);

  if (!isDefined(sharedPredicate.relationFieldMetadataId)) {
    return {
      sql: `ARRAY(SELECT DISTINCT "sharedAccessGroup"."compactId" FROM ${lookup} WHERE "sharedAccessGroup"."value" = CAST(${quotedTableAlias}.${quotedValueColumn} AS text) ORDER BY 1)`,
      parameters,
    };
  }

  const relationFieldMetadata = findFlatEntityByIdInFlatEntityMaps({
    flatEntityId: sharedPredicate.relationFieldMetadataId,
    flatEntityMaps: metadataMaps.flatFieldMetadataMaps,
  });
  const targetFlatObjectMetadata = findFlatEntityByIdInFlatEntityMaps({
    flatEntityId: valueFieldMetadata.objectMetadataId,
    flatEntityMaps: metadataMaps.flatObjectMetadataMaps,
  });

  if (
    !isDefined(relationFieldMetadata) ||
    !isDefined(targetFlatObjectMetadata)
  ) {
    return undefined;
  }

  const { sourceColumnName, targetColumnName } = findRelationJoinColumnsOrThrow(
    {
      relationFieldMetadata,
      flatFieldMetadataMaps: metadataMaps.flatFieldMetadataMaps,
    },
  );
  const targetTableExpression = buildWorkspaceTableExpression({
    workspaceId: flatObjectMetadata.workspaceId,
    tableName: computeObjectTargetTable(targetFlatObjectMetadata),
  });

  return {
    sql: `ARRAY(SELECT DISTINCT "sharedAccessGroup"."compactId" FROM ${targetTableExpression} AS "sharedAccessGroupSource" JOIN ${lookup} ON "sharedAccessGroup"."value" = CAST("sharedAccessGroupSource".${quotedValueColumn} AS text) WHERE "sharedAccessGroupSource".${escapeIdentifier(targetColumnName)} = ${quotedTableAlias}.${escapeIdentifier(sourceColumnName)} AND "sharedAccessGroupSource"."deletedAt" IS NULL ORDER BY 1)`,
    parameters,
  };
};
