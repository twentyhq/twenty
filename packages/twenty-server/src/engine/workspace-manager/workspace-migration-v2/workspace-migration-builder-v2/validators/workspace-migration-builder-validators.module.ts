import { Module } from '@nestjs/common';

import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { FlatFieldMetadataTypeValidatorService } from 'src/engine/metadata-modules/flat-field-metadata/services/flat-field-metadata-type-validator.service';
import { FlatCronTriggerValidatorService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/validators/services/flat-cron-trigger-validator.service';
import { FlatDatabaseEventTriggerValidatorService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/validators/services/flat-database-event-trigger-validator.service';
import { FlatFieldMetadataValidatorService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/validators/services/flat-field-metadata-validator.service';
import { FlatIndexValidatorService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/validators/services/flat-index-metadata-validator.service';
import { FlatObjectMetadataValidatorService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/validators/services/flat-object-metadata-validator.service';
import { FlatRouteTriggerValidatorService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/validators/services/flat-route-trigger-validator.service';
import { FlatServerlessFunctionValidatorService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/validators/services/flat-serverless-function-validator.service';
import { FlatViewFieldValidatorService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/validators/services/flat-view-field-validator.service';
import { FlatViewValidatorService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/validators/services/flat-view-validator.service';

@Module({
  imports: [FeatureFlagModule],
  providers: [
    FlatViewValidatorService,
    FlatViewFieldValidatorService,
    FlatIndexValidatorService,
    FlatFieldMetadataValidatorService,
    FlatObjectMetadataValidatorService,
    FlatServerlessFunctionValidatorService,
    FlatDatabaseEventTriggerValidatorService,
    FlatCronTriggerValidatorService,
    FlatFieldMetadataTypeValidatorService,
    FlatRouteTriggerValidatorService,
  ],
  exports: [
    FlatViewValidatorService,
    FlatViewFieldValidatorService,
    FlatIndexValidatorService,
    FlatFieldMetadataValidatorService,
    FlatObjectMetadataValidatorService,
    FlatServerlessFunctionValidatorService,
    FlatDatabaseEventTriggerValidatorService,
    FlatCronTriggerValidatorService,
    FlatFieldMetadataTypeValidatorService,
    FlatRouteTriggerValidatorService,
  ],
})
export class WorkspaceMigrationBuilderValidatorsModule {}
