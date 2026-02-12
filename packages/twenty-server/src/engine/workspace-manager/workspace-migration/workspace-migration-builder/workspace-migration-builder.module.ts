import { Module } from '@nestjs/common';

import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { FlatFieldMetadataTypeValidatorService } from 'src/engine/metadata-modules/flat-field-metadata/services/flat-field-metadata-type-validator.service';
import { WorkspaceMigrationAgentActionsBuilderService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/agent/workspace-migration-agent-actions-builder.service';
import { WorkspaceMigrationCommandMenuItemActionsBuilderService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/command-menu-item/workspace-migration-command-menu-item-actions-builder.service';
import { WorkspaceMigrationNavigationMenuItemActionsBuilderService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/navigation-menu-item/workspace-migration-navigation-menu-item-actions-builder.service';
import { WorkspaceMigrationFieldActionsBuilderService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/field/workspace-migration-field-actions-builder.service';
import { WorkspaceMigrationIndexActionsBuilderService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/index/workspace-migration-index-actions-builder.service';
import { WorkspaceMigrationObjectActionsBuilderService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/object/workspace-migration-object-actions-builder.service';
import { WorkspaceMigrationPageLayoutTabActionsBuilderService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/page-layout-tab/workspace-migration-page-layout-tab-actions-builder.service';
import { WorkspaceMigrationPageLayoutWidgetActionsBuilderService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/page-layout-widget/workspace-migration-page-layout-widget-actions-builder.service';
import { WorkspaceMigrationPageLayoutActionsBuilderService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/page-layout/workspace-migration-page-layout-actions-builder.service';
import { WorkspaceMigrationRoleTargetActionsBuilderService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/role-target/workspace-migration-role-target-actions-builder.service';
import { WorkspaceMigrationRoleActionsBuilderService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/role/workspace-migration-role-actions-builder.service';
import { WorkspaceMigrationRowLevelPermissionPredicateGroupActionsBuilderService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/row-level-permission-predicate-group/workspace-migration-row-level-permission-predicate-group-actions-builder.service';
import { WorkspaceMigrationRowLevelPermissionPredicateActionsBuilderService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/row-level-permission-predicate/workspace-migration-row-level-permission-predicate-actions-builder.service';
import { WorkspaceMigrationLogicFunctionActionsBuilderService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/logic-function/workspace-migration-logic-function-actions-builder.service';
import { WorkspaceMigrationSkillActionsBuilderService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/skill/workspace-migration-skill-actions-builder.service';
import { WorkspaceMigrationFrontComponentActionsBuilderService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/front-component/workspace-migration-front-component-actions-builder.service';
import { WorkspaceMigrationViewFieldActionsBuilderService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/view-field/workspace-migration-view-field-actions-builder.service';
import { WorkspaceMigrationViewFieldGroupActionsBuilderService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/view-field-group/workspace-migration-view-field-group-actions-builder.service';
import { WorkspaceMigrationWebhookActionsBuilderService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/webhook/workspace-migration-webhook-actions-builder.service';
import { WorkspaceMigrationViewFilterGroupActionsBuilderService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/view-filter-group/workspace-migration-view-filter-group-actions-builder.service';
import { WorkspaceMigrationViewFilterActionsBuilderService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/view-filter/workspace-migration-view-filter-actions-builder.service';
import { WorkspaceMigrationViewGroupActionsBuilderService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/view-group/workspace-migration-view-group-actions-builder.service';
import { WorkspaceMigrationViewActionsBuilderService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/view/workspace-migration-view-actions-builder.service';
import { WorkspaceMigrationBuilderValidatorsModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/workspace-migration-builder-validators.module';

@Module({
  imports: [FeatureFlagModule, WorkspaceMigrationBuilderValidatorsModule],
  providers: [
    FlatFieldMetadataTypeValidatorService,
    WorkspaceMigrationObjectActionsBuilderService,
    WorkspaceMigrationViewActionsBuilderService,
    WorkspaceMigrationViewFieldActionsBuilderService,
    WorkspaceMigrationViewFilterActionsBuilderService,
    WorkspaceMigrationViewFilterGroupActionsBuilderService,
    WorkspaceMigrationViewGroupActionsBuilderService,
    WorkspaceMigrationViewFieldGroupActionsBuilderService,
    WorkspaceMigrationIndexActionsBuilderService,
    WorkspaceMigrationLogicFunctionActionsBuilderService,
    WorkspaceMigrationFieldActionsBuilderService,
    WorkspaceMigrationRoleActionsBuilderService,
    WorkspaceMigrationRoleTargetActionsBuilderService,
    WorkspaceMigrationAgentActionsBuilderService,
    WorkspaceMigrationSkillActionsBuilderService,
    WorkspaceMigrationCommandMenuItemActionsBuilderService,
    WorkspaceMigrationNavigationMenuItemActionsBuilderService,
    WorkspaceMigrationPageLayoutActionsBuilderService,
    WorkspaceMigrationPageLayoutWidgetActionsBuilderService,
    WorkspaceMigrationPageLayoutTabActionsBuilderService,
    WorkspaceMigrationRowLevelPermissionPredicateActionsBuilderService,
    WorkspaceMigrationRowLevelPermissionPredicateGroupActionsBuilderService,
    WorkspaceMigrationFrontComponentActionsBuilderService,
    WorkspaceMigrationWebhookActionsBuilderService,
  ],
  exports: [
    WorkspaceMigrationViewActionsBuilderService,
    WorkspaceMigrationIndexActionsBuilderService,
    WorkspaceMigrationObjectActionsBuilderService,
    WorkspaceMigrationViewFieldActionsBuilderService,
    WorkspaceMigrationViewFilterActionsBuilderService,
    WorkspaceMigrationViewFilterGroupActionsBuilderService,
    WorkspaceMigrationViewGroupActionsBuilderService,
    WorkspaceMigrationViewFieldGroupActionsBuilderService,
    WorkspaceMigrationFieldActionsBuilderService,
    WorkspaceMigrationLogicFunctionActionsBuilderService,
    WorkspaceMigrationRoleActionsBuilderService,
    WorkspaceMigrationRoleTargetActionsBuilderService,
    WorkspaceMigrationAgentActionsBuilderService,
    WorkspaceMigrationSkillActionsBuilderService,
    WorkspaceMigrationCommandMenuItemActionsBuilderService,
    WorkspaceMigrationNavigationMenuItemActionsBuilderService,
    WorkspaceMigrationPageLayoutActionsBuilderService,
    WorkspaceMigrationPageLayoutWidgetActionsBuilderService,
    WorkspaceMigrationPageLayoutTabActionsBuilderService,
    WorkspaceMigrationRowLevelPermissionPredicateActionsBuilderService,
    WorkspaceMigrationRowLevelPermissionPredicateGroupActionsBuilderService,
    FlatFieldMetadataTypeValidatorService,
    WorkspaceMigrationFrontComponentActionsBuilderService,
    WorkspaceMigrationWebhookActionsBuilderService,
  ],
})
export class WorkspaceMigrationBuilderModule {}
