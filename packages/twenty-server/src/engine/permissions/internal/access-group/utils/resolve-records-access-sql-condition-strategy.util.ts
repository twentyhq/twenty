/* @license Enterprise */

import { type RecordsAccessSQLConditionStrategy } from 'src/engine/permissions/internal/access-group/types/records-access-sql-condition-strategy.type';
import { isAccessGroupsEnabled } from 'src/engine/permissions/internal/access-group/utils/is-access-groups-enabled.util';
import { type PermissionsObjectAccessRequest } from 'src/engine/permissions/internal/combine/types/permissions-access-request.type';
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

  return isAccessGroupsEnabled({
    featureFlagsMap: metadataMaps.featureFlagsMap,
  })
    ? 'accessGroups'
    : 'degradedRead';
};
