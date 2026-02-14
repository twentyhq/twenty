import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';

import { AiAgentMonitorModule } from 'src/engine/metadata-modules/ai/ai-agent-monitor/ai-agent-monitor.module';
import { AiAgentModule } from 'src/engine/metadata-modules/ai/ai-agent/ai-agent.module';
import { AiChatModule } from 'src/engine/metadata-modules/ai/ai-chat/ai-chat.module';
import { CommandMenuItemModule } from 'src/engine/metadata-modules/command-menu-item/command-menu-item.module';
import { DataSourceModule } from 'src/engine/metadata-modules/data-source/data-source.module';
import { FieldMetadataModule } from 'src/engine/metadata-modules/field-metadata/field-metadata.module';
import { FlatEntityMapsGraphqlApiExceptionFilter } from 'src/engine/metadata-modules/flat-entity/filters/flat-entity-maps-graphql-api-exception.filter';
import { FrontComponentModule } from 'src/engine/metadata-modules/front-component/front-component.module';
import { LogicFunctionLayerModule } from 'src/engine/metadata-modules/logic-function-layer/logic-function-layer.module';
import { LogicFunctionModule } from 'src/engine/metadata-modules/logic-function/logic-function.module';
import { NavigationMenuItemModule } from 'src/engine/metadata-modules/navigation-menu-item/navigation-menu-item.module';
import { ObjectMetadataModule } from 'src/engine/metadata-modules/object-metadata/object-metadata.module';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';
import { RoleModule } from 'src/engine/metadata-modules/role/role.module';
import { RouteTriggerModule } from 'src/engine/metadata-modules/route-trigger/route-trigger.module';
import { SearchFieldMetadataModule } from 'src/engine/metadata-modules/search-field-metadata/search-field-metadata.module';
import { SkillModule } from 'src/engine/metadata-modules/skill/skill.module';
import { ViewModule } from 'src/engine/metadata-modules/view/view.module';
import { WebhookModule } from 'src/engine/metadata-modules/webhook/webhook.module';
import { WorkspaceMetadataVersionModule } from 'src/engine/metadata-modules/workspace-metadata-version/workspace-metadata-version.module';

@Module({
  imports: [
    DataSourceModule,
    FieldMetadataModule,
    FrontComponentModule,
    ObjectMetadataModule,
    SearchFieldMetadataModule,
    LogicFunctionModule,
    LogicFunctionLayerModule,
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
    WebhookModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: FlatEntityMapsGraphqlApiExceptionFilter,
    },
  ],
  exports: [
    DataSourceModule,
    FieldMetadataModule,
    FrontComponentModule,
    ObjectMetadataModule,
    SearchFieldMetadataModule,
    LogicFunctionModule,
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
