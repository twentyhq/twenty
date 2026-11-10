/* @license Enterprise */

import { isDefined } from 'twenty-shared/utils';

import { type PermissionsRowAccessSqlRequest } from 'src/engine/permissions/internal/combine/types/row-access-policy.type';
import { type SqlCondition } from 'src/engine/permissions/types/sql-condition.type';
import { areRecordGrantsHeldToRowLevelPermissions } from 'src/engine/permissions/internal/combine/utils/are-record-grants-held-to-row-level-permissions.util';
import { combineSqlConditions } from 'src/engine/permissions/internal/record-permission-repository/utils/combine-sql-conditions.util';
import { resolvePermissionsRowAccessOutcome } from 'src/engine/permissions/internal/combine/utils/resolve-permissions-row-access-outcome.util';
import { buildPermissionsCreatorCondition } from 'src/engine/permissions/internal/private-record/utils/build-permissions-creator-condition.util';
import { buildPermissionsShareCondition } from 'src/engine/permissions/internal/record-share/utils/build-permissions-share-condition.util';
import { buildPermissionsRoleCondition } from 'src/engine/permissions/internal/combine/utils/build-permissions-role-condition.util';
import { resolvePermissionsRowLevelPermissionFilter } from 'src/engine/permissions/internal/combine/utils/resolve-permissions-row-level-permission-filter.util';
import { resolvePermissionsRowLevelPermissionSqlCondition } from 'src/engine/permissions/internal/combine/utils/resolve-permissions-row-level-permission-sql-condition.util';

const combineWithOr = (conditions: SqlCondition[]): SqlCondition =>
  conditions.length === 1
    ? conditions[0]
    : combineSqlConditions(conditions, 'OR');

export const buildPermissionsCondition = ({
  tableAlias,
  ...request
}: Omit<PermissionsRowAccessSqlRequest, 'tableAlias'> & {
  tableAlias?: string;
}): SqlCondition | boolean => {
  const sqlRequest = {
    ...request,
    tableAlias: tableAlias ?? request.flatObjectMetadata.nameSingular,
  };
  const outcome = resolvePermissionsRowAccessOutcome(sqlRequest);

  if (isDefined(outcome)) {
    return outcome;
  }

  const rlsRuleFilter = resolvePermissionsRowLevelPermissionFilter(sqlRequest);
  const rlsRuleCondition = isDefined(rlsRuleFilter)
    ? resolvePermissionsRowLevelPermissionSqlCondition({
        request: sqlRequest,
        rlsRuleFilter,
      })
    : undefined;
  const roleCondition = buildPermissionsRoleCondition({
    request: sqlRequest,
    rlsRuleFilter,
    rlsRuleCondition,
  });

  if (roleCondition === true) {
    return true;
  }

  const roleConditions = roleCondition === false ? [] : [roleCondition];

  const recordConditions = [
    buildPermissionsShareCondition(sqlRequest),
    buildPermissionsCreatorCondition(sqlRequest),
  ].filter(isDefined);
  const rowLevelPermissionCondition = areRecordGrantsHeldToRowLevelPermissions(
    sqlRequest,
  )
    ? rlsRuleCondition
    : undefined;

  if (isDefined(rowLevelPermissionCondition) && recordConditions.length > 0) {
    return combineWithOr([
      ...roleConditions,
      combineSqlConditions([
        rowLevelPermissionCondition,
        combineWithOr(recordConditions),
      ]),
    ]);
  }

  const conditions = [...roleConditions, ...recordConditions];

  return conditions.length === 0 ? false : combineWithOr(conditions);
};
