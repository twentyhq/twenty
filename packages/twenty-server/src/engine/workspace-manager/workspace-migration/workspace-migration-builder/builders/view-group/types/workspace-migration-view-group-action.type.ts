import { type BaseCreateWorkspaceMigrationAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/base-create-workspace-migration-action.type';
import { type BaseDeleteWorkspaceMigrationAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/base-delete-workspace-migration-action.type';
import { type BaseUpdateWorkspaceMigrationAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/base-update-workspace-migration-action.type';

export type CreateViewGroupAction =
  BaseCreateWorkspaceMigrationAction<'viewGroup'>;

export type UpdateViewGroupAction =
  BaseUpdateWorkspaceMigrationAction<'viewGroup'>;

export type DeleteViewGroupAction =
  BaseDeleteWorkspaceMigrationAction<'viewGroup'>;
