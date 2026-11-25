/* @license Enterprise */

import { type PermissionsRowAccessRequest } from 'src/engine/permissions/internal/combine/types/permissions-access-request.type';
import { temporaryExcludePermissionStorageObject } from 'src/engine/permissions/utils/temporary-exclude-permission-storage-object.util';

export const arePrivateRecordsApplicable = ({
  flatObjectMetadata,
  operationType,
}: Pick<
  PermissionsRowAccessRequest,
  'flatObjectMetadata' | 'operationType'
>): boolean =>
  operationType !== 'create' &&
  !temporaryExcludePermissionStorageObject(flatObjectMetadata);
