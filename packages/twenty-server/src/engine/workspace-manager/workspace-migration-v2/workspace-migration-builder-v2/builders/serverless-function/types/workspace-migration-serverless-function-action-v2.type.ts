import { type Sources } from 'twenty-shared/types';

import { type BaseCreateWorkspaceMigrationAction } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/base-create-workspace-migration-action.type';
import { type BaseDeleteWorkspaceMigrationAction } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/base-delete-workspace-migration-action.type';
import { type BaseUpdateWorkspaceMigrationAction } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/base-update-workspace-migration-action.type';

export type CreateServerlessFunctionAction =
  BaseCreateWorkspaceMigrationAction<'serverlessFunction'>;

export type UpdateServerlessFunctionAction =
  BaseUpdateWorkspaceMigrationAction<'serverlessFunction'> & {
    code?: Sources;
  };

export type DeleteServerlessFunctionAction =
  BaseDeleteWorkspaceMigrationAction<'serverlessFunction'>;
