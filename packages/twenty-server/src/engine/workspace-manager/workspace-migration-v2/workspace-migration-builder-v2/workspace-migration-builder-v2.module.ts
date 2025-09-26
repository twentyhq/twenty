import { Module } from '@nestjs/common';

import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { FlatFieldMetadataTypeValidatorService } from 'src/engine/metadata-modules/flat-field-metadata/services/flat-field-metadata-type-validator.service';
import { FlatFieldMetadataValidatorService } from 'src/engine/metadata-modules/flat-field-metadata/services/flat-field-metadata-validator.service';
import { FlatObjectMetadataValidatorService } from 'src/engine/metadata-modules/flat-object-metadata/services/flat-object-metadata-validator.service';
import { WorkspaceMigrationV2FieldActionsBuilderService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/field/services/workspace-migration-v2-field-actions-builder.service';
import { WorkspaceMigrationV2IndexActionsBuilderService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/index/workspace-migration-v2-index-actions-builder.service';
import { WorkspaceMigrationV2ObjectActionsBuilderService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/object/services/workspace-migration-v2-object-actions-builder.service';
import { WorkspaceMigrationV2ServerlessFunctionActionsBuilderService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/serverless-function/workspace-migration-v2-serverless-function-actions-builder.service';
import { WorkspaceMigrationV2ViewFieldActionsBuilderService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/view-field/workspace-migration-v2-view-field-actions-builder.service';
import { WorkspaceMigrationV2ViewActionsBuilderService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/view/workspace-migration-v2-view-actions-builder.service';
import { WorkspaceMigrationBuilderV2Service } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/services/workspace-migration-builder-v2.service';
import { FlatServerlessFunctionValidatorService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/validators/services/flat-serverless-function-validator.service';
import { FlatViewFieldValidatorService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/validators/services/flat-view-field-validator.service';
import { FlatViewValidatorService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/validators/services/flat-view-validator.service';
import { WorkspaceMigrationBuilderValidatorsModule } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/validators/workspace-migration-builder-validators.module';

@Module({
  imports: [FeatureFlagModule, WorkspaceMigrationBuilderValidatorsModule],
  providers: [
    WorkspaceMigrationBuilderV2Service,
    FlatFieldMetadataValidatorService,
    FlatFieldMetadataTypeValidatorService,
    WorkspaceMigrationV2ObjectActionsBuilderService,
    FlatObjectMetadataValidatorService,
    WorkspaceMigrationV2FieldActionsBuilderService,
    WorkspaceMigrationV2ViewActionsBuilderService,
    WorkspaceMigrationV2ViewFieldActionsBuilderService,
    WorkspaceMigrationV2IndexActionsBuilderService,
    WorkspaceMigrationV2ServerlessFunctionActionsBuilderService,
    FlatViewValidatorService,
    FlatViewFieldValidatorService,
    FlatServerlessFunctionValidatorService,
  ],
  exports: [
    WorkspaceMigrationBuilderV2Service,
    WorkspaceMigrationV2ViewActionsBuilderService,
    WorkspaceMigrationV2IndexActionsBuilderService,
    WorkspaceMigrationV2ViewFieldActionsBuilderService,
    WorkspaceMigrationV2ServerlessFunctionActionsBuilderService,
  ],
})
export class WorkspaceMigrationBuilderV2Module {}
