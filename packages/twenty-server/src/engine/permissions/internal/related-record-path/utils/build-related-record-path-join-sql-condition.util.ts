/* @license Enterprise */

import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { isAccessGroupsEnabled } from 'src/engine/permissions/internal/access-group/utils/is-access-groups-enabled.util';
import { findRelatedRecordPathsFeedingAccessGroups } from 'src/engine/permissions/internal/access-group/utils/find-related-record-paths-feeding-access-groups.util';
import { type PermissionsMetadataMaps } from 'src/engine/permissions/internal/combine/types/permissions-access-request.type';
import { buildPrivateRecordStateSQLCondition } from 'src/engine/permissions/internal/private-record/utils/build-private-record-state-sql-condition.util';
import { buildRelatedRecordPathHopsJoin } from 'src/engine/permissions/internal/record-permission-repository/utils/build-related-record-path-hops-join.util';
import { combineSQLConditionOutcomesWithOr } from 'src/engine/permissions/internal/record-permission-repository/utils/combine-sql-condition-outcomes-with-or.util';
import { combineSQLConditions } from 'src/engine/permissions/internal/record-permission-repository/utils/combine-sql-conditions.util';
import { type ResolvedRelatedRecordPath } from 'src/engine/permissions/internal/related-record-path/types/resolved-related-record-path.type';
import { resolveRelatedRecordPaths } from 'src/engine/permissions/internal/related-record-path/utils/resolve-related-record-paths.util';
import { type SQLCondition } from 'src/engine/permissions/types/sql-condition.type';
import { escapeIdentifier } from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';

export type BuildEntrySQLCondition = (args: {
  flatObjectMetadata: FlatObjectMetadata;
  tableAlias: string;
}) => SQLCondition | boolean;

export const buildRelatedRecordPathJoinSQLCondition = ({
  workspaceId,
  flatObjectMetadata,
  tableAlias,
  metadataMaps,
  buildEntrySQLCondition,
  canRelatedRecordPathExtendAccessToObject,
  arePrivateRecordsApplicable,
  isUncorrelated = false,
}: {
  workspaceId: string;
  flatObjectMetadata: FlatObjectMetadata;
  tableAlias: string;
  metadataMaps: PermissionsMetadataMaps;
  buildEntrySQLCondition: BuildEntrySQLCondition;
  canRelatedRecordPathExtendAccessToObject: (
    flatObjectMetadata: FlatObjectMetadata,
  ) => boolean;
  arePrivateRecordsApplicable: (
    flatObjectMetadata: FlatObjectMetadata,
  ) => boolean;
  isUncorrelated?: boolean;
}): SQLCondition | boolean => {
  const resolvedRelatedRecordPaths = isAccessGroupsEnabled({
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
    const lastHopIndex = hopTableAliases.length - 1;
    const whereConditions = hopTableAliases.flatMap((hopTableAlias, index) => [
      ...(isUncorrelated && index === lastHopIndex
        ? []
        : [joinConditions[index]]),
      `${escapeIdentifier(hopTableAlias)}."deletedAt" IS NULL`,
    ]);

    if (sourceSQLCondition !== true) {
      whereConditions.push(`(${sourceSQLCondition.sql})`);
    }

    const fromAndWhere = `FROM ${fromExpressions.join(', ')} WHERE ${whereConditions.join(' AND ')}`;
    const lastHop = resolvedPath.hops[lastHopIndex];

    return {
      sql: isUncorrelated
        ? `${escapeIdentifier(targetTableAlias)}.${escapeIdentifier(lastHop.targetColumnName)} = ANY(ARRAY(SELECT ${escapeIdentifier(hopTableAliases[lastHopIndex])}.${escapeIdentifier(lastHop.sourceColumnName)} ${fromAndWhere}))`
        : `EXISTS (SELECT 1 ${fromAndWhere})`,
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
      !canRelatedRecordPathExtendAccessToObject(flatObjectMetadata)
    ) {
      return entrySQLCondition;
    }

    const nextVisitedObjectMetadataIds = new Set([
      ...visitedObjectMetadataIds,
      flatObjectMetadata.id,
    ]);

    const pathsSQLCondition = combineSQLConditionOutcomesWithOr(
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

    if (
      typeof pathsSQLCondition === 'boolean' ||
      !arePrivateRecordsApplicable(flatObjectMetadata)
    ) {
      return combineSQLConditionOutcomesWithOr([
        entrySQLCondition,
        pathsSQLCondition,
      ]);
    }

    return combineSQLConditionOutcomesWithOr([
      entrySQLCondition,
      combineSQLConditions({
        sqlConditions: [
          pathsSQLCondition,
          buildPrivateRecordStateSQLCondition({ tableAlias, isPrivate: false }),
        ],
      }),
    ]);
  };

  return buildReadableSQLCondition({
    flatObjectMetadata,
    tableAlias,
    visitedObjectMetadataIds: new Set(),
  });
};
