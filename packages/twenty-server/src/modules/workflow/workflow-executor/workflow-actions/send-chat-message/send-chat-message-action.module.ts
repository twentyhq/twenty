import { Module } from '@nestjs/common';

import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { SendChatMessageWorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/send-chat-message/send-chat-message.workflow-action';
import { WorkflowRunModule } from 'src/modules/workflow/workflow-runner/workflow-run/workflow-run.module';

@Module({
  imports: [FeatureFlagModule, WorkflowRunModule],
  providers: [SendChatMessageWorkflowAction],
  exports: [SendChatMessageWorkflowAction],
})
export class SendChatMessageActionModule {}
