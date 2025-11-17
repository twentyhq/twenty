import { type FlatEntityPropertiesUpdates } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-properties-updates.type';
import { type FlatFeatureFlag } from 'src/engine/core-modules/feature-flag/types/flat-feature-flag.type';

export type CreateFeatureFlagAction = {
  type: 'create_feature_flag';
  featureFlag: FlatFeatureFlag;
};

export type UpdateFeatureFlagAction = {
  type: 'update_feature_flag';
  featureFlagId: string;
  updates: FlatEntityPropertiesUpdates<'featureFlag'>;
};

export type DeleteFeatureFlagAction = {
  type: 'delete_feature_flag';
  featureFlagId: string;
};

export type WorkspaceMigrationFeatureFlagActionV2 =
  | CreateFeatureFlagAction
  | UpdateFeatureFlagAction
  | DeleteFeatureFlagAction;
