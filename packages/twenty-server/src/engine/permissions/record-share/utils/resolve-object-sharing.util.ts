/* @license Enterprise */

import { type ObjectPermissionAction } from 'twenty-shared/application';
import { FeatureFlagKey } from 'twenty-shared/types';

import { isNonEmptyArray } from 'twenty-shared/utils';

import { isPrivateByDefaultObject } from 'src/engine/permissions/private-record/utils/is-private-by-default-object.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type OperationType } from 'src/engine/permissions/role/utils/validate-operation-is-permitted-or-throw.util';

// A record shared by name reaches people whose role cannot otherwise access
// its object, but only to view or edit it: deleting it, creating siblings or
// managing its access stay with the roles that can access the object
const OPERATIONS_GRANTABLE_BEYOND_ROLE: {
  operationType: OperationType;
  objectPermissionAction: ObjectPermissionAction;
}[] = [
  { operationType: 'select', objectPermissionAction: 'canReadObjectRecords' },
  { operationType: 'update', objectPermissionAction: 'canUpdateObjectRecords' },
];

export type ObjectSharing = {
  isShareable: boolean;
  isPrivateByDefault: boolean;
  canShareBeyondRole: boolean;
  operationTypesGrantedBeyondRole: OperationType[];
};

const resolveOperationTypesGrantableBeyondRole = ({
  disabledObjectPermissionActions,
}: Pick<
  FlatObjectMetadata,
  'disabledObjectPermissionActions'
>): OperationType[] =>
  OPERATIONS_GRANTABLE_BEYOND_ROLE.filter(
    ({ objectPermissionAction }) =>
      !disabledObjectPermissionActions?.includes(objectPermissionAction),
  ).map(({ operationType }) => operationType);

export const resolveObjectSharing = ({
  flatObjectMetadata,
  featureFlagsMap,
}: {
  flatObjectMetadata: Pick<
    FlatObjectMetadata,
    'universalIdentifier' | 'disabledObjectPermissionActions'
  >;
  featureFlagsMap: Partial<Record<FeatureFlagKey, boolean>>;
}): ObjectSharing => {
  const isShareable =
    featureFlagsMap[FeatureFlagKey.IS_RECORD_LEVEL_SHARING_ENABLED] ?? false;
  const operationTypesGrantedBeyondRole = isShareable
    ? resolveOperationTypesGrantableBeyondRole(flatObjectMetadata)
    : [];

  return {
    isShareable,
    isPrivateByDefault: isPrivateByDefaultObject(flatObjectMetadata),
    canShareBeyondRole: isNonEmptyArray(operationTypesGrantedBeyondRole),
    operationTypesGrantedBeyondRole,
  };
};
