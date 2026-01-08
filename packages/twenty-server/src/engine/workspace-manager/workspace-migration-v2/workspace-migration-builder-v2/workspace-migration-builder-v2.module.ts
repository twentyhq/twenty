import { Module } from '@nestjs/common';

import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { FlatFieldMetadataTypeValidatorService } from 'src/engine/metadata-modules/flat-field-metadata/services/flat-field-metadata-type-validator.service';
import { WorkspaceMigrationV2AgentActionsBuilderService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/agent/workspace-migration-v2-agent-actions-builder.service';
import { WorkspaceMigrationV2SkillActionsBuilderService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/skill/workspace-migration-v2-skill-actions-builder.service';
import { WorkspaceMigrationV2CronTriggerActionsBuilderService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/cron-trigger/workspace-migration-v2-cron-trigger-action-builder.service';
import { WorkspaceMigrationV2DatabaseEventTriggerActionsBuilderService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/database-event-trigger/workspace-migration-v2-database-event-trigger-actions-builder.service';
import { WorkspaceMigrationV2FieldActionsBuilderService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/field/workspace-migration-v2-field-actions-builder.service';
import { WorkspaceMigrationV2IndexActionsBuilderService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/index/workspace-migration-v2-index-actions-builder.service';
import { WorkspaceMigrationV2ObjectActionsBuilderService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/object/workspace-migration-v2-object-actions-builder.service';
import { WorkspaceMigrationV2PageLayoutTabActionsBuilderService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/page-layout-tab/workspace-migration-v2-page-layout-tab-actions-builder.service';
import { WorkspaceMigrationV2PageLayoutWidgetActionsBuilderService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/page-layout-widget/workspace-migration-v2-page-layout-widget-actions-builder.service';
import { WorkspaceMigrationV2PageLayoutActionsBuilderService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/page-layout/workspace-migration-v2-page-layout-actions-builder.service';
import { WorkspaceMigrationV2RoleTargetActionsBuilderService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/role-target/workspace-migration-v2-role-target-actions-builder.service';
import { WorkspaceMigrationV2RoleActionsBuilderService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/role/workspace-migration-v2-role-actions-builder.service';
import { WorkspaceMigrationV2RouteTriggerActionsBuilderService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/route-trigger/workspace-migration-v2-route-trigger-actions-builder.service';
import { WorkspaceMigrationV2RowLevelPermissionPredicateGroupActionsBuilderService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/row-level-permission-predicate-group/workspace-migration-v2-row-level-permission-predicate-group-actions-builder.service';
import { WorkspaceMigrationV2RowLevelPermissionPredicateActionsBuilderService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/row-level-permission-predicate/workspace-migration-v2-row-level-permission-predicate-actions-builder.service';
import { WorkspaceMigrationV2ServerlessFunctionActionsBuilderService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/serverless-function/workspace-migration-v2-serverless-function-actions-builder.service';
import { WorkspaceMigrationV2ViewFieldActionsBuilderService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/view-field/workspace-migration-v2-view-field-actions-builder.service';
import { WorkspaceMigrationV2ViewFilterActionsBuilderService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/view-filter/workspace-migration-v2-view-filter-actions-builder.service';
import { WorkspaceMigrationV2ViewFilterGroupActionsBuilderService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/view-filter-group/workspace-migration-v2-view-filter-group-actions-builder.service';
import { WorkspaceMigrationV2ViewGroupActionsBuilderService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/view-group/workspace-migration-v2-view-group-actions-builder.service';
import { WorkspaceMigrationV2ViewActionsBuilderService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/view/workspace-migration-v2-view-actions-builder.service';
import { WorkspaceMigrationBuilderValidatorsModule } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/validators/workspace-migration-builder-validators.module';

@Module({
  imports: [FeatureFlagModule, WorkspaceMigrationBuilderValidatorsModule],
  providers: [
    FlatFieldMetadataTypeValidatorService,
    WorkspaceMigrationV2ObjectActionsBuilderService,
    WorkspaceMigrationV2ViewActionsBuilderService,
    WorkspaceMigrationV2ViewFieldActionsBuilderService,
    WorkspaceMigrationV2ViewFilterActionsBuilderService,
    WorkspaceMigrationV2ViewFilterGroupActionsBuilderService,
    WorkspaceMigrationV2ViewGroupActionsBuilderService,
    WorkspaceMigrationV2IndexActionsBuilderService,
    WorkspaceMigrationV2ServerlessFunctionActionsBuilderService,
    WorkspaceMigrationV2DatabaseEventTriggerActionsBuilderService,
    WorkspaceMigrationV2FieldActionsBuilderService,
    WorkspaceMigrationV2CronTriggerActionsBuilderService,
    WorkspaceMigrationV2RouteTriggerActionsBuilderService,
    WorkspaceMigrationV2RoleActionsBuilderService,
    WorkspaceMigrationV2RoleTargetActionsBuilderService,
    WorkspaceMigrationV2AgentActionsBuilderService,
    WorkspaceMigrationV2SkillActionsBuilderService,
    WorkspaceMigrationV2PageLayoutActionsBuilderService,
    WorkspaceMigrationV2PageLayoutWidgetActionsBuilderService,
    WorkspaceMigrationV2PageLayoutTabActionsBuilderService,
    WorkspaceMigrationV2RowLevelPermissionPredicateActionsBuilderService,
    WorkspaceMigrationV2RowLevelPermissionPredicateGroupActionsBuilderService,
  ],
  exports: [
    WorkspaceMigrationV2ViewActionsBuilderService,
    WorkspaceMigrationV2IndexActionsBuilderService,
    WorkspaceMigrationV2ObjectActionsBuilderService,
    WorkspaceMigrationV2ViewFieldActionsBuilderService,
    WorkspaceMigrationV2ViewFilterActionsBuilderService,
    WorkspaceMigrationV2ViewFilterGroupActionsBuilderService,
    WorkspaceMigrationV2ViewGroupActionsBuilderService,
    WorkspaceMigrationV2FieldActionsBuilderService,
    WorkspaceMigrationV2ServerlessFunctionActionsBuilderService,
    WorkspaceMigrationV2DatabaseEventTriggerActionsBuilderService,
    WorkspaceMigrationV2CronTriggerActionsBuilderService,
    WorkspaceMigrationV2RouteTriggerActionsBuilderService,
    WorkspaceMigrationV2RoleActionsBuilderService,
    WorkspaceMigrationV2RoleTargetActionsBuilderService,
    WorkspaceMigrationV2AgentActionsBuilderService,
    WorkspaceMigrationV2SkillActionsBuilderService,
    WorkspaceMigrationV2PageLayoutActionsBuilderService,
    WorkspaceMigrationV2PageLayoutWidgetActionsBuilderService,
    WorkspaceMigrationV2PageLayoutTabActionsBuilderService,
    WorkspaceMigrationV2RowLevelPermissionPredicateActionsBuilderService,
    WorkspaceMigrationV2RowLevelPermissionPredicateGroupActionsBuilderService,
    FlatFieldMetadataTypeValidatorService,
  ],
})
export class WorkspaceMigrationBuilderV2Module {}
