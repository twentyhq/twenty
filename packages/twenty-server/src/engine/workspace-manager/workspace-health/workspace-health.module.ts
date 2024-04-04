import { Module } from '@nestjs/common';

import { TypeORMModule } from 'src/database/typeorm/typeorm.module';
import { DataSourceModule } from 'src/engine/metadata-modules/data-source/data-source.module';
import { ObjectMetadataModule } from 'src/engine/metadata-modules/object-metadata/object-metadata.module';
import { WorkspaceDataSourceModule } from 'src/engine/workspace-datasource/workspace-datasource.module';
import { DatabaseStructureService } from 'src/engine/workspace-manager/workspace-health/services/database-structure.service';
import { FieldMetadataHealthService } from 'src/engine/workspace-manager/workspace-health/services/field-metadata-health.service';
import { ObjectMetadataHealthService } from 'src/engine/workspace-manager/workspace-health/services/object-metadata-health.service';
import { RelationMetadataHealthService } from 'src/engine/workspace-manager/workspace-health/services/relation-metadata.health.service';
import { WorkspaceHealthService } from 'src/engine/workspace-manager/workspace-health/workspace-health.service';
import { WorkspaceMigrationBuilderModule } from 'src/engine/workspace-manager/workspace-migration-builder/workspace-migration-builder.module';
import { WorkspaceMigrationRunnerModule } from 'src/engine/workspace-manager/workspace-migration-runner/workspace-migration-runner.module';

import { workspaceFixers } from './fixer';

import { WorkspaceFixService } from './services/workspace-fix.service';

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
    ...workspaceFixers,
    WorkspaceHealthService,
    DatabaseStructureService,
    ObjectMetadataHealthService,
    FieldMetadataHealthService,
    RelationMetadataHealthService,
    WorkspaceFixService,
  ],
  exports: [WorkspaceHealthService],
})
export class WorkspaceHealthModule {}
