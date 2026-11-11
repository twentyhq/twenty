/* @license Enterprise */

import { type PermissionsRowAccessRequest } from 'src/engine/permissions/internal/combine/types/row-access-policy.type';
import { canRecordShareGrantOperationToPrincipals } from 'src/engine/permissions/internal/record-share/utils/can-record-share-grant-operation-to-principals.util';

export const areRecordGrantsHeldToRowLevelPermissions = (
  request: PermissionsRowAccessRequest,
): boolean => !canRecordShareGrantOperationToPrincipals(request);
