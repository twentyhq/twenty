import { FeatureFlagFactory } from './feature-flags.factory';
import { StandardObjectFactory } from './standard-object.factory';
import { StandardRelationFactory } from './standard-relation.factory';

export const workspaceSyncMetadataFactories = [
  FeatureFlagFactory,
  StandardObjectFactory,
  StandardRelationFactory,
];
