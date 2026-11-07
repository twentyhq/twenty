/* @license Enterprise */

import { isNonEmptyArray } from 'twenty-shared/utils';

import { type PermissionsRowAccessRequest } from 'src/engine/permissions/internal/combine/types/row-access-policy.type';
import { resolveRequiredRecordShareAccessLevels } from 'src/engine/permissions/internal/record-share/utils/resolve-required-record-share-access-levels.util';
import { arePrivateRecordsEnabled } from 'src/engine/permissions/private-record/utils/are-private-records-enabled.util';
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
  isNonEmptyArray(resolveRequiredRecordShareAccessLevels(operationType)) &&
  !isPermissionStorageObject(flatObjectMetadata) &&
  arePrivateRecordsEnabled({ flatObjectMetadata, featureFlagsMap });
