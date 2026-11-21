/* @license Enterprise */

import { isDefined } from 'twenty-shared/utils';

import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type RecordAccessGroupSQLConditionMetadataMaps } from 'src/engine/permissions/internal/access-group/types/record-access-group-sql-condition-metadata-maps.type';
import { type RlsMemberFieldValues } from 'src/engine/permissions/internal/rls/types/rls-member-field-values.type';
import {
  buildRecordFilterForRule,
  type RlsRule,
} from 'src/engine/permissions/internal/rls/utils/build-rls-record-filter.util';
import { isRlsRelationHopEnabled } from 'src/engine/permissions/internal/rls/utils/is-rls-relation-hop-enabled.util';
import { renderRlsRecordFilterToSql } from 'src/engine/permissions/internal/rls/utils/render-rls-record-filter-to-sql.util';
import { type SQLCondition } from 'src/engine/permissions/types/sql-condition.type';

export const buildRlsRuleSQLCondition = ({
  rowLevelPermissionRule,
  memberFieldValues,
  flatObjectMetadata,
  tableAlias,
  metadataMaps,
}: {
  rowLevelPermissionRule: RlsRule;
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
