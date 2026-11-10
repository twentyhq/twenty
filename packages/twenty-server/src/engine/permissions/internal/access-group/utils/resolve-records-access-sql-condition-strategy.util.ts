/* @license Enterprise */

import { type RecordsAccessSQLConditionStrategy } from 'src/engine/permissions/internal/access-group/types/records-access-sql-condition-strategy.type';
import { areRecordAccessGroupsEnabled } from 'src/engine/permissions/internal/access-group/utils/are-record-access-groups-enabled.util';
import { type PermissionsObjectAccessRequest } from 'src/engine/permissions/internal/combine/types/row-access-policy.type';
import { findPrincipalsRoleIdsWithRlsRule } from 'src/engine/permissions/internal/rls/utils/find-principals-role-ids-with-rls-rule.util';

// Groups only cover the main role, so an RLS rule on a limiting or application role stays degraded
export const resolveRecordsAccessSQLConditionStrategy = ({
  principals,
  metadataMaps,
  flatObjectMetadata,
}: Omit<
  PermissionsObjectAccessRequest,
  'operationType'
>): RecordsAccessSQLConditionStrategy => {
  const roleIdsWithRlsRule = findPrincipalsRoleIdsWithRlsRule({
    principals,
    metadataMaps,
    objectMetadataId: flatObjectMetadata.id,
  });

  if (roleIdsWithRlsRule.length === 0) {
    return 'withoutRowLevelPermissions';
  }

  if (
    !areRecordAccessGroupsEnabled({
      featureFlagsMap: metadataMaps.featureFlagsMap,
    })
  ) {
    return 'degradedRead';
  }

  if (
    roleIdsWithRlsRule.length > 1 ||
    roleIdsWithRlsRule[0] !== principals.mainPrincipal.roleId
  ) {
    return 'degradedRead';
  }

  return 'accessGroups';
};
