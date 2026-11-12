/* @license Enterprise */

import { isDefined } from 'twenty-shared/utils';

import { type PermissionsRowAccessSqlRequest } from 'src/engine/permissions/internal/combine/types/row-access-policy.type';
import { resolvePermissionsRowAccessOutcome } from 'src/engine/permissions/internal/combine/utils/resolve-permissions-row-access-outcome.util';
import { buildPermissionsCreatorSQLCondition } from 'src/engine/permissions/internal/private-record/utils/build-permissions-creator-sql-condition.util';
import { combineSQLConditionOutcomesWithOr } from 'src/engine/permissions/internal/record-permission-repository/utils/combine-sql-condition-outcomes-with-or.util';
import { buildPermissionsShareSQLCondition } from 'src/engine/permissions/internal/record-share/utils/build-permissions-share-sql-condition.util';
import { type SQLCondition } from 'src/engine/permissions/types/sql-condition.type';

export const buildRecordShareOrCreatorSQLCondition = (
  request: PermissionsRowAccessSqlRequest,
): SQLCondition | boolean => {
  if (resolvePermissionsRowAccessOutcome(request) === false) {
    return false;
  }

  return combineSQLConditionOutcomesWithOr(
    [
      buildPermissionsShareSQLCondition(request),
      buildPermissionsCreatorSQLCondition(request),
    ].filter(isDefined),
  );
};
