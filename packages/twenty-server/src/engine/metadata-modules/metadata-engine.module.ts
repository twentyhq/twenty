import { Module } from '@nestjs/common';

import { DataSourceModule } from 'src/engine/metadata-modules/data-source/data-source.module';
import { FieldMetadataModule } from 'src/engine/metadata-modules/field-metadata/field-metadata.module';
import { ObjectMetadataModule } from 'src/engine/metadata-modules/object-metadata/object-metadata.module';
import { RelationMetadataModule } from 'src/engine/metadata-modules/relation-metadata/relation-metadata.module';
import { RemoteServerModule } from 'src/engine/metadata-modules/remote-server/remote-server.module';
import { WorkspaceCacheVersionModule } from 'src/engine/metadata-modules/workspace-cache-version/workspace-cache-version.module';
import { WorkspaceMigrationModule } from 'src/engine/metadata-modules/workspace-migration/workspace-migration.module';

@Module({
  imports: [
    DataSourceModule,
    FieldMetadataModule,
    ObjectMetadataModule,
    RelationMetadataModule,
    WorkspaceCacheVersionModule,
    WorkspaceMigrationModule,
    RemoteServerModule,
  ],
  providers: [],
  exports: [
    DataSourceModule,
    FieldMetadataModule,
    ObjectMetadataModule,
    RelationMetadataModule,
    RemoteServerModule,
  ],
})
export class MetadataEngineModule {}
