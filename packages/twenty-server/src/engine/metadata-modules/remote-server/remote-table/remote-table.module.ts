import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FeatureFlagEntity } from 'src/engine/core-modules/feature-flag/feature-flag.entity';
import { DataSourceModule } from 'src/engine/metadata-modules/data-source/data-source.module';
import { FieldMetadataModule } from 'src/engine/metadata-modules/field-metadata/field-metadata.module';
import { ObjectMetadataModule } from 'src/engine/metadata-modules/object-metadata/object-metadata.module';
import { RemoteServerEntity } from 'src/engine/metadata-modules/remote-server/remote-server.entity';
import { RemotePostgresTableModule } from 'src/engine/metadata-modules/remote-server/remote-table/remote-postgres-table/remote-postgres-table.module';
import { RemoteTableResolver } from 'src/engine/metadata-modules/remote-server/remote-table/remote-table.resolver';
import { RemoteTableService } from 'src/engine/metadata-modules/remote-server/remote-table/remote-table.service';
import { WorkspaceCacheVersionModule } from 'src/engine/metadata-modules/workspace-cache-version/workspace-cache-version.module';
import { WorkspaceDataSourceModule } from 'src/engine/workspace-datasource/workspace-datasource.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([RemoteServerEntity], 'metadata'),
    TypeOrmModule.forFeature([FeatureFlagEntity], 'core'),
    WorkspaceDataSourceModule,
    DataSourceModule,
    ObjectMetadataModule,
    FieldMetadataModule,
    RemotePostgresTableModule,
    WorkspaceCacheVersionModule,
  ],
  providers: [RemoteTableService, RemoteTableResolver],
})
export class RemoteTableModule {}
