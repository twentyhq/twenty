/* @license Enterprise */

import { isDefined } from 'twenty-shared/utils';

import { buildAllRecordsAccessSQLCondition } from 'src/engine/permissions/internal/all-records/utils/build-all-records-access-sql-condition.util';
import { buildRlsAccessSQLCondition } from 'src/engine/permissions/internal/rls/utils/build-rls-access-sql-condition.util';
import { type PermissionsRowAccessSqlRequest } from 'src/engine/permissions/internal/combine/types/row-access-policy.type';
import { type SQLCondition } from 'src/engine/permissions/types/sql-condition.type';
import { combineSQLConditions } from 'src/engine/permissions/internal/record-permission-repository/utils/combine-sql-conditions.util';
import { resolveRowAccessOutcome } from 'src/engine/permissions/internal/combine/utils/resolve-row-access-outcome.util';
import { buildPrivateRecordAccessSQLCondition } from 'src/engine/permissions/internal/private-record/utils/build-private-record-access-sql-condition.util';
import { buildPermissionsRelatedRecordPathSQLCondition } from 'src/engine/permissions/internal/related-record-path/utils/build-permissions-related-record-path-sql-condition.util';
import { buildRecordShareAccessSQLCondition } from 'src/engine/permissions/internal/record-share/utils/build-record-share-access-sql-condition.util';

const combineWithOr = (sqlConditions: SQLCondition[]): SQLCondition =>
  sqlConditions.length === 1
    ? sqlConditions[0]
    : combineSQLConditions({ sqlConditions, operator: 'OR' });

export const buildAccessSQLCondition = ({
  tableAlias,
  ...request
}: Omit<PermissionsRowAccessSqlRequest, 'tableAlias'> & {
  tableAlias?: string;
}): SQLCondition | boolean => {
  const sqlRequest = {
    ...request,
    tableAlias: tableAlias ?? request.flatObjectMetadata.nameSingular,
  };
  const outcome = resolveRowAccessOutcome(sqlRequest);

  if (isDefined(outcome)) {
    return outcome;
  }

  const allRecordsSQLCondition = buildAllRecordsAccessSQLCondition(sqlRequest);

  if (allRecordsSQLCondition === true) {
    return true;
  }

  const rlsSQLCondition = buildRlsAccessSQLCondition(sqlRequest);
  const sqlConditions = [
    allRecordsSQLCondition === false ? undefined : allRecordsSQLCondition,
    rlsSQLCondition === false ? undefined : rlsSQLCondition,
    buildRecordShareAccessSQLCondition(sqlRequest),
    buildPrivateRecordAccessSQLCondition(sqlRequest),
    buildPermissionsRelatedRecordPathSQLCondition(sqlRequest),
  ].filter(isDefined);

  return sqlConditions.length === 0 ? false : combineWithOr(sqlConditions);
};
