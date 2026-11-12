import {
  FeatureFlagKey,
  type ObjectRecordsOperationType,
} from 'twenty-shared/types';

export const getEnforcedOperationType = ({
  operationType,
  featureFlagsMap,
}: {
  operationType: ObjectRecordsOperationType;
  featureFlagsMap: Partial<Record<FeatureFlagKey, boolean>>;
}): ObjectRecordsOperationType =>
  operationType === 'create' &&
  !featureFlagsMap[FeatureFlagKey.IS_CREATE_RECORDS_PERMISSION_ENABLED]
    ? 'update'
    : operationType;
