import { type BaseFlatCreateWorkspaceMigrationAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/base-flat-create-workspace-migration-action.type';
import { type BaseFlatDeleteWorkspaceMigrationAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/base-flat-delete-workspace-migration-action.type';
import { type BaseFlatUpdateWorkspaceMigrationAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/base-flat-update-workspace-migration-action.type';
import { type BaseUniversalDeleteWorkspaceMigrationAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/base-universal-delete-workspace-migration-action.type';

export type FlatCreateFrontComponentAction =
  BaseFlatCreateWorkspaceMigrationAction<'frontComponent'>;

export type FlatUpdateFrontComponentAction =
  BaseFlatUpdateWorkspaceMigrationAction<'frontComponent'>;

export type UniversalDeleteFrontComponentAction =
  BaseUniversalDeleteWorkspaceMigrationAction<'frontComponent'>;

export type FlatDeleteFrontComponentAction =
  BaseFlatDeleteWorkspaceMigrationAction<'frontComponent'>;
