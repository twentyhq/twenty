/* @license Enterprise */

import { type ObjectPermissionAction } from 'twenty-shared/application';
import { FeatureFlagKey, RecordShareAccessLevel } from 'twenty-shared/types';

import { isNonEmptyArray } from 'twenty-shared/utils';

import { isPrivateRecordEnabled } from 'src/engine/permissions/private-record/utils/is-private-record-enabled.util';
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
  isShareRequired: boolean;
  isPrivateByDefault: boolean;
  defaultGeneralAccessLevel: RecordShareAccessLevel | null;
  canShareBeyondRole: boolean;
  operationTypesGrantedBeyondRole: OperationType[];
};

const resolveDefaultGeneralAccessLevel = ({
  isShareable,
  isShareRequired,
  isPrivateByDefault,
}: Pick<
  ObjectSharing,
  'isShareable' | 'isShareRequired' | 'isPrivateByDefault'
>): RecordShareAccessLevel | null => {
  if (isShareRequired || isPrivateByDefault) {
    return RecordShareAccessLevel.NONE;
  }

  return isShareable ? RecordShareAccessLevel.READ_WRITE : null;
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
    'universalIdentifier' | 'isSystem' | 'disabledObjectPermissionActions'
  >;
  featureFlagsMap: Partial<Record<FeatureFlagKey, boolean>>;
}): ObjectSharing => {
  const isRecordSharingEnabled =
    featureFlagsMap[FeatureFlagKey.IS_RECORD_LEVEL_SHARING_ENABLED] ?? false;

  const isPrivateByDefault = isPrivateByDefaultObject(flatObjectMetadata);
  const isShareRequired =
    isPrivateByDefault && !isPrivateRecordEnabled(featureFlagsMap);
  const canBeShared = isRecordSharingEnabled && !flatObjectMetadata.isSystem;
  const isShareable = isPrivateByDefault || canBeShared;

  const operationTypesGrantedBeyondRole = canBeShared
    ? resolveOperationTypesGrantableBeyondRole(flatObjectMetadata)
    : [];

  return {
    isShareable,
    isShareRequired,
    isPrivateByDefault,
    defaultGeneralAccessLevel: resolveDefaultGeneralAccessLevel({
      isShareable,
      isShareRequired,
      isPrivateByDefault,
    }),
    canShareBeyondRole: isNonEmptyArray(operationTypesGrantedBeyondRole),
    operationTypesGrantedBeyondRole,
  };
};
