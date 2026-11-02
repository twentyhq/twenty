/* @license Enterprise */

import { isNonEmptyArray } from 'twenty-shared/utils';

import { type PermissionsRowAccessRequest } from 'src/engine/permissions/combine/types/row-access-policy.type';
import { isPrivateRecordEnabled } from 'src/engine/permissions/private-record/utils/is-private-record-enabled.util';
import { resolveRequiredRecordShareAccessLevels } from 'src/engine/permissions/record-share/utils/resolve-required-record-share-access-levels.util';
import { isPermissionStorageObject } from 'src/engine/permissions/utils/is-permission-storage-object.util';

export const isRecordPrivacyApplicable = ({
  metadataMaps,
  flatObjectMetadata,
  operationType,
}: Pick<
  PermissionsRowAccessRequest,
  'metadataMaps' | 'flatObjectMetadata' | 'operationType'
>): boolean =>
  isNonEmptyArray(resolveRequiredRecordShareAccessLevels(operationType)) &&
  isPrivateRecordEnabled(metadataMaps.featureFlagsMap) &&
  !isPermissionStorageObject(flatObjectMetadata);
