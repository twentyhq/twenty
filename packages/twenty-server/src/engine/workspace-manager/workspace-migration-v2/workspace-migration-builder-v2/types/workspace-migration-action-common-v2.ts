import { type WorkspaceMigrationCronTriggerActionV2 } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/cron-trigger/types/workspace-migration-cron-trigger-action-v2.type';
import { type WorkspaceMigrationDatabaseEventTriggerActionV2 } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/database-event-trigger/types/workspace-migration-database-event-trigger-action-v2.type';
import { type WorkspaceMigrationFieldActionV2 } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/field/types/workspace-migration-field-action-v2';
import { type WorkspaceMigrationIndexActionV2 } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/index/types/workspace-migration-index-action-v2';
import { type WorkspaceMigrationObjectActionV2 } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/object/types/workspace-migration-object-action-v2';
import { type WorkspaceMigrationRouteTriggerActionV2 } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/route-trigger/types/workspace-migration-route-trigger-action-v2.type';
import { type WorkspaceMigrationServerlessFunctionActionV2 } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/serverless-function/types/workspace-migration-serverless-function-action-v2.type';
import { type WorkspaceMigrationViewFieldActionV2 } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/view-field/types/workspace-migration-view-field-action-v2.type';
import { type WorkspaceMigrationViewFilterActionV2 } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/view-filter/types/workspace-migration-view-filter-action-v2.type';
import { type WorkspaceMigrationViewActionV2 } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/view/types/workspace-migration-view-action-v2.type';

export type WorkspaceMigrationActionV2 =
  | WorkspaceMigrationObjectActionV2
  | WorkspaceMigrationFieldActionV2
  | WorkspaceMigrationIndexActionV2
  | WorkspaceMigrationViewActionV2
  | WorkspaceMigrationViewFieldActionV2
  | WorkspaceMigrationViewFilterActionV2
  | WorkspaceMigrationServerlessFunctionActionV2
  | WorkspaceMigrationDatabaseEventTriggerActionV2
  | WorkspaceMigrationCronTriggerActionV2
  | WorkspaceMigrationRouteTriggerActionV2;
export type WorkspaceMigrationActionTypeV2 = WorkspaceMigrationActionV2['type'];

export type ExtractAction<T extends WorkspaceMigrationActionTypeV2> = Extract<
  WorkspaceMigrationActionV2,
  { type: T }
>;
