import { FeatureFlagFactory } from './feature-flags.factory';
import { ReflectiveMetadataFactory } from './reflective-metadata.factory';
import { StandardObjectFactory } from './standard-object.factory';

export const workspaceSyncMetadataFactories = [
  FeatureFlagFactory,
  ReflectiveMetadataFactory,
  StandardObjectFactory,
];
