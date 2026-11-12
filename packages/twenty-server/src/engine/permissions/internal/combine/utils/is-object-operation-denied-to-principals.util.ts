/* @license Enterprise */

import { type PermissionsObjectAccessRequest } from 'src/engine/permissions/internal/combine/types/row-access-policy.type';
import { canAnySourceAccessOperation } from 'src/engine/permissions/internal/combine/utils/can-any-source-access-operation.util';
import { canRelatedRecordPathExtendAccess } from 'src/engine/permissions/internal/related-record-path/utils/can-related-record-path-extend-access.util';
import { areLimitingRolesReachingAllRecords } from 'src/engine/permissions/internal/role/utils/are-limiting-roles-reaching-all-records.util';

export const isObjectOperationDeniedToPrincipals = (
  request: PermissionsObjectAccessRequest,
): boolean =>
  !areLimitingRolesReachingAllRecords(request) ||
  (!canAnySourceAccessOperation(request) &&
    !canRelatedRecordPathExtendAccess(request));
