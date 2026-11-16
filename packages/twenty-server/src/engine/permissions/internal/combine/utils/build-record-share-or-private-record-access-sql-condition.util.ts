/* @license Enterprise */

import { isDefined } from 'twenty-shared/utils';

import { type PermissionsRowAccessSqlRequest } from 'src/engine/permissions/internal/combine/types/permissions-access-request.type';
import { resolveRowAccessOutcome } from 'src/engine/permissions/internal/combine/utils/resolve-row-access-outcome.util';
import { buildPrivateRecordAccessSQLCondition } from 'src/engine/permissions/internal/private-record/utils/build-private-record-access-sql-condition.util';
import { combineSQLConditionOutcomesWithOr } from 'src/engine/permissions/internal/record-permission-repository/utils/combine-sql-condition-outcomes-with-or.util';
import { buildRecordShareAccessSQLCondition } from 'src/engine/permissions/internal/record-share/utils/build-record-share-access-sql-condition.util';
import { type SQLCondition } from 'src/engine/permissions/types/sql-condition.type';

export const buildRecordShareOrPrivateRecordAccessSQLCondition = (
  request: PermissionsRowAccessSqlRequest,
): SQLCondition | boolean => {
  if (resolveRowAccessOutcome(request) === false) {
    return false;
  }

  return combineSQLConditionOutcomesWithOr(
    [
      buildRecordShareAccessSQLCondition(request),
      buildPrivateRecordAccessSQLCondition(request),
    ].filter(isDefined),
  );
};
