import { type ObjectsPermissionsByRoleId } from 'twenty-shared/types';

import { type FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { type ObjectMetadataMaps } from 'src/engine/metadata-modules/types/object-metadata-maps';

export type WorkspaceContextData = {
  objectMetadataMaps: ObjectMetadataMaps;
  metadataVersion: number;
  featureFlagsMap: Record<FeatureFlagKey, boolean>;
  permissionsPerRoleId: ObjectsPermissionsByRoleId;
};
