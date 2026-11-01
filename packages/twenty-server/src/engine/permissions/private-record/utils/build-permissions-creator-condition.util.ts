/* @license Enterprise */

import { isDefined } from 'twenty-shared/utils';

import {
  type PermissionsRowAccessSqlRequest,
  type SqlCondition,
} from 'src/engine/permissions/combine/types/row-access-policy.type';
import { combineSqlConditions } from 'src/engine/permissions/combine/utils/combine-sql-conditions.util';
import { buildRecordCreatedByCondition } from 'src/engine/permissions/private-record/utils/build-record-created-by-condition.util';
import { buildRecordPrivacyCondition } from 'src/engine/permissions/private-record/utils/build-record-privacy-condition.util';
import { resolvePermissionsCreatorWorkspaceMemberId } from 'src/engine/permissions/private-record/utils/resolve-permissions-creator-workspace-member-id.util';

export const buildPermissionsCreatorCondition = (
  request: PermissionsRowAccessSqlRequest,
): SqlCondition | undefined => {
  const workspaceMemberId = resolvePermissionsCreatorWorkspaceMemberId(request);

  if (!isDefined(workspaceMemberId)) {
    return undefined;
  }

  return combineSqlConditions([
    buildRecordPrivacyCondition({
      tableAlias: request.tableAlias,
      isPrivate: true,
    }),
    buildRecordCreatedByCondition({
      tableAlias: request.tableAlias,
      workspaceMemberId,
    }),
  ]);
};
