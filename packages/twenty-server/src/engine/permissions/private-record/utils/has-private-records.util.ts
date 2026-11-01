/* @license Enterprise */

import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

import { type PermissionsRowAccessRequest } from 'src/engine/permissions/combine/types/row-access-policy.type';
import { isPrivateRecordEnabled } from 'src/engine/permissions/private-record/utils/is-private-record-enabled.util';
import { resolveRequiredRecordShareAccessLevels } from 'src/engine/permissions/record-share/utils/resolve-required-record-share-access-levels.util';
import { isPermissionStorageObject } from 'src/engine/permissions/utils/is-permission-storage-object.util';

// An insert has no record yet, so privacy cannot apply to it
export const hasPrivateRecords = ({
  subject,
  environment,
  flatObjectMetadata,
  operationType,
}: Omit<
  PermissionsRowAccessRequest,
  'hypotheticalRecordShareAccessLevel'
>): boolean =>
  isNonEmptyArray(resolveRequiredRecordShareAccessLevels(operationType)) &&
  isPrivateRecordEnabled(environment.featureFlagsMap) &&
  !isPermissionStorageObject(flatObjectMetadata) &&
  isDefined(subject.principalIds);
