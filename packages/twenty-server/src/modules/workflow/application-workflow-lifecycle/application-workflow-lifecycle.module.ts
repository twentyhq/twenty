import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AgentEntity } from 'src/engine/metadata-modules/ai/ai-agent/entities/agent.entity';
import { LogicFunctionEntity } from 'src/engine/metadata-modules/logic-function/logic-function.entity';
import { provideWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/provide-workspace-scoped-repository';
import { ApplicationWorkflowLifecycleWorkspaceService } from 'src/modules/workflow/application-workflow-lifecycle/services/application-workflow-lifecycle.workspace-service';
import { WorkflowRunPinnedDependenciesService } from 'src/modules/workflow/application-workflow-lifecycle/services/workflow-run-pinned-dependencies.service';
import { WorkflowRunQueueModule } from 'src/modules/workflow/workflow-runner/workflow-run-queue/workflow-run-queue.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([LogicFunctionEntity, AgentEntity]),
    WorkflowRunQueueModule,
  ],
  providers: [
    ApplicationWorkflowLifecycleWorkspaceService,
    WorkflowRunPinnedDependenciesService,
    provideWorkspaceScopedRepository(LogicFunctionEntity),
    provideWorkspaceScopedRepository(AgentEntity),
  ],
  exports: [
    ApplicationWorkflowLifecycleWorkspaceService,
    WorkflowRunPinnedDependenciesService,
  ],
})
export class ApplicationWorkflowLifecycleModule {}
