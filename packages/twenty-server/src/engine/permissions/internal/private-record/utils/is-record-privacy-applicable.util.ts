/* @license Enterprise */

import { type PermissionsRowAccessRequest } from 'src/engine/permissions/internal/combine/types/row-access-policy.type';
import { arePrivateRecordsEnabled } from 'src/engine/permissions/internal/private-record/utils/are-private-records-enabled.util';
import { temporaryExcludePermissionStorageObject } from 'src/engine/permissions/utils/temporary-exclude-permission-storage-object.util';

export const isRecordPrivacyApplicable = ({
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
  arePrivateRecordsEnabled({ flatObjectMetadata, featureFlagsMap });
