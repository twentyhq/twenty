/* @license Enterprise */

import { isDefined } from 'twenty-shared/utils';

import { type PermissionsRowAccessSqlRequest } from 'src/engine/permissions/internal/combine/types/row-access-policy.type';
import { type SQLCondition } from 'src/engine/permissions/types/sql-condition.type';
import { combineSQLConditions } from 'src/engine/permissions/internal/record-permission-repository/utils/combine-sql-conditions.util';
import { resolvePermissionsRowAccessOutcome } from 'src/engine/permissions/internal/combine/utils/resolve-permissions-row-access-outcome.util';
import { buildPermissionsCreatorSQLCondition } from 'src/engine/permissions/internal/private-record/utils/build-permissions-creator-sql-condition.util';
import { buildPermissionsRelatedRecordPathSQLCondition } from 'src/engine/permissions/internal/related-record-path/utils/build-permissions-related-record-path-sql-condition.util';
import { buildPermissionsShareSQLCondition } from 'src/engine/permissions/internal/record-share/utils/build-permissions-share-sql-condition.util';
import { buildAllRecordsOrRowLevelPermissionsSQLCondition } from 'src/engine/permissions/internal/combine/utils/build-all-records-or-row-level-permissions-sql-condition.util';
import { resolvePermissionsRowLevelPermissionFilter } from 'src/engine/permissions/internal/combine/utils/resolve-permissions-row-level-permission-filter.util';
import { resolvePermissionsRowLevelPermissionSQLCondition } from 'src/engine/permissions/internal/combine/utils/resolve-permissions-row-level-permission-sql-condition.util';

const combineWithOr = (sqlConditions: SQLCondition[]): SQLCondition =>
  sqlConditions.length === 1
    ? sqlConditions[0]
    : combineSQLConditions({ sqlConditions, operator: 'OR' });

export const buildPermissionsSQLCondition = ({
  tableAlias,
  ...request
}: Omit<PermissionsRowAccessSqlRequest, 'tableAlias'> & {
  tableAlias?: string;
}): SQLCondition | boolean => {
  const sqlRequest = {
    ...request,
    tableAlias: tableAlias ?? request.flatObjectMetadata.nameSingular,
  };
  const outcome = resolvePermissionsRowAccessOutcome(sqlRequest);

  if (isDefined(outcome)) {
    return outcome;
  }

  const rlsRuleFilter = resolvePermissionsRowLevelPermissionFilter(sqlRequest);
  const rlsRuleSQLCondition = isDefined(rlsRuleFilter)
    ? resolvePermissionsRowLevelPermissionSQLCondition({
        request: sqlRequest,
        rlsRuleFilter,
      })
    : undefined;
  const allRecordsOrRowLevelPermissionsSQLCondition =
    buildAllRecordsOrRowLevelPermissionsSQLCondition({
      request: sqlRequest,
      rlsRuleFilter,
      rlsRuleSQLCondition,
    });

  if (allRecordsOrRowLevelPermissionsSQLCondition === true) {
    return true;
  }

  const allRecordsOrRowLevelPermissionsSQLConditions =
    allRecordsOrRowLevelPermissionsSQLCondition === false
      ? []
      : [allRecordsOrRowLevelPermissionsSQLCondition];

  const recordSQLConditions = [
    buildPermissionsShareSQLCondition(sqlRequest),
    buildPermissionsCreatorSQLCondition(sqlRequest),
    buildPermissionsRelatedRecordPathSQLCondition(sqlRequest),
  ].filter(isDefined);
  const sqlConditions = [
    ...allRecordsOrRowLevelPermissionsSQLConditions,
    ...recordSQLConditions,
  ];

  return sqlConditions.length === 0 ? false : combineWithOr(sqlConditions);
};
