/* @license Enterprise */

import { isDefined } from 'twenty-shared/utils';

import { type PermissionsRowAccessSqlRequest } from 'src/engine/permissions/internal/combine/types/permissions-access-request.type';
import { type SQLCondition } from 'src/engine/permissions/types/sql-condition.type';
import { combineSQLConditions } from 'src/engine/permissions/internal/record-permission-repository/utils/combine-sql-conditions.util';
import { buildRecordCreatedBySQLCondition } from 'src/engine/permissions/internal/private-record/utils/build-record-created-by-sql-condition.util';
import { buildPrivateRecordStateSQLCondition } from 'src/engine/permissions/internal/private-record/utils/build-private-record-state-sql-condition.util';
import { resolvePrivateRecordCreatorWorkspaceMemberId } from 'src/engine/permissions/internal/private-record/utils/resolve-private-record-creator-workspace-member-id.util';

export const buildPrivateRecordAccessSQLCondition = (
  request: PermissionsRowAccessSqlRequest,
): SQLCondition | undefined => {
  const workspaceMemberId =
    resolvePrivateRecordCreatorWorkspaceMemberId(request);

  if (!isDefined(workspaceMemberId)) {
    return undefined;
  }

  return combineSQLConditions({
    sqlConditions: [
      buildPrivateRecordStateSQLCondition({
        tableAlias: request.tableAlias,
        isPrivate: true,
      }),
      buildRecordCreatedBySQLCondition({
        tableAlias: request.tableAlias,
        workspaceMemberId,
      }),
    ],
  });
};
