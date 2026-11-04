/* @license Enterprise */

import { isDefined } from 'twenty-shared/utils';

import {
  type PermissionsRowAccessSqlRequest,
  type SqlCondition,
} from 'src/engine/permissions/combine/types/row-access-policy.type';
import { combineSqlConditions } from 'src/engine/permissions/combine/utils/combine-sql-conditions.util';
import { buildRecordPrivacyCondition } from 'src/engine/permissions/private-record/utils/build-record-privacy-condition.util';
import { buildRecordShareCondition } from 'src/engine/permissions/record-share/utils/build-record-share-condition.util';
import { resolvePermissionsShareGrant } from 'src/engine/permissions/record-share/utils/resolve-permissions-share-grant.util';

export const buildPermissionsShareCondition = (
  request: PermissionsRowAccessSqlRequest,
): SqlCondition | undefined => {
  const shareGrant = resolvePermissionsShareGrant(request);

  if (!isDefined(shareGrant)) {
    return undefined;
  }

  const { tableAlias } = request;
  const recordShareCondition = buildRecordShareCondition({
    tableAlias,
    recordShareTableExpression: request.recordShareTableExpression,
    objectMetadataId: request.flatObjectMetadata.id,
    principalIds: shareGrant.principalIds,
    accessLevels: shareGrant.accessLevels,
    isUncorrelated: !shareGrant.isLimitedToPrivateRecords,
  });

  return shareGrant.isLimitedToPrivateRecords
    ? combineSqlConditions([
        buildRecordPrivacyCondition({ tableAlias, isPrivate: true }),
        recordShareCondition,
      ])
    : recordShareCondition;
};
