/* @license Enterprise */

import { isDefined } from 'twenty-shared/utils';

import { type PermissionsRowAccessSqlRequest } from 'src/engine/permissions/internal/combine/types/row-access-policy.type';
import { type SQLCondition } from 'src/engine/permissions/types/sql-condition.type';
import { combineSQLConditions } from 'src/engine/permissions/internal/record-permission-repository/utils/combine-sql-conditions.util';
import { buildRecordCreatedBySQLCondition } from 'src/engine/permissions/internal/private-record/utils/build-record-created-by-sql-condition.util';
import { buildRecordPrivacySQLCondition } from 'src/engine/permissions/internal/private-record/utils/build-record-privacy-sql-condition.util';
import { resolvePermissionsCreatorWorkspaceMemberId } from 'src/engine/permissions/internal/private-record/utils/resolve-permissions-creator-workspace-member-id.util';

export const buildPermissionsCreatorSQLCondition = (
  request: PermissionsRowAccessSqlRequest,
): SQLCondition | undefined => {
  const workspaceMemberId = resolvePermissionsCreatorWorkspaceMemberId(request);

  if (!isDefined(workspaceMemberId)) {
    return undefined;
  }

  return combineSQLConditions({
    sqlConditions: [
      buildRecordPrivacySQLCondition({
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
