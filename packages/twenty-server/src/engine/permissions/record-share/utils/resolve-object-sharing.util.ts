/* @license Enterprise */

import { type ObjectPermissionAction } from 'twenty-shared/application';
import {
  FeatureFlagKey,
  type ObjectRecordsOperationType,
} from 'twenty-shared/types';

import { isNonEmptyArray } from 'twenty-shared/utils';

import { isPrivateByDefaultObject } from 'src/engine/permissions/private-record/utils/is-private-by-default-object.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

// Creating records and managing access stay with the roles that can access the object
const OPERATIONS_GRANTABLE_BY_RECORD_SHARE: {
  operationType: ObjectRecordsOperationType;
  objectPermissionAction: ObjectPermissionAction;
}[] = [
  { operationType: 'read', objectPermissionAction: 'canReadObjectRecords' },
  { operationType: 'update', objectPermissionAction: 'canUpdateObjectRecords' },
  {
    operationType: 'softDelete',
    objectPermissionAction: 'canSoftDeleteObjectRecords',
  },
  {
    operationType: 'destroy',
    objectPermissionAction: 'canDestroyObjectRecords',
  },
];

export type ObjectSharing = {
  isShareable: boolean;
  canSetRecordPrivacy: boolean;
  isPrivateByDefault: boolean;
  isAccessGrantableByRecordShare: boolean;
  operationTypesGrantableByRecordShare: ObjectRecordsOperationType[];
};

const resolveOperationTypesGrantableByRecordShare = ({
  disabledObjectPermissionActions,
}: Pick<
  FlatObjectMetadata,
  'disabledObjectPermissionActions'
>): ObjectRecordsOperationType[] =>
  OPERATIONS_GRANTABLE_BY_RECORD_SHARE.filter(
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
  const operationTypesGrantableByRecordShare = isShareable
    ? resolveOperationTypesGrantableByRecordShare(flatObjectMetadata)
    : [];

  return {
    isShareable,
    canSetRecordPrivacy:
      isShareable ||
      (featureFlagsMap[FeatureFlagKey.IS_PRIVATE_RECORDS_ENABLED] ?? false),
    isPrivateByDefault: isPrivateByDefaultObject(flatObjectMetadata),
    isAccessGrantableByRecordShare: isNonEmptyArray(
      operationTypesGrantableByRecordShare,
    ),
    operationTypesGrantableByRecordShare,
  };
};
