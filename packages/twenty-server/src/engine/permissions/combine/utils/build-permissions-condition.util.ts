/* @license Enterprise */

import { isDefined } from 'twenty-shared/utils';

import {
  type PermissionsRowAccessSqlRequest,
  type SqlCondition,
} from 'src/engine/permissions/combine/types/row-access-policy.type';
import { areRecordGrantsHeldToRowLevelPermissions } from 'src/engine/permissions/combine/utils/are-record-grants-held-to-row-level-permissions.util';
import { combineSqlConditions } from 'src/engine/permissions/combine/utils/combine-sql-conditions.util';
import { resolvePermissionsRowAccessOutcome } from 'src/engine/permissions/combine/utils/resolve-permissions-row-access-outcome.util';
import { buildPermissionsCreatorCondition } from 'src/engine/permissions/private-record/utils/build-permissions-creator-condition.util';
import { buildPermissionsShareCondition } from 'src/engine/permissions/record-share/utils/build-permissions-share-condition.util';
import { buildPermissionsRlsCondition } from 'src/engine/permissions/rls/utils/build-permissions-rls-condition.util';
import { resolvePermissionsRowLevelPermissionFilter } from 'src/engine/permissions/rls/utils/resolve-permissions-row-level-permission-filter.util';
import { buildPermissionsObjectCondition } from 'src/engine/permissions/role/utils/build-permissions-object-condition.util';

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

  const objectCondition = buildPermissionsObjectCondition(sqlRequest);

  if (objectCondition === true) {
    return true;
  }

  const roleConditions = [
    objectCondition === false ? undefined : objectCondition,
    buildPermissionsRlsCondition(sqlRequest),
  ].filter(isDefined);
  const recordConditions = [
    buildPermissionsShareCondition(sqlRequest),
    buildPermissionsCreatorCondition(sqlRequest),
  ].filter(isDefined);
  const rowLevelPermissionFilter = areRecordGrantsHeldToRowLevelPermissions(
    sqlRequest,
  )
    ? resolvePermissionsRowLevelPermissionFilter(sqlRequest)
    : undefined;
  const conditions =
    isDefined(rowLevelPermissionFilter) && recordConditions.length > 0
      ? [
          ...roleConditions,
          combineSqlConditions([
            rowLevelPermissionFilter.condition,
            combineWithOr(recordConditions),
          ]),
        ]
      : [...roleConditions, ...recordConditions];

  return conditions.length === 0 ? false : combineWithOr(conditions);
};
