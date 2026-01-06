import { Module } from '@nestjs/common';

import { AiAgentMonitorModule } from 'src/engine/metadata-modules/ai/ai-agent-monitor/ai-agent-monitor.module';
import { AiAgentModule } from 'src/engine/metadata-modules/ai/ai-agent/ai-agent.module';
import { AiChatModule } from 'src/engine/metadata-modules/ai/ai-chat/ai-chat.module';
import { CronTriggerModule } from 'src/engine/metadata-modules/cron-trigger/cron-trigger.module';
import { DataSourceModule } from 'src/engine/metadata-modules/data-source/data-source.module';
import { DatabaseEventTriggerModule } from 'src/engine/metadata-modules/database-event-trigger/database-event-trigger.module';
import { FieldMetadataModule } from 'src/engine/metadata-modules/field-metadata/field-metadata.module';
import { ObjectMetadataModule } from 'src/engine/metadata-modules/object-metadata/object-metadata.module';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';
import { RemoteServerModule } from 'src/engine/metadata-modules/remote-server/remote-server.module';
import { RoleModule } from 'src/engine/metadata-modules/role/role.module';
import { RouteTriggerModule } from 'src/engine/metadata-modules/route-trigger/route-trigger.module';
import { SearchFieldMetadataModule } from 'src/engine/metadata-modules/search-field-metadata/search-field-metadata.module';
import { ServerlessFunctionLayerModule } from 'src/engine/metadata-modules/serverless-function-layer/serverless-function-layer.module';
import { ServerlessFunctionModule } from 'src/engine/metadata-modules/serverless-function/serverless-function.module';
import { SkillModule } from 'src/engine/metadata-modules/skill/skill.module';
import { ViewModule } from 'src/engine/metadata-modules/view/view.module';
import { WorkspaceMetadataVersionModule } from 'src/engine/metadata-modules/workspace-metadata-version/workspace-metadata-version.module';
import { WorkspaceMigrationModule } from 'src/engine/metadata-modules/workspace-migration/workspace-migration.module';

@Module({
  imports: [
    DataSourceModule,
    FieldMetadataModule,
    ObjectMetadataModule,
    SearchFieldMetadataModule,
    ServerlessFunctionModule,
    ServerlessFunctionLayerModule,
    SkillModule,
    AiAgentModule,
    AiAgentMonitorModule,
    AiChatModule,
    ViewModule,
    WorkspaceMetadataVersionModule,
    WorkspaceMigrationModule,
    RemoteServerModule,
    RoleModule,
    PermissionsModule,
    RouteTriggerModule,
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
    SkillModule,
    AiAgentModule,
    AiChatModule,
    ViewModule,
    RemoteServerModule,
    RoleModule,
    PermissionsModule,
  ],
})
export class MetadataEngineModule {}
