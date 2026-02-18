import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { WorkspaceSchemaManagerModule } from 'src/engine/twenty-orm/workspace-schema-manager/workspace-schema-manager.module';
import { CreateAgentActionHandlerService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/action-handlers/agent/services/create-agent-action-handler.service';
import { DeleteAgentActionHandlerService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/action-handlers/agent/services/delete-agent-action-handler.service';
import { UpdateAgentActionHandlerService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/action-handlers/agent/services/update-agent-action-handler.service';
import { CreateCommandMenuItemActionHandlerService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/action-handlers/command-menu-item/services/create-command-menu-item-action-handler.service';
import { DeleteCommandMenuItemActionHandlerService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/action-handlers/command-menu-item/services/delete-command-menu-item-action-handler.service';
import { UpdateCommandMenuItemActionHandlerService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/action-handlers/command-menu-item/services/update-command-menu-item-action-handler.service';
import { CreateNavigationMenuItemActionHandlerService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/action-handlers/navigation-menu-item/services/create-navigation-menu-item-action-handler.service';
import { DeleteNavigationMenuItemActionHandlerService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/action-handlers/navigation-menu-item/services/delete-navigation-menu-item-action-handler.service';
import { UpdateNavigationMenuItemActionHandlerService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/action-handlers/navigation-menu-item/services/update-navigation-menu-item-action-handler.service';
import { CreateFieldActionHandlerService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/action-handlers/field/services/create-field-action-handler.service';
import { DeleteFieldActionHandlerService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/action-handlers/field/services/delete-field-action-handler.service';
import { UpdateFieldActionHandlerService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/action-handlers/field/services/update-field-action-handler.service';
import { CreateIndexActionHandlerService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/action-handlers/index/services/create-index-action-handler.service';
import { DeleteIndexActionHandlerService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/action-handlers/index/services/delete-index-action-handler.service';
import { UpdateIndexActionHandlerService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/action-handlers/index/services/update-index-action-handler.service';
import { CreateObjectActionHandlerService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/action-handlers/object/services/create-object-action-handler.service';
import { DeleteObjectActionHandlerService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/action-handlers/object/services/delete-object-action-handler.service';
import { UpdateObjectActionHandlerService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/action-handlers/object/services/update-object-action-handler.service';
import { CreatePageLayoutTabActionHandlerService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/action-handlers/page-layout-tab/services/create-page-layout-tab-action-handler.service';
import { DeletePageLayoutTabActionHandlerService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/action-handlers/page-layout-tab/services/delete-page-layout-tab-action-handler.service';
import { UpdatePageLayoutTabActionHandlerService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/action-handlers/page-layout-tab/services/update-page-layout-tab-action-handler.service';
import { CreatePageLayoutWidgetActionHandlerService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/action-handlers/page-layout-widget/services/create-page-layout-widget-action-handler.service';
import { DeletePageLayoutWidgetActionHandlerService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/action-handlers/page-layout-widget/services/delete-page-layout-widget-action-handler.service';
import { UpdatePageLayoutWidgetActionHandlerService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/action-handlers/page-layout-widget/services/update-page-layout-widget-action-handler.service';
import { CreatePageLayoutActionHandlerService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/action-handlers/page-layout/services/create-page-layout-action-handler.service';
import { DeletePageLayoutActionHandlerService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/action-handlers/page-layout/services/delete-page-layout-action-handler.service';
import { UpdatePageLayoutActionHandlerService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/action-handlers/page-layout/services/update-page-layout-action-handler.service';
import { CreateRoleTargetActionHandlerService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/action-handlers/role-target/services/create-role-target-action-handler.service';
import { DeleteRoleTargetActionHandlerService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/action-handlers/role-target/services/delete-role-target-action-handler.service';
import { UpdateRoleTargetActionHandlerService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/action-handlers/role-target/services/update-role-target-action-handler.service';
import { CreateRoleActionHandlerService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/action-handlers/role/services/create-role-action-handler.service';
import { DeleteRoleActionHandlerService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/action-handlers/role/services/delete-role-action-handler.service';
import { UpdateRoleActionHandlerService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/action-handlers/role/services/update-role-action-handler.service';
import { CreateRowLevelPermissionPredicateGroupActionHandlerService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/action-handlers/row-level-permission-predicate-group/services/create-row-level-permission-predicate-group-action-handler.service';
import { DeleteRowLevelPermissionPredicateGroupActionHandlerService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/action-handlers/row-level-permission-predicate-group/services/delete-row-level-permission-predicate-group-action-handler.service';
import { UpdateRowLevelPermissionPredicateGroupActionHandlerService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/action-handlers/row-level-permission-predicate-group/services/update-row-level-permission-predicate-group-action-handler.service';
import { CreateRowLevelPermissionPredicateActionHandlerService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/action-handlers/row-level-permission-predicate/services/create-row-level-permission-predicate-action-handler.service';
import { DeleteRowLevelPermissionPredicateActionHandlerService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/action-handlers/row-level-permission-predicate/services/delete-row-level-permission-predicate-action-handler.service';
import { UpdateRowLevelPermissionPredicateActionHandlerService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/action-handlers/row-level-permission-predicate/services/update-row-level-permission-predicate-action-handler.service';
import { CreateLogicFunctionActionHandlerService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/action-handlers/logic-function/services/create-logic-function-action-handler.service';
import { DeleteLogicFunctionActionHandlerService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/action-handlers/logic-function/services/delete-logic-function-action-handler.service';
import { UpdateLogicFunctionActionHandlerService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/action-handlers/logic-function/services/update-logic-function-action-handler.service';
import { CreateSkillActionHandlerService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/action-handlers/skill/services/create-skill-action-handler.service';
import { DeleteSkillActionHandlerService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/action-handlers/skill/services/delete-skill-action-handler.service';
import { CreateFrontComponentActionHandlerService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/action-handlers/front-component/services/create-front-component-action-handler.service';
import { UpdateFrontComponentActionHandlerService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/action-handlers/front-component/services/update-front-component-action-handler.service';
import { DeleteFrontComponentActionHandlerService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/action-handlers/front-component/services/delete-front-component-action-handler.service';
import { UpdateSkillActionHandlerService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/action-handlers/skill/services/update-skill-action-handler.service';
import { CreateWebhookActionHandlerService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/action-handlers/webhook/services/create-webhook-action-handler.service';
import { DeleteWebhookActionHandlerService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/action-handlers/webhook/services/delete-webhook-action-handler.service';
import { UpdateWebhookActionHandlerService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/action-handlers/webhook/services/update-webhook-action-handler.service';
import { CreateViewFieldGroupActionHandlerService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/action-handlers/view-field-group/services/create-view-field-group-action-handler.service';
import { DeleteViewFieldGroupActionHandlerService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/action-handlers/view-field-group/services/delete-view-field-group-action-handler.service';
import { UpdateViewFieldGroupActionHandlerService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/action-handlers/view-field-group/services/update-view-field-group-action-handler.service';
import { CreateViewFieldActionHandlerService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/action-handlers/view-field/services/create-view-field-action-handler.service';
import { DeleteViewFieldActionHandlerService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/action-handlers/view-field/services/delete-view-field-action-handler.service';
import { UpdateViewFieldActionHandlerService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/action-handlers/view-field/services/update-view-field-action-handler.service';
import { CreateViewFilterGroupActionHandlerService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/action-handlers/view-filter-group/services/create-view-filter-group-action-handler.service';
import { DeleteViewFilterGroupActionHandlerService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/action-handlers/view-filter-group/services/delete-view-filter-group-action-handler.service';
import { UpdateViewFilterGroupActionHandlerService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/action-handlers/view-filter-group/services/update-view-filter-group-action-handler.service';
import { CreateViewFilterActionHandlerService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/action-handlers/view-filter/services/create-view-filter-action-handler.service';
import { DeleteViewFilterActionHandlerService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/action-handlers/view-filter/services/delete-view-filter-action-handler.service';
import { UpdateViewFilterActionHandlerService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/action-handlers/view-filter/services/update-view-filter-action-handler.service';
import { CreateViewGroupActionHandlerService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/action-handlers/view-group/services/create-view-group-action-handler.service';
import { DeleteViewGroupActionHandlerService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/action-handlers/view-group/services/delete-view-group-action-handler.service';
import { UpdateViewGroupActionHandlerService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/action-handlers/view-group/services/update-view-group-action-handler.service';
import { CreateViewActionHandlerService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/action-handlers/view/services/create-view-action-handler.service';
import { DeleteViewActionHandlerService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/action-handlers/view/services/delete-view-action-handler.service';
import { UpdateViewActionHandlerService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/action-handlers/view/services/update-view-action-handler.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([ApplicationEntity]),
    WorkspaceSchemaManagerModule,
  ],
  providers: [
    CreateFieldActionHandlerService,
    UpdateFieldActionHandlerService,
    DeleteFieldActionHandlerService,

    CreateObjectActionHandlerService,
    UpdateObjectActionHandlerService,
    DeleteObjectActionHandlerService,

    CreateIndexActionHandlerService,
    UpdateIndexActionHandlerService,
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

    CreateViewFilterGroupActionHandlerService,
    UpdateViewFilterGroupActionHandlerService,
    DeleteViewFilterGroupActionHandlerService,

    CreateViewGroupActionHandlerService,
    UpdateViewGroupActionHandlerService,
    DeleteViewGroupActionHandlerService,

    CreateViewFieldGroupActionHandlerService,
    UpdateViewFieldGroupActionHandlerService,
    DeleteViewFieldGroupActionHandlerService,

    CreateLogicFunctionActionHandlerService,
    DeleteLogicFunctionActionHandlerService,
    UpdateLogicFunctionActionHandlerService,

    CreateRoleActionHandlerService,
    UpdateRoleActionHandlerService,
    DeleteRoleActionHandlerService,

    CreateRoleTargetActionHandlerService,
    DeleteRoleTargetActionHandlerService,
    UpdateRoleTargetActionHandlerService,

    CreateAgentActionHandlerService,
    UpdateAgentActionHandlerService,
    DeleteAgentActionHandlerService,

    CreateSkillActionHandlerService,
    UpdateSkillActionHandlerService,
    DeleteSkillActionHandlerService,

    CreateCommandMenuItemActionHandlerService,
    UpdateCommandMenuItemActionHandlerService,
    DeleteCommandMenuItemActionHandlerService,

    CreateNavigationMenuItemActionHandlerService,
    UpdateNavigationMenuItemActionHandlerService,
    DeleteNavigationMenuItemActionHandlerService,

    CreatePageLayoutActionHandlerService,
    UpdatePageLayoutActionHandlerService,
    DeletePageLayoutActionHandlerService,

    CreatePageLayoutWidgetActionHandlerService,
    UpdatePageLayoutWidgetActionHandlerService,
    DeletePageLayoutWidgetActionHandlerService,

    CreatePageLayoutTabActionHandlerService,
    UpdatePageLayoutTabActionHandlerService,
    DeletePageLayoutTabActionHandlerService,

    CreateRowLevelPermissionPredicateActionHandlerService,
    UpdateRowLevelPermissionPredicateActionHandlerService,
    DeleteRowLevelPermissionPredicateActionHandlerService,

    CreateRowLevelPermissionPredicateGroupActionHandlerService,
    UpdateRowLevelPermissionPredicateGroupActionHandlerService,
    DeleteRowLevelPermissionPredicateGroupActionHandlerService,

    CreateFrontComponentActionHandlerService,
    UpdateFrontComponentActionHandlerService,
    DeleteFrontComponentActionHandlerService,

    CreateWebhookActionHandlerService,
    UpdateWebhookActionHandlerService,
    DeleteWebhookActionHandlerService,
  ],
})
export class WorkspaceSchemaMigrationRunnerActionHandlersModule {}
