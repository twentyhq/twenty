import { Module } from '@nestjs/common';

import { TypeORMModule } from 'src/database/typeorm/typeorm.module';
import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { WorkspaceMetadataFieldActionRunnerService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/workspace-metadata-migration-runner/workspace-metadata-field-action-runner.service';
import { WorkspaceMetadataIndexActionRunnerService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/workspace-metadata-migration-runner/workspace-metadata-index-action-runner.service';
import { WorkspaceMetadataMigrationRunnerService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/workspace-metadata-migration-runner/workspace-metadata-migration-runner-service';
import { WorkspaceMetadataObjectActionRunnerService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/workspace-metadata-migration-runner/workspace-metadata-object-action-runner.service';
import { WorkspaceMigrationRunnerV2Service } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/workspace-migration-runner-v2.service';
import { WorkspaceSchemaFieldActionRunnerService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/workspace-schema-migration-runner/workspace-schema-field-action-runner.service';
import { WorkspaceSchemaIndexActionRunnerService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/workspace-schema-migration-runner/workspace-schema-index-action-runner.service';
import { WorkspaceSchemaMigrationRunnerService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/workspace-schema-migration-runner/workspace-schema-migration-runner.service';
import { WorkspaceSchemaObjectActionRunnerService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/workspace-schema-migration-runner/workspace-schema-object-action-runner.service';

@Module({
  imports: [FeatureFlagModule, TypeORMModule],
  providers: [
    WorkspaceMetadataObjectActionRunnerService,
    WorkspaceMetadataIndexActionRunnerService,
    WorkspaceMetadataFieldActionRunnerService,
    WorkspaceSchemaObjectActionRunnerService,
    WorkspaceSchemaIndexActionRunnerService,
    WorkspaceSchemaFieldActionRunnerService,
    WorkspaceMetadataMigrationRunnerService,
    WorkspaceSchemaMigrationRunnerService,
    WorkspaceMigrationRunnerV2Service,
  ],
  exports: [
    WorkspaceMigrationRunnerV2Service,
    WorkspaceMetadataObjectActionRunnerService,
    WorkspaceMetadataIndexActionRunnerService,
    WorkspaceMetadataFieldActionRunnerService,
    WorkspaceSchemaObjectActionRunnerService,
    WorkspaceSchemaIndexActionRunnerService,
    WorkspaceSchemaFieldActionRunnerService,
  ],
})
export class WorkspaceMigrationRunnerV2Module {}
