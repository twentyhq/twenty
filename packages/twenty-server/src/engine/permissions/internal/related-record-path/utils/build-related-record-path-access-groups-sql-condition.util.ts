/* @license Enterprise */

import { isNonEmptyArray } from 'twenty-shared/utils';

import { type PermissionsRowAccessSqlRequest } from 'src/engine/permissions/internal/combine/types/permissions-access-request.type';
import { buildPrivateRecordStateSQLCondition } from 'src/engine/permissions/internal/private-record/utils/build-private-record-state-sql-condition.util';
import { arePrivateRecordsApplicable } from 'src/engine/permissions/internal/private-record/utils/are-private-records-applicable.util';
import { combineSQLConditions } from 'src/engine/permissions/internal/record-permission-repository/utils/combine-sql-conditions.util';
import { buildRecordAccessGroupsSQLCondition } from 'src/engine/permissions/internal/access-group/utils/build-record-access-groups-sql-condition.util';
import { type SQLCondition } from 'src/engine/permissions/types/sql-condition.type';

export const buildRelatedRecordPathAccessGroupsSQLCondition = (
  request: PermissionsRowAccessSqlRequest,
): SQLCondition | undefined => {
  const { tableAlias, principalsRelatedRecordPathAccessGroupCompactIds } =
    request;

  if (!isNonEmptyArray(principalsRelatedRecordPathAccessGroupCompactIds)) {
    return undefined;
  }

  const inheritedAccessGroupsSQLCondition = buildRecordAccessGroupsSQLCondition(
    {
      tableAlias,
      principalsAccessGroupCompactIds:
        principalsRelatedRecordPathAccessGroupCompactIds,
    },
  );

  return arePrivateRecordsApplicable(request)
    ? combineSQLConditions({
        sqlConditions: [
          inheritedAccessGroupsSQLCondition,
          buildPrivateRecordStateSQLCondition({ tableAlias, isPrivate: false }),
        ],
      })
    : inheritedAccessGroupsSQLCondition;
};
