import { Module } from '@nestjs/common';

import { AgentHistoryModule } from 'src/engine/metadata-modules/ai/ai-history/ai-history.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { InputAskModule } from 'src/modules/input-ask/input-ask.module';
import { WorkflowAgentConversationWorkspaceService } from 'src/modules/workflow/workflow-executor/workflow-actions/ai-agent/services/workflow-agent-conversation.workspace-service';
import { WorkflowRunModule } from 'src/modules/workflow/workflow-runner/workflow-run/workflow-run.module';

@Module({
  imports: [
    AgentHistoryModule,
    WorkspaceCacheModule,
    WorkflowRunModule,
    InputAskModule,
  ],
  providers: [WorkflowAgentConversationWorkspaceService],
  exports: [WorkflowAgentConversationWorkspaceService],
})
export class WorkflowAgentConversationModule {}
