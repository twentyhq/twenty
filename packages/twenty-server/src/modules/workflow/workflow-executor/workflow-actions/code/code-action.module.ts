import { Module } from '@nestjs/common';

import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { LogicFunctionModule } from 'src/engine/core-modules/logic-function/logic-function.module';
import { UserWorkspaceModule } from 'src/engine/core-modules/user-workspace/user-workspace.module';
import { RoleModule } from 'src/engine/metadata-modules/role/role.module';
import { UserRoleModule } from 'src/engine/metadata-modules/user-role/user-role.module';
import { WorkflowCommonModule } from 'src/modules/workflow/common/workflow-common.module';
import { WorkflowExecutionContextService } from 'src/modules/workflow/workflow-executor/services/workflow-execution-context.service';
import { CodeWorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/code/code.workflow-action';
import { WorkflowRunModule } from 'src/modules/workflow/workflow-runner/workflow-run/workflow-run.module';

@Module({
  imports: [
    ApplicationModule,
    LogicFunctionModule,
    WorkflowRunModule,
    UserWorkspaceModule,
    UserRoleModule,
    RoleModule,
    WorkflowCommonModule,
  ],
  providers: [WorkflowExecutionContextService, CodeWorkflowAction],
  exports: [CodeWorkflowAction],
})
export class CodeActionModule {}
