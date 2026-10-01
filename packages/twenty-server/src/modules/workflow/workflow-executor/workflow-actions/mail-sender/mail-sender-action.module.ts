import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { ToolModule } from 'src/engine/core-modules/tool/tool.module';
import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { UserWorkspaceModule } from 'src/engine/core-modules/user-workspace/user-workspace.module';
import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { RoleModule } from 'src/engine/metadata-modules/role/role.module';
import { UserRoleModule } from 'src/engine/metadata-modules/user-role/user-role.module';
import { WorkflowExecutionContextService } from 'src/modules/workflow/workflow-executor/services/workflow-execution-context.service';
import { DraftEmailWorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/mail-sender/draft-email.workflow-action';
import { SendEmailWorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/mail-sender/send-email.workflow-action';
import { WorkflowRunModule } from 'src/modules/workflow/workflow-runner/workflow-run/workflow-run.module';

@Module({
  imports: [
    ApplicationModule,
    RoleModule,
    ToolModule,
    UserRoleModule,
    UserWorkspaceModule,
    WorkflowRunModule,
    TypeOrmModule.forFeature([ConnectedAccountEntity, UserWorkspaceEntity]),
  ],
  providers: [
    WorkflowExecutionContextService,
    SendEmailWorkflowAction,
    DraftEmailWorkflowAction,
  ],
  exports: [SendEmailWorkflowAction, DraftEmailWorkflowAction],
})
export class MailSenderActionModule {}
