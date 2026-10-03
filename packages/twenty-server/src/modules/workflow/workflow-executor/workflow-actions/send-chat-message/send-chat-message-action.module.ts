import { Module } from '@nestjs/common';

import { ToolProviderModule } from 'src/engine/core-modules/tool-provider/tool-provider.module';
import { WorkflowCoreModule } from 'src/engine/core-modules/workflow/workflow-core.module';
import { AgentInboxModule } from 'src/engine/metadata-modules/ai/ai-chat/agent-inbox.module';
import { WorkflowExecutionContextModule } from 'src/modules/workflow/workflow-executor/services/workflow-execution-context.module';
import { SendChatMessageWorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/send-chat-message/send-chat-message.workflow-action';
import { WorkflowRunModule } from 'src/modules/workflow/workflow-runner/workflow-run/workflow-run.module';

@Module({
  imports: [
    AgentInboxModule,
    WorkflowCoreModule,
    WorkflowExecutionContextModule,
    WorkflowRunModule,
    ToolProviderModule,
  ],
  providers: [SendChatMessageWorkflowAction],
  exports: [SendChatMessageWorkflowAction],
})
export class SendChatMessageActionModule {}
