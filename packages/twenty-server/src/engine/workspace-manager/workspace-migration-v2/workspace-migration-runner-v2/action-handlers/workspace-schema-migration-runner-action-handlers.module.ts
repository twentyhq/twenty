import { Module } from '@nestjs/common';

import { WorkspaceSchemaManagerModule } from 'src/engine/twenty-orm/workspace-schema-manager/workspace-schema-manager.module';
import { CreateAgentActionHandlerService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/action-handlers/agent/services/create-agent-action-handler.service';
import { DeleteAgentActionHandlerService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/action-handlers/agent/services/delete-agent-action-handler.service';
import { UpdateAgentActionHandlerService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/action-handlers/agent/services/update-agent-action-handler.service';
import { CreateCronTriggerActionHandlerService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/action-handlers/cron-trigger/services/create-cron-trigger-action-handler.service';
import { DeleteCronTriggerActionHandlerService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/action-handlers/cron-trigger/services/delete-cron-trigger-action-handler.service';
import { UpdateCronTriggerActionHandlerService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/action-handlers/cron-trigger/services/update-cron-trigger-action-handler.service';
import { CreateDatabaseEventTriggerActionHandlerService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/action-handlers/database-event-trigger/services/create-database-event-trigger-action-handler.service';
import { DeleteDatabaseEventTriggerActionHandlerService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/action-handlers/database-event-trigger/services/delete-database-event-trigger-action-handler.service';
import { UpdateDatabaseEventTriggerActionHandlerService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/action-handlers/database-event-trigger/services/update-database-event-trigger-action-handler.service';
import { CreateFieldActionHandlerService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/action-handlers/field/services/create-field-action-handler.service';
import { DeleteFieldActionHandlerService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/action-handlers/field/services/delete-field-action-handler.service';
import { UpdateFieldActionHandlerService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/action-handlers/field/services/update-field-action-handler.service';
import { CreateIndexActionHandlerService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/action-handlers/index/services/create-index-action-handler.service';
import { DeleteIndexActionHandlerService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/action-handlers/index/services/delete-index-action-handler.service';
import { CreateObjectActionHandlerService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/action-handlers/object/services/create-object-action-handler.service';
import { DeleteObjectActionHandlerService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/action-handlers/object/services/delete-object-action-handler.service';
import { UpdateObjectActionHandlerService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/action-handlers/object/services/update-object-action-handler.service';
import { CreatePageLayoutWidgetActionHandlerService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/action-handlers/page-layout-widget/services/create-page-layout-widget-action-handler.service';
import { DeletePageLayoutWidgetActionHandlerService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/action-handlers/page-layout-widget/services/delete-page-layout-widget-action-handler.service';
import { UpdatePageLayoutWidgetActionHandlerService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/action-handlers/page-layout-widget/services/update-page-layout-widget-action-handler.service';
import { CreateRoleTargetActionHandlerService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/action-handlers/role-target/services/create-role-target-action-handler.service';
import { DeleteRoleTargetActionHandlerService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/action-handlers/role-target/services/delete-role-target-action-handler.service';
import { UpdateRoleTargetActionHandlerService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/action-handlers/role-target/services/update-role-target-action-handler.service';
import { CreateRoleActionHandlerService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/action-handlers/role/services/create-role-action-handler.service';
import { DeleteRoleActionHandlerService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/action-handlers/role/services/delete-role-action-handler.service';
import { UpdateRoleActionHandlerService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/action-handlers/role/services/update-role-action-handler.service';
import { CreateRouteTriggerActionHandlerService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/action-handlers/route-trigger/services/create-route-trigger-action-handler.service';
import { DeleteRouteTriggerActionHandlerService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/action-handlers/route-trigger/services/delete-route-trigger-action-handler.service';
import { UpdateRouteTriggerActionHandlerService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/action-handlers/route-trigger/services/update-route-trigger-action-handler.service';
import { CreateServerlessFunctionActionHandlerService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/action-handlers/serverless-function/services/create-serverless-function-action-handler.service';
import { DeleteServerlessFunctionActionHandlerService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/action-handlers/serverless-function/services/delete-serverless-function-action-handler.service';
import { UpdateServerlessFunctionActionHandlerService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/action-handlers/serverless-function/services/update-serverless-function-action-handler.service';
import { CreateViewFieldActionHandlerService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/action-handlers/view-field/services/create-view-field-action-handler.service';
import { DeleteViewFieldActionHandlerService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/action-handlers/view-field/services/delete-view-field-action-handler.service';
import { UpdateViewFieldActionHandlerService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/action-handlers/view-field/services/update-view-field-action-handler.service';
import { CreateViewFilterActionHandlerService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/action-handlers/view-filter/services/create-view-filter-action-handler.service';
import { DeleteViewFilterActionHandlerService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/action-handlers/view-filter/services/delete-view-filter-action-handler.service';
import { UpdateViewFilterActionHandlerService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/action-handlers/view-filter/services/update-view-filter-action-handler.service';
import { CreateViewGroupActionHandlerService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/action-handlers/view-group/services/create-view-group-action-handler.service';
import { DeleteViewGroupActionHandlerService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/action-handlers/view-group/services/delete-view-group-action-handler.service';
import { UpdateViewGroupActionHandlerService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/action-handlers/view-group/services/update-view-group-action-handler.service';
import { CreateViewActionHandlerService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/action-handlers/view/services/create-view-action-handler.service';
import { DeleteViewActionHandlerService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/action-handlers/view/services/delete-view-action-handler.service';
import { UpdateViewActionHandlerService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/action-handlers/view/services/update-view-action-handler.service';

@Module({
  imports: [WorkspaceSchemaManagerModule],
  providers: [
    CreateFieldActionHandlerService,
    UpdateFieldActionHandlerService,
    DeleteFieldActionHandlerService,

    CreateObjectActionHandlerService,
    UpdateObjectActionHandlerService,
    DeleteObjectActionHandlerService,

    CreateIndexActionHandlerService,
    DeleteIndexActionHandlerService,

    CreateViewActionHandlerService,
    UpdateViewActionHandlerService,
    DeleteViewActionHandlerService,

    CreateViewFieldActionHandlerService,
    UpdateViewFieldActionHandlerService,
    DeleteViewFieldActionHandlerService,

    CreateViewFilterActionHandlerService,
    UpdateViewFilterActionHandlerService,
    DeleteViewFilterActionHandlerService,

    CreateViewGroupActionHandlerService,
    UpdateViewGroupActionHandlerService,
    DeleteViewGroupActionHandlerService,

    CreateServerlessFunctionActionHandlerService,
    DeleteServerlessFunctionActionHandlerService,
    UpdateServerlessFunctionActionHandlerService,

    CreateDatabaseEventTriggerActionHandlerService,
    DeleteDatabaseEventTriggerActionHandlerService,
    UpdateDatabaseEventTriggerActionHandlerService,

    CreateCronTriggerActionHandlerService,
    DeleteCronTriggerActionHandlerService,
    UpdateCronTriggerActionHandlerService,

    CreateRouteTriggerActionHandlerService,
    DeleteRouteTriggerActionHandlerService,
    UpdateRouteTriggerActionHandlerService,

    CreateRoleActionHandlerService,
    UpdateRoleActionHandlerService,
    DeleteRoleActionHandlerService,

    CreateRoleTargetActionHandlerService,
    DeleteRoleTargetActionHandlerService,
    UpdateRoleTargetActionHandlerService,

    CreateAgentActionHandlerService,
    UpdateAgentActionHandlerService,
    DeleteAgentActionHandlerService,

    CreatePageLayoutWidgetActionHandlerService,
    UpdatePageLayoutWidgetActionHandlerService,
    DeletePageLayoutWidgetActionHandlerService,
  ],
})
export class WorkspaceSchemaMigrationRunnerActionHandlersModule {}
