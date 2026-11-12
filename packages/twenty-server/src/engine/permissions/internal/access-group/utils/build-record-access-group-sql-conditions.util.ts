/* @license Enterprise */

import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type AccessGroup } from 'src/engine/permissions/internal/access-group/types/access-group.type';
import { type RecordAccessGroupSQLConditionMetadataMaps } from 'src/engine/permissions/internal/access-group/types/record-access-group-sql-condition-metadata-maps.type';
import { buildRecordAccessGroupSQLConditionOrThrow } from 'src/engine/permissions/internal/access-group/utils/build-record-access-group-sql-condition-or-throw.util';
import { RECORD_ACCESS_GROUP_TABLE_ALIAS } from 'src/engine/permissions/internal/record-permission-repository/constants/record-access-group-table-alias.constant';
import { type RecordAccessGroupSQLCondition } from 'src/engine/permissions/internal/record-permission-repository/types/record-access-group-sql-condition.type';

export const buildRecordAccessGroupSQLConditions = ({
  flatObjectMetadata,
  metadataMaps,
  accessGroups,
}: {
  flatObjectMetadata: FlatObjectMetadata;
  metadataMaps: RecordAccessGroupSQLConditionMetadataMaps;
  accessGroups: AccessGroup[];
}): RecordAccessGroupSQLCondition[] =>
  accessGroups.map((accessGroup) => ({
    compactId: accessGroup.compactId,
    sqlCondition: buildRecordAccessGroupSQLConditionOrThrow({
      accessGroup,
      flatObjectMetadata,
      tableAlias: RECORD_ACCESS_GROUP_TABLE_ALIAS,
      metadataMaps,
    }),
  }));
