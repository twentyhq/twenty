/* @license Enterprise */

import { type PermissionsObjectAccessRequest } from 'src/engine/permissions/internal/combine/types/row-access-policy.type';
import { canRecordShareGrantOperation } from 'src/engine/permissions/internal/record-share/utils/can-record-share-grant-operation.util';
import { areLimitingRolesReachingAllRecords } from 'src/engine/permissions/internal/role/utils/are-limiting-roles-reaching-all-records.util';
import { canAllRecordsOrRowLevelPermissionsGrantOperation } from 'src/engine/permissions/internal/role/utils/can-all-records-or-row-level-permissions-grant-operation.util';

export const isObjectOperationDeniedToPrincipals = (
  request: PermissionsObjectAccessRequest,
): boolean =>
  !areLimitingRolesReachingAllRecords(request) ||
  (!canAllRecordsOrRowLevelPermissionsGrantOperation(request) &&
    !canRecordShareGrantOperation({
      flatObjectMetadata: request.flatObjectMetadata,
      featureFlagsMap: request.metadataMaps.featureFlagsMap,
      operationType: request.operationType,
    }));
