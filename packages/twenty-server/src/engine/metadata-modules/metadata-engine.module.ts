import { Module } from '@nestjs/common';

import { DataSourceModule } from 'src/engine/metadata-modules/data-source/data-source.module';
import { FieldMetadataModule } from 'src/engine/metadata-modules/field-metadata/field-metadata.module';
import { ObjectMetadataModule } from 'src/engine/metadata-modules/object-metadata/object-metadata.module';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';
import { RelationMetadataModule } from 'src/engine/metadata-modules/relation-metadata/relation-metadata.module';
import { RemoteServerModule } from 'src/engine/metadata-modules/remote-server/remote-server.module';
import { RoleModule } from 'src/engine/metadata-modules/role/role.module';
import { ServerlessFunctionModule } from 'src/engine/metadata-modules/serverless-function/serverless-function.module';
import { WorkspaceMetadataVersionModule } from 'src/engine/metadata-modules/workspace-metadata-version/workspace-metadata-version.module';
import { WorkspaceMigrationModule } from 'src/engine/metadata-modules/workspace-migration/workspace-migration.module';

@Module({
  imports: [
    DataSourceModule,
    FieldMetadataModule,
    ObjectMetadataModule,
    RelationMetadataModule,
    ServerlessFunctionModule,
    WorkspaceMetadataVersionModule,
    WorkspaceMigrationModule,
    RemoteServerModule,
    RoleModule,
    PermissionsModule,
  ],
  providers: [],
  exports: [
    DataSourceModule,
    FieldMetadataModule,
    ObjectMetadataModule,
    RelationMetadataModule,
    ServerlessFunctionModule,
    RemoteServerModule,
    RoleModule,
    PermissionsModule,
  ],
})
export class MetadataEngineModule {}
