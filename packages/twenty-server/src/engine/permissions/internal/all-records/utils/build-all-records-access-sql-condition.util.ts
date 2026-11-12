/* @license Enterprise */

import { canAllRecordsAccessOperation } from 'src/engine/permissions/internal/all-records/utils/can-all-records-access-operation.util';
import { type PermissionsRowAccessSqlRequest } from 'src/engine/permissions/internal/combine/types/row-access-policy.type';
import { arePrivateRecordsExcludedFromAllRecordsAndRls } from 'src/engine/permissions/internal/private-record/utils/are-private-records-excluded-from-all-records-and-rls.util';
import { buildRecordPrivacySQLCondition } from 'src/engine/permissions/internal/private-record/utils/build-record-privacy-sql-condition.util';
import { type SQLCondition } from 'src/engine/permissions/types/sql-condition.type';

export const buildAllRecordsAccessSQLCondition = (
  request: PermissionsRowAccessSqlRequest,
): SQLCondition | boolean => {
  if (!canAllRecordsAccessOperation(request)) {
    return false;
  }

  if (!arePrivateRecordsExcludedFromAllRecordsAndRls(request)) {
    return true;
  }

  return buildRecordPrivacySQLCondition({
    tableAlias: request.tableAlias,
    isPrivate: false,
  });
};
