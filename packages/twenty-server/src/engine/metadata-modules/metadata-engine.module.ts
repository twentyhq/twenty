import { Module } from '@nestjs/common';

import { AiAgentMonitorModule } from 'src/engine/metadata-modules/ai/ai-agent-monitor/ai-agent-monitor.module';
import { AiAgentModule } from 'src/engine/metadata-modules/ai/ai-agent/ai-agent.module';
import { AiChatModule } from 'src/engine/metadata-modules/ai/ai-chat/ai-chat.module';
import { CommandMenuItemModule } from 'src/engine/metadata-modules/command-menu-item/command-menu-item.module';
import { NavigationMenuItemModule } from 'src/engine/metadata-modules/navigation-menu-item/navigation-menu-item.module';
import { CronTriggerModule } from 'src/engine/metadata-modules/cron-trigger/cron-trigger.module';
import { DataSourceModule } from 'src/engine/metadata-modules/data-source/data-source.module';
import { DatabaseEventTriggerModule } from 'src/engine/metadata-modules/database-event-trigger/database-event-trigger.module';
import { FieldMetadataModule } from 'src/engine/metadata-modules/field-metadata/field-metadata.module';
import { FrontComponentModule } from 'src/engine/metadata-modules/front-component/front-component.module';
import { ObjectMetadataModule } from 'src/engine/metadata-modules/object-metadata/object-metadata.module';
import { WebhookModule } from 'src/engine/metadata-modules/webhook/webhook.module';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';
import { RoleModule } from 'src/engine/metadata-modules/role/role.module';
import { RouteTriggerModule } from 'src/engine/metadata-modules/route-trigger/route-trigger.module';
import { SearchFieldMetadataModule } from 'src/engine/metadata-modules/search-field-metadata/search-field-metadata.module';
import { ServerlessFunctionLayerModule } from 'src/engine/metadata-modules/serverless-function-layer/serverless-function-layer.module';
import { ServerlessFunctionModule } from 'src/engine/metadata-modules/serverless-function/serverless-function.module';
import { SkillModule } from 'src/engine/metadata-modules/skill/skill.module';
import { ViewModule } from 'src/engine/metadata-modules/view/view.module';
import { WorkspaceMetadataVersionModule } from 'src/engine/metadata-modules/workspace-metadata-version/workspace-metadata-version.module';

@Module({
  imports: [
    DataSourceModule,
    FieldMetadataModule,
    FrontComponentModule,
    ObjectMetadataModule,
    SearchFieldMetadataModule,
    ServerlessFunctionModule,
    ServerlessFunctionLayerModule,
    SkillModule,
    CommandMenuItemModule,
    NavigationMenuItemModule,
    AiAgentModule,
    AiAgentMonitorModule,
    AiChatModule,
    ViewModule,
    WorkspaceMetadataVersionModule,
    RoleModule,
    PermissionsModule,
    RouteTriggerModule,
    CronTriggerModule,
    DatabaseEventTriggerModule,
    WebhookModule,
  ],
  providers: [],
  exports: [
    DataSourceModule,
    FieldMetadataModule,
    FrontComponentModule,
    ObjectMetadataModule,
    SearchFieldMetadataModule,
    ServerlessFunctionModule,
    SkillModule,
    CommandMenuItemModule,
    NavigationMenuItemModule,
    AiAgentModule,
    AiChatModule,
    ViewModule,
    RoleModule,
    PermissionsModule,
    WebhookModule,
  ],
})
export class MetadataEngineModule {}
