import { Module } from '@nestjs/common';

import { ScopedWorkspaceContextFactory } from 'src/engine/twenty-orm/factories/scoped-workspace-context.factory';

import { AiAgentWorkflowAction } from './ai-agent.workflow-action';

@Module({
  providers: [ScopedWorkspaceContextFactory, AiAgentWorkflowAction],
  exports: [AiAgentWorkflowAction],
})
export class AiAgentActionModule {}
