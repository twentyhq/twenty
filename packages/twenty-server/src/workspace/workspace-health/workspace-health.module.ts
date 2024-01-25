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

@Module({
  imports: [
    DataSourceModule,
    TypeORMModule,
    ObjectMetadataModule,
    WorkspaceDataSourceModule,
  ],
  providers: [
    WorkspaceHealthService,
    DatabaseStructureService,
    ObjectMetadataHealthService,
    FieldMetadataHealthService,
    RelationMetadataHealthService,
  ],
  exports: [WorkspaceHealthService],
})
export class WorkspaceHealthModule {}
