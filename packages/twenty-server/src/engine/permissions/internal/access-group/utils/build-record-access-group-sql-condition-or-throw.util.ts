/* @license Enterprise */

import { isDefined } from 'twenty-shared/utils';

import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type RecordAccessGroupSQLConditionMetadataMaps } from 'src/engine/permissions/internal/access-group/types/record-access-group-sql-condition-metadata-maps.type';
import { type AccessGroup } from 'src/engine/permissions/internal/access-group/types/access-group.type';
import { type RlsMemberFieldValues } from 'src/engine/permissions/internal/rls/types/rls-member-field-values.type';
import {
  buildRecordFilterForRule,
  type RlsRule,
} from 'src/engine/permissions/internal/rls/utils/build-rls-record-filter.util';
import { isRlsRelationHopEnabled } from 'src/engine/permissions/internal/rls/utils/is-rls-relation-hop-enabled.util';
import { renderRlsRecordFilterToSql } from 'src/engine/permissions/internal/rls/utils/render-rls-record-filter-to-sql.util';
import { type SQLCondition } from 'src/engine/permissions/types/sql-condition.type';

// null when the rule reaches every record of the object
export const buildRuleSQLConditionOrThrow = ({
  rowLevelPermissionRule,
  memberFieldValues,
  flatObjectMetadata,
  tableAlias,
  metadataMaps,
}: {
  rowLevelPermissionRule: RlsRule | null | undefined;
  memberFieldValues: RlsMemberFieldValues;
  flatObjectMetadata: FlatObjectMetadata;
  tableAlias: string;
  metadataMaps: RecordAccessGroupSQLConditionMetadataMaps;
}): SQLCondition | null => {
  const recordFilter = buildRecordFilterForRule({
    rowLevelPermissionRule,
    memberFieldValues,
    flatFieldMetadataMaps: metadataMaps.flatFieldMetadataMaps,
    flatFieldMetadataOptionMaps: metadataMaps.flatFieldMetadataOptionMaps,
    flatObjectMetadataMaps: metadataMaps.flatObjectMetadataMaps,
    isRelationHopEnabled: isRlsRelationHopEnabled(metadataMaps.featureFlagsMap),
  });

  if (!isDefined(recordFilter)) {
    return null;
  }

  return renderRlsRecordFilterToSql({
    recordFilter,
    tableAlias,
    objectMetadata: flatObjectMetadata,
    flatFieldMetadataMaps: metadataMaps.flatFieldMetadataMaps,
    flatObjectMetadataMaps: metadataMaps.flatObjectMetadataMaps,
  });
};

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
