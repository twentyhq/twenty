/* @license Enterprise */

import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { areRecordAccessGroupsEnabled } from 'src/engine/permissions/internal/access-group/utils/are-record-access-groups-enabled.util';
import { findRelatedRecordPathsFeedingAccessGroups } from 'src/engine/permissions/internal/access-group/utils/find-related-record-paths-feeding-access-groups.util';
import { type PermissionsMetadataMaps } from 'src/engine/permissions/internal/combine/types/row-access-policy.type';
import { buildRecordPrivacySQLCondition } from 'src/engine/permissions/internal/private-record/utils/build-record-privacy-sql-condition.util';
import { buildRelatedRecordPathHopsJoin } from 'src/engine/permissions/internal/record-permission-repository/utils/build-related-record-path-hops-join.util';
import { combineSQLConditions } from 'src/engine/permissions/internal/record-permission-repository/utils/combine-sql-conditions.util';
import { type ResolvedRelatedRecordPath } from 'src/engine/permissions/internal/related-record-path/types/resolved-related-record-path.type';
import { resolveRelatedRecordPaths } from 'src/engine/permissions/internal/related-record-path/utils/resolve-related-record-paths.util';
import { type SQLCondition } from 'src/engine/permissions/types/sql-condition.type';
import { escapeIdentifier } from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';

export type BuildEntrySQLCondition = (args: {
  flatObjectMetadata: FlatObjectMetadata;
  tableAlias: string;
}) => SQLCondition | boolean;

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
  isRecordPrivacyApplicable,
}: {
  workspaceId: string;
  flatObjectMetadata: FlatObjectMetadata;
  tableAlias: string;
  metadataMaps: PermissionsMetadataMaps;
  buildEntrySQLCondition: BuildEntrySQLCondition;
  isObjectOperationDisabled: (
    flatObjectMetadata: FlatObjectMetadata,
  ) => boolean;
  isRecordPrivacyApplicable: (
    flatObjectMetadata: FlatObjectMetadata,
  ) => boolean;
}): SQLCondition | boolean => {
  const resolvedRelatedRecordPaths = areRecordAccessGroupsEnabled({
    featureFlagsMap: metadataMaps.featureFlagsMap,
  })
    ? resolveRelatedRecordPaths(metadataMaps)
    : [];

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

    const { fromExpressions, joinConditions } = buildRelatedRecordPathHopsJoin({
      workspaceId,
      hops: resolvedPath.hops,
      hopTableAliases,
      targetTableAlias,
    });
    const whereConditions = hopTableAliases.flatMap((hopTableAlias, index) => [
      joinConditions[index],
      `${escapeIdentifier(hopTableAlias)}."deletedAt" IS NULL`,
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

    const pathsSQLCondition = combineWithOr(
      findRelatedRecordPathsFeedingAccessGroups({
        rolesPermissions: metadataMaps.rolesPermissions,
        resolvedRelatedRecordPaths,
        objectMetadataId: flatObjectMetadata.id,
      }).map((resolvedPath) =>
        buildPathSQLCondition({
          resolvedPath,
          targetTableAlias: tableAlias,
          visitedObjectMetadataIds: nextVisitedObjectMetadataIds,
        }),
      ),
    );

    return combineWithOr([
      entrySQLCondition,
      typeof pathsSQLCondition !== 'boolean' &&
      isRecordPrivacyApplicable(flatObjectMetadata)
        ? combineSQLConditions({
            sqlConditions: [
              pathsSQLCondition,
              buildRecordPrivacySQLCondition({ tableAlias, isPrivate: false }),
            ],
          })
        : pathsSQLCondition,
    ]);
  };

  return buildReadableSQLCondition({
    flatObjectMetadata,
    tableAlias,
    visitedObjectMetadataIds: new Set(),
  });
};
