/* @license Enterprise */

import { type PermissionsObjectAccessRequest } from 'src/engine/permissions/internal/combine/types/permissions-access-request.type';
import { areLimitingRolesAccessingAllRecords } from 'src/engine/permissions/internal/role/utils/are-limiting-roles-accessing-all-records.util';
import { areLimitingRolesReadingRelatedRecordPathRelations } from 'src/engine/permissions/internal/role/utils/are-limiting-roles-reading-related-record-path-relations.util';
import { isObjectOperationDisabledToPrincipals } from 'src/engine/permissions/internal/role/utils/is-object-operation-disabled-to-principals.util';

export const canRelatedRecordPathExtendAccessToObject = (
  request: PermissionsObjectAccessRequest,
): boolean =>
  !isObjectOperationDisabledToPrincipals(request) &&
  areLimitingRolesAccessingAllRecords(request) &&
  areLimitingRolesReadingRelatedRecordPathRelations(request);
