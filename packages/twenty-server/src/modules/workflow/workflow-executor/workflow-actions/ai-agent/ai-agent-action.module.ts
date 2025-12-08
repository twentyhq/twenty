import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserWorkspaceModule } from 'src/engine/core-modules/user-workspace/user-workspace.module';
import { AiAgentExecutionModule } from 'src/engine/metadata-modules/ai/ai-agent-execution/ai-agent-execution.module';
import { AgentEntity } from 'src/engine/metadata-modules/ai/ai-agent/entities/agent.entity';
import { AiBillingModule } from 'src/engine/metadata-modules/ai/ai-billing/ai-billing.module';
import { UserRoleModule } from 'src/engine/metadata-modules/user-role/user-role.module';
import { WorkflowExecutionContextService } from 'src/modules/workflow/workflow-executor/services/workflow-execution-context.service';
import { WorkflowRunModule } from 'src/modules/workflow/workflow-runner/workflow-run/workflow-run.module';

import { AiAgentWorkflowAction } from './ai-agent.workflow-action';

@Module({
  imports: [
    AiAgentExecutionModule,
    AiBillingModule,
    TypeOrmModule.forFeature([AgentEntity]),
    WorkflowRunModule,
    UserWorkspaceModule,
    UserRoleModule,
  ],
  providers: [WorkflowExecutionContextService, AiAgentWorkflowAction],
  exports: [AiAgentWorkflowAction],
})
export class AiAgentActionModule {}
