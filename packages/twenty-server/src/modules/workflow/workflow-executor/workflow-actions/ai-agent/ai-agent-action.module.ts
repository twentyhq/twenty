import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AiModule } from 'src/engine/core-modules/ai/ai.module';
import { AgentEntity } from 'src/engine/metadata-modules/agent/agent.entity';
import { AgentModule } from 'src/engine/metadata-modules/agent/agent.module';
import { ScopedWorkspaceContextFactory } from 'src/engine/twenty-orm/factories/scoped-workspace-context.factory';

import { AiAgentWorkflowAction } from './ai-agent.workflow-action';

@Module({
  imports: [
    AgentModule,
    AiModule,
    TypeOrmModule.forFeature([AgentEntity], 'core'),
  ],
  providers: [ScopedWorkspaceContextFactory, AiAgentWorkflowAction],
  exports: [AiAgentWorkflowAction],
})
export class AiAgentActionModule {}
