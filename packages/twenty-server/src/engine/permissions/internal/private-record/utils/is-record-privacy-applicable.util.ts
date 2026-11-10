/* @license Enterprise */

import { type PermissionsRowAccessRequest } from 'src/engine/permissions/internal/combine/types/row-access-policy.type';
import { arePrivateRecordsEnabled } from 'src/engine/permissions/internal/private-record/utils/are-private-records-enabled.util';
import { isPermissionStorageObject } from 'src/engine/permissions/utils/is-permission-storage-object.util';

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
  !isPermissionStorageObject(flatObjectMetadata) &&
  arePrivateRecordsEnabled({ flatObjectMetadata, featureFlagsMap });
