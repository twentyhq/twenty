import { Module } from '@nestjs/common';

import { AgentModule } from 'src/engine/metadata-modules/agent/agent.module';
import { CronTriggerModule } from 'src/engine/metadata-modules/cron-trigger/cron-trigger.module';
import { DataSourceModule } from 'src/engine/metadata-modules/data-source/data-source.module';
import { DatabaseEventTriggerModule } from 'src/engine/metadata-modules/database-event-trigger/database-event-trigger.module';
import { FieldMetadataModule } from 'src/engine/metadata-modules/field-metadata/field-metadata.module';
import { ObjectMetadataModule } from 'src/engine/metadata-modules/object-metadata/object-metadata.module';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';
import { RemoteServerModule } from 'src/engine/metadata-modules/remote-server/remote-server.module';
import { RoleModule } from 'src/engine/metadata-modules/role/role.module';
import { RouteModule } from 'src/engine/metadata-modules/route/route.module';
import { SearchFieldMetadataModule } from 'src/engine/metadata-modules/search-field-metadata/search-field-metadata.module';
import { ServerlessFunctionModule } from 'src/engine/metadata-modules/serverless-function/serverless-function.module';
import { WorkspaceMetadataVersionModule } from 'src/engine/metadata-modules/workspace-metadata-version/workspace-metadata-version.module';
import { WorkspaceMigrationModule } from 'src/engine/metadata-modules/workspace-migration/workspace-migration.module';

@Module({
  imports: [
    DataSourceModule,
    FieldMetadataModule,
    ObjectMetadataModule,
    SearchFieldMetadataModule,
    ServerlessFunctionModule,
    AgentModule,
    WorkspaceMetadataVersionModule,
    WorkspaceMigrationModule,
    RemoteServerModule,
    RoleModule,
    PermissionsModule,
    RouteModule,
    CronTriggerModule,
    DatabaseEventTriggerModule,
  ],
  providers: [],
  exports: [
    DataSourceModule,
    FieldMetadataModule,
    ObjectMetadataModule,
    SearchFieldMetadataModule,
    ServerlessFunctionModule,
    AgentModule,
    RemoteServerModule,
    RoleModule,
    PermissionsModule,
  ],
})
export class MetadataEngineModule {}
