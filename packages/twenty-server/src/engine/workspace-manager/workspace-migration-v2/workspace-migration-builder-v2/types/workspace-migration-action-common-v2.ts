import { type WorkspaceMigrationCronTriggerActionV2 } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/workspace-migration-cron-trigger-action-v2.type';
import { type WorkspaceMigrationDatabaseEventTriggerActionV2 } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/workspace-migration-database-event-trigger-action-v2.type';
import { type WorkspaceMigrationFieldActionV2 } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/workspace-migration-field-action-v2';
import { type WorkspaceMigrationIndexActionV2 } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/workspace-migration-index-action-v2';
import { type WorkspaceMigrationObjectActionV2 } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/workspace-migration-object-action-v2';
import { type WorkspaceMigrationServerlessFunctionActionV2 } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/workspace-migration-serverless-function-action-v2.type';
import { type WorkspaceMigrationViewActionV2 } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/workspace-migration-view-action-v2.type';
import { type WorkspaceMigrationViewFieldActionV2 } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/workspace-migration-view-field-action-v2.type';

export type WorkspaceMigrationActionV2 =
  | WorkspaceMigrationObjectActionV2
  | WorkspaceMigrationFieldActionV2
  | WorkspaceMigrationIndexActionV2
  | WorkspaceMigrationViewActionV2
  | WorkspaceMigrationViewFieldActionV2
  | WorkspaceMigrationServerlessFunctionActionV2
  | WorkspaceMigrationDatabaseEventTriggerActionV2
  | WorkspaceMigrationCronTriggerActionV2;
export type WorkspaceMigrationActionTypeV2 = WorkspaceMigrationActionV2['type'];

export type ExtractAction<T extends WorkspaceMigrationActionTypeV2> = Extract<
  WorkspaceMigrationActionV2,
  { type: T }
>;
