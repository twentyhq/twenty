import { Module } from '@nestjs/common';

import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { FlatFieldMetadataTypeValidatorService } from 'src/engine/metadata-modules/flat-field-metadata/services/flat-field-metadata-type-validator.service';
import { FlatAgentValidatorService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/validators/services/flat-agent-validator.service';
import { FlatCronTriggerValidatorService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/validators/services/flat-cron-trigger-validator.service';
import { FlatDatabaseEventTriggerValidatorService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/validators/services/flat-database-event-trigger-validator.service';
import { FlatFieldMetadataValidatorService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/validators/services/flat-field-metadata-validator.service';
import { FlatIndexValidatorService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/validators/services/flat-index-metadata-validator.service';
import { FlatObjectMetadataValidatorService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/validators/services/flat-object-metadata-validator.service';
import { FlatPageLayoutTabValidatorService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/validators/services/flat-page-layout-tab-validator.service';
import { FlatPageLayoutValidatorService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/validators/services/flat-page-layout-validator.service';
import { FlatPageLayoutWidgetValidatorService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/validators/services/flat-page-layout-widget-validator.service';
import { FlatRoleTargetValidatorService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/validators/services/flat-role-target-validator.service';
import { FlatRoleValidatorService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/validators/services/flat-role-validator.service';
import { FlatRouteTriggerValidatorService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/validators/services/flat-route-trigger-validator.service';
import { FlatRowLevelPermissionPredicateGroupValidatorService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/validators/services/flat-row-level-permission-predicate-group-validator.service';
import { FlatRowLevelPermissionPredicateValidatorService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/validators/services/flat-row-level-permission-predicate-validator.service';
import { FlatServerlessFunctionValidatorService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/validators/services/flat-serverless-function-validator.service';
import { FlatSkillValidatorService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/validators/services/flat-skill-validator.service';
import { FlatViewFieldValidatorService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/validators/services/flat-view-field-validator.service';
import { FlatViewFilterGroupValidatorService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/validators/services/flat-view-filter-group-validator.service';
import { FlatViewFilterValidatorService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/validators/services/flat-view-filter-validator.service';
import { FlatViewGroupValidatorService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/validators/services/flat-view-group-validator.service';
import { FlatViewValidatorService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/validators/services/flat-view-validator.service';

@Module({
  imports: [FeatureFlagModule],
  providers: [
    FlatViewValidatorService,
    FlatViewFieldValidatorService,
    FlatViewFilterValidatorService,
    FlatViewFilterGroupValidatorService,
    FlatViewGroupValidatorService,
    FlatIndexValidatorService,
    FlatFieldMetadataValidatorService,
    FlatObjectMetadataValidatorService,
    FlatServerlessFunctionValidatorService,
    FlatDatabaseEventTriggerValidatorService,
    FlatCronTriggerValidatorService,
    FlatFieldMetadataTypeValidatorService,
    FlatRouteTriggerValidatorService,
    FlatRoleValidatorService,
    FlatRoleTargetValidatorService,
    FlatAgentValidatorService,
    FlatSkillValidatorService,
    FlatPageLayoutValidatorService,
    FlatPageLayoutWidgetValidatorService,
    FlatPageLayoutTabValidatorService,
    FlatRowLevelPermissionPredicateValidatorService,
    FlatRowLevelPermissionPredicateGroupValidatorService,
  ],
  exports: [
    FlatViewValidatorService,
    FlatViewFieldValidatorService,
    FlatViewFilterValidatorService,
    FlatViewFilterGroupValidatorService,
    FlatViewGroupValidatorService,
    FlatIndexValidatorService,
    FlatFieldMetadataValidatorService,
    FlatObjectMetadataValidatorService,
    FlatServerlessFunctionValidatorService,
    FlatDatabaseEventTriggerValidatorService,
    FlatCronTriggerValidatorService,
    FlatFieldMetadataTypeValidatorService,
    FlatRouteTriggerValidatorService,
    FlatRoleValidatorService,
    FlatRoleTargetValidatorService,
    FlatAgentValidatorService,
    FlatSkillValidatorService,
    FlatPageLayoutValidatorService,
    FlatPageLayoutWidgetValidatorService,
    FlatPageLayoutTabValidatorService,
    FlatRowLevelPermissionPredicateValidatorService,
    FlatRowLevelPermissionPredicateGroupValidatorService,
  ],
})
export class WorkspaceMigrationBuilderValidatorsModule {}
