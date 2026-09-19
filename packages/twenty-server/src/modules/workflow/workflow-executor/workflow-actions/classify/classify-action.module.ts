import { Module } from '@nestjs/common';

import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { UserWorkspaceModule } from 'src/engine/core-modules/user-workspace/user-workspace.module';
import { AiClassificationModule } from 'src/engine/metadata-modules/ai/ai-classification/ai-classification.module';
import { RoleModule } from 'src/engine/metadata-modules/role/role.module';
import { UserRoleModule } from 'src/engine/metadata-modules/user-role/user-role.module';
import { WorkflowExecutionContextService } from 'src/modules/workflow/workflow-executor/services/workflow-execution-context.service';
import { WorkflowRunModule } from 'src/modules/workflow/workflow-runner/workflow-run/workflow-run.module';

import { ClassifyWorkflowAction } from './classify.workflow-action';

@Module({
  imports: [
    ApplicationModule,
    AiClassificationModule,
    WorkflowRunModule,
    UserWorkspaceModule,
    UserRoleModule,
    RoleModule,
  ],
  providers: [WorkflowExecutionContextService, ClassifyWorkflowAction],
  exports: [ClassifyWorkflowAction],
})
export class ClassifyActionModule {}
