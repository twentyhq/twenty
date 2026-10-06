import { Module } from '@nestjs/common';

import { WorkflowRunRecordShareModule } from 'src/engine/core-modules/workflow/workflow-run-record-share.module';
import { AgentRunConversationModule } from 'src/engine/metadata-modules/ai/ai-agent-execution/agent-run-conversation.module';
import { WorkflowRunInboxSenderModule } from 'src/modules/workflow/workflow-executor/services/workflow-run-inbox-sender.module';
import { WorkflowAgentConversationWorkspaceService } from 'src/modules/workflow/workflow-executor/workflow-actions/ai-agent/services/workflow-agent-conversation.workspace-service';

@Module({
  imports: [
    AgentRunConversationModule,
    WorkflowRunInboxSenderModule,
    WorkflowRunRecordShareModule,
  ],
  providers: [WorkflowAgentConversationWorkspaceService],
  exports: [WorkflowAgentConversationWorkspaceService],
})
export class WorkflowAgentConversationModule {}
