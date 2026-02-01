import { type BaseFlatCreateWorkspaceMigrationAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/base-flat-create-workspace-migration-action.type';
import { type BaseFlatDeleteWorkspaceMigrationAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/base-flat-delete-workspace-migration-action.type';
import { type BaseFlatUpdateWorkspaceMigrationAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/base-flat-update-workspace-migration-action.type';
import { type BaseUniversalDeleteWorkspaceMigrationAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/base-universal-delete-workspace-migration-action.type';

export type FlatCreateViewAction =
  BaseFlatCreateWorkspaceMigrationAction<'view'>;

export type FlatUpdateViewAction =
  BaseFlatUpdateWorkspaceMigrationAction<'view'>;

export type UniversalDeleteViewAction =
  BaseUniversalDeleteWorkspaceMigrationAction<'view'>;

export type FlatDeleteViewAction =
  BaseFlatDeleteWorkspaceMigrationAction<'view'>;
