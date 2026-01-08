import { type BaseCreateWorkspaceMigrationAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/base-create-workspace-migration-action.type';
import { type BaseDeleteWorkspaceMigrationAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/base-delete-workspace-migration-action.type';
import { type BaseUpdateWorkspaceMigrationAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/base-update-workspace-migration-action.type';

export type CreatePageLayoutTabAction =
  BaseCreateWorkspaceMigrationAction<'pageLayoutTab'>;

export type UpdatePageLayoutTabAction =
  BaseUpdateWorkspaceMigrationAction<'pageLayoutTab'>;

export type DeletePageLayoutTabAction =
  BaseDeleteWorkspaceMigrationAction<'pageLayoutTab'>;
