/* @license Enterprise */

import { isDefined } from 'twenty-shared/utils';

import { canAllRecordsAccessOperation } from 'src/engine/permissions/internal/all-records/utils/can-all-records-access-operation.util';
import { buildRlsAccessSQLCondition } from 'src/engine/permissions/internal/rls/utils/build-rls-access-sql-condition.util';
import { type PermissionsRowAccessSqlRequest } from 'src/engine/permissions/internal/combine/types/permissions-access-request.type';
import { type SQLCondition } from 'src/engine/permissions/types/sql-condition.type';
import { arePrivateRecordsExcludedFromAllRecordsAndRls } from 'src/engine/permissions/internal/private-record/utils/are-private-records-excluded-from-all-records-and-rls.util';
import { buildPrivateRecordStateSQLCondition } from 'src/engine/permissions/internal/private-record/utils/build-private-record-state-sql-condition.util';
import { combineSQLConditionOutcomesWithAnd } from 'src/engine/permissions/internal/record-permission-repository/utils/combine-sql-condition-outcomes-with-and.util';
import { combineSQLConditionOutcomesWithOr } from 'src/engine/permissions/internal/record-permission-repository/utils/combine-sql-condition-outcomes-with-or.util';
import { resolveRowAccessOutcome } from 'src/engine/permissions/internal/combine/utils/resolve-row-access-outcome.util';
import { buildPrivateRecordAccessSQLCondition } from 'src/engine/permissions/internal/private-record/utils/build-private-record-access-sql-condition.util';
import { buildRelatedRecordPathAccessGroupsSQLCondition } from 'src/engine/permissions/internal/related-record-path/utils/build-related-record-path-access-groups-sql-condition.util';
import { buildRecordShareAccessSQLCondition } from 'src/engine/permissions/internal/record-share/utils/build-record-share-access-sql-condition.util';

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

  const allRecordsOrRlsSQLCondition = combineSQLConditionOutcomesWithOr([
    canAllRecordsAccessOperation(sqlRequest),
    buildRlsAccessSQLCondition(sqlRequest),
  ]);

  return combineSQLConditionOutcomesWithOr([
    arePrivateRecordsExcludedFromAllRecordsAndRls(sqlRequest)
      ? combineSQLConditionOutcomesWithAnd([
          allRecordsOrRlsSQLCondition,
          buildPrivateRecordStateSQLCondition({
            tableAlias: sqlRequest.tableAlias,
            isPrivate: false,
          }),
        ])
      : allRecordsOrRlsSQLCondition,
    buildRecordShareAccessSQLCondition(sqlRequest) ?? false,
    buildPrivateRecordAccessSQLCondition(sqlRequest) ?? false,
    buildRelatedRecordPathAccessGroupsSQLCondition(sqlRequest) ?? false,
  ]);
};
