/* @license Enterprise */

import { type RecordGqlOperationFilter } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type PermissionsRowAccessSqlRequest } from 'src/engine/permissions/internal/combine/types/row-access-policy.type';
import { areRoleGrantsLimitedToPublicRecords } from 'src/engine/permissions/internal/combine/utils/are-role-grants-limited-to-public-records.util';
import { buildRecordPrivacyCondition } from 'src/engine/permissions/internal/private-record/utils/build-record-privacy-condition.util';
import { combineSqlConditions } from 'src/engine/permissions/internal/record-permission-repository/utils/combine-sql-conditions.util';
import { isRolePermittingOperation } from 'src/engine/permissions/internal/role/utils/is-role-permitting-operation.util';
import { type SqlCondition } from 'src/engine/permissions/types/sql-condition.type';

export const buildPermissionsRoleCondition = ({
  request,
  rlsRuleFilter,
  rlsRuleCondition,
}: {
  request: PermissionsRowAccessSqlRequest;
  rlsRuleFilter: RecordGqlOperationFilter | undefined;
  rlsRuleCondition: SqlCondition | undefined;
}): SqlCondition | boolean => {
  if (!isRolePermittingOperation(request)) {
    return false;
  }

  if (isDefined(rlsRuleFilter) && !isDefined(rlsRuleCondition)) {
    return false;
  }

  if (!areRoleGrantsLimitedToPublicRecords(request)) {
    return rlsRuleCondition ?? true;
  }

  const publicRecordsCondition = buildRecordPrivacyCondition({
    tableAlias: request.tableAlias,
    isPrivate: false,
  });

  return isDefined(rlsRuleCondition)
    ? combineSqlConditions([rlsRuleCondition, publicRecordsCondition])
    : publicRecordsCondition;
};
