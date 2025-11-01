import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DataSourceModule } from 'src/engine/metadata-modules/data-source/data-source.module';
import { FieldMetadataModule } from 'src/engine/metadata-modules/field-metadata/field-metadata.module';
import { ObjectMetadataModule } from 'src/engine/metadata-modules/object-metadata/object-metadata.module';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';
import { RemoteServerEntity } from 'src/engine/metadata-modules/remote-server/remote-server.entity';
import { DistantTableModule } from 'src/engine/metadata-modules/remote-server/remote-table/distant-table/distant-table.module';
import { ForeignTableModule } from 'src/engine/metadata-modules/remote-server/remote-table/foreign-table/foreign-table.module';
import { RemoteTableSchemaUpdateModule } from 'src/engine/metadata-modules/remote-server/remote-table/remote-table-schema-update/remote-table-schema-update.module';
import { RemoteTableEntity } from 'src/engine/metadata-modules/remote-server/remote-table/remote-table.entity';
import { RemoteTableResolver } from 'src/engine/metadata-modules/remote-server/remote-table/remote-table.resolver';
import { RemoteTableService } from 'src/engine/metadata-modules/remote-server/remote-table/remote-table.service';
import { WorkspaceMetadataVersionModule } from 'src/engine/metadata-modules/workspace-metadata-version/workspace-metadata-version.module';
import { WorkspaceDataSourceModule } from 'src/engine/workspace-datasource/workspace-datasource.module';

@Module({
  imports: [
    DistantTableModule,
    TypeOrmModule.forFeature([RemoteServerEntity, RemoteTableEntity]),
    DataSourceModule,
    ObjectMetadataModule,
    FieldMetadataModule,
    PermissionsModule,
    WorkspaceMetadataVersionModule,
    WorkspaceDataSourceModule,
    ForeignTableModule,
    RemoteTableSchemaUpdateModule,
  ],
  providers: [RemoteTableService, RemoteTableResolver],
  exports: [RemoteTableService],
})
export class RemoteTableModule {}
