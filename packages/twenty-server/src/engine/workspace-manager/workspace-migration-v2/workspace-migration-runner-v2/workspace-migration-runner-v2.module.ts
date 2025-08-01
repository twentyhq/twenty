import { Module } from '@nestjs/common';

import { TypeORMModule } from 'src/database/typeorm/typeorm.module';
import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { DataSourceModule } from 'src/engine/metadata-modules/data-source/data-source.module';
import { WorkspaceMetadataVersionModule } from 'src/engine/metadata-modules/workspace-metadata-version/workspace-metadata-version.module';
import { WorkspacePermissionsCacheModule } from 'src/engine/metadata-modules/workspace-permissions-cache/workspace-permissions-cache.module';
import { WorkspaceSchemaManagerModule } from 'src/engine/twenty-orm/workspace-schema-manager/workspace-schema-manager.module';
import { WorkspaceMetadataFieldActionRunnerService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/workspace-metadata-migration-runner/workspace-metadata-field-action-runner.service';
import { WorkspaceMetadataIndexActionRunnerService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/workspace-metadata-migration-runner/workspace-metadata-index-action-runner.service';
import { WorkspaceMetadataMigrationRunnerService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/workspace-metadata-migration-runner/workspace-metadata-migration-runner-service';
import { WorkspaceMetadataObjectActionRunnerService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/workspace-metadata-migration-runner/workspace-metadata-object-action-runner.service';
import { WorkspaceMigrationRunnerV2Service } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/workspace-migration-runner-v2.service';
import { BasicColumnDefinitionGenerator } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/workspace-schema-migration-runner/generators/basic-column-definition.generator';
import { CompositeColumnDefinitionGenerator } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/workspace-schema-migration-runner/generators/composite-column-definition.generator';
import { EnumColumnDefinitionGenerator } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/workspace-schema-migration-runner/generators/enum-column-definition.generator';
import { RelationColumnDefinitionGenerator } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/workspace-schema-migration-runner/generators/relation-column-definition.generator';
import { TsVectorColumnDefinitionGenerator } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/workspace-schema-migration-runner/generators/ts-vector-column-definition.generator';
import { WorkspaceSchemaColumnDefinitionGeneratorService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/workspace-schema-migration-runner/workspace-schema-column-definition-generator.service';
import { WorkspaceSchemaFieldActionRunnerService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/workspace-schema-migration-runner/workspace-schema-field-action-runner.service';
import { WorkspaceSchemaIndexActionRunnerService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/workspace-schema-migration-runner/workspace-schema-index-action-runner.service';
import { WorkspaceSchemaMigrationRunnerService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/workspace-schema-migration-runner/workspace-schema-migration-runner.service';
import { WorkspaceSchemaObjectActionRunnerService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/workspace-schema-migration-runner/workspace-schema-object-action-runner.service';

@Module({
  imports: [
    FeatureFlagModule,
    TypeORMModule,
    DataSourceModule,
    WorkspaceMetadataVersionModule,
    WorkspacePermissionsCacheModule,
    WorkspaceSchemaManagerModule,
  ],
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
    BasicColumnDefinitionGenerator,
    CompositeColumnDefinitionGenerator,
    EnumColumnDefinitionGenerator,
    RelationColumnDefinitionGenerator,
    TsVectorColumnDefinitionGenerator,
    WorkspaceSchemaColumnDefinitionGeneratorService,
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
