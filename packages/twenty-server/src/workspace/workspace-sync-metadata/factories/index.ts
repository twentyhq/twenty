import { FeatureFlagFactory } from './feature-flags.factory';
import { StandardObjectFactory } from './standard-object.factory';
import { StandardRelationFactory } from './standard-relation.factory';
import { ObjectWorkspaceMigrationFactory } from './object-workspace-migration.factory';
import { FieldWorkspaceMigrationFactory } from './field-workspace-migration.factory';
import { RelationWorkspaceMigrationFactory } from './relation-workspace-migration.factory';

export const workspaceSyncMetadataFactories = [
  FeatureFlagFactory,
  StandardObjectFactory,
  StandardRelationFactory,
  ObjectWorkspaceMigrationFactory,
  FieldWorkspaceMigrationFactory,
  RelationWorkspaceMigrationFactory,
];
