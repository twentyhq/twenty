/* @license Enterprise */

import { type RecordGqlOperationFilter } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type PermissionsRowAccessSqlRequest } from 'src/engine/permissions/internal/combine/types/row-access-policy.type';
import { areAllRecordsOrRowLevelPermissionsLimitedToPublicRecords } from 'src/engine/permissions/internal/combine/utils/are-all-records-or-row-level-permissions-limited-to-public-records.util';
import { buildRecordPrivacySQLCondition } from 'src/engine/permissions/internal/private-record/utils/build-record-privacy-sql-condition.util';
import { combineSQLConditions } from 'src/engine/permissions/internal/record-permission-repository/utils/combine-sql-conditions.util';
import { canAllRecordsOrRowLevelPermissionsGrantOperation } from 'src/engine/permissions/internal/role/utils/can-all-records-or-row-level-permissions-grant-operation.util';
import { type SQLCondition } from 'src/engine/permissions/types/sql-condition.type';

export const buildAllRecordsOrRowLevelPermissionsSQLCondition = ({
  request,
  rlsRuleFilter,
  rlsRuleSQLCondition,
}: {
  request: PermissionsRowAccessSqlRequest;
  rlsRuleFilter: RecordGqlOperationFilter | undefined;
  rlsRuleSQLCondition: SQLCondition | undefined;
}): SQLCondition | boolean => {
  if (!canAllRecordsOrRowLevelPermissionsGrantOperation(request)) {
    return false;
  }

  if (isDefined(rlsRuleFilter) && !isDefined(rlsRuleSQLCondition)) {
    return false;
  }

  if (!areAllRecordsOrRowLevelPermissionsLimitedToPublicRecords(request)) {
    return rlsRuleSQLCondition ?? true;
  }

  const publicRecordsSQLCondition = buildRecordPrivacySQLCondition({
    tableAlias: request.tableAlias,
    isPrivate: false,
  });

  return isDefined(rlsRuleSQLCondition)
    ? combineSQLConditions({
        sqlConditions: [rlsRuleSQLCondition, publicRecordsSQLCondition],
      })
    : publicRecordsSQLCondition;
};
