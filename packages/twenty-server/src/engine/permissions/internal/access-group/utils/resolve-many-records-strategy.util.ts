/* @license Enterprise */

import { type ManyRecordsStrategy } from 'src/engine/permissions/internal/access-group/types/many-records-strategy.type';
import { areRecordAccessGroupsEnabled } from 'src/engine/permissions/internal/access-group/utils/are-record-access-groups-enabled.util';
import { type PermissionsObjectAccessRequest } from 'src/engine/permissions/internal/combine/types/row-access-policy.type';
import { findPrincipalsRoleIdsWithRlsRule } from 'src/engine/permissions/internal/rls/utils/find-principals-role-ids-with-rls-rule.util';

// Groups only cover the main role, so an RLS rule on a limiting or application role stays degraded
export const resolveManyRecordsStrategy = ({
  principals,
  metadataMaps,
  flatObjectMetadata,
  operationType,
}: PermissionsObjectAccessRequest): ManyRecordsStrategy => {
  const roleIdsWithRlsRule = findPrincipalsRoleIdsWithRlsRule({
    principals,
    metadataMaps,
    objectMetadataId: flatObjectMetadata.id,
  });

  if (roleIdsWithRlsRule.length === 0) {
    return 'plainCondition';
  }

  if (
    operationType !== 'read' ||
    !areRecordAccessGroupsEnabled({
      featureFlagsMap: metadataMaps.featureFlagsMap,
    })
  ) {
    return 'degradedCondition';
  }

  if (
    roleIdsWithRlsRule.length > 1 ||
    roleIdsWithRlsRule[0] !== principals.mainPrincipal.roleId
  ) {
    return 'degradedCondition';
  }

  return 'accessGroups';
};
