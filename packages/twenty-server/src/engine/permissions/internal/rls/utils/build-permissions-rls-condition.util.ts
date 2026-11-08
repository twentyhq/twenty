/* @license Enterprise */

import { isDefined } from 'twenty-shared/utils';

import { type PermissionsRowAccessSqlRequest } from 'src/engine/permissions/internal/combine/types/row-access-policy.type';
import { type SqlCondition } from 'src/engine/permissions/types/sql-condition.type';
import { combineSqlConditions } from 'src/engine/permissions/internal/combine/utils/combine-sql-conditions.util';
import { buildRecordPrivacyCondition } from 'src/engine/permissions/internal/private-record/utils/build-record-privacy-condition.util';
import { areRoleGrantsLimitedToPublicRecords } from 'src/engine/permissions/internal/role/utils/are-role-grants-limited-to-public-records.util';
import { resolvePermissionsRlsSqlCondition } from 'src/engine/permissions/internal/rls/utils/resolve-permissions-rls-sql-condition.util';

export const buildPermissionsRlsCondition = (
  request: PermissionsRowAccessSqlRequest,
): SqlCondition | undefined => {
  const rlsCondition = resolvePermissionsRlsSqlCondition(request);

  if (!isDefined(rlsCondition)) {
    return undefined;
  }

  return areRoleGrantsLimitedToPublicRecords(request)
    ? combineSqlConditions([
        rlsCondition,
        buildRecordPrivacyCondition({
          tableAlias: request.tableAlias,
          isPrivate: false,
        }),
      ])
    : rlsCondition;
};
