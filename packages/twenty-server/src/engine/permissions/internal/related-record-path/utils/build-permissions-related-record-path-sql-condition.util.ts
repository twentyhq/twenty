/* @license Enterprise */

import { isNonEmptyArray } from 'twenty-shared/utils';

import { type PermissionsRowAccessSqlRequest } from 'src/engine/permissions/internal/combine/types/row-access-policy.type';
import { buildRecordPrivacySQLCondition } from 'src/engine/permissions/internal/private-record/utils/build-record-privacy-sql-condition.util';
import { isRecordPrivacyApplicable } from 'src/engine/permissions/internal/private-record/utils/is-record-privacy-applicable.util';
import { combineSQLConditions } from 'src/engine/permissions/internal/record-permission-repository/utils/combine-sql-conditions.util';
import { buildRecordAccessGroupsSQLCondition } from 'src/engine/permissions/internal/rls/utils/build-record-access-groups-sql-condition.util';
import { type SQLCondition } from 'src/engine/permissions/types/sql-condition.type';

export const buildPermissionsRelatedRecordPathSQLCondition = (
  request: PermissionsRowAccessSqlRequest,
): SQLCondition | undefined => {
  const { tableAlias, callerRelatedRecordPathAccessGroupCompactIds } = request;

  if (!isNonEmptyArray(callerRelatedRecordPathAccessGroupCompactIds)) {
    return undefined;
  }

  const inheritedAccessGroupsSQLCondition = buildRecordAccessGroupsSQLCondition(
    {
      tableAlias,
      callerAccessGroupCompactIds: callerRelatedRecordPathAccessGroupCompactIds,
    },
  );

  return isRecordPrivacyApplicable(request)
    ? combineSQLConditions({
        sqlConditions: [
          inheritedAccessGroupsSQLCondition,
          buildRecordPrivacySQLCondition({ tableAlias, isPrivate: false }),
        ],
      })
    : inheritedAccessGroupsSQLCondition;
};
