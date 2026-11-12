/* @license Enterprise */

import { type PermissionsObjectAccessRequest } from 'src/engine/permissions/internal/combine/types/row-access-policy.type';
import { canPrivateRecordAccessOperation } from 'src/engine/permissions/internal/private-record/utils/can-private-record-access-operation.util';
import { canRelatedRecordPathGrantOperation } from 'src/engine/permissions/internal/related-record-path/utils/can-related-record-path-grant-operation.util';
import { canRecordShareAccessOperation } from 'src/engine/permissions/internal/record-share/utils/can-record-share-access-operation.util';
import { areLimitingRolesReachingAllRecords } from 'src/engine/permissions/internal/role/utils/are-limiting-roles-reaching-all-records.util';
import { canAllRecordsAccessOperation } from 'src/engine/permissions/internal/all-records/utils/can-all-records-access-operation.util';
import { canRlsAccessOperation } from 'src/engine/permissions/internal/rls/utils/can-rls-access-operation.util';

export const isObjectOperationDeniedToPrincipals = (
  request: PermissionsObjectAccessRequest,
): boolean =>
  !areLimitingRolesReachingAllRecords(request) ||
  (!canAllRecordsAccessOperation(request) &&
    !canRlsAccessOperation(request) &&
    !canRecordShareAccessOperation({
      flatObjectMetadata: request.flatObjectMetadata,
      featureFlagsMap: request.metadataMaps.featureFlagsMap,
      operationType: request.operationType,
    }) &&
    !canPrivateRecordAccessOperation(request) &&
    !canRelatedRecordPathGrantOperation(request));
