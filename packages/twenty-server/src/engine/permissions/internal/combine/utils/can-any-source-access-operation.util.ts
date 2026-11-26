/* @license Enterprise */

import { canAllRecordsAccessOperation } from 'src/engine/permissions/internal/all-records/utils/can-all-records-access-operation.util';
import { type PermissionsObjectAccessRequest } from 'src/engine/permissions/internal/combine/types/permissions-access-request.type';
import { canPrivateRecordAccessOperation } from 'src/engine/permissions/internal/private-record/utils/can-private-record-access-operation.util';
import { canRecordShareAccessOperation } from 'src/engine/permissions/internal/record-share/utils/can-record-share-access-operation.util';
import { canRlsAccessOperation } from 'src/engine/permissions/internal/rls/utils/can-rls-access-operation.util';

export const canAnySourceAccessOperation = (
  request: PermissionsObjectAccessRequest,
): boolean =>
  canAllRecordsAccessOperation(request) ||
  canRlsAccessOperation(request) ||
  canRecordShareAccessOperation({
    flatObjectMetadata: request.flatObjectMetadata,
    featureFlagsMap: request.metadataMaps.featureFlagsMap,
    operationType: request.operationType,
  }) ||
  canPrivateRecordAccessOperation(request);
