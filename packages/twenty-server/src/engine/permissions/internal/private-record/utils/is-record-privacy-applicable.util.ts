/* @license Enterprise */

import { isNonEmptyArray } from 'twenty-shared/utils';

import { type PermissionsRowAccessRequest } from 'src/engine/permissions/internal/combine/types/row-access-policy.type';
import { resolveRequiredRecordShareAccessLevels } from 'src/engine/permissions/internal/record-share/utils/resolve-required-record-share-access-levels.util';
import { isPermissionStorageObject } from 'src/engine/permissions/utils/is-permission-storage-object.util';

export const isRecordPrivacyApplicable = ({
  flatObjectMetadata,
  operationType,
}: Pick<
  PermissionsRowAccessRequest,
  'flatObjectMetadata' | 'operationType'
>): boolean =>
  isNonEmptyArray(resolveRequiredRecordShareAccessLevels(operationType)) &&
  !isPermissionStorageObject(flatObjectMetadata);
