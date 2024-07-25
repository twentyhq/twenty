import { StandardIndexFactory } from 'src/engine/workspace-manager/workspace-sync-metadata/factories/standard-index.factory';

import { StandardFieldFactory } from './standard-field.factory';
import { StandardObjectFactory } from './standard-object.factory';
import { StandardRelationFactory } from './standard-relation.factory';

export const workspaceSyncMetadataFactories = [
  StandardFieldFactory,
  StandardObjectFactory,
  StandardRelationFactory,
  StandardIndexFactory,
];
