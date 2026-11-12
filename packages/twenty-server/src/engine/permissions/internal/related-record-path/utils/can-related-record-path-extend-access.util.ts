/* @license Enterprise */

import { isNonEmptyArray } from 'twenty-shared/utils';

import { type PermissionsObjectAccessRequest } from 'src/engine/permissions/internal/combine/types/permissions-access-request.type';
import { findRelatedRecordPathsExtendingAccess } from 'src/engine/permissions/internal/related-record-path/utils/find-related-record-paths-extending-access.util';

export const canRelatedRecordPathExtendAccess = (
  request: Pick<
    PermissionsObjectAccessRequest,
    'metadataMaps' | 'flatObjectMetadata' | 'operationType'
  >,
): boolean => isNonEmptyArray(findRelatedRecordPathsExtendingAccess(request));
