import { Module } from '@nestjs/common';

import { ScopedWorkspaceContextFactory } from 'src/engine/twenty-orm/factories/scoped-workspace-context.factory';
import { MessagingImportManagerModule } from 'src/modules/messaging/message-import-manager/messaging-import-manager.module';
import { SendEmailWorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/mail-sender/send-email.workflow-action';

@Module({
  imports: [MessagingImportManagerModule],
  providers: [ScopedWorkspaceContextFactory, SendEmailWorkflowAction],
  exports: [SendEmailWorkflowAction],
})
export class SendEmailActionModule {}
