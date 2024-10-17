import { Module } from '@nestjs/common';

import { ServerlessFunctionModule } from 'src/engine/metadata-modules/serverless-function/serverless-function.module';
import { ScopedWorkspaceContextFactory } from 'src/engine/twenty-orm/factories/scoped-workspace-context.factory';
import { SendEmailWorkflowAction } from 'src/modules/mail-sender/workflow-actions/send-email.workflow-action';
import { MessagingGmailDriverModule } from 'src/modules/messaging/message-import-manager/drivers/gmail/messaging-gmail-driver.module';
import { CodeWorkflowAction } from 'src/modules/serverless/workflow-actions/code.workflow-action';
import { WorkflowCommonModule } from 'src/modules/workflow/common/workflow-common.module';
import { WorkflowActionFactory } from 'src/modules/workflow/workflow-executor/factories/workflow-action.factory';
import { WorkflowExecutorWorkspaceService } from 'src/modules/workflow/workflow-executor/workspace-services/workflow-executor.workspace-service';

@Module({
  imports: [
    WorkflowCommonModule,
    ServerlessFunctionModule,
    MessagingGmailDriverModule,
  ],
  providers: [
    WorkflowExecutorWorkspaceService,
    ScopedWorkspaceContextFactory,
    WorkflowActionFactory,
    CodeWorkflowAction,
    SendEmailWorkflowAction,
  ],
  exports: [WorkflowExecutorWorkspaceService],
})
export class WorkflowExecutorModule {}
