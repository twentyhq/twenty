import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ToolModule } from 'src/engine/core-modules/tool/tool.module';
import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { WorkflowExecutionContextModule } from 'src/modules/workflow/workflow-executor/services/workflow-execution-context.module';
import { DraftEmailWorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/mail-sender/draft-email.workflow-action';
import { SendEmailWorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/mail-sender/send-email.workflow-action';
import { WorkflowRunModule } from 'src/modules/workflow/workflow-runner/workflow-run/workflow-run.module';

@Module({
  imports: [
    WorkflowExecutionContextModule,
    ToolModule,
    WorkflowRunModule,
    TypeOrmModule.forFeature([ConnectedAccountEntity, UserWorkspaceEntity]),
  ],
  providers: [SendEmailWorkflowAction, DraftEmailWorkflowAction],
  exports: [SendEmailWorkflowAction, DraftEmailWorkflowAction],
})
export class MailSenderActionModule {}
