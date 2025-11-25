import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AiBillingModule } from 'src/engine/metadata-modules/ai-billing/ai-billing.module';
import { AiModelsModule } from 'src/engine/metadata-modules/ai-models/ai-models.module';
import { AiToolsModule } from 'src/engine/metadata-modules/ai-tools/ai-tools.module';
import { UserWorkspaceModule } from 'src/engine/core-modules/user-workspace/user-workspace.module';
import { AgentEntity } from 'src/engine/metadata-modules/ai-agent/entities/agent.entity';
import { RoleTargetsEntity } from 'src/engine/metadata-modules/role/role-targets.entity';
import { UserRoleModule } from 'src/engine/metadata-modules/user-role/user-role.module';
import { ScopedWorkspaceContextFactory } from 'src/engine/twenty-orm/factories/scoped-workspace-context.factory';
import { WorkflowExecutionContextService } from 'src/modules/workflow/workflow-executor/services/workflow-execution-context.service';
import { AiAgentExecutorService } from 'src/modules/workflow/workflow-executor/workflow-actions/ai-agent/services/ai-agent-executor.service';
import { WorkflowRunModule } from 'src/modules/workflow/workflow-runner/workflow-run/workflow-run.module';

import { AiAgentWorkflowAction } from './ai-agent.workflow-action';

@Module({
  imports: [
    AiBillingModule,
    AiModelsModule,
    AiToolsModule,
    TypeOrmModule.forFeature([AgentEntity, RoleTargetsEntity]),
    WorkflowRunModule,
    UserWorkspaceModule,
    UserRoleModule,
  ],
  providers: [
    ScopedWorkspaceContextFactory,
    WorkflowExecutionContextService,
    AiAgentWorkflowAction,
    AiAgentExecutorService,
  ],
  exports: [AiAgentWorkflowAction],
})
export class AiAgentActionModule {}
