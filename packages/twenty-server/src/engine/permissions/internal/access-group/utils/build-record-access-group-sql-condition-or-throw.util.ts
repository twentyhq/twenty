/* @license Enterprise */

import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type RecordAccessGroupSQLConditionMetadataMaps } from 'src/engine/permissions/internal/access-group/types/record-access-group-sql-condition-metadata-maps.type';
import { type AccessGroup } from 'src/engine/permissions/internal/access-group/types/access-group.type';
import { buildRuleSQLConditionOrThrow } from 'src/engine/permissions/internal/access-group/utils/build-rule-sql-condition-or-throw.util';
import { type SQLCondition } from 'src/engine/permissions/types/sql-condition.type';

// null when the group reaches every record of the object
export const buildRecordAccessGroupSQLConditionOrThrow = ({
  accessGroup,
  flatObjectMetadata,
  tableAlias,
  metadataMaps,
}: {
  accessGroup: Pick<
    AccessGroup,
    'roleId' | 'rowLevelPermissionPredicateGroupId' | 'memberFieldValues'
  >;
  flatObjectMetadata: FlatObjectMetadata;
  tableAlias: string;
  metadataMaps: RecordAccessGroupSQLConditionMetadataMaps;
}): SQLCondition | null =>
  buildRuleSQLConditionOrThrow({
    rowLevelPermissionRule: metadataMaps.rolesPermissions[
      accessGroup.roleId
    ]?.objects[flatObjectMetadata.id]?.rowLevelRecordsPermissions?.find(
      ({ ruleId }) => ruleId === accessGroup.rowLevelPermissionPredicateGroupId,
    ),
    memberFieldValues: accessGroup.memberFieldValues ?? {},
    flatObjectMetadata,
    tableAlias,
    metadataMaps,
  });
