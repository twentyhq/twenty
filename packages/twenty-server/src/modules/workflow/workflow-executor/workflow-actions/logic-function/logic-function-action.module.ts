import { Module } from '@nestjs/common';

import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { LogicFunctionModule } from 'src/engine/core-modules/logic-function/logic-function.module';
import { UserWorkspaceModule } from 'src/engine/core-modules/user-workspace/user-workspace.module';
import { WorkspaceManyOrAllFlatEntityMapsCacheModule } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.module';
import { RoleModule } from 'src/engine/metadata-modules/role/role.module';
import { UserRoleModule } from 'src/engine/metadata-modules/user-role/user-role.module';
import { WorkflowCommonModule } from 'src/modules/workflow/common/workflow-common.module';
import { WorkflowExecutionContextService } from 'src/modules/workflow/workflow-executor/services/workflow-execution-context.service';
import { LogicFunctionWorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/logic-function/logic-function.workflow-action';
import { WorkflowRunModule } from 'src/modules/workflow/workflow-runner/workflow-run/workflow-run.module';

@Module({
  imports: [
    ApplicationModule,
    LogicFunctionModule,
    WorkspaceManyOrAllFlatEntityMapsCacheModule,
    WorkflowRunModule,
    UserWorkspaceModule,
    UserRoleModule,
    RoleModule,
    WorkflowCommonModule,
  ],
  providers: [WorkflowExecutionContextService, LogicFunctionWorkflowAction],
  exports: [LogicFunctionWorkflowAction],
})
export class LogicFunctionActionModule {}
