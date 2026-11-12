/* @license Enterprise */

import { isDefined } from 'twenty-shared/utils';

import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type RecordAccessGroupSQLConditionMetadataMaps } from 'src/engine/permissions/internal/access-group/types/record-access-group-sql-condition-metadata-maps.type';
import { type AccessGroup } from 'src/engine/permissions/internal/access-group/types/access-group.type';
import { buildRecordFilterForRule } from 'src/engine/permissions/internal/rls/utils/build-row-level-permission-record-filter.util';
import { isRowLevelPermissionRelationHopEnabled } from 'src/engine/permissions/internal/rls/utils/is-row-level-permission-relation-hop-enabled.util';
import { renderRowLevelPermissionFilterToSql } from 'src/engine/permissions/internal/rls/utils/render-row-level-permission-filter-to-sql.util';
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
}): SQLCondition | null => {
  const recordFilter = buildRecordFilterForRule({
    rowLevelPermissionRule: metadataMaps.rolesPermissions[
      accessGroup.roleId
    ]?.objects[flatObjectMetadata.id]?.rowLevelRecordsPermissions?.find(
      ({ ruleId }) => ruleId === accessGroup.rowLevelPermissionPredicateGroupId,
    ),
    memberFieldValues: accessGroup.memberFieldValues ?? {},
    flatFieldMetadataMaps: metadataMaps.flatFieldMetadataMaps,
    flatObjectMetadataMaps: metadataMaps.flatObjectMetadataMaps,
    isRelationHopEnabled: isRowLevelPermissionRelationHopEnabled(
      metadataMaps.featureFlagsMap,
    ),
  });

  if (!isDefined(recordFilter)) {
    return null;
  }

  return renderRowLevelPermissionFilterToSql({
    recordFilter,
    tableAlias,
    objectMetadata: flatObjectMetadata,
    flatFieldMetadataMaps: metadataMaps.flatFieldMetadataMaps,
    flatObjectMetadataMaps: metadataMaps.flatObjectMetadataMaps,
  });
};
