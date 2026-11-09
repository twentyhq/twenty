import { type FeatureFlagKey } from 'twenty-shared/types';

export type RecordAccessGroupWriteScope = {
  featureFlagsMap: Partial<Record<FeatureFlagKey, boolean>>;
  workspaceId: string;
  objectMetadataId: string;
};
