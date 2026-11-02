/* @license Enterprise */

import { type PermissionsRowAccessRequest } from 'src/engine/permissions/combine/types/row-access-policy.type';
import { isOperationGrantedBeyondRole } from 'src/engine/permissions/record-share/utils/is-operation-granted-beyond-role.util';

export const areRecordGrantsHeldToRowLevelPermissions = ({
  metadataMaps,
  flatObjectMetadata,
  operationType,
}: PermissionsRowAccessRequest): boolean =>
  !isOperationGrantedBeyondRole({
    flatObjectMetadata,
    featureFlagsMap: metadataMaps.featureFlagsMap,
    operationType,
  });
