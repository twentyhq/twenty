import { type BaseFlatCreateWorkspaceMigrationAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/base-flat-create-workspace-migration-action.type';
import { type BaseFlatDeleteWorkspaceMigrationAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/base-flat-delete-workspace-migration-action.type';
import { type BaseFlatUpdateWorkspaceMigrationAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/base-flat-update-workspace-migration-action.type';
import { type BaseUniversalCreateWorkspaceMigrationAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/base-universal-create-workspace-migration-action.type';
import { type BaseUniversalDeleteWorkspaceMigrationAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/base-universal-delete-workspace-migration-action.type';
import { type BaseUniversalUpdateWorkspaceMigrationAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/base-universal-update-workspace-migration-action.type';

export type FlatCreatePageLayoutAction =
  BaseFlatCreateWorkspaceMigrationAction<'pageLayout'>;

export type UniversalCreatePageLayoutAction =
  BaseUniversalCreateWorkspaceMigrationAction<'pageLayout'> & {
    tabIdByUniversalIdentifier?: Record<string, string>;
  };

export type FlatUpdatePageLayoutAction =
  BaseFlatUpdateWorkspaceMigrationAction<'pageLayout'>;

export type UniversalUpdatePageLayoutAction =
  BaseUniversalUpdateWorkspaceMigrationAction<'pageLayout'>;

export type UniversalDeletePageLayoutAction =
  BaseUniversalDeleteWorkspaceMigrationAction<'pageLayout'>;

export type FlatDeletePageLayoutAction =
  BaseFlatDeleteWorkspaceMigrationAction<'pageLayout'>;
