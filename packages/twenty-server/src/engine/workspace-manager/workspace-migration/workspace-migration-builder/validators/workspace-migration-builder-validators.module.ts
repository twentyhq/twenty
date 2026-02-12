import { Module } from '@nestjs/common';

import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { FlatFieldMetadataTypeValidatorService } from 'src/engine/metadata-modules/flat-field-metadata/services/flat-field-metadata-type-validator.service';
import { FlatPageLayoutWidgetTypeValidatorService } from 'src/engine/metadata-modules/flat-page-layout-widget/services/flat-page-layout-widget-type-validator.service';
import { FlatAgentValidatorService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/services/flat-agent-validator.service';
import { FlatCommandMenuItemValidatorService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/services/flat-command-menu-item-validator.service';
import { FlatFieldMetadataValidatorService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/services/flat-field-metadata-validator.service';
import { FlatFrontComponentValidatorService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/services/flat-front-component-validator.service';
import { FlatIndexValidatorService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/services/flat-index-metadata-validator.service';
import { FlatNavigationMenuItemValidatorService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/services/flat-navigation-menu-item-validator.service';
import { FlatObjectMetadataValidatorService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/services/flat-object-metadata-validator.service';
import { FlatPageLayoutTabValidatorService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/services/flat-page-layout-tab-validator.service';
import { FlatPageLayoutValidatorService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/services/flat-page-layout-validator.service';
import { FlatPageLayoutWidgetValidatorService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/services/flat-page-layout-widget-validator.service';
import { FlatRoleTargetValidatorService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/services/flat-role-target-validator.service';
import { FlatRoleValidatorService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/services/flat-role-validator.service';
import { FlatRowLevelPermissionPredicateGroupValidatorService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/services/flat-row-level-permission-predicate-group-validator.service';
import { FlatRowLevelPermissionPredicateValidatorService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/services/flat-row-level-permission-predicate-validator.service';
import { FlatLogicFunctionValidatorService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/services/flat-logic-function-validator.service';
import { FlatSkillValidatorService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/services/flat-skill-validator.service';
import { FlatViewFieldGroupValidatorService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/services/flat-view-field-group-validator.service';
import { FlatViewFieldValidatorService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/services/flat-view-field-validator.service';
import { FlatViewFilterGroupValidatorService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/services/flat-view-filter-group-validator.service';
import { FlatViewFilterValidatorService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/services/flat-view-filter-validator.service';
import { FlatViewGroupValidatorService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/services/flat-view-group-validator.service';
import { FlatViewValidatorService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/services/flat-view-validator.service';
import { FlatWebhookValidatorService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/services/flat-webhook-validator.service';

@Module({
  imports: [FeatureFlagModule],
  providers: [
    FlatViewValidatorService,
    FlatViewFieldValidatorService,
    FlatViewFilterValidatorService,
    FlatViewFilterGroupValidatorService,
    FlatViewGroupValidatorService,
    FlatViewFieldGroupValidatorService,
    FlatIndexValidatorService,
    FlatFieldMetadataValidatorService,
    FlatObjectMetadataValidatorService,
    FlatLogicFunctionValidatorService,
    FlatFieldMetadataTypeValidatorService,
    FlatPageLayoutWidgetTypeValidatorService,
    FlatRoleValidatorService,
    FlatRoleTargetValidatorService,
    FlatAgentValidatorService,
    FlatSkillValidatorService,
    FlatCommandMenuItemValidatorService,
    FlatNavigationMenuItemValidatorService,
    FlatPageLayoutValidatorService,
    FlatPageLayoutWidgetValidatorService,
    FlatPageLayoutTabValidatorService,
    FlatRowLevelPermissionPredicateValidatorService,
    FlatRowLevelPermissionPredicateGroupValidatorService,
    FlatFrontComponentValidatorService,
    FlatWebhookValidatorService,
  ],
  exports: [
    FlatViewValidatorService,
    FlatViewFieldValidatorService,
    FlatViewFilterValidatorService,
    FlatViewFilterGroupValidatorService,
    FlatViewGroupValidatorService,
    FlatViewFieldGroupValidatorService,
    FlatIndexValidatorService,
    FlatFieldMetadataValidatorService,
    FlatObjectMetadataValidatorService,
    FlatLogicFunctionValidatorService,
    FlatFieldMetadataTypeValidatorService,
    FlatRoleValidatorService,
    FlatRoleTargetValidatorService,
    FlatAgentValidatorService,
    FlatSkillValidatorService,
    FlatCommandMenuItemValidatorService,
    FlatNavigationMenuItemValidatorService,
    FlatPageLayoutValidatorService,
    FlatPageLayoutWidgetValidatorService,
    FlatPageLayoutTabValidatorService,
    FlatRowLevelPermissionPredicateValidatorService,
    FlatRowLevelPermissionPredicateGroupValidatorService,
    FlatFrontComponentValidatorService,
    FlatWebhookValidatorService,
  ],
})
export class WorkspaceMigrationBuilderValidatorsModule {}
