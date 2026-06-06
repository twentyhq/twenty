import { Module } from '@nestjs/common';

import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { ToolModule } from 'src/engine/core-modules/tool/tool.module';
import { UserWorkspaceModule } from 'src/engine/core-modules/user-workspace/user-workspace.module';
import { RoleModule } from 'src/engine/metadata-modules/role/role.module';
import { UserRoleModule } from 'src/engine/metadata-modules/user-role/user-role.module';
import { WorkflowExecutionContextService } from 'src/modules/workflow/workflow-executor/services/workflow-execution-context.service';
import { HttpRequestWorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/http-request/http-request.workflow-action';
import { WorkflowRunModule } from 'src/modules/workflow/workflow-runner/workflow-run/workflow-run.module';

@Module({
  imports: [
    ToolModule,
    WorkflowRunModule,
    ApplicationModule,
    UserWorkspaceModule,
    UserRoleModule,
    RoleModule,
  ],
  providers: [WorkflowExecutionContextService, HttpRequestWorkflowAction],
  exports: [HttpRequestWorkflowAction],
})
export class HttpRequestActionModule {}
