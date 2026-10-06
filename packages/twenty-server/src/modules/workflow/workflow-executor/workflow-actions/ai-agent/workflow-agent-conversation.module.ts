import { Module } from '@nestjs/common';

import { WorkflowRunRecordShareModule } from 'src/engine/core-modules/workflow/workflow-run-record-share.module';
import { AiAgentExecutionModule } from 'src/engine/metadata-modules/ai/ai-agent-execution/ai-agent-execution.module';
import { WorkflowRunInboxSenderModule } from 'src/modules/workflow/workflow-executor/services/workflow-run-inbox-sender.module';
import { WorkflowAgentConversationWorkspaceService } from 'src/modules/workflow/workflow-executor/workflow-actions/ai-agent/services/workflow-agent-conversation.workspace-service';
import { WorkflowRunModule } from 'src/modules/workflow/workflow-runner/workflow-run/workflow-run.module';

@Module({
  imports: [
    AiAgentExecutionModule,
    WorkflowRunInboxSenderModule,
    WorkflowRunModule,
    WorkflowRunRecordShareModule,
  ],
  providers: [WorkflowAgentConversationWorkspaceService],
  exports: [WorkflowAgentConversationWorkspaceService],
})
export class WorkflowAgentConversationModule {}
