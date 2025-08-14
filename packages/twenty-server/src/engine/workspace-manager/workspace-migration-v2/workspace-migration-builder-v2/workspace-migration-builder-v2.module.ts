import { Module } from '@nestjs/common';

import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { FlatFieldMetadataTypeValidatorService } from 'src/engine/metadata-modules/flat-field-metadata/services/flat-field-metadata-type-validator.service';
import { FlatFieldMetadataValidatorService } from 'src/engine/metadata-modules/flat-field-metadata/services/flat-field-metadata-validator.service';
import { FlatObjectMetadataValidatorService } from 'src/engine/metadata-modules/flat-object-metadata/services/flat-object-metadata-validator.service';
import { WorkspaceMigrationBuilderV2Service } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/workspace-migration-builder-v2.service';
import { WorkspaceMigrationV2ObjectActionsBuilder } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/workspace-migration-v2-object-actions-builder';

@Module({
  imports: [FeatureFlagModule],
  providers: [
    WorkspaceMigrationBuilderV2Service,
    FlatFieldMetadataValidatorService,
    FlatFieldMetadataTypeValidatorService,
    WorkspaceMigrationV2ObjectActionsBuilder,
    FlatObjectMetadataValidatorService,
  ],
  exports: [WorkspaceMigrationBuilderV2Service],
})
export class WorkspaceMigrationBuilderV2Module {}
