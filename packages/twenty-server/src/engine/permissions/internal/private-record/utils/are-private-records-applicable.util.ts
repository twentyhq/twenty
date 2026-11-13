/* @license Enterprise */

import { type PermissionsRowAccessRequest } from 'src/engine/permissions/internal/combine/types/permissions-access-request.type';
import { isPrivateRecordsEnabled } from 'src/engine/permissions/internal/private-record/utils/is-private-records-enabled.util';
import { temporaryExcludePermissionStorageObject } from 'src/engine/permissions/utils/temporary-exclude-permission-storage-object.util';

export const arePrivateRecordsApplicable = ({
  flatObjectMetadata,
  operationType,
  metadataMaps: { featureFlagsMap },
}: Pick<PermissionsRowAccessRequest, 'flatObjectMetadata' | 'operationType'> & {
  metadataMaps: Pick<
    PermissionsRowAccessRequest['metadataMaps'],
    'featureFlagsMap'
  >;
}): boolean =>
  operationType !== 'create' &&
  !temporaryExcludePermissionStorageObject(flatObjectMetadata) &&
  isPrivateRecordsEnabled({ flatObjectMetadata, featureFlagsMap });
