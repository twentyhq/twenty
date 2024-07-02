import { StandardIndexFactory } from 'src/engine/workspace-manager/workspace-sync-metadata/factories/standard-index.factory';

import { FeatureFlagFactory } from './feature-flags.factory';
import { StandardFieldFactory } from './standard-field.factory';
import { StandardObjectFactory } from './standard-object.factory';
import { StandardRelationFactory } from './standard-relation.factory';

export const workspaceSyncMetadataFactories = [
  FeatureFlagFactory,
  StandardFieldFactory,
  StandardObjectFactory,
  StandardRelationFactory,
  StandardIndexFactory,
];
