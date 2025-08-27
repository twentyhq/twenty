import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AiModule } from 'src/engine/core-modules/ai/ai.module';
import { AgentEntity } from 'src/engine/metadata-modules/agent/agent.entity';
import { RoleTargetsEntity } from 'src/engine/metadata-modules/role/role-targets.entity';
import { RoleEntity } from 'src/engine/metadata-modules/role/role.entity';
import { ScopedWorkspaceContextFactory } from 'src/engine/twenty-orm/factories/scoped-workspace-context.factory';
import { AiAgentExecutorService } from 'src/modules/workflow/workflow-executor/workflow-actions/ai-agent/services/ai-agent-executor.service';

import { AiAgentWorkflowAction } from './ai-agent.workflow-action';

@Module({
  imports: [
    AiModule,
    TypeOrmModule.forFeature(
      [AgentEntity, RoleTargetsEntity, RoleEntity],
      'core',
    ),
  ],
  providers: [
    ScopedWorkspaceContextFactory,
    AiAgentWorkflowAction,
    AiAgentExecutorService,
  ],
  exports: [AiAgentWorkflowAction],
})
export class AiAgentActionModule {}
