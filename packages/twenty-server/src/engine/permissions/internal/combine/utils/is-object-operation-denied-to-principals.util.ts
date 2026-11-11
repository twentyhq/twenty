/* @license Enterprise */

import { type PermissionsObjectAccessRequest } from 'src/engine/permissions/internal/combine/types/row-access-policy.type';
import { canRecordShareGrantOperationToPrincipals } from 'src/engine/permissions/internal/record-share/utils/can-record-share-grant-operation-to-principals.util';
import { areLimitingRolesReachingAllRecords } from 'src/engine/permissions/internal/role/utils/are-limiting-roles-reaching-all-records.util';
import { canAllRecordsOrRowLevelPermissionsGrantOperation } from 'src/engine/permissions/internal/role/utils/can-all-records-or-row-level-permissions-grant-operation.util';

export const isObjectOperationDeniedToPrincipals = (
  request: PermissionsObjectAccessRequest,
): boolean =>
  !areLimitingRolesReachingAllRecords(request) ||
  (!canAllRecordsOrRowLevelPermissionsGrantOperation(request) &&
    !canRecordShareGrantOperationToPrincipals(request));
