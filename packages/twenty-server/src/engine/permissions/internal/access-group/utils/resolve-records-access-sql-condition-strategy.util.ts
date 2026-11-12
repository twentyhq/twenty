/* @license Enterprise */

import { type RecordsAccessSQLConditionStrategy } from 'src/engine/permissions/internal/access-group/types/records-access-sql-condition-strategy.type';
import { areRecordAccessGroupsEnabled } from 'src/engine/permissions/internal/access-group/utils/are-record-access-groups-enabled.util';
import { type PermissionsObjectAccessRequest } from 'src/engine/permissions/internal/combine/types/row-access-policy.type';
import { isMainRoleRestrictedByRlsRule } from 'src/engine/permissions/internal/rls/utils/is-main-role-restricted-by-rls-rule.util';

export const resolveRecordsAccessSQLConditionStrategy = ({
  principals,
  metadataMaps,
  flatObjectMetadata,
}: Pick<
  PermissionsObjectAccessRequest,
  'principals' | 'metadataMaps' | 'flatObjectMetadata'
>): RecordsAccessSQLConditionStrategy => {
  if (
    !isMainRoleRestrictedByRlsRule({
      principals,
      metadataMaps,
      objectMetadataId: flatObjectMetadata.id,
    })
  ) {
    return 'withoutRowLevelPermissions';
  }

  return areRecordAccessGroupsEnabled({
    featureFlagsMap: metadataMaps.featureFlagsMap,
  })
    ? 'accessGroups'
    : 'degradedRead';
};
