import { Module } from '@nestjs/common';

import { AiAgentExecutionModule } from 'src/engine/metadata-modules/ai/ai-agent-execution/ai-agent-execution.module';
import { WorkflowExecutionContextModule } from 'src/modules/workflow/workflow-executor/services/workflow-execution-context.module';
import { WorkflowAgentConversationModule } from 'src/modules/workflow/workflow-executor/workflow-actions/ai-agent/workflow-agent-conversation.module';
import { WorkflowRunModule } from 'src/modules/workflow/workflow-runner/workflow-run/workflow-run.module';

import { AiAgentWorkflowAction } from './ai-agent.workflow-action';

@Module({
  imports: [
    WorkflowExecutionContextModule,
    AiAgentExecutionModule,
    WorkflowRunModule,
    WorkflowAgentConversationModule,
  ],
  providers: [AiAgentWorkflowAction],
  exports: [AiAgentWorkflowAction],
})
export class AiAgentActionModule {}
