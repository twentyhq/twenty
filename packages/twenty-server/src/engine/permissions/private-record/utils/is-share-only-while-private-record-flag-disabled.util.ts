/* @license Enterprise */

import { isNonEmptyArray } from 'twenty-shared/utils';

import { type PermissionsRowAccessRequest } from 'src/engine/permissions/combine/types/row-access-policy.type';
import { isPrivateByDefaultObject } from 'src/engine/permissions/private-record/utils/is-private-by-default-object.util';
import { isPrivateRecordEnabled } from 'src/engine/permissions/private-record/utils/is-private-record-enabled.util';
import { resolveRequiredRecordShareAccessLevels } from 'src/engine/permissions/record-share/utils/resolve-required-record-share-access-levels.util';

// TODO(@charlesBochet): remove after 2.55; chats reach only their shares while IS_PRIVATE_RECORD_ENABLED is off
export const isShareOnlyWhilePrivateRecordFlagDisabled = ({
  metadataMaps,
  flatObjectMetadata,
  operationType,
}: Pick<
  PermissionsRowAccessRequest,
  'metadataMaps' | 'flatObjectMetadata' | 'operationType'
>): boolean =>
  isNonEmptyArray(resolveRequiredRecordShareAccessLevels(operationType)) &&
  isPrivateByDefaultObject(flatObjectMetadata) &&
  !isPrivateRecordEnabled(metadataMaps.featureFlagsMap);
