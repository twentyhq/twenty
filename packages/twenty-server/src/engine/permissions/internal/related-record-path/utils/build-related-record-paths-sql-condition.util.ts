/* @license Enterprise */

import { isDefined } from 'twenty-shared/utils';

import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { isMorphOrRelationFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-morph-or-relation-flat-field-metadata.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type FlatRelatedRecordPath } from 'src/engine/metadata-modules/flat-related-record-path/types/flat-related-record-path.type';
import { type PermissionsMetadataMaps } from 'src/engine/permissions/internal/combine/types/row-access-policy.type';
import { buildWorkspaceTableExpression } from 'src/engine/permissions/internal/record-permission-repository/utils/build-workspace-table-expression.util';
import { combineSQLConditions } from 'src/engine/permissions/internal/record-permission-repository/utils/combine-sql-conditions.util';
import { findRelationJoinColumnsOrThrow } from 'src/engine/permissions/internal/rls/utils/find-relation-join-columns-or-throw.util';
import { type SQLCondition } from 'src/engine/permissions/types/sql-condition.type';
import { computeObjectTargetTable } from 'src/engine/utils/compute-object-target-table.util';
import { escapeIdentifier } from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';

export type BuildEntrySQLCondition = (args: {
  flatObjectMetadata: FlatObjectMetadata;
  tableAlias: string;
}) => SQLCondition | boolean;

type RelatedRecordPathHop = {
  flatObjectMetadata: FlatObjectMetadata;
  sourceColumnName: string;
  targetColumnName: string;
};

type ResolvedRelatedRecordPath = {
  isInherent: boolean;
  sourceFlatObjectMetadata: FlatObjectMetadata;
  targetObjectMetadataId: string;
  hops: RelatedRecordPathHop[];
};

const resolveRelatedRecordPath = ({
  flatRelatedRecordPath,
  metadataMaps,
}: {
  flatRelatedRecordPath: FlatRelatedRecordPath;
  metadataMaps: PermissionsMetadataMaps;
}): ResolvedRelatedRecordPath | undefined => {
  const fieldMetadataIds = [
    flatRelatedRecordPath.firstFieldMetadataId,
    flatRelatedRecordPath.secondFieldMetadataId,
    flatRelatedRecordPath.thirdFieldMetadataId,
  ].filter(isDefined);
  const hops: RelatedRecordPathHop[] = [];
  let currentObjectMetadataId = flatRelatedRecordPath.objectMetadataId;

  for (const fieldMetadataId of fieldMetadataIds) {
    const flatFieldMetadata = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: fieldMetadataId,
      flatEntityMaps: metadataMaps.flatFieldMetadataMaps,
    });
    const flatObjectMetadata = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: currentObjectMetadataId,
      flatEntityMaps: metadataMaps.flatObjectMetadataMaps,
    });

    if (
      !isDefined(flatFieldMetadata) ||
      !isDefined(flatObjectMetadata) ||
      !flatFieldMetadata.isActive ||
      flatFieldMetadata.objectMetadataId !== currentObjectMetadataId ||
      !isMorphOrRelationFlatFieldMetadata(flatFieldMetadata) ||
      !isDefined(flatFieldMetadata.relationTargetObjectMetadataId)
    ) {
      return undefined;
    }

    hops.push({
      flatObjectMetadata,
      ...findRelationJoinColumnsOrThrow({
        relationFieldMetadata: flatFieldMetadata,
        flatFieldMetadataMaps: metadataMaps.flatFieldMetadataMaps,
      }),
    });
    currentObjectMetadataId = flatFieldMetadata.relationTargetObjectMetadataId;
  }

  return {
    isInherent: flatRelatedRecordPath.isInherent,
    sourceFlatObjectMetadata: hops[0].flatObjectMetadata,
    targetObjectMetadataId: currentObjectMetadataId,
    hops,
  };
};

const combineWithOr = (
  sqlConditions: (SQLCondition | boolean)[],
): SQLCondition | boolean => {
  if (sqlConditions.some((sqlCondition) => sqlCondition === true)) {
    return true;
  }

  const definedSQLConditions = sqlConditions.filter(
    (sqlCondition): sqlCondition is SQLCondition => sqlCondition !== false,
  );

  if (definedSQLConditions.length <= 1) {
    return definedSQLConditions[0] ?? false;
  }

  return combineSQLConditions({
    sqlConditions: definedSQLConditions,
    operator: 'OR',
  });
};

