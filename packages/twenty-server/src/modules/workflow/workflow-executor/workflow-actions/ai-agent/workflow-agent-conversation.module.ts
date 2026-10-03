import { Module } from '@nestjs/common';

import { WorkflowRunRecordShareModule } from 'src/engine/core-modules/workflow/workflow-run-record-share.module';
import { AgentChatThreadModule } from 'src/engine/metadata-modules/ai/ai-chat/agent-chat-thread.module';
import { AgentHistoryModule } from 'src/engine/metadata-modules/ai/ai-history/ai-history.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { WorkflowAgentConversationWorkspaceService } from 'src/modules/workflow/workflow-executor/workflow-actions/ai-agent/services/workflow-agent-conversation.workspace-service';
import { WorkflowRunModule } from 'src/modules/workflow/workflow-runner/workflow-run/workflow-run.module';

@Module({
  imports: [
    AgentChatThreadModule,
    AgentHistoryModule,
    WorkflowRunModule,
    WorkflowRunRecordShareModule,
    WorkspaceCacheModule,
  ],
  providers: [WorkflowAgentConversationWorkspaceService],
  exports: [WorkflowAgentConversationWorkspaceService],
})
export class WorkflowAgentConversationModule {}
