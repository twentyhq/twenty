import { StandardIndexFactory } from 'src/engine/workspace-manager/workspace-sync-metadata/factories/standard-index.factory';
import { StandardPermissionFactory } from 'src/engine/workspace-manager/workspace-sync-metadata/factories/standard-permission.factory';

import { StandardFieldRelationFactory } from './standard-field-relation.factory';
import { StandardFieldFactory } from './standard-field.factory';
import { StandardObjectFactory } from './standard-object.factory';

export const workspaceSyncMetadataFactories = [
  StandardFieldFactory,
  StandardObjectFactory,
  StandardFieldRelationFactory,
  StandardIndexFactory,
  StandardPermissionFactory,
];
