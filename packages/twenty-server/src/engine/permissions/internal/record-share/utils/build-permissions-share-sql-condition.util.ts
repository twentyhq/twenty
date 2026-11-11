/* @license Enterprise */

import { isDefined } from 'twenty-shared/utils';

import { type PermissionsRowAccessSqlRequest } from 'src/engine/permissions/internal/combine/types/row-access-policy.type';
import { type SQLCondition } from 'src/engine/permissions/types/sql-condition.type';
import { buildRecordShareSQLCondition } from 'src/engine/permissions/internal/record-share/utils/build-record-share-sql-condition.util';
import { resolvePermissionsShareGrant } from 'src/engine/permissions/internal/record-share/utils/resolve-permissions-share-grant.util';

export const buildPermissionsShareSQLCondition = (
  request: PermissionsRowAccessSqlRequest,
): SQLCondition | undefined => {
  const shareGrant = resolvePermissionsShareGrant(request);

  if (!isDefined(shareGrant)) {
    return undefined;
  }

  return buildRecordShareSQLCondition({
    tableAlias: request.tableAlias,
    recordShareTableExpression: request.recordShareTableExpression,
    objectMetadataId: request.flatObjectMetadata.id,
    principalIds: shareGrant.principalIds,
    accessLevels: shareGrant.accessLevels,
    isUncorrelated: true,
  });
};
