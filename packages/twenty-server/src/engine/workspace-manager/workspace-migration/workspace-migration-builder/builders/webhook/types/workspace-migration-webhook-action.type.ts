import { type BaseCreateWorkspaceMigrationAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/base-create-workspace-migration-action.type';
import { type BaseDeleteWorkspaceMigrationAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/base-delete-workspace-migration-action.type';
import { type BaseFlatDeleteWorkspaceMigrationAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/base-flat-delete-workspace-migration-action.type';
import { type BaseUpdateWorkspaceMigrationAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/base-update-workspace-migration-action.type';

export type CreateWebhookAction = BaseCreateWorkspaceMigrationAction<'webhook'>;

export type UpdateWebhookAction = BaseUpdateWorkspaceMigrationAction<'webhook'>;

export type DeleteWebhookAction = BaseDeleteWorkspaceMigrationAction<'webhook'>;

export type FlatDeleteWebhookAction =
  BaseFlatDeleteWorkspaceMigrationAction<'webhook'>;
