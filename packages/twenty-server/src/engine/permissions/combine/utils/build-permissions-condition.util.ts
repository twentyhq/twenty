/* @license Enterprise */

import { isDefined } from 'twenty-shared/utils';

import { buildPermissionsCreatorCondition } from 'src/engine/permissions/private-record/utils/build-permissions-creator-condition.util';
import { buildPermissionsShareCondition } from 'src/engine/permissions/record-share/utils/build-permissions-share-condition.util';
import { buildPermissionsRlsCondition } from 'src/engine/permissions/rls/utils/build-permissions-rls-condition.util';
import { buildPermissionsObjectCondition } from 'src/engine/permissions/role/utils/build-permissions-object-condition.util';
import {
  type PermissionsRowAccessGrants,
  type RowAccessCompilationEnvironment,
  type SqlCondition,
} from 'src/engine/permissions/combine/types/row-access-policy.type';
import { combineSqlConditions } from 'src/engine/permissions/combine/utils/combine-sql-conditions.util';

export const buildPermissionsCondition = ({
  grants,
  environment,
}: {
  grants: PermissionsRowAccessGrants;
  environment: RowAccessCompilationEnvironment;
}): SqlCondition => {
  const { tableAlias, areRoleGrantsLimitedToPublicRecords } = grants;
  const conditions = [
    grants.objectGrant
      ? buildPermissionsObjectCondition({
          tableAlias,
          isLimitedToPublicRecords: areRoleGrantsLimitedToPublicRecords,
        })
      : undefined,
    isDefined(grants.rlsGrant)
      ? buildPermissionsRlsCondition({
          tableAlias,
          rlsCondition: grants.rlsGrant.condition,
          isLimitedToPublicRecords: areRoleGrantsLimitedToPublicRecords,
        })
      : undefined,
    isDefined(grants.shareGrant)
      ? buildPermissionsShareCondition({
          ...grants.shareGrant,
          tableAlias,
          recordShareTableExpression: environment.recordShareTableExpression,
          objectMetadataId: grants.flatObjectMetadata.id,
        })
      : undefined,
    isDefined(grants.creatorGrant)
      ? buildPermissionsCreatorCondition({
          tableAlias,
          workspaceMemberId: grants.creatorGrant.workspaceMemberId,
        })
      : undefined,
  ].filter(isDefined);

  return conditions.length === 1
    ? conditions[0]
    : combineSqlConditions(conditions, 'OR');
};
