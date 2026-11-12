/* @license Enterprise */

import { type PermissionsObjectAccessRequest } from 'src/engine/permissions/internal/combine/types/row-access-policy.type';
import { areLimitingRolesReachingAllRecords } from 'src/engine/permissions/internal/role/utils/are-limiting-roles-reaching-all-records.util';
import { isObjectOperationDisabledToPrincipals } from 'src/engine/permissions/internal/role/utils/is-object-operation-disabled-to-principals.util';

export const canRelatedRecordPathsReachObject = (
  request: PermissionsObjectAccessRequest,
): boolean =>
  !isObjectOperationDisabledToPrincipals(request) &&
  areLimitingRolesReachingAllRecords(request);
