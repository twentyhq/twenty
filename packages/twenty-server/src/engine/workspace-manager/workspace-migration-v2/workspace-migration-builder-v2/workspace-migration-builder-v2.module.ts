import { Module } from '@nestjs/common';

import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { FlatFieldMetadataTypeValidatorService } from 'src/engine/metadata-modules/flat-field-metadata/services/flat-field-metadata-type-validator.service';
import { WorkspaceMigrationV2CronTriggerActionsBuilderService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/cron-trigger/workspace-migration-v2-cron-trigger-action-builder.service';
import { WorkspaceMigrationV2DatabaseEventTriggerActionsBuilderService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/database-event-trigger/workspace-migration-v2-database-event-trigger-actions-builder.service';
import { WorkspaceMigrationV2FieldActionsBuilderService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/field/services/workspace-migration-v2-field-actions-builder.service';
import { WorkspaceMigrationV2IndexActionsBuilderService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/index/workspace-migration-v2-index-actions-builder.service';
import { WorkspaceMigrationV2ObjectActionsBuilderService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/object/services/workspace-migration-v2-object-actions-builder.service';
import { WorkspaceMigrationV2RouteTriggerActionsBuilderService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/route-trigger/workspace-migration-v2-route-trigger-actions-builder.service';
import { WorkspaceMigrationV2ServerlessFunctionActionsBuilderService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/serverless-function/workspace-migration-v2-serverless-function-actions-builder.service';
import { WorkspaceMigrationV2ViewFieldActionsBuilderService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/view-field/workspace-migration-v2-view-field-actions-builder.service';
import { WorkspaceMigrationV2ViewActionsBuilderService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/view/workspace-migration-v2-view-actions-builder.service';
import { WorkspaceMigrationBuilderValidatorsModule } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/validators/workspace-migration-builder-validators.module';

@Module({
  imports: [FeatureFlagModule, WorkspaceMigrationBuilderValidatorsModule],
  providers: [
    FlatFieldMetadataTypeValidatorService,
    WorkspaceMigrationV2ObjectActionsBuilderService,
    WorkspaceMigrationV2ViewActionsBuilderService,
    WorkspaceMigrationV2ViewFieldActionsBuilderService,
    WorkspaceMigrationV2IndexActionsBuilderService,
    WorkspaceMigrationV2ServerlessFunctionActionsBuilderService,
    WorkspaceMigrationV2DatabaseEventTriggerActionsBuilderService,
    WorkspaceMigrationV2FieldActionsBuilderService,
    WorkspaceMigrationV2CronTriggerActionsBuilderService,
    WorkspaceMigrationV2RouteTriggerActionsBuilderService,
  ],
  exports: [
    WorkspaceMigrationV2ViewActionsBuilderService,
    WorkspaceMigrationV2IndexActionsBuilderService,
    WorkspaceMigrationV2ObjectActionsBuilderService,
    WorkspaceMigrationV2ViewFieldActionsBuilderService,
    WorkspaceMigrationV2FieldActionsBuilderService,
    WorkspaceMigrationV2ServerlessFunctionActionsBuilderService,
    WorkspaceMigrationV2DatabaseEventTriggerActionsBuilderService,
    WorkspaceMigrationV2CronTriggerActionsBuilderService,
    WorkspaceMigrationV2RouteTriggerActionsBuilderService,
    FlatFieldMetadataTypeValidatorService,
  ],
})
export class WorkspaceMigrationBuilderV2Module {}