export const buildRelatedRecordPathsSQLCondition = ({
  workspaceId,
  flatObjectMetadata,
  tableAlias,
  metadataMaps,
  buildEntrySQLCondition,
  isObjectOperationDisabled,
}: {
  workspaceId: string;
  flatObjectMetadata: FlatObjectMetadata;
  tableAlias: string;
  metadataMaps: PermissionsMetadataMaps;
  buildEntrySQLCondition: BuildEntrySQLCondition;
  isObjectOperationDisabled: (
    flatObjectMetadata: FlatObjectMetadata,
  ) => boolean;
}): SQLCondition | boolean => {
  const incomingPathsByTargetObjectMetadataId = new Map<
    string,
    ResolvedRelatedRecordPath[]
  >();

  for (const flatRelatedRecordPath of Object.values(
    metadataMaps.flatRelatedRecordPathMaps?.byUniversalIdentifier ?? {},
  ).filter(isDefined)) {
    const resolvedPath = resolveRelatedRecordPath({
      flatRelatedRecordPath,
      metadataMaps,
    });

    if (isDefined(resolvedPath)) {
      incomingPathsByTargetObjectMetadataId.set(
        resolvedPath.targetObjectMetadataId,
        [
          ...(incomingPathsByTargetObjectMetadataId.get(
            resolvedPath.targetObjectMetadataId,
          ) ?? []),
          resolvedPath,
        ],
      );
    }
  }

  let tableAliasCount = 0;
  const buildNextTableAlias = () => `related_record_path_${tableAliasCount++}`;

  const buildPathSQLCondition = ({
    resolvedPath,
    targetTableAlias,
    visitedObjectMetadataIds,
  }: {
    resolvedPath: ResolvedRelatedRecordPath;
    targetTableAlias: string;
    visitedObjectMetadataIds: Set<string>;
  }): SQLCondition | boolean => {
    const hopTableAliases = resolvedPath.hops.map(buildNextTableAlias);
    const sourceTableAlias = hopTableAliases[0];
    const sourceSQLCondition = resolvedPath.isInherent
      ? buildReadableSQLCondition({
          flatObjectMetadata: resolvedPath.sourceFlatObjectMetadata,
          tableAlias: sourceTableAlias,
          visitedObjectMetadataIds,
        })
      : buildEntrySQLCondition({
          flatObjectMetadata: resolvedPath.sourceFlatObjectMetadata,
          tableAlias: sourceTableAlias,
        });

    if (sourceSQLCondition === false) {
      return false;
    }

    const nextTableAliases = [...hopTableAliases.slice(1), targetTableAlias];
    const fromExpressions = resolvedPath.hops.map(
      (hop, index) =>
        `${buildWorkspaceTableExpression({
          workspaceId,
          tableName: computeObjectTargetTable(hop.flatObjectMetadata),
        })} AS ${escapeIdentifier(hopTableAliases[index])}`,
    );
    const whereConditions = resolvedPath.hops.flatMap((hop, index) => [
      `${escapeIdentifier(nextTableAliases[index])}.${escapeIdentifier(hop.targetColumnName)} = ${escapeIdentifier(hopTableAliases[index])}.${escapeIdentifier(hop.sourceColumnName)}`,
      `${escapeIdentifier(hopTableAliases[index])}."deletedAt" IS NULL`,
    ]);

    if (sourceSQLCondition !== true) {
      whereConditions.push(`(${sourceSQLCondition.sql})`);
    }

    return {
      sql: `EXISTS (SELECT 1 FROM ${fromExpressions.join(', ')} WHERE ${whereConditions.join(' AND ')})`,
      parameters:
        sourceSQLCondition === true ? {} : sourceSQLCondition.parameters,
    };
  };

  const buildReadableSQLCondition = ({
    flatObjectMetadata,
    tableAlias,
    visitedObjectMetadataIds,
  }: {
    flatObjectMetadata: FlatObjectMetadata;
    tableAlias: string;
    visitedObjectMetadataIds: Set<string>;
  }): SQLCondition | boolean => {
    const entrySQLCondition = buildEntrySQLCondition({
      flatObjectMetadata,
      tableAlias,
    });

    if (
      entrySQLCondition === true ||
      visitedObjectMetadataIds.has(flatObjectMetadata.id) ||
      isObjectOperationDisabled(flatObjectMetadata)
    ) {
      return entrySQLCondition;
    }

    const nextVisitedObjectMetadataIds = new Set([
      ...visitedObjectMetadataIds,
      flatObjectMetadata.id,
    ]);

    return combineWithOr([
      entrySQLCondition,
      ...(
        incomingPathsByTargetObjectMetadataId.get(flatObjectMetadata.id) ?? []
      ).map((resolvedPath) =>
        buildPathSQLCondition({
          resolvedPath,
          targetTableAlias: tableAlias,
          visitedObjectMetadataIds: nextVisitedObjectMetadataIds,
        }),
      ),
    ]);
  };

  return buildReadableSQLCondition({
    flatObjectMetadata,
    tableAlias,
    visitedObjectMetadataIds: new Set(),
  });
};
