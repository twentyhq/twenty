import { Module } from '@nestjs/common';

import { TypeORMModule } from 'src/database/typeorm/typeorm.module';
import { DataSourceModule } from 'src/metadata/data-source/data-source.module';
import { ObjectMetadataModule } from 'src/metadata/object-metadata/object-metadata.module';
import { WorkspaceDataSourceModule } from 'src/workspace/workspace-datasource/workspace-datasource.module';
import { DatabaseStructureService } from 'src/workspace/workspace-health/services/database-structure.service';
import { FieldMetadataHealthService } from 'src/workspace/workspace-health/services/field-metadata-health.service';
import { ObjectMetadataHealthService } from 'src/workspace/workspace-health/services/object-metadata-health.service';
import { RelationMetadataHealthService } from 'src/workspace/workspace-health/services/relation-metadata.health.service';
import { WorkspaceHealthService } from 'src/workspace/workspace-health/workspace-health.service';
import { WorkspaceMigrationBuilderModule } from 'src/workspace/workspace-migration-builder/workspace-migration-builder.module';
import { WorkspaceMigrationRunnerModule } from 'src/workspace/workspace-migration-runner/workspace-migration-runner.module';

import { WorkspaceFixService } from './services/workspace-fix.service';
import { WorkspaceFixNullableService } from './services/workspace-fix-nullable.service';
import { WorkspaceFixTypeService } from './services/workspace-fix-type.service';
import { WorkspaceFixDefaultValueService } from './services/workspace-fix-default-value.service';

@Module({
  imports: [
    DataSourceModule,
    TypeORMModule,
    ObjectMetadataModule,
    WorkspaceDataSourceModule,
    WorkspaceMigrationRunnerModule,
    WorkspaceMigrationBuilderModule,
  ],
  providers: [
    WorkspaceHealthService,
    DatabaseStructureService,
    ObjectMetadataHealthService,
    FieldMetadataHealthService,
    RelationMetadataHealthService,
    WorkspaceFixNullableService,
    WorkspaceFixTypeService,
    WorkspaceFixDefaultValueService,
    WorkspaceFixService,
  ],
  exports: [WorkspaceHealthService],
})
export class WorkspaceHealthModule {}
