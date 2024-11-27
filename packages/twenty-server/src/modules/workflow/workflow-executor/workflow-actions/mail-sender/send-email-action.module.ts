import { Module } from '@nestjs/common';

import { ScopedWorkspaceContextFactory } from 'src/engine/twenty-orm/factories/scoped-workspace-context.factory';
import { OAuth2ClientManagerModule } from 'src/modules/connected-account/oauth2-client-manager/oauth2-client-manager.module';
import { GmailClientProvider } from 'src/modules/messaging/message-import-manager/drivers/gmail/providers/gmail-client.provider';
import { SendEmailWorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/mail-sender/send-email.workflow-action';

@Module({
  imports: [OAuth2ClientManagerModule],
  providers: [
    GmailClientProvider,
    ScopedWorkspaceContextFactory,
    SendEmailWorkflowAction,
  ],
  exports: [SendEmailWorkflowAction],
})
export class SendEmailActionModule {}
