/* @license Enterprise */

import { isDefined } from 'twenty-shared/utils';

import { type PermissionsRowAccessSqlRequest } from 'src/engine/permissions/internal/combine/types/permissions-access-request.type';
import { type SQLCondition } from 'src/engine/permissions/types/sql-condition.type';
import { buildRecordShareSQLCondition } from 'src/engine/permissions/internal/record-share/utils/build-record-share-sql-condition.util';
import { resolveRecordShareAccessRequirement } from 'src/engine/permissions/internal/record-share/utils/resolve-record-share-access-requirement.util';

export const buildRecordShareAccessSQLCondition = (
  request: PermissionsRowAccessSqlRequest,
): SQLCondition | undefined => {
  const recordShareAccessRequirement =
    resolveRecordShareAccessRequirement(request);

  if (!isDefined(recordShareAccessRequirement)) {
    return undefined;
  }

  return buildRecordShareSQLCondition({
    tableAlias: request.tableAlias,
    recordShareTableExpression: request.recordShareTableExpression,
    objectMetadataId: request.flatObjectMetadata.id,
    principalIds: recordShareAccessRequirement.principalIds,
    accessLevels: recordShareAccessRequirement.accessLevels,
    isUncorrelated: true,
  });
};
