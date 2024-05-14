import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DataSourceModule } from 'src/engine/metadata-modules/data-source/data-source.module';
import { FieldMetadataModule } from 'src/engine/metadata-modules/field-metadata/field-metadata.module';
import { ObjectMetadataModule } from 'src/engine/metadata-modules/object-metadata/object-metadata.module';
import { RemoteServerEntity } from 'src/engine/metadata-modules/remote-server/remote-server.entity';
import { DistantTableModule } from 'src/engine/metadata-modules/remote-server/remote-table/distant-table/distant-table.module';
import { RemoteTableEntity } from 'src/engine/metadata-modules/remote-server/remote-table/remote-table.entity';
import { RemoteTableResolver } from 'src/engine/metadata-modules/remote-server/remote-table/remote-table.resolver';
import { RemoteTableService } from 'src/engine/metadata-modules/remote-server/remote-table/remote-table.service';
import { WorkspaceCacheVersionModule } from 'src/engine/metadata-modules/workspace-cache-version/workspace-cache-version.module';
import { WorkspaceMigrationModule } from 'src/engine/metadata-modules/workspace-migration/workspace-migration.module';
import { WorkspaceDataSourceModule } from 'src/engine/workspace-datasource/workspace-datasource.module';
import { WorkspaceMigrationRunnerModule } from 'src/engine/workspace-manager/workspace-migration-runner/workspace-migration-runner.module';

@Module({
  imports: [
    DistantTableModule,
    TypeOrmModule.forFeature(
      [RemoteServerEntity, RemoteTableEntity],
      'metadata',
    ),
    DataSourceModule,
    ObjectMetadataModule,
    FieldMetadataModule,
    WorkspaceCacheVersionModule,
    WorkspaceMigrationModule,
    WorkspaceMigrationRunnerModule,
    WorkspaceDataSourceModule,
  ],
  providers: [RemoteTableService, RemoteTableResolver],
  exports: [RemoteTableService],
})
export class RemoteTableModule {}
