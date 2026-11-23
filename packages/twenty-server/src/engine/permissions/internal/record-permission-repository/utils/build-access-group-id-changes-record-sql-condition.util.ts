/* @license Enterprise */

import { isNonEmptyArray } from 'twenty-shared/utils';

import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type AccessGroup } from 'src/engine/permissions/internal/access-group/types/access-group.type';
import { type RecordAccessGroupComputationMetadataMaps } from 'src/engine/permissions/internal/access-group/types/record-access-group-computation-metadata-maps.type';
import { buildRecordAccessGroupSQLConditions } from 'src/engine/permissions/internal/access-group/utils/build-record-access-group-sql-conditions.util';
import { ACCESS_GROUP_IDS_COLUMN_NAME } from 'src/engine/permissions/internal/record-permission-repository/constants/access-group-column-names.constant';
import { RECORD_ACCESS_GROUP_TABLE_ALIAS } from 'src/engine/permissions/internal/record-permission-repository/constants/record-access-group-table-alias.constant';
import { buildRelatedRecordPathAccessGroupIdsExpression } from 'src/engine/permissions/internal/record-permission-repository/utils/build-related-record-path-access-group-ids-expression.util';
import { type ResolvedRelatedRecordPath } from 'src/engine/permissions/internal/related-record-path/types/resolved-related-record-path.type';
import { type SQLCondition } from 'src/engine/permissions/types/sql-condition.type';
import { escapeIdentifier } from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';

export const buildAccessGroupIdChangesRecordSQLCondition = ({
  workspaceId,
  flatObjectMetadata,
  addedCompactIds,
  removedCompactIds,
  resolvedRelatedRecordPaths,
  accessGroups,
  metadataMaps,
}: {
  workspaceId: string;
  flatObjectMetadata: FlatObjectMetadata;
  addedCompactIds: number[];
  removedCompactIds: number[];
  resolvedRelatedRecordPaths: ResolvedRelatedRecordPath[];
  accessGroups: AccessGroup[];
  metadataMaps: RecordAccessGroupComputationMetadataMaps;
}): SQLCondition => {
  const alias = escapeIdentifier(RECORD_ACCESS_GROUP_TABLE_ALIAS);
  const ownAddedAccessGroupSQLConditions = buildRecordAccessGroupSQLConditions({
    flatObjectMetadata,
    metadataMaps,
    accessGroups: accessGroups.filter(
      ({ compactId, objectMetadataId }) =>
        objectMetadataId === flatObjectMetadata.id &&
        addedCompactIds.includes(compactId),
    ),
  }).map(({ sqlCondition }) => sqlCondition ?? { sql: 'TRUE', parameters: {} });
  const relatedRecordPathAddedSQLConditions = isNonEmptyArray(addedCompactIds)
    ? resolvedRelatedRecordPaths.map((resolvedPath, pathIndex) => {
        const { sql, parameters } =
          buildRelatedRecordPathAccessGroupIdsExpression({
            workspaceId,
            targetTableAlias: RECORD_ACCESS_GROUP_TABLE_ALIAS,
            pathIndex,
            resolvedPath,
            metadataMaps,
          });

        return {
          sql: `(${sql}) && CAST(:addedCompactIds AS integer[])`,
          parameters,
        };
      })
    : [];
  const sqlConditions: SQLCondition[] = [
    ...(isNonEmptyArray(removedCompactIds)
      ? [
          {
            sql: `${alias}.${escapeIdentifier(ACCESS_GROUP_IDS_COLUMN_NAME)} && CAST(:removedCompactIds AS integer[])`,
            parameters: {},
          },
        ]
      : []),
    ...ownAddedAccessGroupSQLConditions,
    ...relatedRecordPathAddedSQLConditions,
  ];

  return {
    sql: isNonEmptyArray(sqlConditions)
      ? sqlConditions.map(({ sql }) => `(${sql})`).join(' OR ')
      : 'FALSE',
    parameters: Object.assign(
      { addedCompactIds, removedCompactIds },
      ...sqlConditions.map(({ parameters }) => parameters),
    ),
  };
};
